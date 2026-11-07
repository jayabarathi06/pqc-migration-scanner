"""
Post-Quantum Cryptography (PQC) Recommendations Engine
Provides guidance aligned with NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA),
and FIPS 205 (SLH-DSA), as well as Grover's impact on symmetric ciphers.
"""
from typing import Dict, Any

PQC_DISCLAIMER = (
    "Potential detection, not proof. Static code scanning identifies cryptographic symbols "
    "and syntax patterns. This does not prove whether the identified code executes in production, "
    "nor does it prove the overall system is quantum-safe or quantum-vulnerable. Formal cryptographic "
    "architecture review is recommended."
)

STANDARDS_CATALOG = {
    "FIPS_203": {
        "standard": "FIPS 203 (ML-KEM)",
        "title": "Module-Lattice-Based Key-Encapsulation Mechanism",
        "description": "Primary NIST standard for general post-quantum key establishment derived from Kyber.",
        "parameter_sets": ["ML-KEM-512 (Category 1)", "ML-KEM-768 (Category 3 - Recommended)", "ML-KEM-1024 (Category 5)"],
        "use_case": "Public-key encryption, TLS key exchange, secure tunnel key establishment."
    },
    "FIPS_204": {
        "standard": "FIPS 204 (ML-DSA)",
        "title": "Module-Lattice-Based Digital Signature Algorithm",
        "description": "Primary NIST standard for general post-quantum digital signatures derived from Dilithium.",
        "parameter_sets": ["ML-DSA-44 (Category 2)", "ML-DSA-65 (Category 3 - Recommended)", "ML-DSA-87 (Category 5)"],
        "use_case": "Digital signatures, document signing, identity tokens, certificate authorities."
    },
    "FIPS_205": {
        "standard": "FIPS 205 (SLH-DSA)",
        "title": "Stateless Hash-Based Digital Signature Algorithm",
        "description": "Backup NIST standard for digital signatures derived from SPHINCS+, based only on hash functions.",
        "parameter_sets": ["SLH-DSA-SHA2-128s/f", "SLH-DSA-SHAKE-128s/f", "SLH-DSA-SHA2-192s/f", "SLH-DSA-SHA2-256s/f"],
        "use_case": "Firmware signing, long-term archival verification, non-lattice fallback."
    }
}


def get_recommendation_for_finding(
    algorithm: str,
    purpose: str,
    is_active_code: bool = True
) -> Dict[str, Any]:
    """
    Returns tailored PQC migration advice, rationale, and priority for a specific finding.
    Strictly adheres to:
      - Key establishment -> FIPS 203 (ML-KEM) & Hybrid X25519+ML-KEM
      - Digital signatures -> FIPS 204 (ML-DSA) or FIPS 205 (SLH-DSA)
      - AES -> Assess key length (AES-256); NO PQC replacement recommended
      - Hashes -> Assess classical collision resistance; NO ML-KEM/ML-DSA recommended
    """
    algo_upper = algorithm.upper()

    # Case 1: Key Establishment / Public Key Exchange
    if purpose == "key establishment" or any(k in algo_upper for k in ["ECDH", "DIFFIE-HELLMAN", "DH", "X25519"]):
        return {
            "pqc_standard": "FIPS 203 (ML-KEM)",
            "migration_priority": "P1" if is_active_code else "P3",
            "risk_level": "High" if is_active_code else "Informational",
            "risk_explanation": (
                "Classical discrete logarithm and elliptic curve Diffie-Hellman mechanisms are completely "
                "vulnerable to Shor's algorithm on a Cryptanalytically Relevant Quantum Computer (CRQC). "
                "Adversaries can record current encrypted traffic today and decrypt it in the future ('Harvest Now, Decrypt Later')."
            ),
            "recommendation": (
                "Evaluate migration to NIST FIPS 203 (ML-KEM-768). During transition, adopt hybrid key exchange "
                "(e.g., X25519 + ML-KEM-768) combining classical and post-quantum algorithms to preserve backward compatibility "
                "while providing immediate quantum resistance."
            ),
            "migration_steps": [
                "1. Inventory all protocol endpoints performing key agreement (TLS, VPN, SSH, custom protocols).",
                "2. Upgrade protocol libraries to versions supporting post-quantum hybrid KEM (e.g. X25519Kyber768Draft00 / ML-KEM).",
                "3. Ensure cryptographic agility to allow smooth parameter updates as ecosystem adoption matures."
            ]
        }

    # Case 2: Digital Signatures / Identity / Certificates
    if purpose == "digital signature" or any(s in algo_upper for s in ["ECDSA", "DSA", "ED25519", "RSA-PSS", "RS256", "ES256", "PS256"]):
        return {
            "pqc_standard": "FIPS 204 (ML-DSA) / FIPS 205 (SLH-DSA)",
            "migration_priority": "P1" if is_active_code else "P3",
            "risk_level": "High" if is_active_code else "Informational",
            "risk_explanation": (
                "Classical asymmetric signatures (RSA, ECDSA, DSA, Ed25519) can be forged using Shor's algorithm "
                "on a CRQC by computing the private key from the public key, enabling signature forgery and identity impersonation."
            ),
            "recommendation": (
                "Evaluate migration to NIST FIPS 204 (ML-DSA-65) for general digital signatures. For high-assurance "
                "environments or where lattice assumptions are undesirable (e.g., firmware/code signing), evaluate NIST FIPS 205 (SLH-DSA)."
            ),
            "migration_steps": [
                "1. Audit token generators, API authentication, code signing certificates, and mutual TLS configurations.",
                "2. Prepare systems for increased signature and public key sizes required by post-quantum signature schemes.",
                "3. Transition to hybrid digital certificates or dual-signature schemes in accordance with PKI migration roadmaps."
            ]
        }

    # Case 3: RSA (Generic / Asymmetric encryption or unspecified purpose)
    if "RSA" in algo_upper:
        return {
            "pqc_standard": "FIPS 203 (ML-KEM) / FIPS 204 (ML-DSA)",
            "migration_priority": "P1" if is_active_code else "P3",
            "risk_level": "High" if is_active_code else "Informational",
            "risk_explanation": (
                "RSA factorization is efficiently solved by Shor's algorithm in polynomial time on a CRQC. "
                "Regardless of whether RSA is used for encryption (KEM) or signing, 2048-bit and 4096-bit keys offer no quantum resistance."
            ),
            "recommendation": (
                "Phase out RSA. For encryption/key exchange, migrate to ML-KEM (FIPS 203) or hybrid X25519+ML-KEM. "
                "For authentication and signing, migrate to ML-DSA (FIPS 204) or SLH-DSA (FIPS 205)."
            ),
            "migration_steps": [
                "1. Isolate whether RSA is invoked for key encapsulation, data encryption, or signatures.",
                "2. Replace RSA key exchange with ML-KEM-768 or hybrid mode.",
                "3. Plan certificate renewal cycles with quantum-ready root authorities."
            ]
        }

    # Case 4: Symmetric Encryption (AES, 3DES, DES)
    if any(sym in algo_upper for sym in ["AES", "3DES", "DES", "BLOWFISH"]):
        if "3DES" in algo_upper or "DES" in algo_upper:
            return {
                "pqc_standard": "AES-256 (Symmetric assessment)",
                "migration_priority": "P2" if is_active_code else "P3",
                "risk_level": "Medium" if is_active_code else "Informational",
                "risk_explanation": (
                    "Legacy 3DES/DES is cryptographically obsolete classically (due to 64-bit block size and Sweet32 attacks) "
                    "and has insufficient key space under Grover's algorithm."
                ),
                "recommendation": (
                    "Do NOT replace with a PQC standard. Migrate immediately to standard AES-256 in GCM or CCM authenticated mode. "
                    "Symmetric ciphers require key size evaluation, not lattice-based PQC replacement."
                ),
                "migration_steps": [
                    "1. Deprecate all uses of DES/3DES.",
                    "2. Upgrade cipher suites to AES-256-GCM.",
                    "3. Ensure secure, random IV/nonce generation."
                ]
            }
        
        # AES-128
        if "128" in algo_upper:
            return {
                "pqc_standard": "AES-256 (Symmetric assessment)",
                "migration_priority": "P2" if is_active_code else "P3",
                "risk_level": "Low" if is_active_code else "Informational",
                "risk_explanation": (
                    "Grover's algorithm provides a quadratic speedup for brute-force symmetric key search, reducing "
                    "the effective security margin of AES-128 from 128 bits to roughly 64 bits of quantum security."
                ),
                "recommendation": (
                    "Do NOT replace with a PQC standard. Instead, upgrade key length to AES-256, which provides 128 bits "
                    "of quantum security under Grover's algorithm—well beyond brute-force feasibility."
                ),
                "migration_steps": [
                    "1. Review symmetric key generation to provision 256-bit keys.",
                    "2. Configure symmetric cipher instances to use AES-256-GCM.",
                    "3. Maintain proper key rotation practices."
                ]
            }

        # AES-256 (Informational)
        return {
            "pqc_standard": "AES-256 (Already Post-Quantum Resilient)",
            "migration_priority": "P3",
            "risk_level": "Informational",
            "risk_explanation": (
                "AES-256 offers 256 bits of classical security and 128 bits of quantum security under Grover's algorithm. "
                "It is considered quantum-resistant for symmetric encryption."
            ),
            "recommendation": (
                "No PQC replacement needed. AES-256 remains compliant with post-quantum security requirements. "
                "Ensure authenticated encryption modes (e.g. GCM) and secure key distribution."
            ),
            "migration_steps": [
                "1. Verify key management and secure transmission over quantum-safe key exchange channels."
            ]
        }

    # Case 5: Hash Functions (MD5, SHA-1, SHA-2, SHA-3)
    if any(h in algo_upper for h in ["MD5", "SHA-1", "SHA1", "SHA-256", "SHA-384", "SHA-512", "SHA256", "SHA512"]):
        if "MD5" in algo_upper or "SHA-1" in algo_upper or "SHA1" in algo_upper:
            return {
                "pqc_standard": "SHA-256 / SHA-384 / SHA-3 (Hash upgrade)",
                "migration_priority": "P2" if is_active_code else "P3",
                "risk_level": "Medium" if is_active_code else "Informational",
                "risk_explanation": (
                    "MD5 and SHA-1 are broken under classical cryptanalysis with practical collision attacks. "
                    "Quantum algorithms further diminish any remaining security margin."
                ),
                "recommendation": (
                    "Upgrade to modern collision-resistant cryptographic hash functions such as SHA-256, SHA-384, or SHA-3/SHAKE. "
                    "Hash functions require collision security upgrades, not post-quantum KEM or signature replacements."
                ),
                "migration_steps": [
                    "1. Replace MD5/SHA-1 digest calls with SHA-256 or SHA-512.",
                    "2. If used for passwords, migrate to memory-hard functions (Argon2id)."
                ]
            }
        
        # SHA-256+
        return {
            "pqc_standard": "SHA-2 / SHA-3 (Standard Hash)",
            "migration_priority": "P3",
            "risk_level": "Informational",
            "risk_explanation": (
                "SHA-256, SHA-384, and SHA-512 offer adequate preimage and collision resistance against quantum attacks "
                "(Brassard-Høyer-Tapp quantum collision algorithm requires $O(2^{n/3})$ operations)."
            ),
            "recommendation": (
                "No PQC replacement needed. SHA-256 and SHA-384/512 are suitable for quantum-resistant hashing architectures."
            ),
            "migration_steps": [
                "1. Keep using SHA-256 or SHA-384/512 in conjunction with post-quantum signature schemes."
            ]
        }

    # Fallback / Unknown
    return {
        "pqc_standard": "Review Cryptographic Usage",
        "migration_priority": "P3",
        "risk_level": "Informational",
        "risk_explanation": "Identified cryptographic artifact or dependency requires architectural review.",
        "recommendation": "Review context and assess whether asymmetric key establishment or signing is involved.",
        "migration_steps": [
            "1. Confirm specific cipher or algorithm parameters.",
            "2. Align with NIST Post-Quantum Cryptography transition timelines."
        ]
    }
