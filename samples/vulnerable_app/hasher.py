"""
Hashing Utility Functions (Sample Test File).
Tests SHA family and legacy broken hashes (MD5, SHA-1).
"""
import hashlib

def compute_checksum_md5(data: bytes) -> str:
    # MD5 is cryptographically broken classically; low quantum collision resistance.
    return hashlib.md5(data).hexdigest()

def compute_legacy_sha1(data: bytes) -> str:
    # SHA-1 is vulnerable to collision attacks.
    return hashlib.sha1(data).hexdigest()

def compute_sha256(data: bytes) -> str:
    # SHA-256 remains secure against known quantum collision attacks.
    return hashlib.sha256(data).hexdigest()

def compute_sha512(data: bytes) -> str:
    # SHA-512 provides high classical and quantum collision resistance.
    return hashlib.sha512(data).hexdigest()

