from marshmallow import Schema, fields, validate

from .common import EmailStr


class RegisterRequestSchema(Schema):
    email = EmailStr(required=True)
    password = fields.String(required=True, validate=validate.Length(min=8))


class LoginRequestSchema(Schema):
    email = EmailStr(required=True)
    password = fields.String(required=True)


class UserResponseSchema(Schema):
    id = fields.Int()
    email = fields.String()
