"""Loopback-only frontend host. Real account and competition APIs belong to Django."""
import http.server
import json
import mimetypes
import os
from pathlib import Path
import re
import urllib.parse

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8000"))
PUBLIC_ASSETS = {"/index.html", "/app.js", "/data.js", "/pages.js", "/workspaces.js", "/styles.css"}
PAGE_ROUTES = {"/", "/login", "/signup", "/forgot-password", "/competitions", "/job-fairs", "/rankings", "/workspace", "/admin", "/help", "/privacy", "/terms", "/organizer/competitions/new", "/preview/access-denied", "/preview/loading"}
RETIRED = {"success": False, "code": "django_api_required", "detail": "Legacy account and competition APIs are disabled. Real account operations and competition submissions are handled by Django on the configured backend. No account action was performed."}


def safe_path(raw):
    # Decode once and reject ambiguous paths before any filesystem resolution.
    if not raw.startswith("/") or raw.startswith("//") or any(ord(c) < 32 for c in raw):
        return None
    try:
        value = urllib.parse.unquote(urllib.parse.urlsplit(raw).path, errors="strict")
    except (ValueError, UnicodeError):
        return None
    if any(ord(c) < 32 for c in value) or any(c in value for c in ("\\", "%", "\x7f")):
        return None
    if "//" in value or any(part in (".", "..") for part in value.split("/")):
        return None
    return value


def retired(path):
    return path == "/api/auth" or path.startswith("/api/auth/") or path == "/api/competitions" or path.startswith("/api/competitions/")


class PlatformRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        kwargs["directory"] = str(ROOT)
        super().__init__(*args, **kwargs)

    def log_request(self, code="-", size="-"):
        # Never log queries, credentials or recovery tokens.
        self.log_message('"%s %s" %s %s', self.command, self.path.split("?", 1)[0], str(code), str(size))

    def end_headers(self):
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json_response(self, status_code, payload, allow=None):
        body = b"" if status_code == 204 else json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if allow:
            self.send_header("Allow", allow)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def send_head(self):
        path = safe_path(self.path)
        if path is None:
            self.send_error(404)
            return None
        page = path.rstrip("/") or "/"
        if page in PAGE_ROUTES or re.fullmatch(r"/(?:competitions|job-fairs)/[A-Za-z0-9_-]+|/profiles/[0-9]+", page):
            path = "/index.html"
        if path not in PUBLIC_ASSETS:
            self.send_error(404)
            return None
        target = (ROOT / path.lstrip("/")).resolve()
        if target.parent != ROOT or not target.is_file():
            self.send_error(404)
            return None
        self.path = path
        return super().send_head()

    def dispatch_request(self):
        # Reject foreign Host headers (including DNS rebinding) on this local host.
        if not re.fullmatch(r"(?:127\.0\.0\.1|localhost)(?::[0-9]+)?", self.headers.get("Host", ""), re.I):
            self.send_json_response(421, {"detail": "Use the loopback frontend address."})
            return
        path = safe_path(self.path)
        if path is None:
            self.send_json_response(404, {"detail": "Not found."})
            return
        if retired(path):
            self.send_json_response(410, RETIRED)
            return
        if path.startswith("/api/"):
            previews = {
                "/api/health": {"status": "online", "service": "Talent Square local frontend", "authentication": "Django only"},
                "/api/job-fairs": {"success": True, "demo": True, "detail": "Job fairs are sample previews only.", "totalFairs": 4},
                "/api/rankings": {"success": True, "demo": True, "detail": "Rankings are sample previews only.", "categories": ["Global", "Algorithm", "Hackathon", "UI/UX & Design", "AI & Data Science"]},
            }
            if path not in previews:
                self.send_json_response(404, {"detail": "Unknown frontend API. Real APIs are served by Django."})
            elif self.command not in ("GET", "HEAD"):
                self.send_json_response(405, {"detail": "Read-only frontend endpoint."}, "GET, HEAD")
            else:
                self.send_json_response(200, previews[path])
            return
        if self.command not in ("GET", "HEAD", "OPTIONS"):
            self.send_json_response(405, {"detail": "Frontend pages are read-only."}, "GET, HEAD, OPTIONS")
        elif self.command == "OPTIONS":
            self.send_json_response(204, {}, "GET, HEAD, OPTIONS")
        else:
            super().do_GET() if self.command == "GET" else super().do_HEAD()

    # Keep GET/HEAD file denial testable without requiring a live socket.
    def do_GET(self):
        path = safe_path(self.path)
        if path is None or not path.startswith("/api/"):
            return super().do_GET()
        self.dispatch_request()

    def do_HEAD(self):
        path = safe_path(self.path)
        if path is None or not path.startswith("/api/"):
            return super().do_HEAD()
        self.dispatch_request()

    def parse_request(self):
        if not super().parse_request():
            return False
        if safe_path(self.requestline.split()[1]) is None:
            self.send_error(404)
            return False
        if not re.fullmatch(r"(?:127\.0\.0\.1|localhost)(?::[0-9]+)?", self.headers.get("Host", ""), re.I):
            self.send_json_response(421, {"detail": "Use the loopback frontend address."})
            return False
        return True

    do_POST = do_PUT = do_PATCH = do_DELETE = do_OPTIONS = do_TRACE = do_CONNECT = dispatch_request


def run():
    mimetypes.add_type("application/javascript", ".js")
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), PlatformRequestHandler) as httpd:
        print(f"Talent Square frontend: http://127.0.0.1:{PORT} (Django API required)", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    run()
