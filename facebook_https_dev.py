"""Loopback-only origin for the isolated Talent Square Facebook OAuth rehearsal."""

from getpass import getpass
from hmac import compare_digest
from mimetypes import guess_type
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
from tempfile import TemporaryDirectory
from wsgiref.simple_server import WSGIRequestHandler, make_server

from server import PAGE_ROUTES, PUBLIC_ASSETS, ROOT


HOST = "algebra-unblessed-protector.ngrok-free.dev"
ORIGIN = f"https://{HOST}"
PORT = 18080
CALLBACK = "/api/discovery/facebook/callback/"
CONNECT = "/api/discovery/facebook/connect/"
STAFF_EMAIL = "staff@talent-square-https.example.test"
PAGE_ID = "1450027621530622"
BUSINESS_LOGIN_CONFIG_ID = "1125531993600400"
READ_API = {
    "/api/auth/csrf/", "/api/auth/me/", "/api/discovery/facebook/",
    "/api/discovery/sources/", "/api/discovery/candidates/", "/api/discovery/runs/",
    "/api/competitions/", CALLBACK,
}
WRITE_API = {"/api/auth/login/", "/api/auth/logout/"}
PILOT_ACTIVITY_VIEWS = {
    "/api/participant/bookmarks/", "/api/participant/registrations/", "/api/participant/participations/",
}


class PrivateRequestHandler(WSGIRequestHandler):
    def log_message(self, *args):
        # The callback query may contain an authorization code and state.
        pass


def configure_django(database, fernet_key, *, self_test, read_only_pilot=False,
                     oauth_backup_dir=None, meta_app_secret=""):
    backend = ROOT / "backend"
    sys.path[:0] = [str(backend), str(backend / ".venv/Lib/site-packages")]
    for name in tuple(os.environ):
        if name.startswith(("DJANGO_", "FACEBOOK_")):
            del os.environ[name]
    os.environ.update({
        "DJANGO_SETTINGS_MODULE": "config.settings",
        "DJANGO_DEBUG": "0",
        "DJANGO_SECRET_KEY": secrets.token_urlsafe(64),
        "DJANGO_SQLITE_PATH": str(database),
        "DJANGO_ALLOWED_HOSTS": HOST,
        "DJANGO_FRONTEND_ORIGIN": ORIGIN,
        "DJANGO_CSRF_TRUSTED_ORIGINS": ORIGIN,
        "DJANGO_CORS_ALLOWED_ORIGINS": "",
        "DJANGO_SECURE_COOKIES": "1",
        "DJANGO_SSL_REDIRECT": "1",
        "FACEBOOK_APP_ID": "1180640231308611",
        "FACEBOOK_GRAPH_VERSION": "v27.0",
        "FACEBOOK_LOGIN_CONFIG_ID": BUSINESS_LOGIN_CONFIG_ID,
        "FACEBOOK_ALLOWED_PAGE_IDS": PAGE_ID,
        "FACEBOOK_TOKEN_KEY": fernet_key,
        "FACEBOOK_REDIRECT_URI": ORIGIN + CALLBACK,
        "FACEBOOK_FRONTEND_RETURN_URL": ORIGIN + "/admin?tab=live-imports",
    })
    if self_test or meta_app_secret:
        os.environ["FACEBOOK_APP_SECRET"] = "isolated-test-placeholder" if self_test else meta_app_secret

    from django.conf import settings
    from django.core.wsgi import get_wsgi_application

    if read_only_pilot:
        settings.TALENT_SQUARE_PROTECTED_PILOT = True
        settings.DATABASES["default"]["NAME"] = database.as_uri() + "?mode=ro"
        settings.AUTHENTICATION_BACKENDS = ["accounts.pilot_auth.PilotStaffBackend"]
        settings.SESSION_ENGINE = "django.contrib.sessions.backends.cache"
        settings.SESSION_COOKIE_NAME = "talent_square_pilot_session"
        settings.SESSION_COOKIE_AGE = 1800
        if oauth_backup_dir is not None:
            settings.FACEBOOK_OAUTH_PILOT_DATABASE = database
            settings.FACEBOOK_OAUTH_PILOT_BACKUP_DIR = oauth_backup_dir

    application = get_wsgi_application()
    if read_only_pilot:
        from django.contrib.auth.signals import user_logged_in

        # A readiness login may create a cache session but must not update a user row.
        user_logged_in.disconnect(dispatch_uid="update_last_login")
    return application


def seed_staff(password):
    from accounts.models import ParticipantProfile
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import Permission
    from django.core.management import call_command
    from discovery.models import ImportSource

    call_command("migrate", interactive=False, verbosity=0)
    ImportSource.objects.update(enabled=False, auto_publish=False)
    ImportSource.objects.get_or_create(
        connector="facebook", defaults={"name": "Facebook competition announcements"}
    )
    staff = get_user_model().objects.create_user(
        username="https-test-staff", email=STAFF_EMAIL, password=password, is_staff=True
    )
    staff.user_permissions.add(
        Permission.objects.get(content_type__app_label="discovery", codename="manage_discovery")
    )
    ParticipantProfile.objects.create(user=staff, full_name="HTTPS pilot fixture")


def development_app(django_app, origin_key, *, authority=HOST, self_test=False,
                    read_only_pilot=False, oauth_enabled=False):
    """Admit only requests from the authenticated HTTPS edge and expose pilot routes."""
    expected_key = origin_key.encode("ascii")
    write_api = WRITE_API | ({CONNECT} if self_test or oauth_enabled else set())
    read_api = (READ_API - {CALLBACK, "/api/competitions/"}) | PILOT_ACTIVITY_VIEWS if read_only_pilot else READ_API
    if oauth_enabled:
        read_api = read_api | {CALLBACK}

    def application(environ, start_response):
        def private_response(status, headers, exc_info=None):
            path = environ.get("PATH_INFO")
            if oauth_enabled and path in {CONNECT, CALLBACK}:
                route = "start" if path == CONNECT else "callback"
                print(f"Facebook OAuth {route}: HTTP {status.split()[0]}", flush=True)
            headers = [
                (name, value) for name, value in headers
                if name.lower() not in {"cache-control", "referrer-policy", "x-content-type-options"}
            ]
            headers.extend([
                ("Cache-Control", "no-store, private"),
                ("Referrer-Policy", "no-referrer"),
                ("X-Content-Type-Options", "nosniff"),
            ])
            return start_response(status, headers, exc_info)

        def reject(status):
            private_response(status, [("Content-Length", "0")])
            return [b""]

        supplied_key = environ.pop("HTTP_X_TALENT_SQUARE_ORIGIN", "").encode("latin-1")
        if environ.get("HTTP_HOST") != authority or not compare_digest(supplied_key, expected_key):
            return reject("403 Forbidden")

        # The policy injects the proof only on HTTPS requests after authenticating.
        for name in tuple(environ):
            if name.startswith("HTTP_X_FORWARDED_") or name in {"HTTP_FORWARDED", "HTTP_AUTHORIZATION"}:
                del environ[name]
        environ["wsgi.url_scheme"] = "https"

        path = environ["PATH_INFO"]
        method = environ["REQUEST_METHOD"]
        is_competition = not read_only_pilot and re.fullmatch(r"/api/competitions/[A-Za-z0-9_-]+/", path)
        if path in read_api or is_competition:
            return django_app(environ, private_response) if method in {"GET", "HEAD"} else reject("405 Method Not Allowed")
        if path in write_api:
            return django_app(environ, private_response) if method == "POST" else reject("405 Method Not Allowed")
        if path == "/admin/" or (path not in PAGE_ROUTES and path not in PUBLIC_ASSETS):
            return reject("404 Not Found")
        if method not in {"GET", "HEAD"}:
            return reject("405 Method Not Allowed")

        asset = path if path in PUBLIC_ASSETS else "/index.html"
        content = (ROOT / asset.lstrip("/")).read_bytes()
        if asset == "/index.html":
            attributes = b'<html data-same-origin-api="true" '
            if read_only_pilot:
                attributes += b'data-read-only-pilot="true" '
            content = content.replace(b"<html ", attributes, 1)
        content_type = guess_type(asset)[0] or "application/octet-stream"
        if asset.endswith(".js"):
            content_type = "text/javascript"
        private_response("200 OK", [
            ("Content-Type", content_type + "; charset=utf-8"),
            ("Content-Length", str(len(content))),
            ("X-Frame-Options", "DENY"),
        ])
        return [content if method == "GET" else b""]

    return application


def verify_read_only_pilot(database, *, oauth_enabled=False):
    from django.conf import settings
    from django.contrib.auth import get_user_model
    from django.contrib.sessions.middleware import SessionMiddleware
    from django.db import connection
    from django.http import HttpResponse
    from django.test import Client, RequestFactory
    from discovery.facebook import allowed_page_ids, cipher, configured
    from discovery.models import FacebookPage, ImportCandidate, ImportRun, ImportSource
    from discovery.review import can_manage

    if connection.settings_dict["NAME"] != database.as_uri() + "?mode=ro":
        raise SystemExit("The real database must be open in SQLite read-only mode.")
    with connection.cursor() as cursor:
        cursor.execute("PRAGMA database_list")
        active_database = next(Path(path).resolve() for _, name, path in cursor.fetchall() if name == "main")
    if active_database != database:
        raise SystemExit("The pilot did not open the expected database.")
    source = ImportSource.objects.get(connector="facebook")
    if (
        source.enabled or source.auto_publish or source.is_running or source.next_run_at is not None
        or FacebookPage.objects.exists() or ImportRun.objects.filter(source=source).exists()
        or ImportCandidate.objects.filter(source=source).exists()
    ):
        raise SystemExit("The Facebook source or Page baseline is unsafe.")
    if configured() != oauth_enabled or set(allowed_page_ids()) != {PAGE_ID}:
        raise SystemExit("The OAuth gate or sole Page allowlist does not match the requested mode.")
    if not (
        settings.FACEBOOK_LOGIN_CONFIG_ID == BUSINESS_LOGIN_CONFIG_ID
        and settings.FACEBOOK_REDIRECT_URI == ORIGIN + CALLBACK
        and settings.SESSION_COOKIE_SECURE and settings.SESSION_COOKIE_HTTPONLY
        and settings.SESSION_COOKIE_SAMESITE == "Lax" and settings.SESSION_COOKIE_DOMAIN is None
        and settings.CSRF_COOKIE_SECURE and settings.CSRF_COOKIE_HTTPONLY
        and settings.CSRF_COOKIE_SAMESITE == "Lax" and settings.CSRF_COOKIE_DOMAIN is None
    ):
        raise SystemExit("The approved HTTPS or cookie settings do not match.")
    key = cipher()
    if key.decrypt(key.encrypt(b"protected pilot preflight")) != b"protected pilot preflight":
        raise SystemExit("The existing Fernet key failed its verification.")

    staff = [
        user for user in get_user_model().objects.filter(is_active=True, is_staff=True)
        if can_manage(user)
    ]
    if not staff:
        raise SystemExit("No existing active staff account can manage discovery.")
    client = Client(enforce_csrf_checks=True, HTTP_HOST=HOST, HTTP_ACCEPT="application/json")
    status_path = "/api/discovery/facebook/"
    if client.get(status_path, secure=True).status_code != 403:
        raise SystemExit("The protected status endpoint admitted an anonymous Django request.")
    # Exercise the real account permissions using a disposable cache session, without a password or database write.
    before = staff[0].last_login
    client.force_login(staff[0])
    try:
        if client.get(status_path, secure=True).status_code != 200:
            raise SystemExit("An existing discovery staff account could not read the Facebook status.")
        request = RequestFactory().get(status_path, secure=True)
        request.session = client.session
        request.session.modified = True
        response = SessionMiddleware(lambda _: HttpResponse()).process_response(request, HttpResponse())
        cookie = response.cookies[settings.SESSION_COOKIE_NAME]
        if not (cookie["secure"] and cookie["httponly"] and cookie["samesite"] == "Lax" and not cookie["domain"]):
            raise SystemExit("The Django session middleware did not issue a protected host-only cookie.")
        staff[0].refresh_from_db(fields=["last_login"])
        if staff[0].last_login != before:
            raise SystemExit("Staff preflight changed last-login data.")
    finally:
        client.logout()
    print("Read-only database and OAuth gate verified. Django status: anonymous 403, authorized staff 200. Session cookie flags verified.", flush=True)


def run_read_only_pilot(*, oauth_pilot=False, enable_meta_consent=False):
    database = (ROOT / "backend" / "db.sqlite3").resolve(strict=True)
    fernet_key = os.environ.pop("TS_FB_DEV_FERNET_KEY")
    origin_key = os.environ.pop("TS_FB_PILOT_ORIGIN_PROOF")
    if not re.fullmatch(r"[A-Za-z0-9_-]{32,128}", origin_key):
        raise SystemExit("A valid protected origin proof is required.")
    backup_dir = database.parent / ".runtime" / "backups" if oauth_pilot else None
    if backup_dir is not None and not backup_dir.is_dir():
        raise SystemExit("The private backup directory is unavailable.")
    app_secret = os.environ.pop("TS_FB_PILOT_APP_SECRET", "")
    if enable_meta_consent != bool(app_secret):
        raise SystemExit("The protected app secret must be supplied only when consent is enabled.")
    django_app = configure_django(
        database, fernet_key, self_test=False, read_only_pilot=True,
        oauth_backup_dir=backup_dir, meta_app_secret=app_secret,
    )
    from django.db import connections

    try:
        verify_read_only_pilot(database, oauth_enabled=enable_meta_consent)
        application = development_app(django_app, origin_key, read_only_pilot=True, oauth_enabled=enable_meta_consent)
        with make_server("127.0.0.1", PORT, application, handler_class=PrivateRequestHandler) as server:
            mode = "OAuth pilot" if oauth_pilot else "read-only pilot"
            consent = "enabled" if enable_meta_consent else "disabled"
            print(f"Protected {mode} listening on 127.0.0.1:{PORT}. Live Meta consent is {consent}.", flush=True)
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass
    finally:
        connections.close_all()


def run(*, self_test):
    fernet_key = os.environ.pop("TS_FB_DEV_FERNET_KEY")
    if self_test:
        origin_key = secrets.token_urlsafe(32)
        password = secrets.token_urlsafe(24)
    else:
        if not sys.stdin.isatty():
            raise SystemExit("Run the rehearsal origin in an interactive terminal.")
        origin_key = getpass("ngrok origin-proof secret: ")
        if not re.fullmatch(r"[A-Za-z0-9_-]{32,128}", origin_key):
            raise SystemExit("Use a random URL-safe origin proof of 32 to 128 characters.")
        password = getpass("New password for the disposable Talent Square staff account: ")
        if len(password) < 16:
            raise SystemExit("Use at least 16 characters for the disposable password.")

    runtime = ROOT / "backend" / ".runtime"
    runtime.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix="facebook-https-dev-", dir=runtime) as directory:
        workspace = Path(directory).resolve()
        database = workspace / "disposable.sqlite3"
        django_app = configure_django(database, fernet_key, self_test=self_test)
        from django.conf import settings
        from django.db import connections
        from discovery.facebook import cipher

        actual = Path(settings.DATABASES["default"]["NAME"]).resolve()
        if actual != database or actual.exists():
            raise SystemExit("Expected a new isolated SQLite database.")
        try:
            key = cipher()
            if key.decrypt(key.encrypt(b"development rehearsal")) != b"development rehearsal":
                raise SystemExit("The existing Fernet key failed its verification.")
            seed_staff(password)
            if self_test:
                from facebook_https_dev_test import test_https_flow

                test_https_flow(django_app, origin_key, password, workspace)
                subprocess.run(
                    [sys.executable, "-B", "-c", "from facebook_https_dev_test import test_oauth_pilot; test_oauth_pilot()"],
                    cwd=ROOT, env={
                        **os.environ, "TS_OAUTH_PILOT_FIXTURE_DB": str(database),
                        "TS_OAUTH_PILOT_FIXTURE_PASSWORD": password,
                    }, check=True,
                )
            else:
                app = development_app(django_app, origin_key)
                with make_server("127.0.0.1", PORT, app, handler_class=PrivateRequestHandler) as server:
                    print(f"Isolated origin listening on 127.0.0.1:{PORT}.", flush=True)
                    print(f"Test staff email: {STAFF_EMAIL}. Live Meta consent is disabled.", flush=True)
                    try:
                        server.serve_forever()
                    except KeyboardInterrupt:
                        pass
        finally:
            connections.close_all()


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--real-pilot"]:
        run_read_only_pilot()
    elif args in (["--oauth-pilot"], ["--oauth-pilot", "--enable-meta-consent"]):
        run_read_only_pilot(oauth_pilot=True, enable_meta_consent="--enable-meta-consent" in args)
    elif args in ([], ["--self-test"]):
        run(self_test=args == ["--self-test"])
    else:
        raise SystemExit("Usage: python -B facebook_https_dev.py [--self-test | --real-pilot | --oauth-pilot [--enable-meta-consent]]")
