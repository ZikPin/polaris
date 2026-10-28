from marshmallow import ValidationError
from sqlalchemy import select

from ..extensions import db
from ..models import BoolCell, CheckboxColumn, Course, CourseColumn, CourseRow, CustomRangeColumn, NumberCell
from ..utils.cells import validate_cell_value
from . import course as course_service

TABLE_TYPES = ("lecture", "assignment")


def _row(user_id, row_id):
    return db.first_or_404(
        select(CourseRow)
        .join(Course, CourseRow.course_id == Course.id)
        .where(CourseRow.id == row_id, Course.user_id == user_id),
        description="Row not found.",
    )


def _column(user_id, column_id):
    return db.first_or_404(
        select(CourseColumn)
        .join(Course, CourseColumn.course_id == Course.id)
        .where(CourseColumn.id == column_id, Course.user_id == user_id),
        description="Column not found.",
    )


def get_tables(user_id, course_id):
    """Both tables of a course: the custom columns and the rows with their cells (keyed by column id)."""
    course = course_service.get_course(user_id, course_id)
    columns = db.session.scalars(
        select(CourseColumn).where(CourseColumn.course_id == course.id).order_by(CourseColumn.id)
    ).all()
    rows = db.session.scalars(
        select(CourseRow).where(CourseRow.course_id == course.id).order_by(CourseRow.id)
    ).all()
    cells = {}
    for model in (BoolCell, NumberCell):
        statement = select(model).join(CourseRow, model.row_id == CourseRow.id).where(CourseRow.course_id == course.id)
        for cell in db.session.scalars(statement):
            cells.setdefault(cell.row_id, {})[str(cell.column_id)] = cell.value
    return {
        table_type: {
            "columns": [column for column in columns if column.table_type == table_type],
            "rows": [
                {"id": row.id, "title": row.title, "cells": cells.get(row.id, {})}
                for row in rows
                if row.table_type == table_type
            ],
        }
        for table_type in TABLE_TYPES
    }


def _cell(column, row):
    return BoolCell(column_id=column.id, row_id=row.id) if column.column_type == "bool" else NumberCell(
        column_id=column.id, row_id=row.id
    )


def add_row(user_id, course_id, table_type, title):
    course = course_service.get_course(user_id, course_id)
    row = CourseRow(course_id=course.id, table_type=table_type, title=title)
    db.session.add(row)
    db.session.flush()
    columns = db.session.scalars(
        select(CourseColumn).where(CourseColumn.course_id == course.id, CourseColumn.table_type == table_type)
    ).all()
    db.session.add_all(_cell(column, row) for column in columns)
    db.session.commit()
    return row


def update_row(user_id, row_id, title):
    row = _row(user_id, row_id)
    row.title = title
    db.session.commit()
    return row


def delete_row(user_id, row_id):
    db.session.delete(_row(user_id, row_id))
    db.session.commit()


def add_column(user_id, course_id, table_type, data):
    course = course_service.get_course(user_id, course_id)
    common = {"course_id": course.id, "table_type": table_type, "label": data["label"]}
    if data["column_type"] == "bool":
        column = CheckboxColumn(**common)
    else:
        column = CustomRangeColumn(
            min=data.get("min"),
            max=data.get("max"),
            preferred_statistic=data.get("preferred_statistic", "avg"),
            **common,
        )
    db.session.add(column)
    db.session.flush()
    rows = db.session.scalars(
        select(CourseRow).where(CourseRow.course_id == course.id, CourseRow.table_type == table_type)
    ).all()
    db.session.add_all(_cell(column, row) for row in rows)
    db.session.commit()
    return column


def update_column(user_id, column_id, data):
    column = _column(user_id, column_id)
    if column.column_type == "bool":
        not_allowed = set(data) - {"label"}
        if not_allowed:
            raise ValidationError({name: ["Not allowed for a checkbox column."] for name in not_allowed})
    else:
        new_min = data.get("min", column.min)
        new_max = data.get("max", column.max)
        if new_min is not None and new_max is not None and new_min > new_max:
            raise ValidationError({"min": ["Must not be greater than max."]})
    for name, value in data.items():
        setattr(column, name, value)
    db.session.commit()
    return column


def delete_column(user_id, column_id):
    db.session.delete(_column(user_id, column_id))
    db.session.commit()


def set_cell(user_id, row_id, column_id, value):
    row = _row(user_id, row_id)
    column = _column(user_id, column_id)
    if row.course_id != column.course_id or row.table_type != column.table_type:
        raise ValidationError({"column_id": ["Row and column are not in the same table."]})
    error = validate_cell_value(
        column.column_type, value, getattr(column, "min", None), getattr(column, "max", None)
    )
    if error:
        raise ValidationError({"value": [error]})
    model = BoolCell if column.column_type == "bool" else NumberCell
    cell = db.session.get(model, (column.id, row.id))
    if cell is None:
        cell = _cell(column, row)
        db.session.add(cell)
    cell.value = value
    db.session.commit()
    return cell
