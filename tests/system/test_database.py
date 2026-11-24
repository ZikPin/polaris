from pathlib import Path

import pytest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from flask_migrate import upgrade
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError

from backend.app.extensions import db

pytestmark = pytest.mark.usefixtures("db_context")

MIGRATIONS = Path(__file__).resolve().parents[2] / "backend" / "migrations"

TABLES = {
    "users", "tags", "table_types", "courses", "course_tags", "course_table_types", "course_rows", "course_columns",
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
    ids["type"] = insert("INSERT INTO table_types (name, user_id) VALUES ('Lectures', :user)", **ids)
    ids["course"] = insert("INSERT INTO courses (title, user_id) VALUES ('Algorithms', :user)", **ids)
    ids["date"] = insert("INSERT INTO calendar_dates (date) VALUES ('2026-11-03')")
    ids["row"] = insert(
        "INSERT INTO course_rows (table_type_id, title, course_id) VALUES (:type, 'Chapter 1', :course)", **ids
    )
    ids["column"] = insert(
        "INSERT INTO course_columns (column_type, table_type_id, label, course_id) "
        "VALUES ('bool', :type, 'Watched', :course)", **ids
    )
    # a number column that has no entry in custom_range_columns yet
    ids["bare"] = insert(
        "INSERT INTO course_columns (column_type, table_type_id, label, course_id) "
        "VALUES ('number', :type, 'Grade', :course)", **ids
    )
    run("INSERT INTO course_tags (tag_id, course_id) VALUES (:tag, :course)", ids)
    run("INSERT INTO course_table_types (table_type_id, course_id) VALUES (:type, :course)", ids)
    run("INSERT INTO bool_cells (column_id, row_id, value) VALUES (:column, :row, true)", ids)
    return ids


VIOLATIONS = {
    "course of an unknown user": "INSERT INTO courses (title, user_id) VALUES ('X', 999)",
    "cell of an unknown row": "INSERT INTO bool_cells (column_id, row_id, value) VALUES (:column, 999, false)",
    "duplicate email": "INSERT INTO users (email, password) VALUES ('a@example.com', 'x')",
    "duplicate tag value of a user": "INSERT INTO tags (value, user_id) VALUES ('ML', :user)",
    "duplicate date": "INSERT INTO calendar_dates (date) VALUES ('2026-11-03')",
    "duplicate cell": "INSERT INTO bool_cells (column_id, row_id, value) VALUES (:column, :row, false)",
    "duplicate course tag link": "INSERT INTO course_tags (tag_id, course_id) VALUES (:tag, :course)",
    "duplicate table type name of a user": "INSERT INTO table_types (name, user_id) VALUES ('Lectures', :user)",
    "duplicate course table type link":
        "INSERT INTO course_table_types (table_type_id, course_id) VALUES (:type, :course)",
    "row of an unknown table type":
        "INSERT INTO course_rows (table_type_id, title, course_id) VALUES (999, 'X', :course)",
    "column of an unknown table type":
        "INSERT INTO course_columns (column_type, table_type_id, label, course_id) VALUES ('bool', 999, 'X', :course)",
    "invalid column_type":
        "INSERT INTO course_columns (column_type, table_type_id, label, course_id) VALUES ('text', :type, 'X', :course)",
    "invalid preferred_statistic": "INSERT INTO custom_range_columns (id, preferred_statistic) VALUES (:bare, 'median')",
    "min greater than max": "INSERT INTO custom_range_columns (id, min, max) VALUES (:bare, 5, 1)",
    "course without title": "INSERT INTO courses (title, user_id) VALUES (NULL, :user)",
    "course with a color outside the palette": "INSERT INTO courses (title, color, user_id) VALUES ('X', 'red', :user)",
    "course without description": "INSERT INTO courses (title, description, user_id) VALUES ('X', NULL, :user)",
    "course without color": "INSERT INTO courses (title, color, user_id) VALUES ('X', NULL, :user)",
    "course without hidden": "INSERT INTO courses (title, hidden, user_id) VALUES ('X', NULL, :user)",
    "row without title":
        "INSERT INTO course_rows (table_type_id, title, course_id) VALUES (:type, NULL, :course)",
    "table type without name": "INSERT INTO table_types (name, user_id) VALUES (NULL, :user)",
}


@pytest.mark.parametrize("sql", VIOLATIONS.values(), ids=VIOLATIONS.keys())
def test_database_rejects(ids, sql):
    """ST-25, ST-34"""
    with pytest.raises(IntegrityError):
        run(sql, ids)


def test_optional_values_and_defaults(ids):
    """ST-25"""
    ids["row2"] = run(
        "INSERT INTO course_rows (table_type_id, title, course_id) VALUES (:type, 'Chapter 2', :course) RETURNING id",
        ids,
    ).scalar_one()
    run("INSERT INTO bool_cells (column_id, row_id) VALUES (:column, :row2)", ids)
    run("INSERT INTO number_cells (column_id, row_id) VALUES (:bare, :row)", ids)
    run("INSERT INTO custom_range_columns (id) VALUES (:bare)", ids)
    other_user = run("INSERT INTO users (email, password) VALUES ('b@example.com', 'x') RETURNING id").scalar_one()
    run("INSERT INTO tags (value, user_id) VALUES ('ML', :other)", {"other": other_user})
    run("INSERT INTO table_types (name, user_id) VALUES ('Lectures', :other)", {"other": other_user})

    assert not run("SELECT value FROM bool_cells WHERE row_id = :row2", ids).scalar_one()
    assert run("SELECT value FROM number_cells WHERE row_id = :row", ids).scalar_one() is None
    assert tuple(run("SELECT min, max, preferred_statistic FROM custom_range_columns", ids).one()) == (None, None, "avg")


def test_course_description_color_and_hidden_default(ids):
    """ST-34"""
    assert tuple(run("SELECT description, color, hidden FROM courses", ids).one()) == ("", "clay", False)


def test_migration_keeps_existing_courses(app):
    """ST-34"""
    upgrade(directory=str(MIGRATIONS), revision="dd8508320ac3")
    run("INSERT INTO users (email, password) VALUES ('a@example.com', 'x')")
    run("INSERT INTO courses (title, user_id) VALUES ('Algorithms', 1)")
    run("INSERT INTO course_rows (table_type, title, course_id) VALUES ('lecture', 'Chapter 1', 1)")
    db.session.commit()

    upgrade(directory=str(MIGRATIONS))

    assert tuple(run("SELECT title, description, color, hidden FROM courses").one()) == ("Algorithms", "", "clay", False)
    assert run("SELECT COUNT(*) FROM course_rows").scalar_one() == 1


def test_migration_moves_the_tables_to_table_types(app):
    """ST-41"""
    upgrade(directory=str(MIGRATIONS), revision="be5b4ead9ad9")
    date = run("INSERT INTO calendar_dates (date) VALUES ('2026-11-03') RETURNING id").scalar_one()
    users = []
    for email in ("a@example.com", "b@example.com"):
        users.append(run(f"INSERT INTO users (email, password) VALUES ('{email}', 'x') RETURNING id").scalar_one())
        ids = {"user": users[-1], "date": date}
        ids["course"] = run("INSERT INTO courses (title, user_id) VALUES ('C', :user) RETURNING id", ids).scalar_one()
        for name, table_type, column_type in (("lecture", "lecture", "bool"), ("sheet", "assignment", "number")):
            ids[f"row_{name}"] = run(
                f"INSERT INTO course_rows (table_type, title, course_id) VALUES ('{table_type}', '{name}', :course) "
                "RETURNING id", ids
            ).scalar_one()
            ids[f"col_{name}"] = run(
                "INSERT INTO course_columns (column_type, table_type, label, course_id) "
                f"VALUES ('{column_type}', '{table_type}', '{name}', :course) RETURNING id", ids
            ).scalar_one()
            run(f"INSERT INTO calendar_date_rows (calendar_date_id, row_id) VALUES (:date, :row_{name})", ids)
        run("INSERT INTO bool_cells (column_id, row_id, value) VALUES (:col_lecture, :row_lecture, true)", ids)
        run("INSERT INTO custom_range_columns (id) VALUES (:col_sheet)", ids)
        run("INSERT INTO number_cells (column_id, row_id, value) VALUES (:col_sheet, :row_sheet, 2.5)", ids)
    db.session.commit()

    upgrade(directory=str(MIGRATIONS))

    assert sorted(run("SELECT user_id, name FROM table_types").all()) == [
        (user, name) for user in users for name in ("Assignments", "Lectures")
    ]
    # Every course has both types, and every row and column a type of the owner of its course
    owners = "JOIN table_types ON table_types.id = {0}.table_type_id JOIN courses ON courses.id = {0}.course_id"
    for table in ("course_table_types", "course_rows", "course_columns"):
        same_owner = f"SELECT COUNT(*) FROM {table} {owners.format(table)} WHERE table_types.user_id = courses.user_id"
        assert run(same_owner).scalar_one() == 4, table
    assert sorted(run(f"SELECT course_rows.title, name FROM course_rows {owners.format('course_rows')}").all()) == [
        ("lecture", "Lectures"), ("lecture", "Lectures"), ("sheet", "Assignments"), ("sheet", "Assignments"),
    ]
    assert sorted(run(f"SELECT label, name FROM course_columns {owners.format('course_columns')}").all()) == [
        ("lecture", "Lectures"), ("lecture", "Lectures"), ("sheet", "Assignments"), ("sheet", "Assignments"),
    ]
    counts = {"bool_cells": 2, "number_cells": 2, "custom_range_columns": 2, "calendar_date_rows": 4}
    for table, count in counts.items():
        assert run(f"SELECT COUNT(*) FROM {table}").scalar_one() == count, table


def test_deleting_a_course_deletes_everything_below_it(ids):
    """ST-25, the cascades of the schema"""
    run("INSERT INTO number_cells (column_id, row_id, value) VALUES (:bare, :row, 2.5)", ids)
    run("INSERT INTO calendar_date_rows (calendar_date_id, row_id) VALUES (:date, :row)", ids)

    run("DELETE FROM courses WHERE id = :course", ids)

    for table in [
        "course_rows", "course_columns", "bool_cells", "number_cells", "course_tags", "course_table_types",
        "calendar_date_rows",
    ]:
        assert run(f"SELECT COUNT(*) FROM {table}").scalar_one() == 0, table
    for table in ["users", "tags", "table_types", "calendar_dates"]:
        assert run(f"SELECT COUNT(*) FROM {table}").scalar_one() == 1, table


def test_deleting_a_table_type_deletes_its_tables(ids):
    """ST-25, the cascades of the schema"""
    run("INSERT INTO number_cells (column_id, row_id, value) VALUES (:bare, :row, 2.5)", ids)
    run("INSERT INTO calendar_date_rows (calendar_date_id, row_id) VALUES (:date, :row)", ids)

    run("DELETE FROM table_types WHERE id = :type", ids)

    for table in [
        "course_rows", "course_columns", "bool_cells", "number_cells", "course_table_types", "calendar_date_rows",
    ]:
        assert run(f"SELECT COUNT(*) FROM {table}").scalar_one() == 0, table
    for table in ["users", "courses", "course_tags", "calendar_dates"]:
        assert run(f"SELECT COUNT(*) FROM {table}").scalar_one() == 1, table
