import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from pymongo import MongoClient


class Mongo:
    """Lightweight wrapper around PyMongo's MongoClient that mimics flask-pymongo's `mongo.db` interface."""

    def __init__(self):
        self.client = None
        self.db = None

    def init_app(self, app):
        uri = app.config["MONGO_URI"]
        self.client = MongoClient(uri)
        # Extract the database name from the URI
        self.db = self.client.get_default_database()


mongo = Mongo()
jwt = JWTManager()
socketio = SocketIO()


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)

    # Configure CORS origins
    cors_env = os.getenv("CORS_ORIGINS", "")
    if cors_env == "*":
        allowed_origins = "*"
    else:
        default_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
        ]
        frontend_url = os.getenv("FRONTEND_URL")
        if frontend_url:
            default_origins.append(frontend_url.rstrip("/"))
        if cors_env:
            for origin in cors_env.split(","):
                if origin.strip():
                    default_origins.append(origin.strip().rstrip("/"))
        allowed_origins = list(set(default_origins))

    CORS(
        app,
        resources={
            r"/*": {
                "origins": allowed_origins,
            }
        },
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    )
    # Using 'threading' mode to support Python 3.13; 'eventlet' is incompatible
    socketio.init_app(app, cors_allowed_origins="*", async_mode="threading")

    # Register blueprints with standard /api prefix
    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.shop_routes import shop_bp
    from routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(shop_bp, url_prefix="/api/shop")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Fallback aliases in case client requests omit /api prefix
    app.register_blueprint(auth_bp, url_prefix="/auth", name="auth_bp_alias")
    app.register_blueprint(shop_bp, url_prefix="/shop", name="shop_bp_alias")
    app.register_blueprint(admin_bp, url_prefix="/admin", name="admin_bp_alias")

    # Health check endpoints
    @app.route("/")
    @app.route("/health")
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "Surplify API is running"}, 200

    return app

