from sqlalchemy import func, select

from backend.app.extensions import db
from backend.app.seed import PASSWORD


def _row_counts(app):
    with app.app_context():
        return {
            table.name: db.session.scalar(select(func.count()).select_from(table)) for table in db.metadata.sorted_tables
        }


def _login(app, name):
    client = app.test_client()
    response = client.post("/api/auth/login", json={"email": f"{name}@example.com", "password": PASSWORD})
    assert response.status_code == 200
    return client


def test_seed_creates_the_users_and_a_second_run_changes_nothing(app, tables):
    """ST-27"""
    runner = app.test_cli_runner()
    assert runner.invoke(args=["seed"]).exit_code == 0
    first = _row_counts(app)
    assert first["users"] == 3

    assert runner.invoke(args=["seed"]).exit_code == 0
    assert _row_counts(app) == first


def test_seed_content(app, tables):
    app.test_cli_runner().invoke(args=["seed"])

    alice = _login(app, "alice")
    titles = [course["title"] for course in alice.get("/api/course").get_json()]
    assert titles == ["Algorithms", "Linear Algebra", "Databases", "Machine Learning", "Statistics"]
    assert len(alice.get("/api/tag").get_json()) == 5

    algorithms = next(
        course
        for course in alice.get("/api/dashboard/lecture/column_statistics").get_json()
        if course["title"] == "Algorithms"
    )
    watched = next(column for column in algorithms["columns"] if column["label"] == "Watched")
    assert (watched["checked"], watched["unchecked"]) == (3, 1)

    assert [course["title"] for course in _login(app, "bob").get("/api/course").get_json()] == ["Biology", "Chemistry"]
    assert _login(app, "carol").get("/api/course").get_json() == []
