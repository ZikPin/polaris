import pytest


def test_checkbox_column_and_cells(user_client, course, add_row, add_column, get_tables):
    """ST-05"""
    first = add_row(course["id"], "lecture", "Chapter 1")
    add_row(course["id"], "lecture", "Chapter 2")

    created = user_client.post(
        f"/api/table/{course['id']}/lecture/column", json={"column_type": "bool", "label": "Watched"}
    )
    assert created.status_code == 201
    column = created.get_json()
    assert column["label"] == "Watched"
    assert column["column_type"] == "bool"
    assert "min" not in column

    add_row(course["id"], "lecture", "Chapter 3")
    tables = get_tables(course["id"])
    assert tables["lecture"]["columns"] == [column]
    assert [row["cells"] for row in tables["lecture"]["rows"]] == [{str(column["id"]): False}] * 3
    assert tables["assignment"] == {"columns": [], "rows": []}

    cell_url = f"/api/table/cell/{first['id']}/{column['id']}"
    checked = user_client.put(cell_url, json={"value": True})
    assert checked.get_json() == {"row_id": first["id"], "column_id": column["id"], "value": True}
    assert get_tables(course["id"])["lecture"]["rows"][0]["cells"][str(column["id"])] is True
    user_client.put(cell_url, json={"value": False})
    assert get_tables(course["id"])["lecture"]["rows"][0]["cells"][str(column["id"])] is False

    renamed = user_client.patch(f"/api/table/column/{column['id']}", json={"label": "Seen"})
    assert renamed.get_json()["label"] == "Seen"


def test_deleting_a_checkbox_column_deletes_its_values(user_client, course, add_row, add_column, get_tables):
    """ST-06"""
    add_row(course["id"], "lecture", "Chapter 1")
    column = add_column(course["id"], "lecture", "Watched")

    assert user_client.delete(f"/api/table/column/{column['id']}").status_code == 204

    lecture = get_tables(course["id"])["lecture"]
    assert lecture["columns"] == []
    assert [(row["title"], row["cells"]) for row in lecture["rows"]] == [("Chapter 1", {})]


def test_columns_are_listed_in_creation_order(user_client, course, add_column, get_tables):
    """ST-09"""
    first = add_column(course["id"], "lecture", "X")
    add_column(course["id"], "lecture", "Z")
    user_client.patch(f"/api/table/column/{first['id']}", json={"label": "X renamed"})

    columns = get_tables(course["id"])["lecture"]["columns"]

    assert [column["label"] for column in columns] == ["X renamed", "Z"]


def test_cell_must_match_its_column(user_client, course, add_row, add_column, get_tables):
    """ST-10"""
    other_course = user_client.post("/api/course", json={"title": "Other"}).get_json()
    lecture = add_row(course["id"], "lecture", "Chapter 1")
    assignment = add_row(course["id"], "assignment", "Sheet 1")
    foreign_row = add_row(other_course["id"], "lecture", "Chapter 1")
    column = add_column(course["id"], "lecture", "Watched")

    for row in (assignment, foreign_row):
        response = user_client.put(f"/api/table/cell/{row['id']}/{column['id']}", json={"value": True})
        assert response.status_code == 400
    for value in (1, "yes", None):
        response = user_client.put(f"/api/table/cell/{lecture['id']}/{column['id']}", json={"value": value})
        assert response.status_code == 400
    assert get_tables(course["id"])["lecture"]["rows"][0]["cells"] == {str(column["id"]): False}


def test_checkbox_column_does_not_accept_number_settings(user_client, course):
    response = user_client.post(
        f"/api/table/{course['id']}/lecture/column",
        json={"column_type": "bool", "label": "Watched", "min": 1},
    )

    assert response.status_code == 400
    assert "min" in response.get_json()["fields"]


@pytest.mark.parametrize("label", ["", "   "])
def test_column_label_must_not_be_empty(user_client, course, add_column, label):
    """ST-23"""
    column = add_column(course["id"], "lecture", "Watched")

    created = user_client.post(
        f"/api/table/{course['id']}/lecture/column", json={"column_type": "bool", "label": label}
    )
    renamed = user_client.patch(f"/api/table/column/{column['id']}", json={"label": label})

    assert created.status_code == renamed.status_code == 400
