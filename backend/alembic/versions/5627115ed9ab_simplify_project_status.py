"""simplify_project_status

Revision ID: 5627115ed9ab
Revises: f9c7c3fc7612
Create Date: 2026-04-12 17:38:34.384716

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5627115ed9ab'
down_revision: Union[str, None] = 'f9c7c3fc7612'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First add new enum value
    op.execute("COMMIT")
    op.execute("ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'inactive'")

    # Now convert existing draft/frozen rows
    op.execute("BEGIN")
    op.execute("UPDATE projects SET status = 'inactive' WHERE status IN ('draft', 'frozen')")


def downgrade() -> None:
    op.execute("UPDATE projects SET status = 'draft' WHERE status = 'inactive'")
