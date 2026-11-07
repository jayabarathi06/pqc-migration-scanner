"""
Risk Analyzer Module
Calculates granular risk levels, migration priorities, and an explainable
0-100 overall Post-Quantum Cryptography risk score based on Shor's and Grover's algorithm exposure.
"""
from typing import List, Dict, Any

SCAN_LIMITATIONS = [
    "Static regex and AST heuristics only: cannot inspect dynamically loaded modules, reflection, or runtime eval().",
    "Compiled binaries, native shared libraries (.so, .dll), and obfuscated source files are skipped.",
    "Third-party external services, cloud key management systems (AWS KMS, Azure Key Vault, GCP Cloud KMS), and hardware security modules (HSM) are outside the scope of code scans.",
    "Full semantic AST validation is available for Python; other languages (JS/TS, Go, Java, C#, Rust, PHP) utilize pattern-based heuristic detection labeled 'limited detection'.",
    "A scan result of 0 does not prove that an application is quantum-safe, as network-level protocols and runtime dependencies may introduce cryptographic operations."
]


def calculate_quantum_risk_score(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes an explainable 0-100 Post-Quantum Risk Score.
    Weighting model:
      - High Risk (P1): 25 pts each (Asymmetric public-key vulnerable to Shor's algorithm).
      - Medium Risk (P2): 10 pts each (Obsolete symmetric or broken hashes).
      - Low Risk (P2): 5 pts each (AES-128 Grover key-halving).
      - Informational (P3): 0 pts (Post-quantum resilient ciphers, comments, tests).
    Overall score is capped between 0 and 100.
    """
    counts = {
        "High": 0,
        "Medium": 0,
        "Low": 0,
        "Informational": 0
    }
    priority_counts = {
        "P1": 0,
        "P2": 0,
        "P3": 0
    }
    algo_counts: Dict[str, int] = {}

    for finding in findings:
        risk = finding.get("risk", "Informational")
        priority = finding.get("migration_priority", "P3")
        algo = finding.get("algorithm", "Unknown")

        counts[risk] = counts.get(risk, 0) + 1
        priority_counts[priority] = priority_counts.get(priority, 0) + 1
        algo_counts[algo] = algo_counts.get(algo, 0) + 1

    # Score formula
    raw_score = (
        counts["High"] * 25 +
        counts["Medium"] * 10 +
        counts["Low"] * 5
    )
    score = min(100, raw_score)

    if score >= 75:
        tier = "Critical Quantum Exposure"
        assessment = (
            "Application relies extensively on classical public-key cryptography (RSA, ECC, DH) "
            "that is entirely broken by Shor's algorithm on a quantum computer. High risk of 'Harvest Now, Decrypt Later' attacks."
        )
    elif score >= 50:
        tier = "High Quantum Exposure"
        assessment = (
            "Multiple classical asymmetric algorithms detected in active code paths. Migration to NIST PQC standards (FIPS 203/204) "
            "should be prioritized for key exchange and signatures."
        )
    elif score >= 25:
        tier = "Moderate Exposure"
        assessment = (
            "Cryptographic usage contains a mix of legacy symmetric ciphers, broken hashes, or limited asymmetric mechanisms. "
            "Upgrade paths should be scheduled."
        )
    elif score > 0:
        tier = "Low Exposure"
        assessment = (
            "Minimal cryptographic risk detected (e.g. AES-128 key length or test code references). "
            "Review symmetric key sizes and ensure crypto-agility."
        )
    else:
        tier = "Informational / Baseline"
        assessment = (
            "No active classical asymmetric cryptography identified in scanned source code. "
            "Verify dependencies, runtime infrastructure, and network protocols."
        )

    explanation = (
        f"Score of {score}/100 calculated from {counts['High']} High risk (Shor's algorithm exposure @ 25 pts each), "
        f"{counts['Medium']} Medium risk (@ 10 pts each), {counts['Low']} Low risk (@ 5 pts each), and "
        f"{counts['Informational']} Informational findings. Capped at 100."
    )

    return {
        "score": score,
        "tier": tier,
        "assessment": assessment,
        "calculation_explanation": explanation,
        "severity_breakdown": counts,
        "priority_breakdown": priority_counts,
        "algorithm_breakdown": algo_counts,
        "total_findings": len(findings),
        "limitations": SCAN_LIMITATIONS
    }

