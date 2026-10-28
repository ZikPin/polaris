import pytest


@pytest.fixture
def add_tag(user_client):
    def add(value):
        response = user_client.post("/api/tag", json={"value": value})
        assert response.status_code == 201
        return response.get_json()
    return add


def titles(response):
    return [course["title"] for course in response.get_json()]


def test_tags_are_unique_and_listed_alphabetically(user_client, add_tag):
    """ST-11"""
    add_tag("b")
    add_tag("a")
    c = add_tag("c")

    renamed = user_client.patch(f"/api/tag/{c['id']}", json={"value": "d"})
    duplicate = user_client.post("/api/tag", json={"value": "a"})

    assert renamed.status_code == 200
    assert duplicate.status_code == 409
    assert [tag["value"] for tag in user_client.get("/api/tag").get_json()] == ["a", "b", "d"]


def test_course_tags_are_replaced_and_deleted_tags_disappear(user_client, course, add_tag):
    """ST-12"""
    a, b, c = add_tag("A"), add_tag("B"), add_tag("C")
    url = f"/api/course/{course['id']}"

    both = user_client.patch(url, json={"tag_ids": [a["id"], b["id"]]})
    assert [tag["value"] for tag in both.get_json()["tags"]] == ["A", "B"]
    only_c = user_client.patch(url, json={"tag_ids": [c["id"]]})
    assert [tag["value"] for tag in only_c.get_json()["tags"]] == ["C"]

    user_client.patch(url, json={"tag_ids": [c["id"], a["id"]]})
    assert user_client.delete(f"/api/tag/{a['id']}").status_code == 204
    course_after = user_client.get(url)
    assert course_after.status_code == 200
    assert [tag["value"] for tag in course_after.get_json()["tags"]] == ["C"]


def test_course_rejects_unknown_tags(user_client, course):
    response = user_client.patch(f"/api/course/{course['id']}", json={"tag_ids": [999]})

    assert response.status_code == 400
    assert "tag_ids" in response.get_json()["fields"]


def test_courses_are_filtered_by_at_least_one_tag(user_client, add_tag):
    """ST-13"""
    a, b = add_tag("A"), add_tag("B")
    for title, tag_ids in [("1", [a["id"]]), ("2", [b["id"]]), ("3", [a["id"], b["id"]]), ("4", [])]:
        user_client.post("/api/course", json={"title": title, "tag_ids": tag_ids})

    assert titles(user_client.get(f"/api/course?tag_id={a['id']}")) == ["1", "3"]
    assert titles(user_client.get(f"/api/course?tag_id={b['id']}")) == ["2", "3"]
    assert titles(user_client.get(f"/api/course?tag_id={a['id']}&tag_id={b['id']}")) == ["1", "2", "3"]
    assert titles(user_client.get("/api/course")) == ["1", "2", "3", "4"]


@pytest.mark.parametrize("value", ["", "   "])
def test_tag_value_must_not_be_empty(user_client, add_tag, value):
    """ST-23"""
    tag = add_tag("ML")

    assert user_client.post("/api/tag", json={"value": value}).status_code == 400
    assert user_client.patch(f"/api/tag/{tag['id']}", json={"value": value}).status_code == 400
