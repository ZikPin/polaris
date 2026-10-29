from collections import defaultdict

from sqlalchemy import select

from ..extensions import db
from ..models import BoolCell, Course, CourseColumn, CourseRow, NumberCell, Tag
from ..utils.statistics import count_checked, is_not_done, statistic


def _courses(user_id, tag_ids, course_ids):
    """The courses of the user, in creation order. Given filters all have to match, tags match with at least one."""
    statement = select(Course).where(Course.user_id == user_id)
    if tag_ids:
        statement = statement.where(Course.tags.any(Tag.id.in_(tag_ids)))
    if course_ids:
        statement = statement.where(Course.id.in_(course_ids))
    return db.session.scalars(statement.order_by(Course.id)).all()


def column_statistics(user_id, table_type, tag_ids=(), course_ids=()):
    """Per course the statistics of every custom column: counts for checkboxes, avg or sum for numbers."""
    courses = _courses(user_id, tag_ids, course_ids)
    ids = [course.id for course in courses]
    columns, values = [], defaultdict(list)  # values: column id -> cell values
    if ids:
        columns = db.session.scalars(
            select(CourseColumn)
            .where(CourseColumn.course_id.in_(ids), CourseColumn.table_type == table_type)
            .order_by(CourseColumn.id)
        ).all()
        for model in (BoolCell, NumberCell):
            statement = (
                select(model.column_id, model.value)
                .join(CourseColumn, model.column_id == CourseColumn.id)
                .where(CourseColumn.course_id.in_(ids), CourseColumn.table_type == table_type)
            )
            for column_id, value in db.session.execute(statement):
                values[column_id].append(value)

    result = []
    for course in courses:
        entries = []
        for column in (column for column in columns if column.course_id == course.id):
            entry = {"column_id": column.id, "label": column.label, "column_type": column.column_type}
            if column.column_type == "bool":
                entry["checked"], entry["unchecked"] = count_checked(values[column.id])
            else:
                entry["statistic"] = column.preferred_statistic
                entry["value"] = statistic(values[column.id], column.preferred_statistic)
            entries.append(entry)
        result.append({"course_id": course.id, "title": course.title, "columns": entries})
    return result


def not_done(user_id, table_type, tag_ids=(), course_ids=()):
    """Per course the rows that have at least one unchecked checkbox."""
    courses = _courses(user_id, tag_ids, course_ids)
    ids = [course.id for course in courses]
    rows, checkboxes = [], defaultdict(list)  # checkboxes: row id -> checkbox values
    if ids:
        where = (CourseRow.course_id.in_(ids), CourseRow.table_type == table_type)
        rows = db.session.scalars(select(CourseRow).where(*where).order_by(CourseRow.id)).all()
        statement = (
            select(BoolCell.row_id, BoolCell.value).join(CourseRow, BoolCell.row_id == CourseRow.id).where(*where)
        )
        for row_id, value in db.session.execute(statement):
            checkboxes[row_id].append(value)

    return [
        {
            "course_id": course.id,
            "title": course.title,
            "rows": [
                {"id": row.id, "title": row.title}
                for row in rows
                if row.course_id == course.id and is_not_done(checkboxes[row.id])
            ],
        }
        for course in courses
    ]
