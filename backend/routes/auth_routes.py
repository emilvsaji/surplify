from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import mongo
from utils.helpers import serialize_doc, success_response, error_response, validate_required
from bson import ObjectId
from datetime import datetime
import bcrypt

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    missing = validate_required(data, ["name", "email", "password", "role"])
    if missing:
        return error_response(f"Missing fields: {', '.join(missing)}", 400)

    if data["role"] not in ["user", "shopowner"]:
        return error_response("Invalid role. Must be 'user' or 'shopowner'", 400)

    db = mongo.db
    if db.users.find_one({"email": data["email"]}):
        return error_response("Email already registered", 409)

    hashed = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())

    user_doc = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed.decode("utf-8"),
        "role": data["role"],
        "phone": data.get("phone", ""),
        "isBlocked": False,
        "createdAt": datetime.utcnow(),
    }

    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token(identity=str(result.inserted_id), additional_claims={"role": user_doc["role"]})

    return success_response("Registration successful", {
        "token": token,
        "user": serialize_doc({
            "_id": user_doc["_id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "phone": user_doc["phone"],
        })
    }, status=201)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    if not data.get("email") or not data.get("password"):
        return error_response("Email and password are required", 400)

    db = mongo.db
    user = db.users.find_one({"email": data["email"]})
    if not user or not bcrypt.checkpw(data["password"].encode("utf-8"), user["password"].encode("utf-8")):
        return error_response("Invalid email or password", 401)

    if user.get("isBlocked"):
        return error_response("Your account has been blocked. Contact admin.", 403)

    token = create_access_token(identity=str(user["_id"]), additional_claims={"role": user["role"]})

    return success_response("Login successful", {
        "token": token,
        "user": serialize_doc({
            "_id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "phone": user.get("phone", ""),
        })
    })


@auth_bp.route("/me", methods=["GET"])
def get_me():
    from flask_jwt_extended import jwt_required, get_jwt_identity
    @jwt_required()
    def inner():
        user_id = get_jwt_identity()
        db = mongo.db
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return error_response("User not found", 404)
        return success_response("Profile fetched", {
            "user": serialize_doc({
                "_id": user["_id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "phone": user.get("phone", ""),
            })
        })
    return inner()
