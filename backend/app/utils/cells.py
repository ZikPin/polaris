import math


def validate_cell_value(column_type, value, min_value=None, max_value=None):
    """Return why `value` is not allowed in a column of this type and range, or None if it is allowed."""
    if column_type == "bool":
        return None if isinstance(value, bool) else "Must be true or false."
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return "Must be a number or empty."
    if not math.isfinite(value):
        return "Must be a finite number."
    if min_value is not None and value < min_value:
        return f"Must be at least {min_value:g}."
    if max_value is not None and value > max_value:
        return f"Must be at most {max_value:g}."
    return None
