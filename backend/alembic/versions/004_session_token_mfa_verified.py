"""session token hash + mfa factor verified_at

Revision ID: 004
Revises: 003
Create Date: 2026-10-09
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("sessions", sa.Column("token_hash", sa.String(128), nullable=True))
    op.create_index("ix_sessions_token_hash", "sessions", ["token_hash"], unique=True)
    op.add_column("mfa_factors", sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True))
    # Existing factors are treated as already verified
    op.execute("UPDATE mfa_factors SET verified_at = created_at WHERE verified_at IS NULL")


def downgrade() -> None:
    op.drop_column("mfa_factors", "verified_at")
    op.drop_index("ix_sessions_token_hash", table_name="sessions")
    op.drop_column("sessions", "token_hash")
