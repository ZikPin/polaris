import pytest


def cells(get_tables, course, table_type="lecture"):
    return [row["cells"] for row in get_tables(course["id"])[table_type]["rows"]]


def test_number_cells_start_empty(course, add_row, add_column, get_tables):
    add_row(course["id"], "lecture", "Chapter 1")
    column = add_column(course["id"], "lecture", "Grade", "number")
    add_row(course["id"], "lecture", "Chapter 2")

    assert cells(get_tables, course) == [{str(column["id"]): None}] * 2


@pytest.mark.parametrize(
    "bounds, accepted, rejected",
    [
        ({"min": 1, "max": 5}, [1, 3, 5, 2.5], [0.9, 5.1, -1]),
        ({"min": 1}, [1, 1000], [0, -5]),
        ({"max": 5}, [5, -1000], [5.1, 100]),
        ({}, [-100, 0, 1000], []),
    ],
)
def test_number_cell_values_are_checked_against_the_bounds(
    user_client, course, add_row, add_column, get_tables, bounds, accepted, rejected
):
    """ST-07"""
    row = add_row(course["id"], "lecture", "Chapter 1")
    column = add_column(course["id"], "lecture", "Grade", "number", **bounds)
    url = f"/api/table/cell/{row['id']}/{column['id']}"

    for value in accepted:
        response = user_client.put(url, json={"value": value})
        assert response.status_code == 200, value
        assert response.get_json()["value"] == value
    stored = accepted[-1]
    for value in [*rejected, "abc", True]:
        assert user_client.put(url, json={"value": value}).status_code == 400, value
        assert cells(get_tables, course) == [{str(column["id"]): stored}]

    assert user_client.put(url, json={"value": None}).status_code == 200
    assert cells(get_tables, course) == [{str(column["id"]): None}]


def test_changing_the_bounds_only_affects_later_values(user_client, course, add_row, add_column, set_cell, get_tables):
    """ST-08"""
    column = add_column(course["id"], "lecture", "Grade", "number", min=1, max=5)
    rows = [add_row(course["id"], "lecture", f"Chapter {i}") for i in range(1, 6)]
    for value, row in enumerate(rows, start=1):
        set_cell(row, column, value)

    changed = user_client.patch(f"/api/table/column/{column['id']}", json={"min": 3})
    assert changed.status_code == 200
    assert changed.get_json()["min"] == 3

    assert [list(c.values())[0] for c in cells(get_tables, course)] == [1, 2, 3, 4, 5]
    low = user_client.put(f"/api/table/cell/{rows[0]['id']}/{column['id']}", json={"value": 2})
    high = user_client.put(f"/api/table/cell/{rows[0]['id']}/{column['id']}", json={"value": 4})
    assert (low.status_code, high.status_code) == (400, 200)


def test_bounds_must_stay_ordered(user_client, course, add_column):
    column = add_column(course["id"], "lecture", "Grade", "number", min=1, max=5)

    too_high = user_client.patch(f"/api/table/column/{column['id']}", json={"min": 9})
    removed = user_client.patch(f"/api/table/column/{column['id']}", json={"min": None, "max": None})
    created = user_client.post(
        f"/api/table/{course['id']}/lecture/column",
        json={"column_type": "number", "label": "X", "min": 5, "max": 1},
    )

    assert too_high.status_code == created.status_code == 400
    assert removed.status_code == 200
    assert (removed.get_json()["min"], removed.get_json()["max"]) == (None, None)


def test_checkbox_column_only_accepts_a_label_change(user_client, course, add_column):
    column = add_column(course["id"], "lecture", "Watched")

    response = user_client.patch(f"/api/table/column/{column['id']}", json={"label": "Seen", "min": 1})

    assert response.status_code == 400
    assert "min" in response.get_json()["fields"]


def test_values_must_match_the_column_type(user_client, course, add_row, add_column, set_cell):
    """ST-10"""
    row = add_row(course["id"], "lecture", "Chapter 1")
    number = add_column(course["id"], "lecture", "Grade", "number")
    set_cell(row, number, 3)

    response = user_client.put(f"/api/table/cell/{row['id']}/{number['id']}", json={"value": True})

    assert response.status_code == 400


def test_deleting_a_number_column_deletes_its_values(user_client, course, add_row, add_column, set_cell, get_tables):
    """ST-06"""
    row = add_row(course["id"], "lecture", "Chapter 1")
    column = add_column(course["id"], "lecture", "Grade", "number")
    set_cell(row, column, 3)

    assert user_client.delete(f"/api/table/column/{column['id']}").status_code == 204

    lecture = get_tables(course["id"])["lecture"]
    assert lecture["columns"] == []
    assert [r["cells"] for r in lecture["rows"]] == [{}]


def test_columns_of_both_types_keep_their_creation_order(course, add_column, get_tables):
    """ST-09"""
    add_column(course["id"], "lecture", "X")
    add_column(course["id"], "lecture", "Y", "number")
    add_column(course["id"], "lecture", "Z")

    columns = get_tables(course["id"])["lecture"]["columns"]

    assert [(c["label"], c["column_type"]) for c in columns] == [("X", "bool"), ("Y", "number"), ("Z", "bool")]
