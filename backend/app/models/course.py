from sqlalchemy import func

from ..extensions import db
from .tag import Tag, course_tags


# The accent palette of docs/design/BRIEF.md
COLORS = ("clay", "mustard", "olive", "sage", "teal", "blue", "periwinkle", "plum", "rose", "stone")


class Course(db.Model):
    __tablename__ = "courses"
    __table_args__ = (
        db.CheckConstraint(f"color IN ({', '.join(repr(color) for color in COLORS)})", name="color"),
        {"sqlite_autoincrement": True},
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False, default="", server_default="")
    color = db.Column(db.String, nullable=False, default="clay", server_default="clay")
    user_id = db.Column(db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    tags = db.relationship(
        "Tag",
        secondary=course_tags,
        back_populates="courses",
        order_by=lambda: func.lower(Tag.value),
        passive_deletes=True,
    )
    # Rows and columns are listed in creation order (see RELATIONAL_SCHEMA.md)
    rows = db.relationship(
        "CourseRow", order_by="CourseRow.id", cascade="all, delete-orphan", passive_deletes=True
    )
    columns = db.relationship(
        "CourseColumn", order_by="CourseColumn.id", cascade="all, delete-orphan", passive_deletes=True
    )
