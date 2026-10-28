import pytest


@pytest.mark.parametrize("table_type, other", [("lecture", "assignment"), ("assignment", "lecture")])
def test_rows_are_listed_in_creation_order(user_client, course, add_row, get_tables, table_type, other):
    """ST-03"""
    first = add_row(course["id"], table_type, "B")
    second = add_row(course["id"], table_type, "A")

    renamed = user_client.patch(f"/api/table/row/{first['id']}", json={"title": "Beta"})
    assert renamed.status_code == 200
    assert user_client.delete(f"/api/table/row/{second['id']}").status_code == 204
    add_row(course["id"], table_type, "C")

    tables = get_tables(course["id"])
    assert [row["title"] for row in tables[table_type]["rows"]] == ["Beta", "C"]
    assert tables[other]["rows"] == []


def test_deleting_a_row_deletes_its_values(user_client, course, add_row, add_column, get_tables):
    """ST-04"""
    first = add_row(course["id"], "lecture", "Chapter 1")
    second = add_row(course["id"], "lecture", "Chapter 2")
    column = add_column(course["id"], "lecture", "Watched")
    for row in (first, second):
        user_client.put(f"/api/table/cell/{row['id']}/{column['id']}", json={"value": True})

    assert user_client.delete(f"/api/table/row/{first['id']}").status_code == 204

    rows = get_tables(course["id"])["lecture"]["rows"]
    assert rows == [{"id": second["id"], "title": "Chapter 2", "cells": {str(column["id"]): True}}]


@pytest.mark.parametrize("title", ["", "   "])
def test_row_title_must_not_be_empty(user_client, course, add_row, get_tables, title):
    """ST-23"""
    row = add_row(course["id"], "lecture", "Chapter 1")

    assert user_client.post(f"/api/table/{course['id']}/lecture/row", json={"title": title}).status_code == 400
    assert user_client.patch(f"/api/table/row/{row['id']}", json={"title": title}).status_code == 400
    assert [r["title"] for r in get_tables(course["id"])["lecture"]["rows"]] == ["Chapter 1"]


def test_unknown_table_type_is_not_found(user_client, course):
    response = user_client.post(f"/api/table/{course['id']}/exam/row", json={"title": "Final"})

    assert response.status_code == 404
