from sqlalchemy import text
from werkzeug.security import check_password_hash

from backend.app.extensions import db

CREDENTIALS = {"email": "a@example.com", "password": "password1"}


def test_register_logs_the_user_in(client):
    """ST-19"""
    response = client.post("/api/auth/register", json=CREDENTIALS)

    assert response.status_code == 201
    assert response.get_json() == {"id": 1, "email": "a@example.com"}
    assert client.get("/api/auth/me").status_code == 200


def test_register_rejects_bad_input(app, client):
    """ST-19"""
    client.post("/api/auth/register", json=CREDENTIALS)
    rejected = [
        ({"email": "a@example.com", "password": "password2"}, 409),
        ({"email": "A@Example.com", "password": "password2"}, 409),
        ({"email": "not-an-email", "password": "password1"}, 400),
        ({"email": "b@example.com", "password": "1234567"}, 400),
        ({"email": "b@example.com"}, 400),
    ]

    for payload, status in rejected:
        assert client.post("/api/auth/register", json=payload).status_code == status, payload

    with app.app_context():
        assert db.session.execute(text("SELECT COUNT(*) FROM users")).scalar_one() == 1


def test_login_and_logout(user_client):
    """ST-20"""
    assert user_client.post("/api/auth/logout").status_code == 204
    assert user_client.get("/api/auth/me").status_code == 401

    wrong_password = user_client.post("/api/auth/login", json={**CREDENTIALS, "password": "wrong-password"})
    unknown_email = user_client.post("/api/auth/login", json={**CREDENTIALS, "email": "z@example.com"})
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.get_json() == unknown_email.get_json()
    assert user_client.get("/api/auth/me").status_code == 401

    assert user_client.post("/api/auth/login", json=CREDENTIALS).status_code == 200
    assert user_client.get("/api/auth/me").get_json()["email"] == "a@example.com"


def test_passwords_are_stored_hashed(app, client):
    """ST-26"""
    for email in ("a@example.com", "b@example.com"):
        app.test_client().post("/api/auth/register", json={"email": email, "password": "password1"})

    with app.app_context():
        stored = [row[0] for row in db.session.execute(text("SELECT password FROM users ORDER BY id"))]

    assert len(stored) == 2
    assert "password1" not in stored
    assert stored[0] != stored[1]
    assert all(check_password_hash(password, "password1") for password in stored)
