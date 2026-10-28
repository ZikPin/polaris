from sqlalchemy import false

from ..extensions import db

TABLE_TYPE_CHECK = "table_type IN ('lecture', 'assignment')"


class CourseRow(db.Model):
    __tablename__ = "course_rows"
    __table_args__ = (db.CheckConstraint(TABLE_TYPE_CHECK, name="table_type"), {"sqlite_autoincrement": True})

    id = db.Column(db.Integer, primary_key=True)
    table_type = db.Column(db.String, nullable=False)
    title = db.Column(db.String, nullable=False)
    course_id = db.Column(db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)


class CourseColumn(db.Model):
    """Base of the custom columns. The subtype is stored in column_type."""

    __tablename__ = "course_columns"
    __table_args__ = (
        db.CheckConstraint("column_type IN ('bool', 'number')", name="column_type"),
        db.CheckConstraint(TABLE_TYPE_CHECK, name="table_type"),
        {"sqlite_autoincrement": True},
    )

    id = db.Column(db.Integer, primary_key=True)
    column_type = db.Column(db.String, nullable=False)
    table_type = db.Column(db.String, nullable=False)
    label = db.Column(db.String, nullable=False)
    course_id = db.Column(db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)

    __mapper_args__ = {"polymorphic_on": column_type}


class CheckboxColumn(CourseColumn):
    __mapper_args__ = {"polymorphic_identity": "bool"}


class CustomRangeColumn(CourseColumn):
    __tablename__ = "custom_range_columns"
    __table_args__ = (
        db.CheckConstraint("preferred_statistic IN ('sum', 'avg')", name="preferred_statistic"),
        db.CheckConstraint("min IS NULL OR max IS NULL OR min <= max", name="min_max"),
    )

    id = db.Column(db.ForeignKey("course_columns.id", ondelete="CASCADE"), primary_key=True)
    min = db.Column(db.Float)
    max = db.Column(db.Float)
    preferred_statistic = db.Column(db.String, nullable=False, default="avg", server_default="avg")

    __mapper_args__ = {"polymorphic_identity": "number", "polymorphic_load": "selectin"}


class BoolCell(db.Model):
    __tablename__ = "bool_cells"

    column_id = db.Column(db.ForeignKey("course_columns.id", ondelete="CASCADE"), primary_key=True)
    row_id = db.Column(db.ForeignKey("course_rows.id", ondelete="CASCADE"), primary_key=True)
    value = db.Column(db.Boolean, nullable=False, default=False, server_default=false())


class NumberCell(db.Model):
    __tablename__ = "number_cells"

    column_id = db.Column(db.ForeignKey("course_columns.id", ondelete="CASCADE"), primary_key=True)
    row_id = db.Column(db.ForeignKey("course_rows.id", ondelete="CASCADE"), primary_key=True)
    value = db.Column(db.Float)  # empty (NULL) until a value is entered
