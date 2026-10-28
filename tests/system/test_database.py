from pathlib import Path

import pytest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from flask_migrate import upgrade
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError

from backend.app.extensions import db

MIGRATIONS = Path(__file__).resolve().parents[2] / "backend" / "migrations"

TABLES = {
    "users", "tags", "courses", "course_tags", "course_rows", "course_columns",
    "custom_range_columns", "bool_cells", "number_cells", "calendar_dates", "calendar_date_rows",
}


def test_migrations_create_the_schema(app):
    """ST-24"""
    upgrade(directory=str(MIGRATIONS))

    assert set(inspect(db.engine).get_table_names()) - {"alembic_version"} == TABLES
    with db.engine.connect() as connection:
        context = MigrationContext.configure(connection, opts={"compare_type": True})
        assert compare_metadata(context, db.metadata) == []


def run(sql, ids=None):
    params = {key: value for key, value in (ids or {}).items() if f":{key}" in sql}
    return db.session.execute(text(sql), params)


@pytest.fixture
def ids(tables):
    """A small valid data set. Returns the ids of its records."""
    def insert(sql, **params):
        return run(sql + " RETURNING id", params).scalar_one()

    ids = {}
    ids["user"] = insert("INSERT INTO users (email, password) VALUES ('a@example.com', 'x')")
    ids["tag"] = insert("INSERT INTO tags (value, user_id) VALUES ('ML', :user)", **ids)
    ids["course"] = insert("INSERT INTO courses (title, user_id) VALUES ('Algorithms', :user)", **ids)
    ids["date"] = insert("INSERT INTO calendar_dates (date) VALUES ('2026-11-03')")
    ids["row"] = insert(
        "INSERT INTO course_rows (table_type, title, course_id) VALUES ('lecture', 'Chapter 1', :course)", **ids
    )
    ids["column"] = insert(
        "INSERT INTO course_columns (column_type, table_type, label, course_id) "
        "VALUES ('bool', 'lecture', 'Watched', :course)", **ids
    )
    # a number column that has no entry in custom_range_columns yet
    ids["bare"] = insert(
        "INSERT INTO course_columns (column_type, table_type, label, course_id) "
        "VALUES ('number', 'lecture', 'Grade', :course)", **ids
    )
    run("INSERT INTO course_tags (tag_id, course_id) VALUES (:tag, :course)", ids)
    run("INSERT INTO bool_cells (column_id, row_id, value) VALUES (:column, :row, 1)", ids)
    return ids


VIOLATIONS = {
    "course of an unknown user": "INSERT INTO courses (title, user_id) VALUES ('X', 999)",
    "cell of an unknown row": "INSERT INTO bool_cells (column_id, row_id, value) VALUES (:column, 999, 0)",
    "duplicate email": "INSERT INTO users (email, password) VALUES ('a@example.com', 'x')",
    "duplicate tag value of a user": "INSERT INTO tags (value, user_id) VALUES ('ML', :user)",
    "duplicate date": "INSERT INTO calendar_dates (date) VALUES ('2026-11-03')",
    "duplicate cell": "INSERT INTO bool_cells (column_id, row_id, value) VALUES (:column, :row, 0)",
    "duplicate course tag link": "INSERT INTO course_tags (tag_id, course_id) VALUES (:tag, :course)",
    "invalid table_type of a row":
        "INSERT INTO course_rows (table_type, title, course_id) VALUES ('exam', 'X', :course)",
    "invalid table_type of a column":
        "INSERT INTO course_columns (column_type, table_type, label, course_id) VALUES ('bool', 'exam', 'X', :course)",
    "invalid column_type":
        "INSERT INTO course_columns (column_type, table_type, label, course_id) VALUES ('text', 'lecture', 'X', :course)",
    "invalid preferred_statistic": "INSERT INTO custom_range_columns (id, preferred_statistic) VALUES (:bare, 'median')",
    "min greater than max": "INSERT INTO custom_range_columns (id, min, max) VALUES (:bare, 5, 1)",
    "course without title": "INSERT INTO courses (title, user_id) VALUES (NULL, :user)",
    "row without title":
        "INSERT INTO course_rows (table_type, title, course_id) VALUES ('lecture', NULL, :course)",
}


@pytest.mark.parametrize("sql", VIOLATIONS.values(), ids=VIOLATIONS.keys())
def test_database_rejects(ids, sql):
    """ST-25"""
    with pytest.raises(IntegrityError):
        run(sql, ids)


def test_optional_values_and_defaults(ids):
    """ST-25"""
    ids["row2"] = run(
        "INSERT INTO course_rows (table_type, title, course_id) VALUES ('lecture', 'Chapter 2', :course) RETURNING id",
        ids,
    ).scalar_one()
    run("INSERT INTO bool_cells (column_id, row_id) VALUES (:column, :row2)", ids)
    run("INSERT INTO number_cells (column_id, row_id) VALUES (:bare, :row)", ids)
    run("INSERT INTO custom_range_columns (id) VALUES (:bare)", ids)
    other_user = run("INSERT INTO users (email, password) VALUES ('b@example.com', 'x') RETURNING id").scalar_one()
    run("INSERT INTO tags (value, user_id) VALUES ('ML', :other)", {"other": other_user})

    assert not run("SELECT value FROM bool_cells WHERE row_id = :row2", ids).scalar_one()
    assert run("SELECT value FROM number_cells WHERE row_id = :row", ids).scalar_one() is None
    assert tuple(run("SELECT min, max, preferred_statistic FROM custom_range_columns", ids).one()) == (None, None, "avg")


def test_deleting_a_course_deletes_everything_below_it(ids):
    """ST-25, the cascades of the schema"""
    run("INSERT INTO number_cells (column_id, row_id, value) VALUES (:bare, :row, 2.5)", ids)
    run("INSERT INTO calendar_date_rows (calendar_date_id, row_id) VALUES (:date, :row)", ids)

    run("DELETE FROM courses WHERE id = :course", ids)

    for table in ["course_rows", "course_columns", "bool_cells", "number_cells", "course_tags", "calendar_date_rows"]:
        assert run(f"SELECT COUNT(*) FROM {table}").scalar_one() == 0, table
    for table in ["users", "tags", "calendar_dates"]:
        assert run(f"SELECT COUNT(*) FROM {table}").scalar_one() == 1, table
