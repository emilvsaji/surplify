from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request, get_jwt
from app import mongo
from bson import ObjectId
from utils.helpers import error_response


def role_required(*roles):
    """Decorator to restrict access based on user role."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt() or {}
            token_role = claims.get("role")
            user_id = get_jwt_identity()
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})

            if not user:
                return error_response("User not found", 404)

            # If token has a role, trust it; otherwise fall back to DB
            role = token_role or user.get("role")
            if role not in roles:
                return error_response("Access denied. Insufficient permissions.", 403)

            if user.get("isBlocked"):
                return error_response("Account is blocked. Contact support.", 403)

            return fn(*args, **kwargs)
        return wrapper
    return decorator
