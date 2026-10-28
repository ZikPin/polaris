from marshmallow import Schema, fields

from .common import NonEmptyStr


class TagRequestSchema(Schema):
    value = NonEmptyStr(required=True)


class TagResponseSchema(Schema):
    id = fields.Int()
    value = fields.String()
