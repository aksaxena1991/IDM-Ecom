"""Phase 2/5/6 security posture tests."""

from __future__ import annotations

import pyotp
import pytest

from app.core.redirects import safe_redirect_path
from app.core.security import decrypt_secret, encrypt_secret
from app.features.mfa.services import otpauth_qr_data_url
from app.services.mfa_service import mfa_service
from app.services.policy_engine import evaluate


def test_redirect_allowlist_relative_only():
    assert safe_redirect_path("/dashboard") == "/dashboard"
    assert safe_redirect_path("//evil.com") == "/"
    assert safe_redirect_path("https://evil.com") == "/"
    assert safe_redirect_path("http://evil.com/x") == "/"
    assert safe_redirect_path(None) == "/"
    # Same-origin absolute resume (e.g. after SSO authorize → hosted login)
    assert (
        safe_redirect_path(
            "http://localhost:8000/oauth2/authorize?client_id=demo",
            base_url="http://localhost:8000",
        )
        == "/oauth2/authorize?client_id=demo"
    )
    assert (
        safe_redirect_path(
            "http://evil.com/oauth2/authorize",
            base_url="http://localhost:8000",
        )
        == "/"
    )


def test_mfa_encrypt_v2_roundtrip_and_legacy_decrypt(monkeypatch):
    from app.core import security as sec

    monkeypatch.setattr(
        sec, "get_settings", lambda: type("S", (), {"mfa_encryption_key": "unit-test-mfa-key-32-bytes!!"})()
    )
    cipher = encrypt_secret("hello-secret")
    assert cipher.startswith("v2:")
    assert decrypt_secret(cipher) == "hello-secret"
    legacy = sec._fernet(b"sso-mfa-v1").encrypt(b"legacy").decode("utf-8")
    assert decrypt_secret(legacy) == "legacy"


def test_app_access_default_deny_without_policies():
    decision = evaluate(
        [],
        action="app:access",
        subject={"status": "active"},
        resource={},
        environment={"hour": 12, "weekday": 1},
    )
    assert decision.allowed is False
    assert decision.reason == "no_policy_for_action"


def test_otpauth_qr_data_url_is_png():
    uri = "otpauth://totp/SSO:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SSO"
    data_url = otpauth_qr_data_url(uri)
    assert data_url.startswith("data:image/png;base64,")
    assert len(data_url) > 200


@pytest.mark.asyncio
async def test_mfa_pending_until_verify(db_session, seeded):
    user = seeded["user"]
    factor, secret, _uri = await mfa_service.enroll_totp(db_session, user.id)
    assert factor.verified_at is None
    assert await mfa_service.has_mfa(db_session, user.id) is False
    code = pyotp.TOTP(secret).now()
    assert await mfa_service.verify_totp(db_session, user.id, code) is True
    assert await mfa_service.has_mfa(db_session, user.id) is True
