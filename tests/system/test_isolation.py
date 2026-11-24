import re

import pytest

from backend.app import create_app

PUBLIC = {"auth.register", "auth.login", "auth.forgot_password", "auth.reset_password", "static"}


def concrete(rule):
    """A URL for a route rule, with placeholder values."""
    url = re.sub(r"<int:[^>]+>", "1", rule)
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
    user_client, second_client, course, types, add_row, add_column, set_cell, get_tables
):
    """ST-22"""
    tag = user_client.post("/api/tag", json={"value": "ML"}).get_json()
    user_client.patch(f"/api/course/{course['id']}", json={"tag_ids": [tag["id"]]})
    row = add_row(course["id"], "Lectures", "Chapter 1")
    column = add_column(course["id"], "Lectures", "Watched")
    set_cell(row, column, True)
    cid, rid, colid, tid = course["id"], row["id"], column["id"], types["Lectures"]

    attempts = [
        ("get", f"/api/course/{cid}", None),
        ("patch", f"/api/course/{cid}", {"title": "x"}),
        ("delete", f"/api/course/{cid}", None),
        ("get", f"/api/table/{cid}", None),
        ("post", f"/api/table/{cid}/{tid}/row", {"title": "x"}),
        ("post", f"/api/table/{cid}/{tid}/column", {"column_type": "bool", "label": "x"}),
        ("patch", f"/api/table/row/{rid}", {"title": "x"}),
        ("delete", f"/api/table/row/{rid}", None),
        ("patch", f"/api/table/column/{colid}", {"label": "x"}),
        ("delete", f"/api/table/column/{colid}", None),
        ("put", f"/api/table/cell/{rid}/{colid}", {"value": False}),
        ("patch", f"/api/tag/{tag['id']}", {"value": "x"}),
        ("delete", f"/api/tag/{tag['id']}", None),
        ("patch", f"/api/table_type/{tid}", {"name": "x"}),
        ("delete", f"/api/table_type/{tid}", None),
    ]
    for method, url, body in attempts:
        kwargs = {} if body is None else {"json": body}
        assert getattr(second_client, method)(url, **kwargs).status_code == 404, (method, url)

    own_types = [t["id"] for t in second_client.get("/api/table_type").get_json()]
    own_course = second_client.post("/api/course", json={"title": "Mine", "table_type_ids": own_types}).get_json()
    own_url = f"/api/course/{own_course['id']}"
    assert second_client.patch(own_url, json={"tag_ids": [tag["id"]]}).status_code == 400
    assert second_client.patch(own_url, json={"table_type_ids": [tid]}).status_code == 400
    assert second_client.put("/api/calendar/2026-11-03", json={"row_ids": [rid]}).status_code == 400
    for type_id in own_types:
        for endpoint in ("column_statistics", "not_done"):
            url = f"/api/dashboard/{type_id}/{endpoint}"
            assert [e["title"] for e in second_client.get(url).get_json()] == ["Mine"]
            assert second_client.get(f"{url}?course_id={cid}").get_json() == []
    for endpoint in ("column_statistics", "not_done"):
        assert second_client.get(f"/api/dashboard/{tid}/{endpoint}").get_json() == []

    assert [t["value"] for t in user_client.get("/api/tag").get_json()] == ["ML"]
    assert [t["name"] for t in user_client.get("/api/table_type").get_json()] == ["Assignments", "Lectures"]
    assert [c["title"] for c in user_client.get("/api/course").get_json()] == ["Algorithms"]
    lecture = get_tables(cid)["Lectures"]
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
