"""user attributes, resource attributes, and access policies

Revision ID: 002
Revises: 001
Create Date: 2026-10-09
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_attributes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("attr_key", sa.String(64), nullable=False),
        sa.Column("attr_value", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "attr_key", name="uq_user_attribute_key"),
    )
    op.create_index("ix_user_attributes_user_id", "user_attributes", ["user_id"])

    op.create_table(
        "resource_attributes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("applications.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("attr_key", sa.String(64), nullable=False),
        sa.Column("attr_value", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("application_id", "attr_key", name="uq_resource_attribute_key"),
    )
    op.create_index("ix_resource_attributes_application_id", "resource_attributes", ["application_id"])

    op.create_table(
        "access_policies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("effect", sa.Enum("allow", "deny", name="policy_effect"), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("actions", postgresql.JSONB(), nullable=False),
        sa.Column("resource_match", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("conditions", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("tenant_id", "name", name="uq_policy_tenant_name"),
    )
    op.create_index("ix_access_policies_tenant_id", "access_policies", ["tenant_id"])


def downgrade() -> None:
    op.drop_index("ix_access_policies_tenant_id", table_name="access_policies")
    op.drop_table("access_policies")
    op.drop_index("ix_resource_attributes_application_id", table_name="resource_attributes")
    op.drop_table("resource_attributes")
    op.drop_index("ix_user_attributes_user_id", table_name="user_attributes")
    op.drop_table("user_attributes")
    sa.Enum(name="policy_effect").drop(op.get_bind(), checkfirst=True)
