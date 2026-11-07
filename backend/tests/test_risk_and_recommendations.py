"""
Unit Tests for Risk Scoring and Recommendations Logic.
"""
from scanner.risk_analyzer import calculate_quantum_risk_score
from scanner.recommendations import get_recommendation_for_finding


def test_quantum_risk_scoring_capping():
    # 5 High risk findings = 5 * 25 = 125 -> capped at 100
    mock_findings = [
        {"risk": "High", "migration_priority": "P1", "algorithm": "RSA"},
        {"risk": "High", "migration_priority": "P1", "algorithm": "ECDH"},
        {"risk": "High", "migration_priority": "P1", "algorithm": "ECDSA"},
        {"risk": "High", "migration_priority": "P1", "algorithm": "RSA (JWT)"},
        {"risk": "High", "migration_priority": "P1", "algorithm": "Diffie-Hellman"}
    ]
    result = calculate_quantum_risk_score(mock_findings)
    assert result["score"] == 100
    assert result["tier"] == "Critical Quantum Exposure"
    assert result["severity_breakdown"]["High"] == 5


def test_zero_findings_score():
    result = calculate_quantum_risk_score([])
    assert result["score"] == 0
    assert result["total_findings"] == 0


def test_recommendation_standards_mapping():
    # Key establishment
    kem_rec = get_recommendation_for_finding("ECDH", "key establishment", is_active_code=True)
    assert "FIPS 203" in kem_rec["pqc_standard"]
    assert "hybrid" in kem_rec["recommendation"].lower()
    assert kem_rec["migration_priority"] == "P1"

    # Signature
    dsa_rec = get_recommendation_for_finding("ECDSA", "digital signature", is_active_code=True)
    assert "FIPS 204" in dsa_rec["pqc_standard"]
    assert dsa_rec["migration_priority"] == "P1"

    # Symmetric cipher
    aes_rec = get_recommendation_for_finding("AES-128", "symmetric encryption", is_active_code=True)
    assert "NOT replace with a PQC standard" in aes_rec["recommendation"]
    assert "AES-256" in aes_rec["recommendation"]

    # Hash function
    hash_rec = get_recommendation_for_finding("MD5", "hashing", is_active_code=True)
    assert "ML-KEM" not in hash_rec["recommendation"]
    assert "ML-DSA" not in hash_rec["recommendation"]
    assert "SHA-256" in hash_rec["recommendation"]
