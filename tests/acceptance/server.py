"""The backend for the acceptance tests: `python -m tests.acceptance.server` from the repository root.

It builds the pristine database (all migrations plus the seed), copies it to the live file and serves
the live file on port 5000, where the Angular dev server expects Flask. The tests copy the pristine file
over the live one before every test (see fixtures.ts).
"""
import logging
import shutil

from flask_migrate import upgrade
from sqlalchemy.pool import NullPool

from backend.app import ROOT, create_app
from backend.app.extensions import db
from backend.app.seed import seed

INSTANCE = ROOT / "instance"
LIVE = INSTANCE / "acceptance.db"
PRISTINE = INSTANCE / "acceptance.pristine.db"


def create_pristine_database():
    INSTANCE.mkdir(exist_ok=True)
    for path in (LIVE, PRISTINE):
        path.unlink(missing_ok=True)
    app = create_app("development", {"SQLALCHEMY_DATABASE_URI": f"sqlite:///{PRISTINE}"})
    with app.app_context():
        upgrade()
        seed()
        db.engine.dispose()
    shutil.copyfile(PRISTINE, LIVE)


if __name__ == "__main__":
    create_pristine_database()
    logging.getLogger("werkzeug").setLevel(logging.WARNING)  # one line per request is noise in the test output
    # No connection pool: the file is replaced between tests, so no connection may stay open on the old one.
    app = create_app(
        "development",
        {"SQLALCHEMY_DATABASE_URI": f"sqlite:///{LIVE}", "SQLALCHEMY_ENGINE_OPTIONS": {"poolclass": NullPool}},
    )
    app.run(port=5050)
