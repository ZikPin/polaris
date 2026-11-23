from flask import Blueprint
from flask_login import current_user, login_required

from ..schemas.table_type import TableTypeRequestSchema, TableTypeResponseSchema
from ..services import table_type as table_type_service
from .helpers import load

bp = Blueprint("table_type", __name__, url_prefix="/api/table_type")


@bp.get("")
@login_required
def list_table_types():
    return TableTypeResponseSchema(many=True).dump(table_type_service.list_table_types(current_user.id))


@bp.post("")
@login_required
def create_table_type():
    table_type = table_type_service.create_table_type(current_user.id, load(TableTypeRequestSchema())["name"])
    return TableTypeResponseSchema().dump(table_type), 201


@bp.patch("/<int:table_type_id>")
@login_required
def rename_table_type(table_type_id):
    name = load(TableTypeRequestSchema())["name"]
    return TableTypeResponseSchema().dump(table_type_service.rename_table_type(current_user.id, table_type_id, name))


@bp.delete("/<int:table_type_id>")
@login_required
def delete_table_type(table_type_id):
    table_type_service.delete_table_type(current_user.id, table_type_id)
    return "", 204
