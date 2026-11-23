from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..extensions import db
from ..models import Course, Tag
from . import table_type as table_type_service
from . import tag as tag_service


def list_courses(user_id, tag_ids=()):
    """The courses of the user, in creation order. With tag ids only courses that have at least one of them."""
    statement = select(Course).where(Course.user_id == user_id).options(selectinload(Course.tags), selectinload(Course.table_types))
    if tag_ids:
        statement = statement.where(Course.tags.any(Tag.id.in_(tag_ids)))
    return db.session.scalars(statement.order_by(Course.id)).all()


def get_course(user_id, course_id):
    return db.first_or_404(
        select(Course).where(Course.id == course_id, Course.user_id == user_id),
        description="Course not found.",
    )


def _apply(course, data):
    for field in ("title", "description", "color", "hidden"):
        if field in data:
            setattr(course, field, data[field])
    if "tag_ids" in data:
        course.tags = tag_service.get_tags(course.user_id, data["tag_ids"])
    if "table_type_ids" in data:
        removed = set(course.table_types)
        course.table_types = table_type_service.get_table_types(course.user_id, data["table_type_ids"])
        # The rows and columns of a removed table type are deleted (orphans), their cells with them (REQ-F-85)
        if removed - set(course.table_types):
            kept = {table_type.id for table_type in course.table_types}
            course.rows = [row for row in course.rows if row.table_type_id in kept]
            course.columns = [column for column in course.columns if column.table_type_id in kept]


def create_course(user_id, data):
    course = Course(user_id=user_id)
    _apply(course, data)
    db.session.add(course)
    db.session.commit()
    return course


def update_course(user_id, course_id, data):
    course = get_course(user_id, course_id)
    _apply(course, data)
    db.session.commit()
    return course


def delete_course(user_id, course_id):
    db.session.delete(get_course(user_id, course_id))
    db.session.commit()
