import pytest

from backend.app.utils.statistics import count_checked, is_not_done, statistic


def test_count_checked():
    assert count_checked([True, True, False]) == (2, 1)
    assert count_checked([]) == (0, 0)


@pytest.mark.parametrize(
    "values, kind, expected",
    [
        ([1, 2, 3], "avg", 2),
        ([1, 2, 3], "sum", 6),
        ([2, None, 4], "avg", 3),
        ([2, None, 4], "sum", 6),
        ([0, 0], "avg", 0),
        ([None, None], "avg", None),
        ([None], "sum", None),
        ([], "avg", None),
    ],
)
def test_statistic_ignores_empty_values(values, kind, expected):
    assert statistic(values, kind) == expected
    assert (statistic(values, kind) is None) is (expected is None)


@pytest.mark.parametrize(
    "checkboxes, expected",
    [([True, True], False), ([True, False], True), ([False, False], True), ([], False)],
)
def test_row_is_not_done_if_a_checkbox_is_unchecked(checkboxes, expected):
    assert is_not_done(checkboxes) is expected
