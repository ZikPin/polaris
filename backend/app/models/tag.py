from ..extensions import db

course_tags = db.Table(
    "course_tags",
    db.Column("tag_id", db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    db.Column("course_id", db.ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(db.Model):
    __tablename__ = "tags"
    __table_args__ = (db.UniqueConstraint("user_id", "value"), {"sqlite_autoincrement": True})

    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.String, nullable=False)
    user_id = db.Column(db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    courses = db.relationship("Course", secondary=course_tags, back_populates="tags", passive_deletes=True)
