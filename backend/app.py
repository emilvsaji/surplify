from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_socketio import SocketIO

mongo = PyMongo()
jwt = JWTManager()
socketio = SocketIO()


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    socketio.init_app(app, cors_allowed_origins="*", async_mode="eventlet")

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
