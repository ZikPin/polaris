from flask import Blueprint
from flask_login import current_user, login_required

from ..schemas.tag import TagRequestSchema, TagResponseSchema
from ..services import tag as tag_service
from .helpers import load

bp = Blueprint("tag", __name__, url_prefix="/api/tag")


@bp.get("")
@login_required
def list_tags():
    return TagResponseSchema(many=True).dump(tag_service.list_tags(current_user.id))


@bp.post("")
@login_required
def create_tag():
    tag = tag_service.create_tag(current_user.id, load(TagRequestSchema())["value"])
    return TagResponseSchema().dump(tag), 201


@bp.patch("/<int:tag_id>")
@login_required
def update_tag(tag_id):
    tag = tag_service.update_tag(current_user.id, tag_id, load(TagRequestSchema())["value"])
    return TagResponseSchema().dump(tag)


@bp.delete("/<int:tag_id>")
@login_required
def delete_tag(tag_id):
    tag_service.delete_tag(current_user.id, tag_id)
    return "", 204
