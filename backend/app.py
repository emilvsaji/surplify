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
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    # Using 'threading' mode to support Python 3.13; 'eventlet' is incompatible
    socketio.init_app(app, cors_allowed_origins="*", async_mode="threading")

    # Register blueprints
    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.shop_routes import shop_bp
    from routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(shop_bp, url_prefix="/api/shop")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "Surplify API is running"}, 200

    return app
