import sys
from pathlib import Path
from urllib.parse import parse_qs

# Ensure backend root directory is on Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import app


class VercelPathRewriteMiddleware:
    """
    ASGI middleware to restore the original client path on Vercel.
    Extracts the __pqc_path query parameter injected by vercel.json rewrite
    and assigns it to scope['path'].
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            query_bytes = scope.get("query_string", b"")
            if b"__pqc_path=" in query_bytes:
                query_str = query_bytes.decode("utf-8", errors="ignore")
                params = parse_qs(query_str)
                pqc_path_list = params.get("__pqc_path")
                if pqc_path_list and pqc_path_list[0]:
                    raw_val = pqc_path_list[0]
                    # Normalize path
                    parts = [p for p in raw_val.split("/") if p]
                    target_path = "/" + "/".join(parts)
                    scope["path"] = target_path
                    scope["raw_path"] = target_path.encode("utf-8")
        await self.app(scope, receive, send)


app.add_middleware(VercelPathRewriteMiddleware)
