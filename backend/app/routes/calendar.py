from datetime import datetime

from flask import Blueprint, request
from flask_login import current_user, login_required
from marshmallow import ValidationError

from ..schemas.calendar import CalendarDayRequestSchema, CalendarDayResponseSchema, CalendarQuerySchema
from ..services import calendar as calendar_service
from .helpers import load

bp = Blueprint("calendar", __name__, url_prefix="/api/calendar")


def _parse_date(text):
    try:
        return datetime.strptime(text, "%Y-%m-%d").date()
    except ValueError:
        raise ValidationError({"date": ["Must be a date like 2026-11-03."]})


@bp.get("")
@login_required
def get_month():
    query = CalendarQuerySchema().load(request.args.to_dict())
    return CalendarDayResponseSchema(many=True).dump(calendar_service.get_month(current_user.id, query["month"]))


@bp.put("/<day>")
@login_required
def set_day(day):
    parsed = _parse_date(day)
    data = load(CalendarDayRequestSchema())
    return CalendarDayResponseSchema().dump(calendar_service.set_day(current_user.id, parsed, data["row_ids"]))
