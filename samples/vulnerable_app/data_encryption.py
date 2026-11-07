"""
Symmetric Encryption Service (Sample Test File).
Tests AES and legacy 3DES detection.
"""

def encrypt_with_aes_128(plaintext: bytes, key: bytes, iv: bytes):
    # AES-128: Grover's algorithm reduces effective security margin to 64-bit strength.
    from Crypto.Cipher import AES
    cipher = AES.new(key, AES.MODE_CBC, iv)
    return cipher.encrypt(plaintext)

def encrypt_with_aes_256(plaintext: bytes, key: bytes, nonce: bytes):
    # AES-256: Post-quantum resilient (128-bit quantum security level under Grover's).
    from Crypto.Cipher import AES
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return ciphertext, tag

def legacy_triple_des_encrypt(plaintext: bytes, key: bytes):
    # Legacy 3DES / DES - Weak classical and quantum security.
    from Crypto.Cipher import DES3
    cipher = DES3.new(key, DES3.MODE_ECB)
    return cipher.encrypt(plaintext)
