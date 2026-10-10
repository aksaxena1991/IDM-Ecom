from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from pydantic import BeforeValidator, Field, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def _parse_cors_origins(value: Any) -> list[str]:
    """Accept list, JSON array string, or comma-separated string from env."""
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return []
        if text.startswith("["):
            parsed = json.loads(text)
            if not isinstance(parsed, list):
                raise ValueError("CORS_ORIGINS JSON must be an array of strings")
            return [str(item).strip() for item in parsed if str(item).strip()]
        return [part.strip() for part in text.split(",") if part.strip()]
    raise TypeError("cors_origins must be a list[str]")


# NoDecode: pydantic-settings would JSON-decode list fields before validators;
# we parse JSON arrays and legacy comma-separated env values ourselves.
CorsOrigins = Annotated[list[str], NoDecode, BeforeValidator(_parse_cors_origins)]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "SSO Backend"
    environment: str = "local"
    debug: bool = True
    base_url: str = "http://localhost:8000"

    database_url: str = "postgresql+asyncpg://sso:sso_dev_password@localhost:5433/sso"
    redis_url: str = "redis://localhost:6379/0"

    # Used for production boot checks; reserved for CSRF HMAC / cookie signing helpers.
    secret_key: str = "change-me"
    cookie_secure: bool = False
    cookie_name: str = "sso_session"

    session_idle_minutes: int = 30
    session_absolute_hours: int = 12

    id_token_ttl_seconds: int = 300
    access_token_ttl_seconds: int = 900
    auth_code_ttl_seconds: int = 60
    refresh_token_ttl_days: int = 30

    admin_rate_limit_per_minute: int = 100
    login_max_failures: int = 5
    login_lockout_seconds: int = 300
    token_rate_limit_per_minute: int = 60
    signup_rate_limit_per_minute: int = 20
    mfa_rate_limit_per_minute: int = 30
    scim_rate_limit_per_minute: int = 120

    mfa_encryption_key: str = "local-dev-mfa-encryption-key-32b!"
    require_admin_mfa: bool = False
    signing_keys_dir: Path = Path("./keys")

    # SPA origins allowed by CORS / cookie CSRF Origin checks
    cors_origins: CorsOrigins = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    # Bearer token required for GET /metrics (Prometheus scrape). Empty disables the endpoint (401).
    metrics_token: str = "local-dev-metrics-token"

    audit_stream_key: str = "sso:audit:events"
    audit_retention_days: int = 365
    audit_csv_max_rows: int = 1_000_000

    @model_validator(mode="after")
    def _reject_insecure_production_defaults(self) -> Settings:
        prod = self.environment.lower() in {"prod", "production"} or self.debug is False
        if not prod:
            return self
        if self.secret_key in {"change-me", "test-secret"}:
            raise ValueError("SECRET_KEY must be set to a strong value when debug=False / production")
        if self.mfa_encryption_key in {
            "local-dev-mfa-encryption-key-32b!",
            "change-me",
        }:
            raise ValueError("MFA_ENCRYPTION_KEY must be set when debug=False / production")
        if not self.cookie_secure:
            raise ValueError("COOKIE_SECURE must be true when debug=False / production")
        if self.metrics_token in {"", "local-dev-metrics-token", "change-me"}:
            raise ValueError("METRICS_TOKEN must be set when debug=False / production")
        self.require_admin_mfa = True
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
