"""
Code Scanner Orchestration Module
Scans extracted source directories, coordinates AST and regex analysis,
assigns finding identifiers, and computes overall risk metrics.
"""
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List

from scanner.crypto_detector import scan_file_content
from scanner.risk_analyzer import calculate_quantum_risk_score
from scanner.recommendations import PQC_DISCLAIMER


def scan_directory(base_dir: str, project_name: str = "Scanned Project") -> Dict[str, Any]:
    """
    Recursively iterates over all source code files in base_dir,
    runs cryptographic detection, and aggregates results.
    """
    base_path = Path(base_dir).resolve()
    all_findings: List[Dict[str, Any]] = []
    scanned_file_count = 0
    finding_counter = 1

    for root, _, files in os.walk(base_path):
        for file in files:
            full_path = Path(root) / file
            rel_path = str(full_path.relative_to(base_path)).replace("\\", "/")

            # Attempt reading as text
            try:
                with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                
                scanned_file_count += 1
                file_findings = scan_file_content(rel_path, content)
                for finding in file_findings:
                    finding["id"] = f"PQC-{str(finding_counter).zfill(3)}"
                    finding_counter += 1
                    all_findings.append(finding)
            except Exception:
                # Silently skip files that cannot be decoded or read
                continue

    # Sort findings by risk priority: High -> Medium -> Low -> Informational
    severity_order = {"High": 0, "Medium": 1, "Low": 2, "Informational": 3}
    all_findings.sort(key=lambda x: severity_order.get(x["risk"], 4))

    risk_metrics = calculate_quantum_risk_score(all_findings)

    return {
        "status": "success",
        "project_name": project_name,
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "total_files_scanned": scanned_file_count,
        "total_findings": len(all_findings),
        "risk_summary": risk_metrics,
        "findings": all_findings,
        "disclaimer": PQC_DISCLAIMER
    }
