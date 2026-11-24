import os

import pytest
from sqlalchemy import text

from backend.app import create_app
from backend.app.extensions import db

# Set it to run the suite on Postgres instead of a SQLite file per test (docker-compose.yml)
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")

CREDENTIALS = {"email": "a@example.com", "password": "password1"}


@pytest.fixture
def app(tmp_path):
    """The app with a fresh database that has no tables yet.

    No app context is kept open for the test: requests made inside an open context would share it,
    and with it the user that Flask-Login caches on `g`. Tests that use `db` directly request `db_context`.

    On SQLite every test has its own file. A Postgres is shared, so the tables are dropped before and after each test.
    """
    app = create_app("test", {"SQLALCHEMY_DATABASE_URI": TEST_DATABASE_URL or f"sqlite:///{tmp_path / 'test.db'}"})
    if TEST_DATABASE_URL:
        _drop_tables(app)
    yield app
    if TEST_DATABASE_URL:
        _drop_tables(app)
    with app.app_context():
        db.engine.dispose()


def _drop_tables(app):
    with app.app_context():
        db.session.remove()
        db.drop_all()
        db.session.execute(text("DROP TABLE IF EXISTS alembic_version"))  # left by the migration test
        db.session.commit()


@pytest.fixture
def db_context(app):
    """An app context, for tests that use `db` directly instead of through requests."""
    with app.app_context():
        yield


@pytest.fixture
def tables(app):
    """The tables of the models, created in the database of the app."""
    with app.app_context():
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
def types(user_client):
    """The ids of the table types of the logged-in user by name, at first Lectures and Assignments."""
    return {table_type["name"]: table_type["id"] for table_type in user_client.get("/api/table_type").get_json()}


@pytest.fixture
def course(user_client, types):
    """A course of the logged-in user with the tables Lectures and Assignments."""
    payload = {"title": "Algorithms", "table_type_ids": list(types.values())}
    return user_client.post("/api/course", json=payload).get_json()


@pytest.fixture
def get_tables(user_client):
    """The tables of a course by the name of their table type."""
    def get(course_id):
        response = user_client.get(f"/api/table/{course_id}")
        assert response.status_code == 200
        return {table["table_type"]["name"]: table for table in response.get_json()}
    return get


# The helpers below take the name of a table type (for example "Lectures") instead of its id, to keep tests readable

@pytest.fixture
def add_row(user_client, types):
    def add(course_id, table_type, title):
        response = user_client.post(f"/api/table/{course_id}/{types[table_type]}/row", json={"title": title})
        assert response.status_code == 201
        return response.get_json()
    return add


@pytest.fixture
def set_cell(user_client):
    def put(row, column, value):
        response = user_client.put(f"/api/table/cell/{row['id']}/{column['id']}", json={"value": value})
        assert response.status_code == 200
        return response.get_json()
    return put


@pytest.fixture
def add_column(user_client, types):
    def add(course_id, table_type, label, column_type="bool", **extra):
        payload = {"column_type": column_type, "label": label, **extra}
        response = user_client.post(f"/api/table/{course_id}/{types[table_type]}/column", json=payload)
        assert response.status_code == 201
        return response.get_json()
    return add
