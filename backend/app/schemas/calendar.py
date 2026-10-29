from marshmallow import Schema, fields, validate

from .common import unique


class CalendarQuerySchema(Schema):
    month = fields.String(required=True, validate=validate.Regexp(r"^\d{4}-(0[1-9]|1[0-2])$"))


class CalendarDayRequestSchema(Schema):
    row_ids = fields.List(fields.Int(), required=True, validate=unique)


class CalendarRowResponseSchema(Schema):
    id = fields.Int()
    title = fields.String()
    table_type = fields.String()
    course_id = fields.Int()


class CalendarDayResponseSchema(Schema):
    date = fields.Date()
    rows = fields.Nested(CalendarRowResponseSchema, many=True)
