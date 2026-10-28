from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

from .extensions import login_manager


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify(error="not logged in"), 401


def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def validation_error(error):
        return jsonify(error="validation failed", fields=error.normalized_messages()), 400

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.description), error.code
