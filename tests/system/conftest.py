import pytest

from backend.app import create_app
from backend.app.extensions import db

CREDENTIALS = {"email": "a@example.com", "password": "password1"}


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


@pytest.fixture
def user_client(client):
    """A client that is registered and logged in as a@example.com."""
    assert client.post("/api/auth/register", json=CREDENTIALS).status_code == 201
    return client


@pytest.fixture
def second_client(app, tables):
    """A second client, registered and logged in as b@example.com."""
    other = app.test_client()
    other.post("/api/auth/register", json={"email": "b@example.com", "password": "password1"})
    return other


@pytest.fixture
def course(user_client):
    """A course of the logged-in user."""
    return user_client.post("/api/course", json={"title": "Algorithms"}).get_json()


@pytest.fixture
def get_tables(user_client):
    def get(course_id):
        response = user_client.get(f"/api/table/{course_id}")
        assert response.status_code == 200
        return response.get_json()
    return get


@pytest.fixture
def add_row(user_client):
    def add(course_id, table_type, title):
        response = user_client.post(f"/api/table/{course_id}/{table_type}/row", json={"title": title})
        assert response.status_code == 201
        return response.get_json()
    return add


@pytest.fixture
def add_column(user_client):
    def add(course_id, table_type, label, column_type="bool", **extra):
        payload = {"column_type": column_type, "label": label, **extra}
        response = user_client.post(f"/api/table/{course_id}/{table_type}/column", json=payload)
        assert response.status_code == 201
        return response.get_json()
    return add
