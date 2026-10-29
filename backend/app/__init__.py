import os
from pathlib import Path

from flask import Flask

from . import models  # noqa: F401  registers the models with SQLAlchemy
from .config import CONFIGS
from .errors import register_error_handlers
from .extensions import db, login_manager, migrate
from .routes import register_blueprints
from .seed import seed_command

ROOT = Path(__file__).resolve().parents[2]


def create_app(config=None, overrides=None):
    """Create the app. `config` is 'development', 'test' or 'production' (default: APP_ENV, else development)."""
    name = config or os.environ.get("APP_ENV", "development")
    app = Flask(__name__, instance_path=str(ROOT / "instance"))
    app.config.from_object(CONFIGS[name])
    if overrides:
        app.config.update(overrides)
    if name == "production" and not (app.config["SECRET_KEY"] and app.config["SQLALCHEMY_DATABASE_URI"]):
        raise RuntimeError("SECRET_KEY and DATABASE_URL must be set in production")

    os.makedirs(app.instance_path, exist_ok=True)
    db.init_app(app)
    migrate.init_app(app, db, directory=str(ROOT / "backend" / "migrations"))
    login_manager.init_app(app)
    register_error_handlers(app)
    register_blueprints(app)
    app.cli.add_command(seed_command)
    return app
