"""table types

Revision ID: c7e2a9d4f1b3
Revises: be5b4ead9ad9
Create Date: 2026-11-23 21:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c7e2a9d4f1b3'
down_revision = 'be5b4ead9ad9'
branch_labels = None
depends_on = None

# The old table_type strings and the table types that replace them
TYPES = {'lecture': 'Lectures', 'assignment': 'Assignments'}


def _foreign_keys(enabled):
    # SQLite drops course_rows and course_columns to rebuild them without table_type, and dropping a table deletes its
    # rows first, cascading to the cells and calendar links. The pragma only works outside a transaction.
    if op.get_bind().dialect.name == 'sqlite':
        with op.get_context().autocommit_block():
            op.execute(f"PRAGMA foreign_keys={'ON' if enabled else 'OFF'}")


def upgrade():
    _foreign_keys(False)
    op.create_table('table_types',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_table_types_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_table_types')),
    sa.UniqueConstraint('user_id', 'name', name=op.f('uq_table_types_user_id')),
    sqlite_autoincrement=True
    )
    op.create_table('course_table_types',
    sa.Column('table_type_id', sa.Integer(), nullable=False),
    sa.Column('course_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['course_id'], ['courses.id'], name=op.f('fk_course_table_types_course_id_courses'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['table_type_id'], ['table_types.id'], name=op.f('fk_course_table_types_table_type_id_table_types'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('table_type_id', 'course_id', name=op.f('pk_course_table_types'))
    )

    # Every user gets both types and every course both tables, so all existing data keeps its table (REQ-F-83)
    for name in TYPES.values():
        op.execute(f"INSERT INTO table_types (name, user_id) SELECT '{name}', id FROM users")
    op.execute(
        "INSERT INTO course_table_types (table_type_id, course_id) "
        "SELECT table_types.id, courses.id FROM courses JOIN table_types ON table_types.user_id = courses.user_id"
    )
    for table in ('course_rows', 'course_columns'):
        op.add_column(table, sa.Column('table_type_id', sa.Integer(), nullable=True))
        for old, name in TYPES.items():
            op.execute(
                f"UPDATE {table} SET table_type_id = (SELECT table_types.id FROM table_types "
                f"JOIN courses ON courses.user_id = table_types.user_id "
                f"WHERE courses.id = {table}.course_id AND table_types.name = '{name}') "
                f"WHERE table_type = '{old}'"
            )
        with op.batch_alter_table(table, table_kwargs={'sqlite_autoincrement': True}) as batch_op:
            batch_op.alter_column('table_type_id', existing_type=sa.Integer(), nullable=False)
            batch_op.create_foreign_key(
                batch_op.f(f'fk_{table}_table_type_id_table_types'), 'table_types', ['table_type_id'], ['id'],
                ondelete='CASCADE',
            )
            batch_op.drop_constraint(batch_op.f(f'ck_{table}_table_type'), type_='check')
            batch_op.drop_column('table_type')
    _foreign_keys(True)


def downgrade():
    # Rows and columns of any other table type cannot be kept, their cells and calendar links go with them
    for table in ('course_rows', 'course_columns'):
        op.execute(
            f"DELETE FROM {table} WHERE table_type_id NOT IN "
            f"(SELECT id FROM table_types WHERE name IN ({', '.join(repr(name) for name in TYPES.values())}))"
        )
    _foreign_keys(False)
    for table in ('course_rows', 'course_columns'):
        op.add_column(table, sa.Column('table_type', sa.String(), nullable=True))
        for old, name in TYPES.items():
            op.execute(
                f"UPDATE {table} SET table_type = '{old}' "
                f"WHERE table_type_id IN (SELECT id FROM table_types WHERE name = '{name}')"
            )
        with op.batch_alter_table(table, table_kwargs={'sqlite_autoincrement': True}) as batch_op:
            batch_op.alter_column('table_type', existing_type=sa.String(), nullable=False)
            batch_op.create_check_constraint('table_type', "table_type IN ('lecture', 'assignment')")
            batch_op.drop_constraint(batch_op.f(f'fk_{table}_table_type_id_table_types'), type_='foreignkey')
            batch_op.drop_column('table_type_id')
    op.drop_table('course_table_types')
    op.drop_table('table_types')
    _foreign_keys(True)
