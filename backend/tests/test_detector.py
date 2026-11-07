"""
Unit Tests for Cryptographic Detection and False Positive Mitigation.
"""
import pytest
from scanner.crypto_detector import scan_file_content, is_comment_line, is_test_file


def test_rsa_ast_and_regex_detection():
    code = """
from Crypto.PublicKey import RSA
key = RSA.generate(2048)
"""
    findings = scan_file_content("service/auth.py", code)
    assert len(findings) > 0
    rsa_findings = [f for f in findings if "RSA" in f["algorithm"]]
    assert len(rsa_findings) > 0
    assert rsa_findings[0]["risk"] == "High"
    assert rsa_findings[0]["migration_priority"] == "P1"
    assert "FIPS 203" in rsa_findings[0]["recommendation"] or "ML-KEM" in rsa_findings[0]["recommendation"]


def test_ecdh_and_dh_detection():
    code = """
from cryptography.hazmat.primitives.asymmetric import ec
secret = server_key.exchange(ec.ECDH(), peer_pub)
"""
    findings = scan_file_content("crypto/exchange.py", code)
    ecdh_findings = [f for f in findings if "ECDH" in f["algorithm"]]
    assert len(ecdh_findings) > 0
    assert ecdh_findings[0]["risk"] == "High"
    assert ecdh_findings[0]["purpose"] == "key establishment"


def test_ecdsa_and_signature_detection():
    js_code = """
const crypto = require('crypto');
const sign = crypto.createSign('SHA256');
sign.update('message');
"""
    findings = scan_file_content("signer.js", js_code)
    assert len(findings) > 0
    sig_finding = findings[0]
    assert sig_finding["purpose"] == "digital signature"
    assert "FIPS 204" in sig_finding["recommendation"] or "ML-DSA" in sig_finding["recommendation"]


def test_aes_symmetric_rules():
    code_128 = "cipher = AES.new(key, AES.MODE_CBC, iv) # AES_128"
    findings_128 = scan_file_content("enc128.py", code_128)
    assert any("AES" in f["algorithm"] for f in findings_128)
    # Check that AES does NOT recommend ML-KEM or ML-DSA
    for f in findings_128:
        if "AES" in f["algorithm"]:
            assert "ML-KEM" not in f["recommendation"]
            assert "ML-DSA" not in f["recommendation"]

    code_256 = "cipher = createCipheriv('aes-256-gcm', key, iv)"
    findings_256 = scan_file_content("enc256.js", code_256)
    assert any("AES-256" in f["algorithm"] for f in findings_256)
    f256 = [f for f in findings_256 if "AES-256" in f["algorithm"]][0]
    assert f256["risk"] == "Informational"


def test_hashes_detection():
    code = """
import hashlib
h1 = hashlib.md5(b"test").hexdigest()
h2 = hashlib.sha1(b"test").hexdigest()
h3 = hashlib.sha256(b"test").hexdigest()
"""
    findings = scan_file_content("hash_util.py", code)
    algos = [f["algorithm"] for f in findings]
    assert "MD5" in algos
    assert "SHA-1" in algos
    assert "SHA-256" in algos

    md5_f = [f for f in findings if f["algorithm"] == "MD5"][0]
    assert md5_f["risk"] == "Medium"
    assert "ML-KEM" not in md5_f["recommendation"]


def test_false_positives_in_comments_and_docs():
    comment_code = """
# We plan to replace RSA and ECDSA with ML-DSA in version 2.0
# Also note that AES-128 was previously considered.
"""
    findings = scan_file_content("docs/architecture.py", comment_code)
    # Any mention in pure comment lines must have Low confidence and Informational risk
    for f in findings:
        assert f["confidence"] == "Low"
        assert f["risk"] == "Informational"


def test_test_file_downgrade():
    test_code = """
def test_rsa_keygen():
    from Crypto.PublicKey import RSA
    key = RSA.generate(2048)
    assert key is not None
"""
    findings = scan_file_content("tests/test_auth.py", test_code)
    assert len(findings) > 0
    for f in findings:
        assert f["confidence"] == "Low"
        assert f["risk"] == "Informational"


def test_pem_and_jwt_detection():
    pem_content = "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
    findings = scan_file_content("certs/key.pem", pem_content)
    assert len(findings) > 0
    assert "PEM" in findings[0]["algorithm"]
    assert findings[0]["risk"] == "High"
