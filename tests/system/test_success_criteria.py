import time
from datetime import date

from backend.app.seed import PASSWORD

CREDENTIALS = {"email": "a@example.com", "password": "password1"}
LIMIT = 0.5  # seconds, REQ-NF-03


def test_data_is_still_there_after_logging_out_and_in_again(
    app, user_client, course, add_row, add_column, set_cell
):
    """ST-28"""
    tag = user_client.post("/api/tag", json={"value": "ML"}).get_json()
    user_client.patch(f"/api/course/{course['id']}", json={"tag_ids": [tag["id"]]})
    row = add_row(course["id"], "Lectures", "Intro")
    column = add_column(course["id"], "Lectures", "Watched")
    set_cell(row, column, True)
    assert user_client.post("/api/auth/logout").status_code == 204

    fresh = app.test_client()
    assert fresh.post("/api/auth/login", json=CREDENTIALS).status_code == 200

    courses = fresh.get("/api/course").get_json()
    assert [(entry["title"], [t["value"] for t in entry["tags"]]) for entry in courses] == [("Algorithms", ["ML"])]
    tables = fresh.get(f"/api/table/{course['id']}").get_json()
    lectures = next(table for table in tables if table["table_type"]["name"] == "Lectures")
    assert [entry["label"] for entry in lectures["columns"]] == ["Watched"]
    assert [(entry["title"], entry["cells"]) for entry in lectures["rows"]] == [("Intro", {str(column["id"]): True})]


def test_every_endpoint_answers_within_500_ms(app, tables):
    """ST-29: on the amount of data of the acceptance seed."""
    app.test_cli_runner().invoke(args=["seed"])
    client = app.test_client()
    slow = {}

    def call(method, url, **kwargs):
        start = time.perf_counter()
        response = getattr(client, method)(url, **kwargs)
        elapsed = time.perf_counter() - start
        assert response.status_code < 400, (method, url, response.status_code)
        if elapsed >= LIMIT:
            slow[f"{method.upper()} {url}"] = round(elapsed, 3)
        return response.get_json() if response.data else None

    call("post", "/api/auth/register", json={"email": "new@example.com", "password": "password1"})
    call("post", "/api/auth/logout")
    call("post", "/api/auth/login", json={"email": "alice@example.com", "password": PASSWORD})
    call("get", "/api/auth/me")

    call("get", "/api/course")
    call("get", "/api/course/1")
    tag = call("post", "/api/tag", json={"value": "Timing"})
    call("get", "/api/tag")
    call("patch", f"/api/tag/{tag['id']}", json={"value": "Timing 2"})
    table_type = call("post", "/api/table_type", json={"name": "Timing"})
    call("patch", f"/api/table_type/{table_type['id']}", json={"name": "Timing 2"})
    type_ids = [entry["id"] for entry in call("get", "/api/table_type")]
    created = call("post", "/api/course", json={"title": "Timing", "tag_ids": [tag["id"]], "table_type_ids": type_ids})
    course_id = created["id"]
    call("patch", f"/api/course/{course_id}", json={"title": "Timing 2"})

    call("get", f"/api/table/{course_id}")
    row = call("post", f"/api/table/{course_id}/{type_ids[0]}/row", json={"title": "Row"})
    call("patch", f"/api/table/row/{row['id']}", json={"title": "Row 2"})
    column = call(
        "post", f"/api/table/{course_id}/{type_ids[0]}/column", json={"column_type": "bool", "label": "Column"}
    )
    call("patch", f"/api/table/column/{column['id']}", json={"label": "Column 2"})
    call("put", f"/api/table/cell/{row['id']}/{column['id']}", json={"value": True})

    for type_id in type_ids:
        call("get", f"/api/dashboard/{type_id}/column_statistics")
        call("get", f"/api/dashboard/{type_id}/not_done")

    today = date.today()
    call("put", f"/api/calendar/{today.isoformat()}", json={"row_ids": [row["id"]]})
    call("get", f"/api/calendar?month={today:%Y-%m}")

    call("delete", f"/api/table/column/{column['id']}")
    call("delete", f"/api/table/row/{row['id']}")
    call("delete", f"/api/course/{course_id}")
    call("delete", f"/api/tag/{tag['id']}")
    call("delete", f"/api/table_type/{table_type['id']}")

    assert slow == {}
