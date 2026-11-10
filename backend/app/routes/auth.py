from flask import Blueprint
from flask_login import current_user, login_required, login_user, logout_user

from ..schemas.auth import (
    ForgotPasswordRequestSchema,
    LoginRequestSchema,
    RegisterRequestSchema,
    ResetPasswordRequestSchema,
    UserResponseSchema,
)
from ..services import auth as auth_service
from .helpers import load

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    data = load(RegisterRequestSchema())
    user = auth_service.register(data["email"], data["password"])
    login_user(user)
    return UserResponseSchema().dump(user), 201


@bp.post("/login")
def login():
    data = load(LoginRequestSchema())
    user = auth_service.authenticate(data["email"], data["password"])
    login_user(user)
    return UserResponseSchema().dump(user)


@bp.post("/forgot-password")
def forgot_password():
    auth_service.request_password_reset(load(ForgotPasswordRequestSchema())["email"])
    return "", 204


@bp.post("/reset-password")
def reset_password():
    data = load(ResetPasswordRequestSchema())
    user = auth_service.reset_password(data["token"], data["password"])
    login_user(user)
    return UserResponseSchema().dump(user)


@bp.post("/logout")
@login_required
def logout():
    logout_user()
    return "", 204


@bp.get("/me")
@login_required
def me():
    return UserResponseSchema().dump(current_user)
