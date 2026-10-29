from . import auth, calendar, course, dashboard, table, tag


def register_blueprints(app):
    for module in (auth, course, tag, table, dashboard, calendar):
        app.register_blueprint(module.bp)
