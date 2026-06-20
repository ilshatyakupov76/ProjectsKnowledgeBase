"""create projects and features tables

Revision ID: 0001_create_projects_features
Revises: None
Create Date: 2026-06-06
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_create_projects_features"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("client", sa.String(length=255), nullable=False),
        sa.Column("industry", sa.String(length=255), nullable=False),
        sa.Column("platform", sa.String(length=255), nullable=False),
        sa.Column("product", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "features",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("project_id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=500), nullable=False),
        sa.Column("analysis_hours", sa.Integer(), nullable=False),
        sa.Column("development_hours", sa.Integer(), nullable=False),
        sa.Column("testing_hours", sa.Integer(), nullable=False),
        sa.Column("stack", sa.String(length=500), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_features_project_id", "features", ["project_id"])
    op.create_index("ix_projects_client", "projects", ["client"])
    op.create_index("ix_projects_industry", "projects", ["industry"])
    op.create_index("ix_projects_platform", "projects", ["platform"])
    op.create_index("ix_projects_product", "projects", ["product"])


def downgrade() -> None:
    op.drop_index("ix_projects_product", table_name="projects")
    op.drop_index("ix_projects_platform", table_name="projects")
    op.drop_index("ix_projects_industry", table_name="projects")
    op.drop_index("ix_projects_client", table_name="projects")
    op.drop_index("ix_features_project_id", table_name="features")
    op.drop_table("features")
    op.drop_table("projects")
