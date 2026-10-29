import os

from sqlalchemy.engine import URL


class Base:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"


class Development(Base):
    SECRET_KEY = "dev"
    SQLALCHEMY_DATABASE_URI = "sqlite:///polaris.db"  # relative to the instance folder


class Test(Base):
    TESTING = True
    SECRET_KEY = "test"
    SQLALCHEMY_DATABASE_URI = "sqlite://"  # in memory, the tests pass their own file


def _production_database():
    """The Postgres database from DB_USER, DB_PASSWORD, DB_HOST, DB_PORT and DB_NAME, None if one of them is missing.

    The names are prefixed because USER and PORT are variables of the system and of hosts like Render. `URL.create`
    quotes special characters in the password.
    """
    user, password, host, port, name = (os.environ.get(f"DB_{key}") for key in ("USER", "PASSWORD", "HOST", "PORT", "NAME"))
    if not all((user, password, host, port, name)):
        return None
    return URL.create(
        "postgresql+psycopg2",
        username=user,
        password=password,
        host=host,
        port=int(port),
        database=name,
        query={"sslmode": "require"},
    )


class Production(Base):
    SESSION_COOKIE_SECURE = True
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = _production_database()


CONFIGS = {"development": Development, "test": Test, "production": Production}
