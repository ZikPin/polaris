from marshmallow import Schema, ValidationError, fields, validate, validates_schema

from .common import NonEmptyStr

NUMBER_ONLY = ("min", "max", "preferred_statistic")


def _check_bounds(data):
    if data.get("min") is not None and data.get("max") is not None and data["min"] > data["max"]:
        raise ValidationError({"min": ["Must not be greater than max."]})


def _bool_number_or_null(value):
    if value is not None and not isinstance(value, (bool, int, float)):
        raise ValidationError("Must be true, false, a number or null.")


class ColumnCreateRequestSchema(Schema):
    column_type = fields.String(required=True, validate=validate.OneOf(["bool", "number"]))
    label = NonEmptyStr(required=True)
    min = fields.Float(allow_none=True, allow_nan=False)
    max = fields.Float(allow_none=True, allow_nan=False)
    preferred_statistic = fields.String(validate=validate.OneOf(["avg", "sum"]))

    @validates_schema
    def check_column(self, data, **kwargs):
        if data.get("column_type") == "bool":
            errors = {name: ["Not allowed for a checkbox column."] for name in NUMBER_ONLY if name in data}
            if errors:
                raise ValidationError(errors)
        _check_bounds(data)


class ColumnUpdateRequestSchema(Schema):
    label = NonEmptyStr()
    min = fields.Float(allow_none=True, allow_nan=False)
    max = fields.Float(allow_none=True, allow_nan=False)
    preferred_statistic = fields.String(validate=validate.OneOf(["avg", "sum"]))

    @validates_schema
    def check_bounds(self, data, **kwargs):
        _check_bounds(data)


class ColumnResponseSchema(Schema):
    id = fields.Int()
    label = fields.String()
    column_type = fields.String()
    # only present for number columns
    min = fields.Float(allow_none=True)
    max = fields.Float(allow_none=True)
    preferred_statistic = fields.String()


class RowRequestSchema(Schema):
    title = NonEmptyStr(required=True)


class RowResponseSchema(Schema):
    id = fields.Int()
    title = fields.String()


class CellRequestSchema(Schema):
    # The service checks the type against the column
    value = fields.Raw(required=True, allow_none=True, validate=_bool_number_or_null)


class CellResponseSchema(Schema):
    row_id = fields.Int()
    column_id = fields.Int()
    value = fields.Raw(allow_none=True)


class TableRowResponseSchema(Schema):
    id = fields.Int()
    title = fields.String()
    cells = fields.Dict(keys=fields.String(), values=fields.Raw(allow_none=True))


class TableResponseSchema(Schema):
    columns = fields.Nested(ColumnResponseSchema, many=True)
    rows = fields.Nested(TableRowResponseSchema, many=True)


class CourseTablesResponseSchema(Schema):
    lecture = fields.Nested(TableResponseSchema)
    assignment = fields.Nested(TableResponseSchema)
