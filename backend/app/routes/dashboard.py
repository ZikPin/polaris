from flask import Blueprint, request
from flask_login import current_user, login_required

from ..schemas.dashboard import CourseNotDoneResponseSchema, CourseStatisticsResponseSchema, DashboardQuerySchema
from ..services import dashboard as dashboard_service

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


def _filters():
    query = DashboardQuerySchema().load(request.args.to_dict(flat=False))
    return query.get("tag_id", []), query.get("course_id", [])


@bp.get("/<int:table_type_id>/column_statistics")
@login_required
def column_statistics(table_type_id):
    tag_ids, course_ids = _filters()
    result = dashboard_service.column_statistics(current_user.id, table_type_id, tag_ids, course_ids)
    return CourseStatisticsResponseSchema(many=True).dump(result)


@bp.get("/<int:table_type_id>/not_done")
@login_required
def not_done(table_type_id):
    tag_ids, course_ids = _filters()
    result = dashboard_service.not_done(current_user.id, table_type_id, tag_ids, course_ids)
    return CourseNotDoneResponseSchema(many=True).dump(result)
