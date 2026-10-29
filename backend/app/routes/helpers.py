from flask import request
from marshmallow import ValidationError

# URL part for the table of a course, any other value is a 404
TABLE_TYPE = "<any(lecture,assignment):table_type>"


def load(schema, partial=False):
    """Validate the JSON body of the request. A partial body (PATCH) needs at least one field."""
    data = schema.load(request.get_json(), partial=partial)
    if partial and not data:
        raise ValidationError({"_schema": ["At least one field is required."]})
    return data
