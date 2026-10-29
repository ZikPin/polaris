import pytest

from backend.app import create_app


@pytest.fixture
def web(tmp_path):
    """A client of an app that serves a tiny 'built Angular app', as production does."""
    site = tmp_path / "site"
    site.mkdir()
    (site / "index.html").write_text("<app-root></app-root>")
    (site / "main.js").write_text("console.log(1)")
    app = create_app(
        "test", {"SQLALCHEMY_DATABASE_URI": f"sqlite:///{tmp_path / 'test.db'}", "FRONTEND_DIR": str(site)}
    )
    return app.test_client()


@pytest.mark.parametrize("path", ["/", "/login", "/courses/3"])
def test_the_routes_of_the_app_get_the_index(web, path):
    """ST-31"""
    response = web.get(path)
    assert response.status_code == 200
    assert b"<app-root>" in response.data


def test_a_file_of_the_build_is_sent_as_it_is(web):
    assert web.get("/main.js").data == b"console.log(1)"


def test_an_unknown_api_path_is_a_json_404_and_not_the_app(web):
    response = web.get("/api/nothing")
    assert response.status_code == 404
    assert "error" in response.get_json()
