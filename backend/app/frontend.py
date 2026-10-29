from pathlib import Path

from flask import send_from_directory
from werkzeug.exceptions import NotFound


def register_frontend(app):
    """Serves the built Angular app from the `FRONTEND_DIR` config, so the browser talks to a single origin.

    A file that exists is sent as it is. Every other path is a route of the Angular app and gets `index.html`.
    Paths below /api are never the app: the API answers them (and its 404 is JSON).
    """
    folder = Path(app.config["FRONTEND_DIR"])

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def frontend(path):
        if path.startswith("api/"):
            raise NotFound("Not found.")
        if path and (folder / path).is_file():
            return send_from_directory(folder, path)
        return send_from_directory(folder, "index.html")
