"""HTTPS browser regression against the disposable OAuth rehearsal origin."""

import base64
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from hmac import compare_digest
import json
import ssl
import subprocess
from threading import Thread
from time import time
from types import SimpleNamespace
from unittest.mock import patch
from urllib.request import urlopen
from urllib.parse import urlsplit
from wsgiref.simple_server import make_server
from wsgiref.util import setup_testing_defaults

from facebook_https_dev import (
    BUSINESS_LOGIN_CONFIG_ID, CALLBACK, CONNECT, HOST, ORIGIN, STAFF_EMAIL,
    PrivateRequestHandler, development_app,
)


def temporary_certificate(workspace):
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import NameOID

    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, HOST)])
    now = datetime.now(timezone.utc)
    certificate = (
        x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key())
        .serial_number(x509.random_serial_number()).not_valid_before(now - timedelta(minutes=1))
        .not_valid_after(now + timedelta(hours=1))
        .add_extension(x509.SubjectAlternativeName([x509.DNSName(HOST)]), critical=False)
        .sign(key, hashes.SHA256())
    )
    pem = workspace / "test-tls.pem"
    pem.write_bytes(certificate.public_bytes(serialization.Encoding.PEM) + key.private_bytes(
        serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()
    ))
    tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    tls.load_cert_chain(pem)
    spki = key.public_key().public_bytes(
        serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return tls, base64.b64encode(sha256(spki).digest()).decode("ascii")


def test_https_flow(django_app, origin_key, password, workspace, *, read_only_pilot=False):
    from accounts.browser_profile_regression import find_chrome, free_port, require
    from accounts.browser_test_support import BrowserTemporaryDirectory
    from django.db import connections
    from discovery import facebook_views
    from discovery.models import FacebookPage, ImportRun, ImportSource

    production_preview = development_app(django_app, origin_key)
    for headers, path, method, expected in [
        ({"HTTP_X_FORWARDED_PROTO": "https"}, "/login", "GET", "403"),
        ({"HTTP_X_TALENT_SQUARE_ORIGIN": "invalid"}, "/login", "GET", "403"),
        ({"HTTP_X_TALENT_SQUARE_ORIGIN": origin_key, "HTTP_HOST": "wrong.example"}, "/login", "GET", "403"),
        ({"HTTP_X_TALENT_SQUARE_ORIGIN": origin_key}, "/admin/login/", "GET", "404"),
        ({"HTTP_X_TALENT_SQUARE_ORIGIN": origin_key}, CONNECT, "POST", "404"),
        ({"HTTP_X_TALENT_SQUARE_ORIGIN": origin_key}, "/api/discovery/sources/1/run/", "POST", "404"),
    ]:
        environ = {"HTTP_HOST": HOST, "PATH_INFO": path, "REQUEST_METHOD": method, **headers}
        setup_testing_defaults(environ)
        states = []
        list(production_preview(environ, lambda status, headers, exc=None: states.append(status)))
        require(states[0].startswith(expected), "Rehearsal origin access boundary failed")

    tls, test_pin = temporary_certificate(workspace)
    with make_server("127.0.0.1", 0, None, handler_class=PrivateRequestHandler) as server:
        port = server.server_port
        authority = f"{HOST}:{port}"
        app = development_app(
            django_app, origin_key, authority=authority, self_test=True, read_only_pilot=read_only_pilot,
            oauth_enabled=read_only_pilot,
        )
        gate_password = "dummy-https-browser-gate"
        gate_header = "Basic " + base64.b64encode(("pilot:" + gate_password).encode()).decode()
        trace = []

        def simulated_edge(environ, start_response):
            if read_only_pilot and not compare_digest(environ.get("HTTP_AUTHORIZATION", ""), gate_header):
                trace.append((environ["PATH_INFO"], "edge", "401"))
                start_response("401 Unauthorized", [
                    ("WWW-Authenticate", 'Basic realm="Talent Square HTTPS rehearsal"'),
                    ("Cache-Control", "no-store"), ("Content-Length", "0"),
                ])
                return [b""]
            environ["HTTP_X_TALENT_SQUARE_ORIGIN"] = origin_key
            if read_only_pilot and environ["PATH_INFO"].startswith("/api/auth/"):
                def record_account_response(status, headers, exc_info=None):
                    trace.append((environ["PATH_INFO"], "Django", status.split()[0]))
                    return start_response(status, headers, exc_info)

                return app(environ, record_account_response)
            return app(environ, start_response)

        server.set_app(simulated_edge)
        server.socket = tls.wrap_socket(server.socket, server_side=True)

        def serve():
            try:
                server.serve_forever()
            finally:
                connections.close_all()

        thread = Thread(target=serve, daemon=True)
        thread.start()
        try:
            with patch.object(facebook_views, "graph", side_effect=AssertionError("Unexpected Meta request")) as graph:
                with BrowserTemporaryDirectory(prefix="facebook-https-chrome-") as profile:
                    debug_port = free_port()
                    browser = subprocess.Popen([
                        find_chrome(), "--headless=new", "--disable-gpu", "--no-first-run",
                        "--no-default-browser-check", "--no-proxy-server",
                        f"--host-resolver-rules=MAP {HOST} 127.0.0.1",
                        f"--ignore-certificate-errors-spki-list={test_pin}",
                        f"--remote-debugging-port={debug_port}", f"--user-data-dir={profile}", "about:blank",
                    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    try:
                        cdp = chrome_tab(debug_port, authority, gate_password if read_only_pilot else None)
                        try:
                            browser_checks(cdp, authority, password, facebook_views, require, read_only_pilot)
                        except (RuntimeError, AssertionError):
                            if read_only_pilot:
                                print("Isolated gate and Django response trace:", trace, flush=True)
                            raise
                        finally:
                            cdp.close()
                    finally:
                        if browser.poll() is None:
                            browser.terminate()
                        browser.wait(timeout=15)
                graph.assert_not_called()
        finally:
            server.shutdown()
            thread.join(timeout=5)

    require(not FacebookPage.objects.exists(), "A Page was unexpectedly connected")
    require(not ImportRun.objects.exists(), "A discovery run was unexpectedly created")
    require(
        ImportSource.objects.filter(connector="facebook", enabled=False, auto_publish=False).exists(),
        "Facebook source safety flags changed",
    )
    print("PASS: HTTPS frontend staff login, same-origin APIs, origin guard, Secure/HttpOnly/Lax cookies, CSRF, exact Business Login redirect, and expired/rejected/replayed OAuth state.", flush=True)
    print("PASS: Browser regression made no Meta requests and left its fixture without Pages or discovery runs.", flush=True)


def chrome_tab(port, authority=None, gate_password=None):
    from accounts.browser_profile_regression import ChromeCDP
    from time import sleep

    class BasicAuthChrome(ChromeCDP):
        def __init__(self, websocket_url):
            super().__init__(websocket_url)
            self.challenges = []
            self.api_statuses = []

        def _fetch_action(self, method, params):
            self._send_frame(json.dumps({"id": self._next_message_id(), "method": method, "params": params}))

        def _fulfill_api_request(self, event):
            self._fetch_action("Fetch.continueRequest", {"requestId": event["requestId"]})

        def _receive(self):
            message = super()._receive()
            if message.get("method") == "Fetch.authRequired":
                event = message["params"]
                url = urlsplit(event["request"]["url"])
                challenge = event["authChallenge"]
                permitted = (
                    url.scheme == "https" and url.netloc == authority
                    and challenge.get("source") == "Server" and challenge.get("scheme") == "basic"
                )
                self.challenges.append(url.path)
                # Provide the credentials only at the first challenge, as the operator would.
                response = {"response": "CancelAuth"}
                if permitted and len(self.challenges) == 1:
                    response = {"response": "ProvideCredentials", "username": "pilot", "password": gate_password}
                self._fetch_action("Fetch.continueWithAuth", {
                    "requestId": event["requestId"], "authChallengeResponse": response,
                })
            elif message.get("method") == "Network.responseReceived":
                response = message["params"]["response"]
                url = urlsplit(response["url"])
                if url.netloc == authority and url.path.startswith("/api/auth/"):
                    self.api_statuses.append((url.path, response["status"]))
            return message

    for _ in range(50):
        try:
            with urlopen(f"http://127.0.0.1:{port}/json/list", timeout=1) as response:
                tabs = json.load(response)
            websocket = next(tab["webSocketDebuggerUrl"] for tab in tabs if tab["type"] == "page")
            return BasicAuthChrome(websocket) if gate_password else ChromeCDP(websocket)
        except (OSError, StopIteration):
            sleep(.1)
    raise RuntimeError("The disposable Chrome tab was unavailable.")


def browser_checks(cdp, authority, password, facebook_views, require, read_only_pilot):
    from django.conf import settings

    base = f"https://{authority}"
    cdp.command("Page.enable")
    cdp.command("Network.enable")
    if read_only_pilot:
        cdp.command("Fetch.enable", {"patterns": [{"urlPattern": base + "/*"}], "handleAuthRequests": True})
    cdp.command("Network.setBlockedURLs", {"urls": ["*://*.facebook.com/*", "*://facebook.com/*"]})
    cdp.command("Page.navigate", {"url": base + "/login"})
    cdp.wait_for("!!document.querySelector('form [name=email]')", "Talent Square login form", timeout=45)
    require(cdp.evaluate("isSecureContext && window.TalentSphereUI.apiOrigin === ''"), "Frontend did not opt into HTTPS same-origin API calls")
    if read_only_pilot:
        require(cdp.evaluate("""fetch('/api/auth/me/').then(async response =>
            response.status === 200 && (await response.json()).authenticated === false)"""),
            "Signed-out state must leave the edge credential cached")
    else:
        require(cdp.evaluate("fetch('/api/auth/me/').then(r=>r.status)") == 401, "Signed-out API status")
        require(cdp.evaluate(f"fetch({json.dumps(CONNECT)}, {{method:'POST'}}).then(r=>r.status)") == 403, "Anonymous OAuth start")

    def submit_login(candidate_password):
        for field, value in (("email", STAFF_EMAIL), ("password", candidate_password)):
            cdp.evaluate(f"""(() => {{
                const input = document.querySelector('form [name={field}]');
                input.focus(); input.select();
            }})()""")
            cdp.command("Input.insertText", {"text": value})
        cdp.evaluate("document.querySelector('form button[type=submit]').click()")

    if read_only_pilot:
        submit_login("incorrect-disposable-password")
        cdp.wait_for("document.body.innerText.includes('Invalid email or password.')", "Django credential error")
        require(("/api/auth/login/", 403) in cdp.api_statuses, "Expected Django to reject an incorrect password")
    submit_login(password)
    try:
        cdp.wait_for("location.pathname==='/workspace'", "staff login completion", timeout=15)
    finally:
        if read_only_pilot:
            print("Chrome Basic challenges (paths only):", cdp.challenges, "Account API statuses:", cdp.api_statuses, flush=True)
    if read_only_pilot:
        require(cdp.challenges == ["/login"], "Basic Auth was challenged again during login")
    if read_only_pilot:
        cdp.command("Emulation.setDeviceMetricsOverride", {"width": 900, "height": 850, "deviceScaleFactor": 1, "mobile": False})
        cdp.wait_for("document.querySelector('#nav-admin-workspace')?.getClientRects().length", "visible staff Admin link at 900px")
        cdp.wait_for("document.body.innerText.includes('My Competitions')", "read-only participant activity")
        require(cdp.evaluate("!document.querySelector('#nav-btn-login, #nav-btn-register')"), "Header still shows signed-out links")
        require(cdp.evaluate("""fetch('/api/auth/me/').then(async response => {
            const account = await response.json();
            return response.status === 200 && account.authenticated && account.can_manage_discovery
                && account.profile?.full_name === 'HTTPS pilot fixture';
        })"""), "Account profile or Django staff capability was missing")
        statuses = cdp.evaluate("""(async () => Promise.all([
            ['/api/auth/me/', 'GET'], ['/api/discovery/sources/', 'HEAD'],
            ...['bookmarks', 'registrations', 'participations'].map(name => ['/api/participant/' + name + '/?page_size=60', 'GET'])
        ].map(([path, method]) => fetch(path, {method}).then(response => response.status, () => 'network error'))))()""")
        require(statuses == [200, 200, 200, 200, 200], "Read-only workspace and staff requests did not all return 200")
        print("PASS: Read-only HTTPS login persisted; saved profile and Admin link visible; all three activity requests returned 200.", flush=True)
    cdp.command("Page.navigate", {"url": base + "/admin?tab=live-imports"})
    cdp.wait_for("[...document.querySelectorAll('button')].some(e=>e.textContent.includes('Connect Facebook Pages') && !e.disabled)", "staff Facebook status through the frontend")

    cookies = cdp.command("Network.getCookies", {"urls": [base]})["cookies"]
    for name in (settings.SESSION_COOKIE_NAME, settings.CSRF_COOKIE_NAME):
        cookie = next((item for item in cookies if item["name"] == name), {})
        require(
            cookie.get("secure") and cookie.get("httpOnly") and cookie.get("sameSite") == "Lax"
            and cookie.get("domain") == HOST,
            "Expected a host-only Secure/HttpOnly/Lax cookie",
        )

    require(cdp.evaluate(f"fetch({json.dumps(CONNECT)}, {{method:'POST'}}).then(r=>r.status)") == 403, "OAuth start without CSRF")
    require(cdp.evaluate(f"""(async () => {{
        const response = await fetch({json.dumps(CONNECT)}, {{
            method:'POST', headers:{{'X-CSRFToken':'invalid','Content-Type':'application/json'}}, body:'{{}}'
        }});
        return response.status;
    }})()""") == 403, "OAuth start with invalid CSRF")

    start = f"""(async () => {{
        const {{csrfToken}} = await fetch('/api/auth/csrf/').then(r => r.json());
        const response = await fetch({json.dumps(CONNECT)}, {{
            method:'POST', headers:{{'X-CSRFToken':csrfToken,'Content-Type':'application/json'}}, body:'{{}}'
        }});
        if (!response.ok) return false;
        const dialog = new URL((await response.json()).url);
        window.rehearsalState = dialog.searchParams.get('state');
        return !!window.rehearsalState && dialog.origin === 'https://www.facebook.com'
            && dialog.pathname === '/v27.0/dialog/oauth'
            && dialog.searchParams.get('client_id') === '1180640231308611'
            && dialog.searchParams.get('redirect_uri') === {json.dumps(ORIGIN + CALLBACK)}
            && dialog.searchParams.get('config_id') === {json.dumps(BUSINESS_LOGIN_CONFIG_ID)}
            && dialog.searchParams.get('response_type') === 'code' && !dialog.searchParams.has('scope');
    }})()"""
    require(cdp.evaluate(start), "Exact Business Login URL and state")
    if read_only_pilot:
        history = cdp.command("Page.getNavigationHistory")
        entry_id = history["entries"][history["currentIndex"]]["id"]
        cdp.command("Page.navigate", {"url": "data:text/html,<title>Mock Page management</title>"})
        cdp.wait_for("document.title === 'Mock Page management'", "Simulated Meta diversion without callback")
        cdp.command("Page.navigateToHistoryEntry", {"entryId": entry_id})
        cdp.wait_for("location.pathname === '/admin'", "Return to Live Imports after simulated diversion")
        require(cdp.evaluate("""fetch('/api/discovery/facebook/').then(async response =>
            response.status === 200 && (await response.json()).pages.length === 0)"""),
            "An abandoned authorization must not create a Page")
        require(cdp.evaluate(start), "Fresh start after returning from simulated Page management")
    callback = f"""async (state) => {{
        const query = new URLSearchParams({{state, error:'access_denied'}});
        const response = await fetch({json.dumps(CALLBACK)} + '?' + query);
        if (response.status !== 400) return '';
        const body = await response.json();
        return Array.isArray(body) ? body.join(' ') : body.detail || '';
    }}"""
    require("could not be verified" in cdp.evaluate(f"({callback})('mismatch')"), "Mismatched OAuth state")
    require("could not be verified" in cdp.evaluate(f"({callback})('\\u00e9')"), "Malformed OAuth state")
    require(cdp.evaluate(start), "New state after rejected callback")
    cdp.evaluate("window.supersededState = window.rehearsalState")
    require(cdp.evaluate(start), "New start supersedes the previous flow")
    require("could not be verified" in cdp.evaluate(f"({callback})(window.supersededState)"), "Superseded callback")
    require("cancelled or denied" in cdp.evaluate(f"({callback})(window.rehearsalState)"), "Superseded callback consumed the current state")
    require(cdp.evaluate(start), "New state after superseded callback test")
    with patch.object(facebook_views, "time", SimpleNamespace(time=lambda: time() + 601)):
        require("expired" in cdp.evaluate(f"({callback})(window.rehearsalState)"), "Expired OAuth state")
    require(cdp.evaluate(start), "New state after expired callback")
    require("cancelled or denied" in cdp.evaluate(f"({callback})(window.rehearsalState)"), "Valid state reached the cancellation branch")
    require("could not be verified" in cdp.evaluate(f"({callback})(window.rehearsalState)"), "OAuth state replay")
    if read_only_pilot:
        require(cdp.challenges == ["/login"], "Basic Auth was challenged again before reaching Live Imports")


def test_oauth_pilot():
    """Test the real pilot configuration against the disposable browser fixture."""
    from contextlib import closing
    from pathlib import Path
    import os
    import sqlite3
    from urllib.parse import parse_qs, urlsplit

    from facebook_https_dev import ROOT, PAGE_ID, configure_django, verify_read_only_pilot

    database = Path(os.environ.pop("TS_OAUTH_PILOT_FIXTURE_DB")).resolve(strict=True)
    browser_password = os.environ.pop("TS_OAUTH_PILOT_FIXTURE_PASSWORD")
    assert database.name == "disposable.sqlite3" and database.parent.name.startswith("facebook-https-dev-")
    assert database.parent.parent == (ROOT / "backend" / ".runtime").resolve()
    backup_dir = database.parent / "backups"
    backup_dir.mkdir()
    from sys import path

    path.insert(0, str(ROOT / "backend" / ".venv/Lib/site-packages"))
    from cryptography.fernet import Fernet

    key = Fernet.generate_key()
    django_app = configure_django(
        database, key.decode(), self_test=True, read_only_pilot=True, oauth_backup_dir=backup_dir
    )
    from django.conf import settings
    from django.contrib.auth import get_user_model
    from django.db import connections
    from django.test import Client
    from discovery.connectors import ConnectorError
    from discovery.models import FacebookPage

    verify_read_only_pilot(database, oauth_enabled=True)
    before_browser = database.read_bytes()
    test_https_flow(django_app, "browser-fixture-proof", browser_password, database.parent, read_only_pilot=True)
    assert database.read_bytes() == before_browser, "Browser login or workspace changed the isolated SQLite file"
    proof = "test-only-pilot-proof"
    routes = [
        (False, CONNECT, "POST", 404), (False, CALLBACK, "GET", 404),
        (True, CONNECT, "GET", 405), (True, CALLBACK, "POST", 405),
        (True, "/api/discovery/facebook/pages/1/", "PATCH", 404),
        (True, "/api/discovery/sources/1/run/", "POST", 404),
        (True, "/api/competitions/", "POST", 404),
        (True, "/api/participant/bookmarks/", "POST", 405),
        (True, "/api/participant/competitions/1/bookmark/", "DELETE", 404),
    ]
    for enabled, route, method, expected in routes:
        application = development_app(django_app, proof, read_only_pilot=True, oauth_enabled=enabled)
        environ = {"HTTP_HOST": HOST, "PATH_INFO": route, "REQUEST_METHOD": method, "HTTP_X_TALENT_SQUARE_ORIGIN": proof}
        setup_testing_defaults(environ)
        statuses = []
        list(application(environ, lambda status, headers, exc=None: statuses.append(int(status.split()[0]))))
        assert statuses == [expected], "Protected pilot route exposed an unexpected method or endpoint"

    def contents(file):
        with closing(sqlite3.connect(file.as_uri() + "?mode=ro", uri=True)) as db:
            names = db.execute("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name")
            return {name: db.execute('SELECT * FROM "' + name.replace('"', '""') + '" ORDER BY rowid').fetchall()
                    for (name,) in names}

    client = Client(enforce_csrf_checks=True, HTTP_HOST=HOST, HTTP_ACCEPT="application/json")
    staff = get_user_model().objects.get(email=STAFF_EMAIL)
    client.force_login(staff)
    csrf = client.get("/api/auth/csrf/", secure=True).json()["csrfToken"]
    before = contents(database)
    graph_responses = [
        {"access_token": "mock-short"},
        {"access_token": "mock-long"},
        {"data": [{"permission": scope, "status": "granted"} for scope in ("pages_show_list", "pages_read_engagement")]},
        {"data": [
            {"id": "123", "name": "Excluded Page", "tasks": ["MODERATE"], "access_token": "mock-other"},
            {"id": PAGE_ID, "name": "Talent Square", "tasks": ["MODERATE"], "access_token": "mock-allowed"},
        ]},
    ]

    def consent():
        response = client.post(CONNECT, {}, content_type="application/json", secure=True, HTTP_ORIGIN=ORIGIN, HTTP_X_CSRFTOKEN=csrf)
        assert response.status_code == 200
        query = parse_qs(urlsplit(response.json()["url"]).query)
        assert query["config_id"] == [BUSINESS_LOGIN_CONFIG_ID] and query["redirect_uri"] == [ORIGIN + CALLBACK]
        return {"state": query["state"][0], "code": "mock-callback"}

    try:
        assert client.post(CONNECT, {}, content_type="application/json", secure=True, HTTP_ORIGIN=ORIGIN).status_code == 403
        with patch("discovery.facebook_views.graph", side_effect=graph_responses):
            rejected = consent()
            with patch("discovery.facebook_pilot.create_verified_snapshot", side_effect=ConnectorError("mock backup failure")):
                assert client.get(CALLBACK, rejected, secure=True).status_code == 400
        assert contents(database) == before and not list(backup_dir.iterdir())
        with patch("discovery.facebook_views.graph", side_effect=graph_responses) as graph:
            accepted = consent()
            response = client.get(CALLBACK, accepted, secure=True)
            assert response.status_code == 302 and response["Location"] == settings.FACEBOOK_FRONTEND_RETURN_URL
            assert client.get(CALLBACK, accepted, secure=True).status_code == 400
            duplicate = client.post(CONNECT, {}, content_type="application/json", secure=True, HTTP_ORIGIN=ORIGIN, HTTP_X_CSRFTOKEN=csrf)
            assert duplicate.status_code == 400
            assert graph.call_count == 4

        snapshots = list(backup_dir.glob("facebook-pre-consent-write-*.sqlite3"))
        assert len(snapshots) == 1 and contents(snapshots[0]) == before
        after = contents(database)
        assert {table for table in before if before[table] != after[table]} <= {"discovery_facebookpage", "sqlite_sequence"}
        assert [row for row in after["sqlite_sequence"] if row[0] != "discovery_facebookpage"] == before["sqlite_sequence"]
        page = FacebookPage.objects.get()
        assert page.page_id == PAGE_ID and not page.enabled and page.connected_by_id == staff.pk
        assert Fernet(key).decrypt(page.encrypted_token.encode()) == b"mock-allowed"
        print("PASS: OAuth-only routes, verified backup before the sole encrypted paused Page insert, refused backup failure, replay rejected, and no unrelated SQLite writes.")
    finally:
        connections.close_all()
