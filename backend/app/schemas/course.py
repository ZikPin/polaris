from marshmallow import Schema, fields, validate

from ..models.course import COLORS
from .common import NonEmptyStr, unique
from .tag import TagResponseSchema


class CourseQuerySchema(Schema):
    tag_id = fields.List(fields.Int())


class CourseRequestSchema(Schema):
    title = NonEmptyStr(required=True)
    tag_ids = fields.List(fields.Int(), validate=unique)
    description = fields.String(validate=validate.Length(max=1000))
    color = fields.String(validate=validate.OneOf(COLORS))


class CourseResponseSchema(Schema):
    id = fields.Int()
    title = fields.String()
    description = fields.String()
    color = fields.String()
    tags = fields.Nested(TagResponseSchema, many=True)
