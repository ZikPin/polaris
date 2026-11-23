from marshmallow import Schema, fields

from .common import NonEmptyStr


class TableTypeRequestSchema(Schema):
    name = NonEmptyStr(required=True)


class TableTypeResponseSchema(Schema):
    id = fields.Int()
    name = fields.String()
