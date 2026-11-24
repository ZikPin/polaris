import pytest


@pytest.fixture
def add_type(user_client, types):
    """Creates a table type and makes it known to the helpers that take the name of a type."""
    def add(name):
        response = user_client.post("/api/table_type", json={"name": name})
        assert response.status_code == 201
        types[name] = response.get_json()["id"]
        return response.get_json()
    return add


@pytest.fixture
def fill(add_row, add_column, set_cell):
    """Adds a row with a checked checkbox to the table of a course. Returns the row."""
    def add(course_id, table_type):
        row = add_row(course_id, table_type, f"{table_type} row")
        set_cell(row, add_column(course_id, table_type, f"{table_type} column"), True)
        return row
    return add


def names(client):
    return [table_type["name"] for table_type in client.get("/api/table_type").get_json()]


def calendar_titles(client):
    return [row["title"] for day in client.get("/api/calendar?month=2026-11").get_json() for row in day["rows"]]


def test_table_types_are_unique_per_user_and_listed_alphabetically(user_client, second_client, add_type):
    """ST-37"""
    assert names(user_client) == ["Assignments", "Lectures"]

    add_type("Labs")
    exams = add_type("Exams")
    renamed = user_client.patch(f"/api/table_type/{exams['id']}", json={"name": "Quizzes"})

    assert renamed.get_json() == {"id": exams["id"], "name": "Quizzes"}
    assert names(user_client) == ["Assignments", "Labs", "Lectures", "Quizzes"]
    assert user_client.post("/api/table_type", json={"name": "Labs"}).status_code == 409
    assert user_client.patch(f"/api/table_type/{exams['id']}", json={"name": "Labs"}).status_code == 409
    for name in ("", "   "):
        response = user_client.post("/api/table_type", json={"name": name})
        assert response.status_code == 400
        assert list(response.get_json()["fields"]) == ["name"]

    assert second_client.post("/api/table_type", json={"name": "Labs"}).status_code == 201
    assert names(second_client) == ["Assignments", "Labs", "Lectures"]
    assert names(user_client) == ["Assignments", "Labs", "Lectures", "Quizzes"]


def test_the_table_types_of_a_course_are_chosen(user_client, second_client, types, add_type, fill, get_tables):
    """ST-38"""
    add_type("Labs")
    first = user_client.post("/api/course", json={"title": "Physics"}).get_json()
    second = user_client.post("/api/course", json={"title": "Chemistry"}).get_json()
    assert get_tables(first["id"]) == {}

    for course in (first, second):
        user_client.patch(f"/api/course/{course['id']}", json={"table_type_ids": [types["Lectures"], types["Labs"]]})
    tables = get_tables(first["id"])
    assert [(name, table["columns"], table["rows"]) for name, table in tables.items()] == [
        ("Labs", [], []), ("Lectures", [], []),
    ]
    rows = [fill(course["id"], name) for course in (first, second) for name in ("Lectures", "Labs")]
    user_client.put("/api/calendar/2026-11-03", json={"row_ids": [row["id"] for row in rows]})
    second_tables = get_tables(second["id"])

    url = f"/api/course/{first['id']}"
    removed = user_client.patch(url, json={"table_type_ids": [types["Lectures"]]})

    assert [t["name"] for t in removed.get_json()["table_types"]] == ["Lectures"]
    lectures = get_tables(first["id"])
    assert list(lectures) == ["Lectures"]
    assert [row["title"] for row in lectures["Lectures"]["rows"]] == ["Lectures row"]
    assert [column["label"] for column in lectures["Lectures"]["columns"]] == ["Lectures column"]
    assert get_tables(second["id"]) == second_tables
    # Only the Labs row of the first course left the day (rows by table type, then in creation order)
    assert calendar_titles(user_client) == ["Labs row", "Lectures row", "Lectures row"]

    foreign = second_client.get("/api/table_type").get_json()[0]["id"]
    for invalid in ([999], [foreign]):
        response = user_client.patch(url, json={"table_type_ids": invalid})
        assert response.status_code == 400
        assert list(response.get_json()["fields"]) == ["table_type_ids"]
    assert get_tables(first["id"]) == lectures
    assert user_client.post(f"/api/table/{first['id']}/{types['Labs']}/row", json={"title": "X"}).status_code == 404


def test_deleting_a_table_type_removes_its_tables_from_every_course(
    user_client, second_client, types, add_type, fill, get_tables
):
    """ST-39"""
    add_type("Labs")
    courses = [
        user_client.post(
            "/api/course", json={"title": title, "table_type_ids": [types["Lectures"], types["Labs"]]}
        ).get_json()
        for title in ("Physics", "Chemistry")
    ]
    rows = [fill(course["id"], name) for course in courses for name in ("Lectures", "Labs")]
    user_client.put("/api/calendar/2026-11-03", json={"row_ids": [row["id"] for row in rows]})
    lectures = [get_tables(course["id"])["Lectures"] for course in courses]

    assert second_client.delete(f"/api/table_type/{types['Labs']}").status_code == 404
    assert user_client.delete(f"/api/table_type/{types['Labs']}").status_code == 204

    assert names(user_client) == ["Assignments", "Lectures"]
    for course, table in zip(courses, lectures):
        assert get_tables(course["id"]) == {"Lectures": table}
        assert [t["name"] for t in user_client.get(f"/api/course/{course['id']}").get_json()["table_types"]] == [
            "Lectures"
        ]
    assert calendar_titles(user_client) == ["Lectures row", "Lectures row"]
    assert user_client.get(f"/api/dashboard/{types['Labs']}/not_done").get_json() == []


def test_every_table_works_like_lectures_and_assignments(
    user_client, types, add_type, add_row, add_column, set_cell, get_tables
):
    """ST-40"""
    add_type("Labs")
    order = [types["Lectures"], types["Labs"], types["Assignments"]]
    course = user_client.post("/api/course", json={"title": "Physics", "table_type_ids": order}).get_json()
    user_client.post("/api/course", json={"title": "Chemistry", "table_type_ids": [types["Lectures"]]})
    lab1, lab2 = add_row(course["id"], "Labs", "Lab 1"), add_row(course["id"], "Labs", "Lab 2")
    done = add_column(course["id"], "Labs", "Done")
    points = add_column(course["id"], "Labs", "Points", "number")
    set_cell(lab1, done, True)
    set_cell(lab1, points, 4)
    set_cell(lab2, points, 2)
    lecture = add_row(course["id"], "Lectures", "Chapter 1")
    sheet = add_row(course["id"], "Assignments", "Sheet 1")

    tables = get_tables(course["id"])
    assert list(tables) == ["Assignments", "Labs", "Lectures"]
    assert [row["title"] for row in tables["Labs"]["rows"]] == ["Lab 1", "Lab 2"]
    assert tables["Labs"]["rows"][0]["cells"] == {str(done["id"]): True, str(points["id"]): 4}

    statistics = user_client.get(f"/api/dashboard/{types['Labs']}/column_statistics").get_json()
    assert [(c["label"], c.get("checked"), c.get("value")) for c in statistics[0]["columns"]] == [
        ("Done", 1, None), ("Points", None, 3),
    ]
    assert [entry["title"] for entry in statistics] == ["Physics"]
    not_done = user_client.get(f"/api/dashboard/{types['Labs']}/not_done").get_json()
    assert [(entry["title"], [row["title"] for row in entry["rows"]]) for entry in not_done] == [("Physics", ["Lab 2"])]
    lectures = user_client.get(f"/api/dashboard/{types['Lectures']}/column_statistics").get_json()
    assert [entry["title"] for entry in lectures] == ["Physics", "Chemistry"]

    day = user_client.put("/api/calendar/2026-11-03", json={"row_ids": [lecture["id"], lab2["id"], sheet["id"]]})
    assert [(row["title"], row["table_type"]["name"]) for row in day.get_json()["rows"]] == [
        ("Sheet 1", "Assignments"), ("Lab 2", "Labs"), ("Chapter 1", "Lectures"),
    ]
