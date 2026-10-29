import re

import pytest

from backend.app import create_app

PUBLIC = {"auth.register", "auth.login", "static"}


def concrete(rule):
    """A URL for a route rule, with placeholder values."""
    url = re.sub(r"<any\([^)]*\):table_type>", "lecture", rule)
    url = re.sub(r"<int:[^>]+>", "1", url)
    return re.sub(r"<[^>]+>", "2026-11-03", url)


def protected_endpoints():
    """Every (method, url) of the app except registering and logging in."""
    app = create_app("test")
    return sorted(
        (method, concrete(rule.rule))
        for rule in app.url_map.iter_rules()
        if rule.endpoint not in PUBLIC
        for method in rule.methods - {"HEAD", "OPTIONS"}
    )


@pytest.mark.parametrize("method, url", protected_endpoints(), ids=lambda value: str(value))
def test_every_protected_endpoint_needs_a_login(client, method, url):
    """ST-21"""
    response = client.open(url, method=method, json={})

    assert response.status_code == 401


def test_other_users_data_is_not_reachable(
    user_client, second_client, course, add_row, add_column, set_cell, get_tables
):
    """ST-22"""
    tag = user_client.post("/api/tag", json={"value": "ML"}).get_json()
    user_client.patch(f"/api/course/{course['id']}", json={"tag_ids": [tag["id"]]})
    row = add_row(course["id"], "lecture", "Chapter 1")
    column = add_column(course["id"], "lecture", "Watched")
    set_cell(row, column, True)
    cid, rid, colid = course["id"], row["id"], column["id"]

    attempts = [
        ("get", f"/api/course/{cid}", None),
        ("patch", f"/api/course/{cid}", {"title": "x"}),
        ("delete", f"/api/course/{cid}", None),
        ("get", f"/api/table/{cid}", None),
        ("post", f"/api/table/{cid}/lecture/row", {"title": "x"}),
        ("post", f"/api/table/{cid}/lecture/column", {"column_type": "bool", "label": "x"}),
        ("patch", f"/api/table/row/{rid}", {"title": "x"}),
        ("delete", f"/api/table/row/{rid}", None),
        ("patch", f"/api/table/column/{colid}", {"label": "x"}),
        ("delete", f"/api/table/column/{colid}", None),
        ("put", f"/api/table/cell/{rid}/{colid}", {"value": False}),
        ("patch", f"/api/tag/{tag['id']}", {"value": "x"}),
        ("delete", f"/api/tag/{tag['id']}", None),
    ]
    for method, url, body in attempts:
        kwargs = {} if body is None else {"json": body}
        assert getattr(second_client, method)(url, **kwargs).status_code == 404, (method, url)

    own_course = second_client.post("/api/course", json={"title": "Mine"}).get_json()
    assert second_client.patch(f"/api/course/{own_course['id']}", json={"tag_ids": [tag["id"]]}).status_code == 400
    assert second_client.put("/api/calendar/2026-11-03", json={"row_ids": [rid]}).status_code == 400
    for table_type in ("lecture", "assignment"):
        for endpoint in ("column_statistics", "not_done"):
            url = f"/api/dashboard/{table_type}/{endpoint}"
            assert [e["title"] for e in second_client.get(url).get_json()] == ["Mine"]
            assert second_client.get(f"{url}?course_id={cid}").get_json() == []

    assert [t["value"] for t in user_client.get("/api/tag").get_json()] == ["ML"]
    assert [c["title"] for c in user_client.get("/api/course").get_json()] == ["Algorithms"]
    lecture = get_tables(cid)["lecture"]
    assert [c["label"] for c in lecture["columns"]] == ["Watched"]
    assert lecture["rows"] == [{"id": rid, "title": "Chapter 1", "cells": {str(colid): True}}]


def test_users_can_use_the_same_names(user_client, second_client, course):
    """ST-22"""
    user_client.post("/api/tag", json={"value": "ML"})

    assert second_client.post("/api/tag", json={"value": "ML"}).status_code == 201
    assert second_client.post("/api/course", json={"title": "Algorithms"}).status_code == 201

    for client in (user_client, second_client):
        assert [t["value"] for t in client.get("/api/tag").get_json()] == ["ML"]
        assert [c["title"] for c in client.get("/api/course").get_json()] == ["Algorithms"]
