from marshmallow import Schema, fields

from .common import NonEmptyStr, unique
from .tag import TagResponseSchema


class CourseQuerySchema(Schema):
    tag_id = fields.List(fields.Int())


class CourseRequestSchema(Schema):
    title = NonEmptyStr(required=True)
    tag_ids = fields.List(fields.Int(), validate=unique)


class CourseResponseSchema(Schema):
    id = fields.Int()
    title = fields.String()
    tags = fields.Nested(TagResponseSchema, many=True)
