from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


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

    database_url: str = "postgresql+asyncpg://sso:sso_dev_password@localhost:5432/sso"
    redis_url: str = "redis://localhost:6379/0"

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

    mfa_encryption_key: str = "local-dev-mfa-encryption-key-32b!"
    signing_keys_dir: Path = Path("./keys")

    audit_stream_key: str = "sso:audit:events"
    audit_retention_days: int = 365
    audit_csv_max_rows: int = 1_000_000


@lru_cache
def get_settings() -> Settings:
    return Settings()
