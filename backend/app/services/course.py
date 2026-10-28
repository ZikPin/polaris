from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..extensions import db
from ..models import Course, Tag
from . import tag as tag_service


def list_courses(user_id, tag_ids=()):
    """The courses of the user, in creation order. With tag ids only courses that have at least one of them."""
    statement = select(Course).where(Course.user_id == user_id).options(selectinload(Course.tags))
    if tag_ids:
        statement = statement.where(Course.tags.any(Tag.id.in_(tag_ids)))
    return db.session.scalars(statement.order_by(Course.id)).all()


def get_course(user_id, course_id):
    return db.first_or_404(
        select(Course).where(Course.id == course_id, Course.user_id == user_id),
        description="Course not found.",
    )


def create_course(user_id, data):
    course = Course(user_id=user_id, title=data["title"])
    if "tag_ids" in data:
        course.tags = tag_service.get_tags(user_id, data["tag_ids"])
    db.session.add(course)
    db.session.commit()
    return course


def update_course(user_id, course_id, data):
    course = get_course(user_id, course_id)
    if "title" in data:
        course.title = data["title"]
    if "tag_ids" in data:
        course.tags = tag_service.get_tags(user_id, data["tag_ids"])
    db.session.commit()
    return course


def delete_course(user_id, course_id):
    db.session.delete(get_course(user_id, course_id))
    db.session.commit()
