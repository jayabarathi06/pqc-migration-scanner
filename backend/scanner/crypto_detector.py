"""
Cryptographic Detector Engine
Analyzes source code files using Python AST (full support) and multi-language
regex heuristics (limited detection) to identify classical public-key cryptography,
symmetric ciphers, hashes, PEM certificates, JWT algorithms, TLS ciphers, and dependencies.
"""
import ast
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

from scanner.recommendations import get_recommendation_for_finding, PQC_DISCLAIMER

# Map file extensions to languages and support levels
LANGUAGE_MAP = {
    ".py": ("python", "full support"),
    ".js": ("javascript", "limited detection"),
    ".jsx": ("javascript", "limited detection"),
    ".ts": ("typescript", "limited detection"),
    ".tsx": ("typescript", "limited detection"),
    ".java": ("java", "limited detection"),
    ".go": ("go", "limited detection"),
    ".cs": ("csharp", "limited detection"),
    ".php": ("php", "limited detection"),
    ".rb": ("ruby", "limited detection"),
    ".rs": ("rust", "limited detection"),
    ".pem": ("config", "limited detection"),
    ".key": ("config", "limited detection"),
    ".crt": ("config", "limited detection"),
    ".conf": ("config", "limited detection"),
    ".cfg": ("config", "limited detection"),
    ".yaml": ("config", "limited detection"),
    ".yml": ("config", "limited detection"),
    ".json": ("config", "limited detection"),
    ".txt": ("config", "limited detection"),
    ".mod": ("config", "limited detection"),
    ".xml": ("config", "limited detection"),
    ".sh": ("shell", "limited detection"),
    ".bash": ("shell", "limited detection"),
}

# Regex pattern definitions
REGEX_RULES = [
    # 1. PEM Headers & SSH Keys
    {
        "pattern": r"-----BEGIN\s+(RSA|EC|DSA)?\s*PRIVATE\s+KEY-----",
        "algorithm": "RSA/EC Private Key PEM",
        "purpose": "key establishment",
        "default_risk": "High"
    },
    {
        "pattern": r"\b(ssh-rsa|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521)\b",
        "algorithm": "SSH Classical Public Key",
        "purpose": "digital signature",
        "default_risk": "High"
    },

    # 2. OpenSSL CLI commands
    {
        "pattern": r"\bopenssl\s+(genrsa|ecparam|dhparam|dsa)\b",
        "algorithm": "OpenSSL Classical Keygen",
        "purpose": "key establishment",
        "default_risk": "High"
    },

    # 3. TLS Cipher Suites with ECDHE / DHE / RSA
    {
        "pattern": r"\b(ECDHE|DHE)-(RSA|ECDSA)-(AES128|AES256|3DES)[A-Z0-9\-_]*\b",
        "algorithm": "Classical TLS Cipher Suite",
        "purpose": "key establishment",
        "default_risk": "High"
    },

    # 4. JWT Algorithms
    {
        "pattern": r"['\"](RS256|RS384|RS512|PS256|PS384|PS512)['\"]",
        "algorithm": "RSA (JWT RS/PS)",
        "purpose": "digital signature",
        "default_risk": "High"
    },
    {
        "pattern": r"['\"](ES256|ES384|ES512)['\"]",
        "algorithm": "ECDSA (JWT ES)",
        "purpose": "digital signature",
        "default_risk": "High"
    },

    # 5. Public Key / Asymmetric Algorithms
    {
        "pattern": r"\b(RSA\.generate|generate_private_key.*RSA|RSA\.new|RSA_generate_key|crypto\.constants\.RSA|KeyPairGenerator\.getInstance\(['\"]RSA['\"]\))\b",
        "algorithm": "RSA",
        "purpose": "key establishment",
        "default_risk": "High"
    },
    {
        "pattern": r"\b(X25519PrivateKey|x25519|curve25519)\b",
        "algorithm": "X25519",
        "purpose": "key establishment",
        "default_risk": "High"
    },
    {
        "pattern": r"\b(ec\.ECDH\(\)|DiffieHellman|diffie_hellman|generate_parameters.*dh|DH_generate_parameters)\b",
        "algorithm": "ECDH / Diffie-Hellman",
        "purpose": "key establishment",
        "default_risk": "High"
    },
    {
        "pattern": r"(createSign|createVerify)\s*\(\s*['\"][A-Za-z0-9\-_]+['\"]\s*\)|\b(openssl_sign|ecdsa\.SigningKey|ec\.SECP[0-9]+[A-Z0-9]*|prime256v1)\b",
        "algorithm": "ECDSA / Classical Signature",
        "purpose": "digital signature",
        "default_risk": "High"
    },
    {
        "pattern": r"\b(Ed25519PrivateKey|Ed25519|dsa\.generate_private_key)\b",
        "algorithm": "Ed25519 / DSA",
        "purpose": "digital signature",
        "default_risk": "High"
    },

    # 6. Symmetric Ciphers
    {
        "pattern": r"\b(DES3\.new|TripleDES|['\"]des-ede3['\"]|['\"]3des['\"]|\b3DES\b)\b",
        "algorithm": "3DES",
        "purpose": "symmetric encryption",
        "default_risk": "Medium"
    },
    {
        "pattern": r"\b(AES\.new\(.*AES\.MODE_.*|createCipheriv\(['\"]aes-128|['\"]aes-128-[a-z]+['\"]|AES_128)\b",
        "algorithm": "AES-128",
        "purpose": "symmetric encryption",
        "default_risk": "Low"
    },
    {
        "pattern": r"\b(createCipheriv\(['\"]aes-256|['\"]aes-256-[a-z]+['\"]|AES_256)\b",
        "algorithm": "AES-256",
        "purpose": "symmetric encryption",
        "default_risk": "Informational"
    },

    # 7. Hash Functions
    {
        "pattern": r"\b(hashlib\.md5|crypto\.createHash\(['\"]md5['\"]\)|md5\(|MessageDigest\.getInstance\(['\"]MD5['\"]\))\b",
        "algorithm": "MD5",
        "purpose": "hashing",
        "default_risk": "Medium"
    },
    {
        "pattern": r"\b(hashlib\.sha1|crypto\.createHash\(['\"]sha1['\"]\)|sha1\(|MessageDigest\.getInstance\(['\"]SHA-?1['\"]\))\b",
        "algorithm": "SHA-1",
        "purpose": "hashing",
        "default_risk": "Medium"
    },
    {
        "pattern": r"\b(hashlib\.sha256|crypto\.createHash\(['\"]sha256['\"]\)|sha256\(|MessageDigest\.getInstance\(['\"]SHA-?256['\"]\))\b",
        "algorithm": "SHA-256",
        "purpose": "hashing",
        "default_risk": "Informational"
    },
    {
        "pattern": r"\b(hashlib\.sha512|crypto\.createHash\(['\"]sha512['\"]\)|sha512\(|MessageDigest\.getInstance\(['\"]SHA-?512['\"]\))\b",
        "algorithm": "SHA-512",
        "purpose": "hashing",
        "default_risk": "Informational"
    },

    # 8. Dependencies in build files
    {
        "pattern": r"\b(pycryptodome|cryptography|jsonwebtoken|node-forge|bouncycastle|jjwt)\b",
        "algorithm": "Cryptographic Library Dependency",
        "purpose": "unknown",
        "default_risk": "Informational"
    }
]


def is_test_file(path_str: str) -> bool:
    """Checks if a file resides in a test directory or has a test filename pattern."""
    p = path_str.replace("\\", "/").lower()
    parts = p.split("/")
    if any(part in {"test", "tests", "spec", "specs", "__tests__"} for part in parts):
        return True
    filename = parts[-1]
    return (
        filename.startswith("test_") or
        filename.endswith("_test.py") or
        filename.endswith(".test.js") or
        filename.endswith(".spec.js") or
        filename.endswith(".test.ts") or
        filename.endswith(".spec.ts")
    )


def is_comment_line(line_text: str, language: str) -> bool:
    """Detects whether a matched line is purely a comment."""
    stripped = line_text.strip()
    if not stripped:
        return False
    # PEM headers and delimiters are cryptographic artifacts, never comments
    if stripped.startswith("-----BEGIN") or stripped.startswith("-----END"):
        return False
    if stripped.startswith("#"):
        return True
    if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
        return True
    if stripped.startswith("--") or stripped.startswith(";"):
        return True
    return False


def build_snippet(lines: List[str], target_idx: int) -> str:
    """Extracts a 3-line evidence window (previous line, target line, next line)."""
    start = max(0, target_idx - 1)
    end = min(len(lines), target_idx + 2)
    snippet_lines = []
    for i in range(start, end):
        prefix = "-> " if i == target_idx else "   "
        line_num = str(i + 1).rjust(4)
        snippet_lines.append(f"{prefix}{line_num} | {lines[i]}")
    return "\n".join(snippet_lines)


class PythonASTDetector(ast.NodeVisitor):
    """
    AST visitor for Python files to pinpoint precise cryptographic calls,
    imports, and method invocations.
    """
    def __init__(self, lines: List[str], file_path: str):
        self.lines = lines
        self.file_path = file_path
        self.findings: List[Dict[str, Any]] = []

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            name = alias.name
            if name in {"cryptography", "Crypto", "jwt"}:
                self._record_ast_finding(
                    line=node.lineno,
                    algorithm="Cryptographic Module Import",
                    purpose="unknown",
                    default_risk="Informational",
                    confidence="High"
                )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        mod = node.module or ""
        if "Crypto.PublicKey.RSA" in mod or "cryptography.hazmat.primitives.asymmetric.rsa" in mod:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="RSA",
                purpose="key establishment",
                default_risk="High",
                confidence="High"
            )
        elif "asymmetric.ec" in mod or "asymmetric.dh" in mod:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="ECDH / Diffie-Hellman",
                purpose="key establishment",
                default_risk="High",
                confidence="High"
            )
        elif "Crypto.Cipher.AES" in mod:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="AES",
                purpose="symmetric encryption",
                default_risk="Informational",
                confidence="High"
            )
        elif "Crypto.Cipher.DES3" in mod:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="3DES",
                purpose="symmetric encryption",
                default_risk="Medium",
                confidence="High"
            )
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        func_str = self._resolve_call_name(node.func)
        
        # RSA keygen
        if func_str in {"RSA.generate", "rsa.generate_private_key"}:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="RSA",
                purpose="key establishment",
                default_risk="High",
                confidence="High"
            )
        # ECDH exchange
        elif "exchange" in func_str and any("ECDH" in self._resolve_call_name(arg) for arg in node.args):
            self._record_ast_finding(
                line=node.lineno,
                algorithm="ECDH",
                purpose="key establishment",
                default_risk="High",
                confidence="High"
            )
        # DH parameter generation
        elif "generate_parameters" in func_str and "dh" in func_str:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="Diffie-Hellman",
                purpose="key establishment",
                default_risk="High",
                confidence="High"
            )
        # JWT RS256/ES256 encode
        elif "jwt.encode" in func_str:
            # Check algorithm keyword
            algo_val = ""
            for kw in node.keywords:
                if kw.arg == "algorithm" and isinstance(kw.value, ast.Constant):
                    algo_val = str(kw.value.value)
            if "RS" in algo_val or "PS" in algo_val:
                self._record_ast_finding(
                    line=node.lineno,
                    algorithm="RSA (JWT)",
                    purpose="digital signature",
                    default_risk="High",
                    confidence="High"
                )
            elif "ES" in algo_val:
                self._record_ast_finding(
                    line=node.lineno,
                    algorithm="ECDSA (JWT)",
                    purpose="digital signature",
                    default_risk="High",
                    confidence="High"
                )
        # Hashes
        elif "hashlib.md5" in func_str:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="MD5",
                purpose="hashing",
                default_risk="Medium",
                confidence="High"
            )
        elif "hashlib.sha1" in func_str:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="SHA-1",
                purpose="hashing",
                default_risk="Medium",
                confidence="High"
            )
        elif "hashlib.sha256" in func_str:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="SHA-256",
                purpose="hashing",
                default_risk="Informational",
                confidence="High"
            )
        elif "hashlib.sha512" in func_str:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="SHA-512",
                purpose="hashing",
                default_risk="Informational",
                confidence="High"
            )
        # 3DES
        elif "DES3.new" in func_str:
            self._record_ast_finding(
                line=node.lineno,
                algorithm="3DES",
                purpose="symmetric encryption",
                default_risk="Medium",
                confidence="High"
            )

        self.generic_visit(node)

    def _resolve_call_name(self, node: ast.AST) -> str:
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._resolve_call_name(node.value)}.{node.attr}"
        elif isinstance(node, ast.Call):
            return self._resolve_call_name(node.func)
        return ""

    def _record_ast_finding(
        self,
        line: int,
        algorithm: str,
        purpose: str,
        default_risk: str,
        confidence: str
    ):
        target_idx = line - 1
        snippet = build_snippet(self.lines, target_idx)
        in_test = is_test_file(self.file_path)
        is_active = not in_test

        rec_info = get_recommendation_for_finding(
            algorithm=algorithm,
            purpose=purpose,
            is_active_code=is_active
        )

        finding = {
            "algorithm": algorithm,
            "file_path": self.file_path,
            "line": line,
            "evidence_snippet": snippet,
            "purpose": purpose,
            "confidence": "Low" if in_test else confidence,
            "risk": "Informational" if in_test else rec_info["risk_level"],
            "risk_explanation": rec_info["risk_explanation"],
            "recommendation": rec_info["recommendation"],
            "migration_priority": rec_info["migration_priority"],
            "language": "python",
            "support_level": "full support",
            "disclaimer": PQC_DISCLAIMER
        }
        self.findings.append(finding)


def scan_file_content(file_path: str, content: str) -> List[Dict[str, Any]]:
    """
    Scans a single file's text using Python AST (if .py) followed by regex rules.
    Deduplicates findings by (file_path, line, algorithm).
    """
    ext = Path(file_path).suffix.lower()
    language, support_level = LANGUAGE_MAP.get(ext, ("plaintext", "limited detection"))
    lines = content.splitlines()
    in_test = is_test_file(file_path)
    findings: List[Dict[str, Any]] = []
    seen_keys = set()

    # Step 1: Python AST detection if Python file
    if language == "python":
        try:
            tree = ast.parse(content, filename=file_path)
            visitor = PythonASTDetector(lines, file_path)
            visitor.visit(tree)
            for f in visitor.findings:
                key = (f["file_path"], f["line"], f["algorithm"])
                if key not in seen_keys:
                    seen_keys.add(key)
                    findings.append(f)
        except (SyntaxError, ValueError):
            # Fall back to regex if AST cannot parse
            pass

    # Step 2: Multi-language Regex detection
    for line_idx, line_text in enumerate(lines):
        line_num = line_idx + 1
        is_comment = is_comment_line(line_text, language)

        for rule in REGEX_RULES:
            match = re.search(rule["pattern"], line_text, re.IGNORECASE)
            if match:
                algo = rule["algorithm"]
                purpose = rule["purpose"]
                key = (file_path, line_num, algo)
                if key in seen_keys:
                    continue
                seen_keys.add(key)

                is_active = not (in_test or is_comment)
                confidence = "Low" if (in_test or is_comment) else "High"
                
                rec_info = get_recommendation_for_finding(
                    algorithm=algo,
                    purpose=purpose,
                    is_active_code=is_active
                )

                risk = "Informational" if not is_active else rec_info["risk_level"]
                priority = "P3" if not is_active else rec_info["migration_priority"]

                # If it's a comment or in a test file, clarify in risk explanation
                explanation = rec_info["risk_explanation"]
                if is_comment:
                    explanation = f"[Comment / Documentation] Mention only; not active cryptographic execution. {explanation}"
                elif in_test:
                    explanation = f"[Test Suite] Identified in test/mock code path. {explanation}"

                snippet = build_snippet(lines, line_idx)

                findings.append({
                    "algorithm": algo,
                    "file_path": file_path,
                    "line": line_num,
                    "evidence_snippet": snippet,
                    "purpose": purpose,
                    "confidence": confidence,
                    "risk": risk,
                    "risk_explanation": explanation,
                    "recommendation": rec_info["recommendation"],
                    "migration_priority": priority,
                    "language": language,
                    "support_level": support_level,
                    "disclaimer": PQC_DISCLAIMER
                })

    return findings
