from datetime import date

from marshmallow import ValidationError
from sqlalchemy import case, delete, insert, select

from ..extensions import db
from ..models import CalendarDate, Course, CourseRow, calendar_date_rows


def _own_rows(user_id):
    return select(CourseRow).join(Course, CourseRow.course_id == Course.id).where(Course.user_id == user_id)


def _days(user_id):
    """The (date, row) pairs of the user: by date, then lectures before assignments, then by creation."""
    return (
        select(CalendarDate.date, CourseRow)
        .select_from(CalendarDate)
        .join(calendar_date_rows, calendar_date_rows.c.calendar_date_id == CalendarDate.id)
        .join(CourseRow, CourseRow.id == calendar_date_rows.c.row_id)
        .join(Course, Course.id == CourseRow.course_id)
        .where(Course.user_id == user_id)
        .order_by(CalendarDate.date, case((CourseRow.table_type == "lecture", 0), else_=1), CourseRow.id)
    )


def _group(pairs):
    days = {}
    for day, row in pairs:
        days.setdefault(day, []).append(row)
    return [{"date": day, "rows": rows} for day, rows in days.items()]


def get_month(user_id, month):
    """The days of a month ('YYYY-MM') that have rows of the user."""
    year, number = (int(part) for part in month.split("-"))
    start = date(year, number, 1)
    end = date(year + (number == 12), number % 12 + 1, 1)
    statement = _days(user_id).where(CalendarDate.date >= start, CalendarDate.date < end)
    return _group(db.session.execute(statement))


def set_day(user_id, day, row_ids):
    """Replace the rows of the user on a day. Rows of other users on the same date are not touched."""
    ids = set(row_ids)
    owned = db.session.scalars(_own_rows(user_id).where(CourseRow.id.in_(ids))).all() if ids else []
    if len(owned) != len(ids):
        raise ValidationError({"row_ids": ["Unknown row id."]})

    calendar_date = db.session.scalar(select(CalendarDate).where(CalendarDate.date == day))
    if calendar_date is None and ids:
        calendar_date = CalendarDate(date=day)
        db.session.add(calendar_date)
        db.session.flush()
    if calendar_date is not None:
        own_row_ids = _own_rows(user_id).with_only_columns(CourseRow.id)
        db.session.execute(
            delete(calendar_date_rows).where(
                calendar_date_rows.c.calendar_date_id == calendar_date.id,
                calendar_date_rows.c.row_id.in_(own_row_ids),
            )
        )
        if ids:
            db.session.execute(
                insert(calendar_date_rows),
                [{"calendar_date_id": calendar_date.id, "row_id": row_id} for row_id in ids],
            )
    db.session.commit()

    pairs = db.session.execute(_days(user_id).where(CalendarDate.date == day))
    return {"date": day, "rows": [row for _, row in pairs]}
