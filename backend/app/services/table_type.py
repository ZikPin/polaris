from marshmallow import ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import Conflict

from ..extensions import db
from ..models import TableType


def list_table_types(user_id):
    statement = select(TableType).where(TableType.user_id == user_id)
    return db.session.scalars(statement.order_by(func.lower(TableType.name), TableType.name)).all()


def get_table_type(user_id, table_type_id):
    return db.first_or_404(
        select(TableType).where(TableType.id == table_type_id, TableType.user_id == user_id),
        description="Table type not found.",
    )


def get_table_types(user_id, table_type_ids):
    """The table types with these ids. An id that does not exist or belongs to another user is a validation error."""
    ids = set(table_type_ids)
    statement = select(TableType).where(TableType.user_id == user_id, TableType.id.in_(ids))
    table_types = db.session.scalars(statement).all() if ids else []
    if len(table_types) != len(ids):
        raise ValidationError({"table_type_ids": ["Unknown table type id."]})
    return table_types


def _commit():
    """The name is unique per user, the database refuses a duplicate."""
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise Conflict("Table type already exists.")


def create_table_type(user_id, name):
    table_type = TableType(user_id=user_id, name=name)
    db.session.add(table_type)
    _commit()
    return table_type


def rename_table_type(user_id, table_type_id, name):
    table_type = get_table_type(user_id, table_type_id)
    table_type.name = name
    _commit()
    return table_type


def delete_table_type(user_id, table_type_id):
    """The database deletes its rows, columns, cells and calendar links in every course with it (REQ-F-82)."""
    db.session.delete(get_table_type(user_id, table_type_id))
    db.session.commit()
