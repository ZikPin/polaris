from flask import Blueprint
from flask_login import current_user, login_required

from ..schemas.table import (
    CellRequestSchema,
    CellResponseSchema,
    ColumnCreateRequestSchema,
    ColumnResponseSchema,
    ColumnUpdateRequestSchema,
    CourseTablesResponseSchema,
    RowRequestSchema,
    RowResponseSchema,
)
from ..services import table as table_service
from .helpers import load

bp = Blueprint("table", __name__, url_prefix="/api/table")

TABLE_TYPE = "<any(lecture,assignment):table_type>"


@bp.get("/<int:course_id>")
@login_required
def get_tables(course_id):
    return CourseTablesResponseSchema().dump(table_service.get_tables(current_user.id, course_id))


@bp.post(f"/<int:course_id>/{TABLE_TYPE}/column")
@login_required
def add_column(course_id, table_type):
    data = load(ColumnCreateRequestSchema())
    column = table_service.add_column(current_user.id, course_id, table_type, data)
    return ColumnResponseSchema().dump(column), 201


@bp.patch("/column/<int:column_id>")
@login_required
def update_column(column_id):
    column = table_service.update_column(
        current_user.id, column_id, load(ColumnUpdateRequestSchema(), partial=True)
    )
    return ColumnResponseSchema().dump(column)


@bp.delete("/column/<int:column_id>")
@login_required
def delete_column(column_id):
    table_service.delete_column(current_user.id, column_id)
    return "", 204


@bp.post(f"/<int:course_id>/{TABLE_TYPE}/row")
@login_required
def add_row(course_id, table_type):
    row = table_service.add_row(current_user.id, course_id, table_type, load(RowRequestSchema())["title"])
    return RowResponseSchema().dump(row), 201


@bp.patch("/row/<int:row_id>")
@login_required
def update_row(row_id):
    row = table_service.update_row(current_user.id, row_id, load(RowRequestSchema())["title"])
    return RowResponseSchema().dump(row)


@bp.delete("/row/<int:row_id>")
@login_required
def delete_row(row_id):
    table_service.delete_row(current_user.id, row_id)
    return "", 204


@bp.put("/cell/<int:row_id>/<int:column_id>")
@login_required
def set_cell(row_id, column_id):
    cell = table_service.set_cell(current_user.id, row_id, column_id, load(CellRequestSchema())["value"])
    return CellResponseSchema().dump(cell)
