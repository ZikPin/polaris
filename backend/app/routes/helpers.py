from flask import request
from marshmallow import ValidationError


def load(schema, partial=False):
    """Validate the JSON body of the request. A partial body (PATCH) needs at least one field."""
    data = schema.load(request.get_json(), partial=partial)
    if partial and not data:
        raise ValidationError({"_schema": ["At least one field is required."]})
    return data
