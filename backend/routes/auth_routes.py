from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import mongo
from utils.helpers import serialize_doc
from bson import ObjectId
from datetime import datetime
import bcrypt

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    required = ["name", "email", "password", "role"]
    for field in required:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field} is required"}), 400

    if data["role"] not in ["user", "shopowner"]:
        return jsonify({"error": "Invalid role. Must be 'user' or 'shopowner'"}), 400

    # Check if email already exists
    if mongo.db.users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already registered"}), 409

    # Hash password
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

    result = mongo.db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token(identity=str(result.inserted_id))

    return jsonify({
        "message": "Registration successful",
        "token": token,
        "user": serialize_doc({
            "_id": user_doc["_id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "phone": user_doc["phone"],
        })
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = mongo.db.users.find_one({"email": data["email"]})
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not bcrypt.checkpw(data["password"].encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401

    if user.get("isBlocked"):
        return jsonify({"error": "Your account has been blocked. Contact admin."}), 403

    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": serialize_doc({
            "_id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "phone": user.get("phone", ""),
        })
    }), 200


@auth_bp.route("/me", methods=["GET"])
def get_me():
    from flask_jwt_extended import jwt_required, get_jwt_identity
    @jwt_required()
    def inner():
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "user": serialize_doc({
                "_id": user["_id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "phone": user.get("phone", ""),
            })
        }), 200
    return inner()
