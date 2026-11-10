from flask import current_app, render_template
from itsdangerous import BadData, URLSafeTimedSerializer
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, Conflict, Unauthorized
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import User
from . import mail

RESET_MAX_AGE = 60 * 60  # seconds
INVALID_LINK = "This link is invalid or has expired."


def _by_email(email):
    return db.session.execute(select(User).where(User.email == email)).scalar_one_or_none()


def register(email, password):
    if _by_email(email) is not None:
        raise Conflict("Email is already registered.")
    user = User(email=email, password=generate_password_hash(password))
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise Conflict("Email is already registered.")
    return user


def authenticate(email, password):
    user = _by_email(email)
    if user is None or not check_password_hash(user.password, password):
        raise Unauthorized("Invalid email or password.")
    return user


def _reset_tokens():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="password-reset")


def request_password_reset(email):
    """Emails a reset link if the account exists. The token holds the end of the hash, so a new password voids it."""
    user = _by_email(email)
    if user is None:
        return
    token = _reset_tokens().dumps({"id": user.id, "password": user.password[-10:]})
    link = f"{current_app.config['APP_URL']}/reset-password?token={token}"
    html = render_template("reset_password_email.html", link=link)
    text = f"Set a new password for Polaris: {link}\n\nThe link works for one hour. If it was not you, ignore this."
    mail.send(user.email, "Reset your Polaris password", html, text)


def reset_password(token, password):
    try:
        payload = _reset_tokens().loads(token, max_age=RESET_MAX_AGE)
    except BadData:
        raise BadRequest(INVALID_LINK)
    user = db.session.get(User, payload["id"])
    if user.password[-10:] != payload["password"]:
        raise BadRequest(INVALID_LINK)
    user.password = generate_password_hash(password)
    db.session.commit()
    return user
