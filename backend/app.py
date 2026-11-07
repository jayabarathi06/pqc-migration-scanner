"""
FastAPI Application Entrypoint
Provides REST API endpoints for:
  - GET  /health
  - POST /scan        (Uploaded ZIP -> Structured PQC Scan JSON)
  - POST /scan-sample (Bundled Sample -> Structured PQC Scan JSON)
  - POST /report      (Scan JSON -> Downloadable ReportLab PDF)
"""
import os
import tempfile
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, Response, Body, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from scanner.zip_handler import extract_zip_securely, ZipValidationError, MAX_UPLOAD_SIZE
from scanner.code_scanner import scan_directory
from pdf_generator.report_builder import generate_pqc_pdf_report

app = FastAPI(
    title="Post-Quantum Cryptography Migration Scanner",
    description="Audits source code archives for classical cryptography vulnerable to quantum threats.",
    version="1.0.0"
)

from urllib.parse import parse_qs

# Configure CORS origins from environment variable
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

class VercelPathRewriteMiddleware:
    """
    ASGI middleware to restore the original client path on Vercel.
    Extracts the __pqc_path query parameter injected by vercel.json rewrite
    and assigns it to scope['path'] before routing.
    """
    def __init__(self, app_instance):
        self.app = app_instance

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            query_bytes = scope.get("query_string", b"")
            if b"__pqc_path=" in query_bytes:
                query_str = query_bytes.decode("utf-8", errors="ignore")
                params = parse_qs(query_str)
                pqc_path_list = params.get("__pqc_path")
                if pqc_path_list and pqc_path_list[0]:
                    raw_val = pqc_path_list[0]
                    clean_path = "/" + "/".join([p for p in raw_val.split("/") if p])
                    scope["path"] = clean_path
                    scope["raw_path"] = clean_path.encode("utf-8")
        await self.app(scope, receive, send)

app.add_middleware(VercelPathRewriteMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def debug_headers_middleware(request, call_next):
    response = await call_next(request)
    response.headers["X-Request-Path"] = str(request.url.path)
    response.headers["X-Scope-Path"] = str(request.scope.get("path", ""))
    response.headers["X-Query-String"] = str(request.scope.get("query_string", b""))
    return response


@app.get("/")
@app.get("/api")
@app.get("/api/index.py")
def root_index():
    return {
        "service": "PQC Migration Scanner Backend",
        "status": "online",
        "endpoints": ["/health", "/scan", "/scan-sample", "/report"]
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "PQC Migration Scanner",
        "version": "1.0.0"
    }


@app.get("/debug-headers")
def debug_headers(request: Request):
    return dict(request.headers)
    """
    Health check endpoint.
    """
    return {
        "status": "ok",
        "service": "PQC Migration Scanner",
        "version": "1.0.0"
    }


@app.post("/scan")
@app.post("/api/scan")
async def scan_project_archive(file: UploadFile = File(...)):
    """
    Accepts an uploaded source code ZIP archive (up to 3 MB),
    validates zip integrity and bomb protections, extracts safely,
    scans for cryptographic usage, and returns a detailed audit report.
    """
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a standard .zip archive."
        )

    try:
        content = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(exc)}"
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded ZIP archive is empty."
        )

    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum upload limit of {MAX_UPLOAD_SIZE // (1024 * 1024)} MB."
        )

    # Process in an isolated temporary directory and clean up automatically
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            total_extracted, extracted_files = extract_zip_securely(content, temp_dir)
        except ZipValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

        if total_extracted == 0:
            return {
                "status": "success",
                "project_name": file.filename,
                "total_files_scanned": 0,
                "total_findings": 0,
                "risk_summary": {
                    "score": 0,
                    "tier": "Empty or Binary Codebase",
                    "assessment": "No scannable text or source files detected in the archive.",
                    "calculation_explanation": "Zero eligible code files found.",
                    "severity_breakdown": {"High": 0, "Medium": 0, "Low": 0, "Informational": 0},
                    "priority_breakdown": {"P1": 0, "P2": 0, "P3": 0},
                    "algorithm_breakdown": {},
                    "limitations": []
                },
                "findings": [],
                "disclaimer": "Potential detection, not proof."
            }

        scan_result = scan_directory(temp_dir, project_name=file.filename)
        return scan_result


@app.post("/scan-sample")
@app.post("/api/scan-sample")
def scan_bundled_sample():
    """
    Executes a real scan against the bundled sample vulnerable application
    without requiring manual file upload.
    """
    # Look for samples/vulnerable_app relative to backend or project root
    possible_paths = [
        Path(__file__).parent.parent / "samples" / "vulnerable_app",
        Path("samples") / "vulnerable_app",
        Path(__file__).parent / "samples" / "vulnerable_app"
    ]

    sample_dir = None
    for p in possible_paths:
        if p.exists() and p.is_dir():
            sample_dir = p
            break

    if not sample_dir:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bundled sample application directory not found on server."
        )

    scan_result = scan_directory(str(sample_dir), project_name="Bundled Vulnerable Sample App")
    return scan_result


@app.post("/report")
@app.post("/api/report")
def export_pdf_report(scan_data: Dict[str, Any] = Body(...)):
    """
    Generates and returns an executive ReportLab PDF report from scan results.
    """
    try:
        pdf_bytes = generate_pqc_pdf_report(scan_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=pqc_migration_report.pdf"
            }
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(exc)}"
        )

