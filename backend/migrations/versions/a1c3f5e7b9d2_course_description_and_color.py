"""course description and color

Revision ID: a1c3f5e7b9d2
Revises: dd8508320ac3
Create Date: 2026-11-02 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1c3f5e7b9d2'
down_revision = 'dd8508320ac3'
branch_labels = None
depends_on = None

COLORS = "'clay', 'mustard', 'olive', 'sage', 'teal', 'blue', 'periwinkle', 'plum', 'rose', 'stone'"


def upgrade():
    op.add_column('courses', sa.Column('description', sa.String(), server_default='', nullable=False))
    # Plain SQL: SQLite can only add a check constraint by rebuilding the table, and dropping `courses` would cascade
    # to everything below it
    op.execute(
        f"ALTER TABLE courses ADD COLUMN color VARCHAR NOT NULL DEFAULT 'clay' "
        f"CONSTRAINT ck_courses_color CHECK (color IN ({COLORS}))"
    )


def downgrade():
    op.drop_column('courses', 'color')  # SQLite cannot drop a column that has a check constraint
    op.drop_column('courses', 'description')
