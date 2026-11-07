"""
Integration Tests for FastAPI Endpoints (/health, /scan, /report) and PDF Generation.
"""
import io
import zipfile
import pytest
from fastapi.testclient import TestClient

from app import app
from pdf_generator.report_builder import generate_pqc_pdf_report

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_scan_endpoint_with_valid_zip():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("auth.py", "from Crypto.PublicKey import RSA\nkey = RSA.generate(2048)")
    zip_bytes = buf.getvalue()

    response = client.post(
        "/scan",
        files={"file": ("test_project.zip", zip_bytes, "application/zip")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_findings"] > 0
    assert data["risk_summary"]["score"] > 0


def test_scan_endpoint_with_invalid_extension():
    response = client.post(
        "/scan",
        files={"file": ("test_project.tar", b"test", "application/x-tar")}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]


def test_scan_bundled_sample():
    response = client.post("/scan-sample")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_findings"] >= 5
    assert data["risk_summary"]["score"] >= 75
    assert data["risk_summary"]["severity_breakdown"]["High"] >= 3


def test_report_endpoint_pdf_generation():
    mock_scan_data = {
        "status": "success",
        "project_name": "Test Application",
        "scanned_at": "2026-11-06T12:00:00Z",
        "total_files_scanned": 5,
        "total_findings": 2,
        "risk_summary": {
            "score": 50,
            "tier": "High Quantum Exposure",
            "assessment": "High quantum risk detected.",
            "calculation_explanation": "Test explanation.",
            "severity_breakdown": {"High": 2, "Medium": 0, "Low": 0, "Informational": 0},
            "priority_breakdown": {"P1": 2, "P2": 0, "P3": 0},
            "algorithm_breakdown": {"RSA": 1, "ECDSA": 1},
            "limitations": ["Static analysis only."]
        },
        "findings": [
            {
                "id": "PQC-001",
                "algorithm": "RSA",
                "file_path": "auth.py",
                "line": 15,
                "evidence_snippet": "-> 15 | key = RSA.generate(2048)",
                "purpose": "key establishment",
                "confidence": "High",
                "risk": "High",
                "risk_explanation": "Shor's algorithm breaks RSA.",
                "recommendation": "Evaluate ML-KEM (FIPS 203).",
                "migration_priority": "P1",
                "language": "python",
                "support_level": "full support",
                "disclaimer": "Potential detection, not proof."
            }
        ],
        "disclaimer": "Potential detection, not proof."
    }

    # Test direct generator function
    pdf_bytes = generate_pqc_pdf_report(mock_scan_data)
    assert pdf_bytes.startswith(b"%PDF-")
    assert len(pdf_bytes) > 1000

    # Test /report HTTP endpoint
    response = client.post("/report", json=mock_scan_data)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF-")
