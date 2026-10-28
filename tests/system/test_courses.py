import pytest

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


def test_data_is_still_there_after_logging_in_again(app, user_client, course):
    """ST-28"""
    new_client = app.test_client()
    assert new_client.post("/api/auth/login", json=CREDENTIALS).status_code == 200

    assert [c["title"] for c in new_client.get("/api/course").get_json()] == ["Algorithms"]
