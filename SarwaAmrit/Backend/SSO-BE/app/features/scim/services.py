"""SCIM filter parsers, temporary passwords, and sync-cursor helpers."""

from sqlalchemy import select

from app.core.security import generate_token
from app.models.entities import User


def parse_scim_filter(filter: str | None):
    if not filter:
        return []
    clauses = []
    parts = [p.strip() for p in filter.split(" and ")]
    for part in parts:
        if 'userName eq "' in part:
            value = part.split('userName eq "')[1].rstrip('"')
            clauses.append(User.email == value.lower())
        elif 'externalId eq "' in part:
            value = part.split('externalId eq "')[1].rstrip('"')
            clauses.append(User.external_id == value)
    return clauses


def temporary_password() -> str:
    return generate_token(12)


__all__ = ["parse_scim_filter", "temporary_password", "select"]
