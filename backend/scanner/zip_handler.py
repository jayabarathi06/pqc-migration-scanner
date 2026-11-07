"""
Secure ZIP Handler Module
Validates file sizes, signatures, and guards against zip bombs, path traversal,
and symlinks. Safely extracts allowed source code files into an isolated temp directory.
"""
import io
import os
import stat
import zipfile
import tempfile
from pathlib import Path
from typing import List, Tuple

# Security limits
MAX_UPLOAD_SIZE = 3 * 1024 * 1024          # 3 MB upload limit
MAX_TOTAL_UNCOMPRESSED = 50 * 1024 * 1024   # 50 MB uncompressed limit
MAX_SINGLE_FILE_SIZE = 1 * 1024 * 1024     # 1 MB single file limit
MAX_FILE_COUNT = 2000                      # 2,000 files maximum

# Skip common dependencies, build artifacts, and binary assets
SKIPPED_DIRS = {
    ".git", ".svn", ".hg", "node_modules", "venv", ".venv", "env",
    "dist", "build", "__pycache__", ".pytest_cache", ".idea", ".vscode",
    "target", "vendor", "bin", "obj", ".next", ".nuxt"
}

BINARY_EXTENSIONS = {
    ".exe", ".dll", ".so", ".dylib", ".bin", ".dat", ".iso", ".img",
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp", ".bmp",
    ".mp3", ".mp4", ".wav", ".avi", ".mov", ".mkv",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".tar", ".gz",
    ".7z", ".rar", ".woff", ".woff2", ".ttf", ".eot", ".pyc", ".pyo",
    ".pyd", ".class", ".jar", ".war"
}


class ZipValidationError(Exception):
    """Raised when an uploaded ZIP file violates security or integrity rules."""
    pass


def validate_zip_stream(stream_bytes: bytes) -> None:
    """
    Validates magic bytes and upload size.
    """
    if len(stream_bytes) > MAX_UPLOAD_SIZE:
        raise ZipValidationError(
            f"File size exceeds maximum allowed upload limit of {MAX_UPLOAD_SIZE // (1024 * 1024)} MB."
        )
    if len(stream_bytes) < 4:
        raise ZipValidationError("File is too small to be a valid ZIP archive.")
    
    # Check standard ZIP magic bytes (PK\x03\x04 or empty archive PK\x05\x06)
    if not (stream_bytes.startswith(b"PK\x03\x04") or stream_bytes.startswith(b"PK\x05\x06")):
        raise ZipValidationError("Invalid file signature: uploaded file is not a valid ZIP archive.")


def inspect_and_filter_zip(zf: zipfile.ZipFile) -> List[zipfile.ZipInfo]:
    """
    Inspects archive contents for zip bombs, path traversals, symlinks,
    and returns a filtered list of valid source code ZipInfo entries.
    """
    entries = zf.infolist()
    
    if len(entries) > MAX_FILE_COUNT:
        raise ZipValidationError(
            f"Zip contains {len(entries)} files, exceeding the limit of {MAX_FILE_COUNT} files."
        )

    total_uncompressed_size = 0
    safe_entries: List[zipfile.ZipInfo] = []

    for entry in entries:
        # Check for path traversal (e.g. ../ or absolute paths)
        raw_name = entry.filename.replace("\\", "/")
        if raw_name.startswith("/") or ".." in raw_name.split("/"):
            raise ZipValidationError(f"Path traversal detected in archive entry: {entry.filename}")

        # Check for symlinks (Unix file type in upper 16 bits of external_attr)
        mode = entry.external_attr >> 16
        if stat.S_ISLNK(mode):
            raise ZipValidationError(f"Symlinks are disallowed for security reasons: {entry.filename}")

        # Ignore directory entries for size calculation
        if entry.is_dir() or raw_name.endswith("/"):
            continue

        # Check single file uncompressed size limit
        if entry.file_size > MAX_SINGLE_FILE_SIZE:
            raise ZipValidationError(
                f"File '{entry.filename}' exceeds single file size limit ({entry.file_size} > {MAX_SINGLE_FILE_SIZE} bytes)."
            )

        total_uncompressed_size += entry.file_size
        if total_uncompressed_size > MAX_TOTAL_UNCOMPRESSED:
            raise ZipValidationError(
                f"Total uncompressed archive size exceeds limit of {MAX_TOTAL_UNCOMPRESSED // (1024 * 1024)} MB (Zip bomb protection)."
            )

        # Check if the file is inside a skipped directory or has binary extension
        parts = [p.lower() for p in raw_name.split("/")]
        if any(skip in parts for skip in SKIPPED_DIRS):
            continue

        ext = Path(raw_name).suffix.lower()
        if ext in BINARY_EXTENSIONS:
            continue

        safe_entries.append(entry)

    return safe_entries


def extract_zip_securely(stream_bytes: bytes, destination_dir: str) -> Tuple[int, List[str]]:
    """
    Validates, filters, and extracts safe entries into destination_dir.
    Returns (total_files_extracted, list_of_relative_paths).
    """
    validate_zip_stream(stream_bytes)

    try:
        with zipfile.ZipFile(io.BytesIO(stream_bytes)) as zf:
            safe_entries = inspect_and_filter_zip(zf)
            extracted_paths: List[str] = []
            dest_path = Path(destination_dir).resolve()

            for entry in safe_entries:
                # Sanitize target path
                norm_name = entry.filename.replace("\\", "/").lstrip("/")
                target_file = (dest_path / norm_name).resolve()

                # Double check that resolved path is strictly within dest_path
                if not str(target_file).startswith(str(dest_path)):
                    raise ZipValidationError(f"Invalid extraction path for {entry.filename}")

                target_file.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(entry) as source, open(target_file, "wb") as target:
                    target.write(source.read())

                extracted_paths.append(norm_name)

            return len(extracted_paths), extracted_paths
    except zipfile.BadZipFile as exc:
        raise ZipValidationError(f"Malformed or corrupted ZIP file: {str(exc)}") from exc

