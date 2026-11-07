import sys
from pathlib import Path

# Ensure backend root directory is on Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import app


class VercelPathRewriteMiddleware:
    """
    ASGI middleware to restore the original client path on Vercel.
    When Vercel rewrites requests to /api/index.py, it passes the original
    requested URI in the 'x-matched-path' header.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            matched_path = headers.get(b"x-matched-path")
            if matched_path:
                decoded_path = matched_path.decode("utf-8").split("?")[0]
                # If matched_path is /api/index.py, leave it or check
                if decoded_path not in {"/api/index.py", "/api/index", "/api"}:
                    scope["path"] = decoded_path
                    scope["raw_path"] = decoded_path.encode("utf-8")
        await self.app(scope, receive, send)


app.add_middleware(VercelPathRewriteMiddleware)
