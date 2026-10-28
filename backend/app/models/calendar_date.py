from ..extensions import db


class CalendarDate(db.Model):
    __tablename__ = "calendar_dates"
    __table_args__ = {"sqlite_autoincrement": True}

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False)


calendar_date_rows = db.Table(
    "calendar_date_rows",
    db.Column("calendar_date_id", db.ForeignKey("calendar_dates.id", ondelete="CASCADE"), primary_key=True),
    db.Column("row_id", db.ForeignKey("course_rows.id", ondelete="CASCADE"), primary_key=True),
)
