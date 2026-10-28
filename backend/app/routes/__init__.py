from . import auth, course, table, tag


def register_blueprints(app):
    for module in (auth, course, tag, table):
        app.register_blueprint(module.bp)
