from ..extensions import db
from .tag import course_tags


class Course(db.Model):
    __tablename__ = "courses"
    __table_args__ = {"sqlite_autoincrement": True}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    user_id = db.Column(db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    tags = db.relationship(
        "Tag", secondary=course_tags, back_populates="courses", order_by="Tag.value", passive_deletes=True
    )
    # Rows and columns are listed in creation order (see RELATIONAL_SCHEMA.md)
    rows = db.relationship(
        "CourseRow", order_by="CourseRow.id", cascade="all, delete-orphan", passive_deletes=True
    )
    columns = db.relationship(
        "CourseColumn", order_by="CourseColumn.id", cascade="all, delete-orphan", passive_deletes=True
    )
