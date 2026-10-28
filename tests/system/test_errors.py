from flask import request
from flask_login import login_required
from marshmallow import Schema, fields


def test_unknown_url_returns_a_json_error(client):
    """ST-30"""
    response = client.get("/api/unknown")

    assert response.status_code == 404
    assert "error" in response.get_json()


def test_validation_error_returns_400_with_fields(app):
    """ST-30"""
    class TitleSchema(Schema):
        title = fields.Str(required=True)

    @app.post("/test/validate")
    def validate():
        TitleSchema().load(request.get_json())
        return {}

    response = app.test_client().post("/test/validate", json={})

    assert response.status_code == 400
    assert response.get_json() == {
        "error": "validation failed",
        "fields": {"title": ["Missing data for required field."]},
    }


def test_protected_route_without_login_returns_401(app):
    """ST-30"""
    @app.get("/test/protected")
    @login_required
    def protected():
        return {}

    response = app.test_client().get("/test/protected")

    assert response.status_code == 401
    assert response.get_json() == {"error": "not logged in"}
