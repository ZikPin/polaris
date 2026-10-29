def count_checked(values):
    """(checked, unchecked) of a list of booleans."""
    checked = sum(1 for value in values if value)
    return checked, len(values) - checked


def statistic(values, kind):
    """The 'avg' or 'sum' of the numbers. Empty values (None) are ignored, None if there is no number."""
    numbers = [value for value in values if value is not None]
    if not numbers:
        return None
    total = sum(numbers)
    return total / len(numbers) if kind == "avg" else total


def is_not_done(checkbox_values):
    """A row is not done if at least one of its checkboxes is unchecked. Without checkboxes it is done."""
    return not all(checkbox_values)
