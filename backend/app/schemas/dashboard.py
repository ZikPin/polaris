from marshmallow import Schema, fields


class DashboardQuerySchema(Schema):
    tag_id = fields.List(fields.Int())
    course_id = fields.List(fields.Int())


class ColumnStatisticResponseSchema(Schema):
    column_id = fields.Int()
    label = fields.String()
    column_type = fields.String()
    # only for 'bool'
    checked = fields.Int()
    unchecked = fields.Int()
    # only for 'number', value is null if there is no data
    statistic = fields.String()
    value = fields.Float(allow_none=True)


class CourseStatisticsResponseSchema(Schema):
    course_id = fields.Int()
    title = fields.String()
    columns = fields.Nested(ColumnStatisticResponseSchema, many=True)


class NotDoneRowResponseSchema(Schema):
    id = fields.Int()
    title = fields.String()


class CourseNotDoneResponseSchema(Schema):
    course_id = fields.Int()
    title = fields.String()
    rows = fields.Nested(NotDoneRowResponseSchema, many=True)
