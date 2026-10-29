import pytest


def statistics(client, table_type, query=""):
    response = client.get(f"/api/dashboard/{table_type}/column_statistics{query}")
    assert response.status_code == 200
    return response.get_json()


def not_done(client, table_type, query=""):
    response = client.get(f"/api/dashboard/{table_type}/not_done{query}")
    assert response.status_code == 200
    return response.get_json()


def test_checkbox_columns_are_counted_per_table(user_client, course, add_row, add_column, set_cell):
    """ST-14"""
    lectures = [add_row(course["id"], "lecture", f"L{i}") for i in range(1, 5)]
    assignments = [add_row(course["id"], "assignment", f"A{i}") for i in range(1, 3)]
    watched = add_column(course["id"], "lecture", "W")
    solved = add_column(course["id"], "assignment", "S")
    for row in lectures[:3]:
        set_cell(row, watched, True)
    set_cell(assignments[0], solved, True)

    assert statistics(user_client, "lecture") == [
        {
            "course_id": course["id"],
            "title": "Algorithms",
            "columns": [
                {"column_id": watched["id"], "label": "W", "column_type": "bool", "checked": 3, "unchecked": 1}
            ],
        }
    ]
    assert statistics(user_client, "assignment")[0]["columns"] == [
        {"column_id": solved["id"], "label": "S", "column_type": "bool", "checked": 1, "unchecked": 1}
    ]


@pytest.mark.parametrize("table_type", ["lecture", "assignment"])
def test_number_columns_use_their_statistic_and_ignore_empty_cells(
    user_client, course, add_row, add_column, set_cell, table_type
):
    """ST-15"""
    rows = [add_row(course["id"], table_type, f"R{i}") for i in range(1, 4)]
    grade = add_column(course["id"], table_type, "Grade", "number")
    empty = add_column(course["id"], table_type, "Empty", "number")
    set_cell(rows[0], grade, 2)
    set_cell(rows[2], grade, 4)

    def columns():
        return {c["label"]: c for c in statistics(user_client, table_type)[0]["columns"]}

    assert (columns()["Grade"]["statistic"], columns()["Grade"]["value"]) == ("avg", 3)
    assert columns()["Empty"]["value"] is None

    user_client.patch(f"/api/table/column/{grade['id']}", json={"preferred_statistic": "sum"})
    assert (columns()["Grade"]["statistic"], columns()["Grade"]["value"]) == ("sum", 6)
    assert empty["id"] == columns()["Empty"]["column_id"]


@pytest.mark.parametrize("table_type", ["lecture", "assignment"])
def test_rows_with_an_unchecked_checkbox_are_not_done(user_client, course, add_row, add_column, set_cell, table_type):
    """ST-16"""
    r1, r2, r3 = (add_row(course["id"], table_type, name) for name in ("R1", "R2", "R3"))
    watched = add_column(course["id"], table_type, "W")
    notes = add_column(course["id"], table_type, "N")
    for row, column in [(r1, watched), (r1, notes), (r2, watched)]:
        set_cell(row, column, True)

    def titles():
        return [row["title"] for row in not_done(user_client, table_type)[0]["rows"]]

    assert titles() == ["R2", "R3"]
    set_cell(r2, notes, True)
    assert titles() == ["R3"]


def test_rows_without_checkbox_columns_are_never_listed(user_client, course, add_row):
    """ST-16"""
    add_row(course["id"], "lecture", "L1")

    assert not_done(user_client, "lecture") == [{"course_id": course["id"], "title": "Algorithms", "rows": []}]


@pytest.fixture
def tagged_courses(user_client):
    """Courses 1 (tag A), 2 (tag B), 3 (tags A and B), and the ids of the tags."""
    a = user_client.post("/api/tag", json={"value": "A"}).get_json()["id"]
    b = user_client.post("/api/tag", json={"value": "B"}).get_json()["id"]
    courses = [
        user_client.post("/api/course", json={"title": str(i), "tag_ids": ids}).get_json()["id"]
        for i, ids in enumerate([[a], [b], [a, b]], start=1)
    ]
    return courses, a, b


def test_dashboard_is_restricted_by_tags_and_courses(user_client, tagged_courses):
    """ST-17"""
    (c1, c2, c3), a, b = tagged_courses

    def ids(query):
        return [entry["course_id"] for entry in statistics(user_client, "lecture", query)]

    assert ids("") == [c1, c2, c3]
    assert ids(f"?tag_id={a}") == [c1, c3]
    assert ids(f"?tag_id={a}&tag_id={b}") == [c1, c2, c3]
    assert ids(f"?course_id={c2}&course_id={c3}") == [c2, c3]
    assert ids(f"?tag_id={a}&course_id={c2}&course_id={c3}") == [c3]
    assert [entry["course_id"] for entry in not_done(user_client, "lecture", f"?tag_id={b}")] == [c2, c3]


def test_dashboard_rejects_bad_filters_and_table_types(user_client):
    assert user_client.get("/api/dashboard/lecture/column_statistics?tag_id=abc").status_code == 400
    assert user_client.get("/api/dashboard/exam/not_done").status_code == 404
