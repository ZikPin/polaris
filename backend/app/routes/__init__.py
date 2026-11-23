from . import auth, calendar, course, dashboard, table, table_type, tag


def register_blueprints(app):
    for module in (auth, course, tag, table_type, table, dashboard, calendar):
        app.register_blueprint(module.bp)
