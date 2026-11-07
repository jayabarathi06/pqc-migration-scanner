"""
Unit Tests for ZIP Hardening and Security Rules.
"""
import io
import zipfile
import pytest

from scanner.zip_handler import (
    extract_zip_securely,
    validate_zip_stream,
    ZipValidationError,
    MAX_UPLOAD_SIZE,
    MAX_SINGLE_FILE_SIZE
)


def test_invalid_magic_bytes():
    corrupted_data = b"NOT_A_ZIP_HEADER"
    with pytest.raises(ZipValidationError, match="Invalid file signature"):
        validate_zip_stream(corrupted_data)


def test_oversized_upload_limit():
    huge_data = b"PK\x03\x04" + (b"0" * (MAX_UPLOAD_SIZE + 10))
    with pytest.raises(ZipValidationError, match="exceeds maximum allowed upload limit"):
        validate_zip_stream(huge_data)


def test_path_traversal_rejection(tmp_path):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("../../etc/passwd", "root:x:0:0:")
    zip_bytes = buf.getvalue()

    with pytest.raises(ZipValidationError, match="Path traversal detected"):
        extract_zip_securely(zip_bytes, str(tmp_path))


def test_single_file_size_limit_rejection(tmp_path):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        # File compressed to small bytes, but expands beyond MAX_SINGLE_FILE_SIZE
        zf.writestr("large.txt", "A" * (MAX_SINGLE_FILE_SIZE + 500))
    zip_bytes = buf.getvalue()

    with pytest.raises(ZipValidationError, match="exceeds single file size limit"):
        extract_zip_securely(zip_bytes, str(tmp_path))


def test_valid_safe_extraction(tmp_path):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("src/main.py", "print('hello world')")
        zf.writestr(".git/HEAD", "ref: refs/heads/main")  # should be skipped
        zf.writestr("node_modules/pkg/index.js", "console.log()")  # should be skipped
    zip_bytes = buf.getvalue()

    count, files = extract_zip_securely(zip_bytes, str(tmp_path))
    assert count == 1
    assert "src/main.py" in files
    assert not (tmp_path / ".git").exists()
    assert not (tmp_path / "node_modules").exists()
