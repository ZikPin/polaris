"""course hidden

Revision ID: be5b4ead9ad9
Revises: a1c3f5e7b9d2
Create Date: 2026-11-10 01:51:34.095615

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'be5b4ead9ad9'
down_revision = 'a1c3f5e7b9d2'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('courses', sa.Column('hidden', sa.Boolean(), server_default=sa.false(), nullable=False))


def downgrade():
    op.drop_column('courses', 'hidden')
