from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import Conflict, Unauthorized
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import User


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
