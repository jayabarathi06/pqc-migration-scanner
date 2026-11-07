# Post-Quantum Cryptography (PQC) Migration Scanner

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![NIST PQC](https://img.shields.io/badge/Standards-NIST%20FIPS%20203%2F204%2F205-7C3AED)](https://csrc.nist.gov/projects/post-quantum-cryptography)
[![ReportLab](https://img.shields.io/badge/Reports-ReportLab%20PDF-E11D48)](https://www.reportlab.com/)

A full-stack cybersecurity audit tool designed to scan source code archives for classical cryptographic primitives vulnerable to future cryptanalytically relevant quantum computers (CRQCs). It calculates an explainable 0–100 quantum risk score, maps vulnerabilities directly to official **NIST PQC standards (FIPS 203, FIPS 204, FIPS 205)**, renders interactive analytics dashboards, and compiles executive PDF reports.

---

## 1. Quantum Threats Addressed

1. **Shor's Algorithm (Polynomial Break of Asymmetric Primitives):**
   - Efficiently computes prime factorization and discrete logarithms.
   - **Vulnerable Algorithms:** RSA, ECC, ECDSA, ECDH, Diffie-Hellman, DSA, Ed25519, X25519.
   - **Threat Impact:** Broken signatures allow identity forgery; broken key establishment allows retroactive traffic decryption ("Harvest Now, Decrypt Later").
   - **NIST Migration Target:** FIPS 203 (ML-KEM) for key exchange; FIPS 204 (ML-DSA) and FIPS 205 (SLH-DSA) for digital signatures.

2. **Grover's Algorithm (Quadratic Speedup on Symmetric Ciphers & Hashes):**
   - Provides an $O(\sqrt{N})$ search speedup, effectively halving key strength.
   - **AES-128:** Reduced to ~64 bits of quantum security (Upgrade recommended to AES-256).
   - **AES-256:** Retains 128 bits of quantum security, remaining post-quantum resilient.
   - **Hash Functions:** MD5 and SHA-1 are classically broken and must be retired; SHA-256, SHA-384, and SHA-512 provide sufficient quantum collision resistance.

---

## 2. Architecture & Project Layout

```
PQC-Migration-Scanner/
├── backend/
│   ├── app.py                      # FastAPI entrypoint (/health, /scan, /scan-sample, /report)
│   ├── requirements.txt            # Runtime dependencies (FastAPI, ReportLab, Pydantic, etc.)
│   ├── requirements-dev.txt        # Development dependencies (Uvicorn, Pytest)
│   ├── scanner/
│   │   ├── code_scanner.py         # Directory traversal and multi-file orchestrator
│   │   ├── crypto_detector.py      # Python AST parsing and regex heuristics
│   │   ├── risk_analyzer.py        # 0–100 quantum risk score calculation
│   │   ├── recommendations.py     # NIST FIPS 203/204/205 standards mapping
│   │   └── zip_handler.py          # Zip-bomb protection and secure extraction
│   ├── pdf_generator/
│   │   └── report_builder.py       # ReportLab PDF executive report compiler
│   └── tests/                      # Pytest automated test suite (21 passing tests)
├── frontend/
│   ├── src/
│   │   ├── components/             # Navbar, Footer, SeverityBadge, FindingDrawer
│   │   ├── pages/                  # Home, Upload, Results, Dashboard, Recommendations, Report
│   │   ├── services/api.ts         # Axios client with sessionStorage persistence
│   │   └── types/scan.ts           # TypeScript interfaces
│   ├── vite.config.ts              # Vite + Tailwind CSS v4 plugin
│   └── vercel.json                 # SPA client route rewrite
├── samples/
│   ├── vulnerable_app/             # Realistic multi-language benchmark suite
│   └── vulnerable_app.zip          # Bundled sample archive for instant testing
└── README.md
```

---

## 3. Security Hardening

- **No Code Execution:** Files are never dynamically imported, executed, or evaluated.
- **Zip-Bomb Defenses:** Strict limits: max upload size 3 MB, max 2,000 files, max 50 MB total decompressed, max 1 MB single file.
- **Path Traversal & Symlink Protection:** Disallows relative paths (`../`), absolute paths, and symbolic links.
- **Ephemeral Storage:** Unpacked in isolated temporary directories and automatically cleaned up upon request completion.
- **Safe Output Rendering:** All code evidence snippets are rendered as plain text in `<pre>` tags without `dangerouslySetInnerHTML`.

---

## 4. Local Installation & Running Guide

### Prerequisites
- Python 3.12+ (or 3.13)
- Node.js 20.19+ (or Node 22+)
- PowerShell (Windows)

### Backend Setup
```powershell
# 1. Navigate to backend
cd backend

# 2. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 3. Start API server (port 8000)
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```
Verify backend health: `http://127.0.0.1:8000/health`

### Frontend Setup
```powershell
# 1. In a separate terminal, navigate to frontend
cd frontend

# 2. Start Vite dev server (port 5173)
npm run dev
```
Open your browser at `http://127.0.0.1:5173`.

---

## 5. Running the Test Suites

### Backend Tests (pytest)
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -v
```
All 21 automated tests verify:
- RSA, ECC, ECDSA, ECDH, Diffie-Hellman, AES-128, AES-256, 3DES, MD5, SHA-1, SHA-256, SHA-512 detection.
- Context filtering (downgrading comments and test suites to Informational).
- Zip bomb, path traversal, and corrupted archive rejections.
- HTTP `/scan`, `/scan-sample`, and `/report` PDF generation.

### Frontend Production Build
```powershell
cd frontend
npm run build
```

---

## 6. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `POST` | `/scan` | Uploads multipart ZIP archive; returns structured PQC scan JSON |
| `POST` | `/scan-sample` | Audits the bundled vulnerable sample codebase directly |
| `POST` | `/report` | Accepts scan JSON and returns downloadable ReportLab PDF (`application/pdf`) |

---

## 7. Audit Limitations & Disclaimer

**Potential detection, not proof.** Static code analysis identifies cryptographic APIs, keywords, and structural patterns. It cannot verify dynamic runtime key negotiation, cloud-managed KMS keys (AWS KMS, GCP KMS), or physical Hardware Security Modules (HSMs). Results provide architectural guidance and should be complemented by formal cryptographic review.

