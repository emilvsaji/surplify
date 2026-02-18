from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask import jsonify
from app import mongo
from bson import ObjectId


def role_required(*roles):
    """Decorator to restrict access based on user role."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"error": "User not found"}), 404
            if user.get("role") not in roles:
                return jsonify({"error": "Access denied. Insufficient permissions."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
