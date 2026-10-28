import os


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


class Production(Base):
    SESSION_COOKIE_SECURE = True
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


CONFIGS = {"development": Development, "test": Test, "production": Production}
