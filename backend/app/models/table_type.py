from ..extensions import db

course_table_types = db.Table(
    "course_table_types",
    db.Column("table_type_id", db.ForeignKey("table_types.id", ondelete="CASCADE"), primary_key=True),
    db.Column("course_id", db.ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
)


class TableType(db.Model):
    __tablename__ = "table_types"
    __table_args__ = (db.UniqueConstraint("user_id", "name"), {"sqlite_autoincrement": True})

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    user_id = db.Column(db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
