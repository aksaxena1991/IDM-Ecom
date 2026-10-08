from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app.core.config import get_settings

_ph = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=2)


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _ph.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def generate_token(nbytes: int = 32) -> str:
    return secrets.token_urlsafe(nbytes)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def pkce_challenge_s256(verifier: str) -> str:
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")


def verify_pkce(verifier: str, challenge: str, method: str) -> bool:
    if method != "S256":
        return False
    return hmac.compare_digest(pkce_challenge_s256(verifier), challenge)


def _fernet(salt: bytes) -> Fernet:
    settings = get_settings()
    raw = settings.mfa_encryption_key.encode("utf-8")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100_000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(raw))
    return Fernet(key)


def encrypt_secret(plaintext: str) -> str:
    """Encrypt with current key version (v2). Prefer KMS in production deployments."""
    token = _fernet(b"sso-mfa-v2").encrypt(plaintext.encode("utf-8")).decode("utf-8")
    return f"v2:{token}"


def decrypt_secret(ciphertext: str) -> str:
    if ciphertext.startswith("v2:"):
        return _fernet(b"sso-mfa-v2").decrypt(ciphertext[3:].encode("utf-8")).decode("utf-8")
    # Legacy v1 (no prefix)
    try:
        return _fernet(b"sso-mfa-v1").decrypt(ciphertext.encode("utf-8")).decode("utf-8")
    except Exception:
        return _fernet(b"sso-mfa-v2").decrypt(ciphertext.encode("utf-8")).decode("utf-8")


def constant_time_equals(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)


def encode_cursor(value: str) -> str:
    return base64.urlsafe_b64encode(value.encode("utf-8")).decode("ascii")


def decode_cursor(cursor: str) -> str:
    return base64.urlsafe_b64decode(cursor.encode("ascii")).decode("utf-8")


def problem_oauth_error(error: str, description: str, status: int = 400) -> dict[str, Any]:
    return {"error": error, "error_description": description, "status": status}
