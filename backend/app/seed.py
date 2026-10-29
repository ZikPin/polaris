"""The seed data of the acceptance test plan, also used as demo data: `flask seed`."""
from datetime import date, timedelta

import click
from flask.cli import with_appcontext
from sqlalchemy import select

from .extensions import db
from .models import User
from .services import auth as auth_service
from .services import calendar as calendar_service
from .services import course as course_service
from .services import table as table_service
from .services import tag as tag_service

PASSWORD = "polaris-demo"
TABLE_TYPES = ("lecture", "assignment")


def _check(label):
    return {"column_type": "bool", "label": label}


def _number(label, min=None, max=None, statistic="avg"):
    return {"column_type": "number", "label": label, "min": min, "max": max, "preferred_statistic": statistic}


# A course is {title, tags, lecture, assignment}. A table is {columns, rows}, a row is (title, {column label: value}).
# Cells that are not named keep their default (unchecked, empty).
USERS = {
    "alice@example.com": {
        "tags": ["Semester 1", "Semester 2", "CS", "Math", "ML"],
        "courses": [
            {
                "title": "Algorithms",
                "tags": ["Semester 1", "CS"],
                "lecture": {
                    "columns": [_check("Watched"), _check("Notes")],
                    "rows": [
                        ("Chapter 1", {"Watched": True, "Notes": True}),
                        ("Chapter 2", {"Watched": True}),
                        ("Chapter 3", {"Watched": True}),
                        ("Chapter 4", {}),
                    ],
                },
                "assignment": {
                    "columns": [_check("Solved"), _number("Points", 0, 20, "sum")],
                    "rows": [
                        ("Sheet 1", {"Solved": True, "Points": 14}),
                        ("Sheet 2", {"Points": 9}),
                        ("Sheet 3", {}),
                    ],
                },
            },
            {
                "title": "Linear Algebra",
                "tags": ["Semester 1", "Math"],
                "lecture": {
                    "columns": [_check("Watched")],
                    "rows": [("Chapter 1", {"Watched": True}), ("Chapter 2", {"Watched": True})],
                },
                "assignment": {
                    "columns": [_check("Solved"), _number("Grade", 1, 6)],
                    "rows": [
                        ("Sheet 1", {"Solved": True, "Grade": 1}),
                        ("Sheet 2", {"Solved": True, "Grade": 2}),
                        ("Sheet 3", {"Solved": True, "Grade": 3}),
                    ],
                },
            },
            {
                "title": "Databases",
                "tags": ["Semester 2", "CS"],
                "lecture": {
                    "columns": [_check("Watched"), _check("Notes")],
                    "rows": [("Introduction", {"Watched": True}), ("SQL basics", {}), ("Normalization", {})],
                },
            },
            {
                "title": "Machine Learning",
                "tags": ["Semester 2", "CS", "ML"],
                "lecture": {
                    "columns": [_check("Watched")],
                    "rows": [
                        ("Regression", {"Watched": True}),
                        ("Classification", {"Watched": True}),
                        ("Neural networks", {}),
                    ],
                },
                "assignment": {
                    "columns": [_check("Solved"), _number("Score", 0, 100)],
                    "rows": [
                        ("Project 1", {"Solved": True, "Score": 85}),
                        ("Project 2", {"Solved": True, "Score": 72}),
                    ],
                },
            },
            {"title": "Statistics", "tags": []},
        ],
        # Days counted from the day of seeding, so the demo calendar is never in the past: (days, [(course, row)])
        "calendar": [
            (0, [("Algorithms", "Chapter 4"), ("Algorithms", "Sheet 3")]),
            (2, [("Databases", "SQL basics")]),
            (5, [("Machine Learning", "Neural networks")]),
        ],
    },
    "bob@example.com": {
        "tags": ["Lab"],
        "courses": [
            {
                "title": "Biology",
                "tags": ["Lab"],
                "lecture": {
                    "columns": [_check("Watched")],
                    "rows": [("Cells", {"Watched": True}), ("Genetics", {})],
                },
                "assignment": {"columns": [_check("Solved")], "rows": [("Report 1", {})]},
            },
            {
                "title": "Chemistry",
                "tags": [],
                "lecture": {"columns": [_check("Watched")], "rows": [("Atoms", {})]},
            },
        ],
    },
    "carol@example.com": {},
}


def _create_course(user, spec, tag_ids, rows):
    course = course_service.create_course(
        user.id, {"title": spec["title"], "tag_ids": [tag_ids[value] for value in spec["tags"]]}
    )
    for table_type in TABLE_TYPES:
        table = spec.get(table_type, {})
        columns = {
            column["label"]: table_service.add_column(user.id, course.id, table_type, column)
            for column in table.get("columns", [])
        }
        for title, cells in table.get("rows", []):
            row = table_service.add_row(user.id, course.id, table_type, title)
            rows[(spec["title"], title)] = row.id
            for label, value in cells.items():
                table_service.set_cell(user.id, row.id, columns[label].id, value)


def _seed_user(email, spec):
    user = auth_service.register(email, PASSWORD)
    tag_ids = {value: tag_service.create_tag(user.id, value).id for value in spec.get("tags", [])}
    rows = {}
    for course in spec.get("courses", []):
        _create_course(user, course, tag_ids, rows)
    for days, entries in spec.get("calendar", []):
        calendar_service.set_day(user.id, date.today() + timedelta(days=days), [rows[entry] for entry in entries])


def seed():
    """Creates the seed users with their data. A user that already exists is left as it is. Returns the new emails."""
    created = []
    for email, spec in USERS.items():
        if db.session.scalar(select(User).where(User.email == email)) is None:
            _seed_user(email, spec)
            created.append(email)
    return created


@click.command("seed")
@with_appcontext
def seed_command():
    """Create the users alice, bob and carol with demo data."""
    created = seed()
    click.echo(f"Seeded {', '.join(created)}." if created else "Nothing to seed, the users already exist.")
