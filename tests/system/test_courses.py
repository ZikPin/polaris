import pytest

from backend.app.models.course import COLORS

CREDENTIALS = {"email": "a@example.com", "password": "password1"}
EMPTY_TABLES = {"lecture": {"columns": [], "rows": []}, "assignment": {"columns": [], "rows": []}}


def test_course_lifecycle(user_client):
    """ST-01"""
    created = user_client.post("/api/course", json={"title": "Algorithms"})
    assert created.status_code == 201
    course = created.get_json()
    assert course["title"] == "Algorithms"
    assert course["tags"] == []
    assert user_client.get(f"/api/table/{course['id']}").get_json() == EMPTY_TABLES

    renamed = user_client.patch(f"/api/course/{course['id']}", json={"title": "Algorithms 1"})
    assert renamed.status_code == 200
    assert [c["title"] for c in user_client.get("/api/course").get_json()] == ["Algorithms 1"]

    assert user_client.delete(f"/api/course/{course['id']}").status_code == 204
    assert user_client.get("/api/course").get_json() == []
    assert user_client.get(f"/api/course/{course['id']}").status_code == 404
    assert user_client.get(f"/api/table/{course['id']}").status_code == 404


def test_deleting_a_course_deletes_everything_in_it(user_client, course, add_row, add_column, get_tables):
    """ST-02"""
    tag = user_client.post("/api/tag", json={"value": "ML"}).get_json()
    user_client.patch(f"/api/course/{course['id']}", json={"tag_ids": [tag["id"]]})
    row = add_row(course["id"], "lecture", "Chapter 1")
    column = add_column(course["id"], "lecture", "Watched")
    user_client.put(f"/api/table/cell/{row['id']}/{column['id']}", json={"value": True})

    assert user_client.delete(f"/api/course/{course['id']}").status_code == 204

    assert user_client.get(f"/api/table/{course['id']}").status_code == 404
    assert [t["value"] for t in user_client.get("/api/tag").get_json()] == ["ML"]
    new_course = user_client.post("/api/course", json={"title": "Algorithms"}).get_json()
    assert get_tables(new_course["id"]) == EMPTY_TABLES


@pytest.mark.parametrize("title", ["", "   "])
def test_course_title_must_not_be_empty(user_client, course, title):
    """ST-23"""
    assert user_client.post("/api/course", json={"title": title}).status_code == 400
    assert user_client.patch(f"/api/course/{course['id']}", json={"title": title}).status_code == 400
    assert user_client.get(f"/api/course/{course['id']}").get_json()["title"] == "Algorithms"


def test_course_description_and_color(user_client, course):
    """ST-32"""
    url = f"/api/course/{course['id']}"
    assert (course["description"], course["color"]) == ("", "clay")

    user_client.patch(url, json={"description": "Spring term", "color": "sage"})
    user_client.patch(url, json={"title": "Algorithms 1"})
    saved = user_client.get(url).get_json()
    assert (saved["description"], saved["color"]) == ("Spring term", "sage")

    for color in COLORS:
        assert user_client.patch(url, json={"color": color}).status_code == 200
    assert user_client.patch(url, json={"description": "x" * 1000}).status_code == 200

    for invalid in ({"color": "red"}, {"description": "x" * 1001}):
        response = user_client.patch(url, json=invalid)
        assert response.status_code == 400
        assert list(invalid) == list(response.get_json()["fields"])
    stored = user_client.get(url).get_json()
    assert (stored["description"], stored["color"]) == ("x" * 1000, "stone")


def test_course_edit_is_saved_at_once(user_client, course):
    """ST-33"""
    url = f"/api/course/{course['id']}"
    tag = user_client.post("/api/tag", json={"value": "ML"}).get_json()

    edit = {"title": "Algorithms 1", "tag_ids": [tag["id"]], "description": "Spring term", "color": "teal", "hidden": True}
    saved = user_client.patch(url, json=edit).get_json()
    assert saved == {
        "id": course["id"], "title": "Algorithms 1", "description": "Spring term", "color": "teal", "hidden": True,
        "tags": [tag],
    }

    rejected = user_client.patch(url, json={**edit, "title": "Other", "color": "rose", "tag_ids": [999]})
    assert rejected.status_code == 400
    assert user_client.get(url).get_json() == saved


def test_hidden_course(user_client, course, add_row):
    """ST-35"""
    url = f"/api/course/{course['id']}"
    assert course["hidden"] is False

    user_client.patch(url, json={"hidden": True})
    user_client.patch(url, json={"title": "Algorithms 1"})
    assert user_client.get(url).get_json()["hidden"] is True

    rejected = user_client.patch(url, json={"hidden": "abc"})
    assert rejected.status_code == 400
    assert list(rejected.get_json()["fields"]) == ["hidden"]
    assert user_client.get(url).get_json()["hidden"] is True

    row = add_row(course["id"], "lecture", "Chapter 1")
    assert user_client.put("/api/calendar/2026-11-03", json={"row_ids": [row["id"]]}).status_code == 200
    assert [c["id"] for c in user_client.get("/api/course").get_json()] == [course["id"]]
    assert [c["course_id"] for c in user_client.get("/api/dashboard/lecture/not_done").get_json()] == [course["id"]]
    assert [r["id"] for r in user_client.get("/api/calendar?month=2026-11").get_json()[0]["rows"]] == [row["id"]]

    user_client.patch(url, json={"hidden": False})
    assert user_client.get(url).get_json()["hidden"] is False


def test_data_is_still_there_after_logging_in_again(app, user_client, course):
    """ST-28"""
    new_client = app.test_client()
    assert new_client.post("/api/auth/login", json=CREDENTIALS).status_code == 200

    assert [c["title"] for c in new_client.get("/api/course").get_json()] == ["Algorithms"]
