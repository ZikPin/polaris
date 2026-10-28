from marshmallow import ValidationError, fields


class NonEmptyStr(fields.String):
    """A string that is stripped and must not be empty afterwards (REQ-F-51)."""

    def _deserialize(self, value, attr, data, **kwargs):
        value = super()._deserialize(value, attr, data, **kwargs).strip()
        if not value:
            raise ValidationError("Must not be empty.")
        return value


class EmailStr(fields.Email):
    """An email address, stripped and lower-cased."""

    def _deserialize(self, value, attr, data, **kwargs):
        return super()._deserialize(value, attr, data, **kwargs).strip().lower()


def unique(values):
    if len(set(values)) != len(values):
        raise ValidationError("Values must be unique.")
