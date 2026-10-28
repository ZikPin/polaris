from marshmallow import ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import Conflict

from ..extensions import db
from ..models import Tag


def list_tags(user_id):
    statement = select(Tag).where(Tag.user_id == user_id).order_by(func.lower(Tag.value), Tag.value)
    return db.session.scalars(statement).all()


def get_tag(user_id, tag_id):
    return db.first_or_404(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id), description="Tag not found."
    )


def get_tags(user_id, tag_ids):
    """The tags with these ids. An id that does not exist or belongs to another user is a validation error."""
    ids = set(tag_ids)
    tags = db.session.scalars(select(Tag).where(Tag.user_id == user_id, Tag.id.in_(ids))).all() if ids else []
    if len(tags) != len(ids):
        raise ValidationError({"tag_ids": ["Unknown tag id."]})
    return tags


def _exists(user_id, value):
    return db.session.execute(
        select(Tag.id).where(Tag.user_id == user_id, Tag.value == value)
    ).first() is not None


def _commit():
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise Conflict("Tag already exists.")


def create_tag(user_id, value):
    if _exists(user_id, value):
        raise Conflict("Tag already exists.")
    tag = Tag(user_id=user_id, value=value)
    db.session.add(tag)
    _commit()
    return tag


def update_tag(user_id, tag_id, value):
    tag = get_tag(user_id, tag_id)
    if value != tag.value and _exists(user_id, value):
        raise Conflict("Tag already exists.")
    tag.value = value
    _commit()
    return tag


def delete_tag(user_id, tag_id):
    db.session.delete(get_tag(user_id, tag_id))
    db.session.commit()
