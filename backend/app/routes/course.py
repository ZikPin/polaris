from flask import Blueprint, request
from flask_login import current_user, login_required

from ..schemas.course import CourseQuerySchema, CourseRequestSchema, CourseResponseSchema
from ..services import course as course_service
from .helpers import load

bp = Blueprint("course", __name__, url_prefix="/api/course")


@bp.get("")
@login_required
def list_courses():
    query = CourseQuerySchema().load(request.args.to_dict(flat=False))
    courses = course_service.list_courses(current_user.id, query.get("tag_id", []))
    return CourseResponseSchema(many=True).dump(courses)


@bp.post("")
@login_required
def create_course():
    course = course_service.create_course(current_user.id, load(CourseRequestSchema()))
    return CourseResponseSchema().dump(course), 201


@bp.get("/<int:course_id>")
@login_required
def get_course(course_id):
    return CourseResponseSchema().dump(course_service.get_course(current_user.id, course_id))


@bp.patch("/<int:course_id>")
@login_required
def update_course(course_id):
    course = course_service.update_course(
        current_user.id, course_id, load(CourseRequestSchema(), partial=True)
    )
    return CourseResponseSchema().dump(course)


@bp.delete("/<int:course_id>")
@login_required
def delete_course(course_id):
    course_service.delete_course(current_user.id, course_id)
    return "", 204
