#!/usr/bin/env python3
"""Authenticated, quota-limited API proxy for the private Ollama service."""

import json
import logging
import os
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


API_HOST = os.environ.get("ATLAS_API_HOST", "127.0.0.1")
API_PORT = int(os.environ.get("ATLAS_API_PORT", "8787"))
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:1.5b")
DAILY_LIMIT = int(os.environ.get("ATLAS_DAILY_LIMIT", "20"))
DATABASE_PATH = os.environ.get("ATLAS_QUOTA_DB", "/var/lib/atlas-api/usage.sqlite3")
ALLOWED_ORIGINS = frozenset(
    origin.strip()
    for origin in os.environ.get("ATLAS_ALLOWED_ORIGINS", "https://wwwatlasai.com").split(",")
    if origin.strip()
)
MAX_REQUEST_BYTES = 32 * 1024
MAX_MESSAGES = 6
MAX_MESSAGE_CHARS = 1000
SYSTEM_PROMPT = (
    "你的名字是 ATLAS，是一位友好、可靠的中文 AI 助手。"
    "回答清晰实用；用户问候或询问身份时，简洁自然地介绍自己。"
    "不要每次回答都重复自我介绍；不确定时坦诚说明，不要编造。"
)
INFERENCE_SLOT = threading.BoundedSemaphore(1)
LOGGER = logging.getLogger("atlas-api")


class SupabaseUnavailable(Exception):
    pass


def initialize_database(database_path=DATABASE_PATH):
    os.makedirs(os.path.dirname(os.path.abspath(database_path)), mode=0o750, exist_ok=True)
    with sqlite3.connect(database_path, timeout=10) as database:
        database.execute(
            """
            CREATE TABLE IF NOT EXISTS daily_usage (
                user_id TEXT NOT NULL,
                usage_day TEXT NOT NULL,
                request_count INTEGER NOT NULL,
                PRIMARY KEY (user_id, usage_day)
            )
            """
        )


def utc_day():
    return datetime.now(timezone.utc).date().isoformat()


def get_daily_usage(user_id, database_path=DATABASE_PATH):
    with sqlite3.connect(database_path, timeout=10) as database:
        row = database.execute(
            "SELECT request_count FROM daily_usage WHERE user_id = ? AND usage_day = ?",
            (user_id, utc_day()),
        ).fetchone()
    return row[0] if row else 0


def reserve_daily_usage(user_id, database_path=DATABASE_PATH, daily_limit=DAILY_LIMIT):
    day = utc_day()
    with sqlite3.connect(database_path, timeout=10, isolation_level=None) as database:
        database.execute("BEGIN IMMEDIATE")
        row = database.execute(
            "SELECT request_count FROM daily_usage WHERE user_id = ? AND usage_day = ?",
            (user_id, day),
        ).fetchone()
        used = row[0] if row else 0
        if used >= daily_limit:
            database.rollback()
            return None
        if row:
            database.execute(
                "UPDATE daily_usage SET request_count = ? WHERE user_id = ? AND usage_day = ?",
                (used + 1, user_id, day),
            )
        else:
            database.execute(
                "INSERT INTO daily_usage (user_id, usage_day, request_count) VALUES (?, ?, 1)",
                (user_id, day),
            )
        database.commit()
    return used + 1


def validate_messages(value):
    if not isinstance(value, list) or not value or len(value) > MAX_MESSAGES:
        raise ValueError(f"messages must contain between 1 and {MAX_MESSAGES} items")

    messages = []
    for item in value:
        if not isinstance(item, dict) or item.get("role") not in ("user", "assistant"):
            raise ValueError("messages may contain only user and assistant roles")
        content = item.get("content")
        if not isinstance(content, str) or not content.strip() or len(content) > MAX_MESSAGE_CHARS:
            raise ValueError(f"each message must contain 1 to {MAX_MESSAGE_CHARS} characters")
        messages.append({"role": item["role"], "content": content.strip()})

    if messages[-1]["role"] != "user":
        raise ValueError("the latest message must be from the user")
    return [{"role": "system", "content": SYSTEM_PROMPT}, *messages]


def verify_supabase_user(access_token):
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise SupabaseUnavailable("Supabase auth is not configured")

    request = Request(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        },
        method="GET",
    )
    try:
        with urlopen(request, timeout=10) as response:
            user = json.loads(response.read())
    except HTTPError as error:
        if error.code in (401, 403):
            return None
        raise SupabaseUnavailable(f"Supabase returned HTTP {error.code}") from error
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise SupabaseUnavailable("Could not verify the Supabase session") from error

    user_id = user.get("id") if isinstance(user, dict) else None
    try:
        return str(uuid.UUID(user_id))
    except (ValueError, TypeError, AttributeError):
        return None


def call_ollama(messages):
    request_body = json.dumps(
        {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {"num_ctx": 4096, "num_predict": 512, "temperature": 0.7},
        }
    ).encode("utf-8")
    request = Request(
        f"{OLLAMA_URL}/api/chat",
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=240) as response:
            result = json.loads(response.read())
    except HTTPError as error:
        raise RuntimeError(f"Ollama returned HTTP {error.code}") from error
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError("Could not get a valid response from Ollama") from error

    answer = result.get("message", {}).get("content") if isinstance(result, dict) else None
    if not isinstance(answer, str) or not answer.strip():
        raise RuntimeError("Ollama returned an empty response")
    return answer.strip()


class AtlasAPIHandler(BaseHTTPRequestHandler):
    server_version = "ATLASAPI/1.0"

    def log_message(self, format_string, *args):
        LOGGER.info("%s - %s", self.client_address[0], format_string % args)

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        origin = self.headers.get("Origin")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(body)

    def reject_disallowed_origin(self):
        origin = self.headers.get("Origin")
        if origin and origin not in ALLOWED_ORIGINS:
            self.send_json(403, {"error": "This website origin is not allowed."})
            return True
        return False

    def do_OPTIONS(self):
        origin = self.headers.get("Origin")
        if not origin or origin not in ALLOWED_ORIGINS:
            self.send_json(403, {"error": "This website origin is not allowed."})
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Vary", "Origin")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if self.reject_disallowed_origin():
            return
        if self.path == "/health":
            try:
                with urlopen(f"{OLLAMA_URL}/api/version", timeout=3):
                    pass
            except (HTTPError, URLError, TimeoutError):
                self.send_json(503, {"status": "unavailable"})
                return
            self.send_json(200, {"status": "ok"})
            return
        if self.path != "/api/usage":
            self.send_json(404, {"error": "Not found"})
            return

        user_id = self.authenticated_user()
        if not user_id:
            return
        used = get_daily_usage(user_id)
        self.send_json(
            200,
            {"limit": DAILY_LIMIT, "used": used, "remaining": max(0, DAILY_LIMIT - used)},
        )

    def do_POST(self):
        if self.reject_disallowed_origin():
            return
        if self.path != "/api/chat":
            self.send_json(404, {"error": "Not found"})
            return

        user_id = self.authenticated_user()
        if not user_id:
            return

        if self.headers.get_content_type() != "application/json":
            self.send_json(415, {"error": "Content-Type must be application/json"})
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(400, {"error": "Invalid Content-Length"})
            return
        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            self.send_json(413, {"error": "Request body is empty or too large"})
            return

        try:
            payload = json.loads(self.rfile.read(content_length))
            messages = validate_messages(payload.get("messages") if isinstance(payload, dict) else None)
        except (json.JSONDecodeError, UnicodeDecodeError, ValueError) as error:
            self.send_json(400, {"error": str(error)})
            return

        if not INFERENCE_SLOT.acquire(blocking=False):
            self.send_json(503, {"error": "ATLAS is busy. Please try again shortly."})
            return
        try:
            used = reserve_daily_usage(user_id)
            if used is None:
                self.send_json(
                    429,
                    {
                        "error": f"Daily limit reached ({DAILY_LIMIT} requests). Try again after UTC midnight.",
                        "limit": DAILY_LIMIT,
                        "used": DAILY_LIMIT,
                        "remaining": 0,
                    },
                )
                return
            answer = call_ollama(messages)
        except sqlite3.Error:
            LOGGER.exception("Unable to update daily usage")
            self.send_json(503, {"error": "Usage tracking is temporarily unavailable."})
            return
        except RuntimeError:
            LOGGER.exception("Ollama request failed")
            self.send_json(502, {"error": "The local model could not complete this request."})
            return
        finally:
            INFERENCE_SLOT.release()

        self.send_json(
            200,
            {
                "message": {"role": "assistant", "content": answer},
                "usage": {
                    "limit": DAILY_LIMIT,
                    "used": used,
                    "remaining": max(0, DAILY_LIMIT - used),
                },
            },
        )

    def authenticated_user(self):
        authorization = self.headers.get("Authorization", "")
        scheme, separator, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not separator or not token.strip() or len(token) > 8192:
            self.send_json(401, {"error": "Please sign in to use ATLAS."})
            return None
        try:
            user_id = verify_supabase_user(token.strip())
        except SupabaseUnavailable:
            LOGGER.exception("Supabase session verification failed")
            self.send_json(503, {"error": "Authentication service is temporarily unavailable."})
            return None
        if not user_id:
            self.send_json(401, {"error": "Your session is invalid or expired. Please sign in again."})
            return None
        return user_id


def main():
    if DAILY_LIMIT < 1:
        raise RuntimeError("ATLAS_DAILY_LIMIT must be a positive integer")
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise RuntimeError("Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before starting the API")
    ollama_endpoint = urlsplit(OLLAMA_URL)
    ollama_host = ollama_endpoint.hostname
    if (
        ollama_endpoint.scheme != "http"
        or ollama_host not in ("127.0.0.1", "localhost")
        or ollama_endpoint.path not in ("", "/")
        or ollama_endpoint.username
        or ollama_endpoint.password
        or ollama_endpoint.query
        or ollama_endpoint.fragment
    ):
        raise RuntimeError("OLLAMA_URL must point to the local Ollama service")
    if API_HOST != "127.0.0.1":
        raise RuntimeError("ATLAS_API_HOST must be loopback; expose it through HTTPS Nginx instead")
    initialize_database()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    server = ThreadingHTTPServer((API_HOST, API_PORT), AtlasAPIHandler)
    server.daemon_threads = True
    LOGGER.info("ATLAS API listening on %s:%s", API_HOST, API_PORT)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
