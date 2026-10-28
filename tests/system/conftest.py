import pytest

from backend.app import create_app
from backend.app.extensions import db


@pytest.fixture
def app(tmp_path):
    """The app with a fresh database file that has no tables yet."""
    app = create_app("test", {"SQLALCHEMY_DATABASE_URI": f"sqlite:///{tmp_path / 'test.db'}"})
    with app.app_context():
        yield app
        db.session.remove()
        db.engine.dispose()


@pytest.fixture
def tables(app):
    """The tables of the models, created in the database of the app."""
    db.create_all()


@pytest.fixture
def client(app, tables):
    return app.test_client()
