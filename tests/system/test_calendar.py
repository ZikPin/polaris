import pytest


def titles(response):
    return [row["title"] for row in response.get_json()["rows"]]


def test_a_day_lists_lectures_before_assignments(user_client, course, add_row):
    """ST-18"""
    lecture1 = add_row(course["id"], "lecture", "L1")
    assignment = add_row(course["id"], "assignment", "A1")
    lecture2 = add_row(course["id"], "lecture", "L2")

    response = user_client.put(
        "/api/calendar/2026-11-03", json={"row_ids": [assignment["id"], lecture2["id"], lecture1["id"]]}
    )

    assert response.status_code == 200
    assert response.get_json()["date"] == "2026-11-03"
    assert titles(response) == ["L1", "L2", "A1"]


def test_setting_a_day_replaces_its_rows(user_client, course, add_row):
    """ST-18"""
    first, second, third = (add_row(course["id"], "lecture", name) for name in ("L1", "L2", "L3"))
    day = "/api/calendar/2026-11-03"
    user_client.put(day, json={"row_ids": [first["id"], second["id"]]})
    user_client.put("/api/calendar/2026-11-04", json={"row_ids": [first["id"]]})

    replaced = user_client.put(day, json={"row_ids": [second["id"], third["id"]]})
    cleared = user_client.put("/api/calendar/2026-11-04", json={"row_ids": []})

    assert titles(replaced) == ["L2", "L3"]
    assert titles(cleared) == []
    month = user_client.get("/api/calendar?month=2026-11").get_json()
    assert [(d["date"], [r["title"] for r in d["rows"]]) for d in month] == [("2026-11-03", ["L2", "L3"])]


def test_deleting_a_row_removes_it_from_its_days(user_client, course, add_row):
    """ST-18"""
    first, second = add_row(course["id"], "lecture", "L1"), add_row(course["id"], "lecture", "L2")
    user_client.put("/api/calendar/2026-11-03", json={"row_ids": [first["id"], second["id"]]})

    user_client.delete(f"/api/table/row/{second['id']}")

    month = user_client.get("/api/calendar?month=2026-11").get_json()
    assert [[r["title"] for r in d["rows"]] for d in month] == [["L1"]]


def test_month_only_contains_its_own_days(user_client, course, add_row):
    row = add_row(course["id"], "lecture", "L1")
    for day in ("2026-10-31", "2026-11-01", "2026-11-30", "2026-12-01"):
        user_client.put(f"/api/calendar/{day}", json={"row_ids": [row["id"]]})

    month = user_client.get("/api/calendar?month=2026-11").get_json()

    assert [d["date"] for d in month] == ["2026-11-01", "2026-11-30"]


def test_users_share_dates_but_not_rows(user_client, second_client, course, add_row):
    """ST-18"""
    own = add_row(course["id"], "lecture", "Mine")
    other_course = second_client.post("/api/course", json={"title": "Other"}).get_json()
    foreign = second_client.post(f"/api/table/{other_course['id']}/lecture/row", json={"title": "Theirs"}).get_json()
    user_client.put("/api/calendar/2026-11-03", json={"row_ids": [own["id"]]})
    second_client.put("/api/calendar/2026-11-03", json={"row_ids": [foreign["id"]]})

    user_client.put("/api/calendar/2026-11-03", json={"row_ids": []})

    assert user_client.get("/api/calendar?month=2026-11").get_json() == []
    theirs = second_client.get("/api/calendar?month=2026-11").get_json()
    assert [[r["title"] for r in d["rows"]] for d in theirs] == [["Theirs"]]


@pytest.mark.parametrize(
    "url, body",
    [
        ("/api/calendar/2026-11-03", {"row_ids": [999]}),
        ("/api/calendar/2026-11-03", {"row_ids": [1, 1]}),
        ("/api/calendar/2026-11-03", {}),
        ("/api/calendar/2026-13-01", {"row_ids": []}),
        ("/api/calendar/tomorrow", {"row_ids": []}),
    ],
)
def test_calendar_rejects_bad_requests(user_client, url, body):
    assert user_client.put(url, json=body).status_code == 400


@pytest.mark.parametrize("query", ["", "?month=nov", "?month=2026-13", "?month=2026-1"])
def test_calendar_needs_a_valid_month(user_client, query):
    assert user_client.get(f"/api/calendar{query}").status_code == 400
