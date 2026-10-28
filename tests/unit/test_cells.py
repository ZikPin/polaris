import pytest

from backend.app.utils.cells import validate_cell_value


@pytest.mark.parametrize("value", [True, False])
def test_checkbox_cell_accepts_booleans(value):
    assert validate_cell_value("bool", value) is None


@pytest.mark.parametrize("value", [None, 0, 1, "true", 1.5])
def test_checkbox_cell_rejects_everything_else(value):
    assert validate_cell_value("bool", value) is not None


@pytest.mark.parametrize("value", [None, 0, -100, 1000, 2.5])
def test_number_cell_without_bounds_accepts_any_number_or_empty(value):
    assert validate_cell_value("number", value) is None


@pytest.mark.parametrize("value", ["abc", "1", True, float("nan"), float("inf")])
def test_number_cell_rejects_non_numbers(value):
    assert validate_cell_value("number", value) is not None


@pytest.mark.parametrize(
    "value, min_value, max_value, allowed",
    [
        (1, 1, 5, True),
        (5, 1, 5, True),
        (0.9, 1, 5, False),
        (5.1, 1, 5, False),
        (0, 1, None, False),
        (1000, 1, None, True),
        (6, None, 5, False),
        (-1000, None, 5, True),
        (None, 1, 5, True),
    ],
)
def test_number_cell_respects_only_the_bounds_that_are_set(value, min_value, max_value, allowed):
    assert (validate_cell_value("number", value, min_value, max_value) is None) is allowed
