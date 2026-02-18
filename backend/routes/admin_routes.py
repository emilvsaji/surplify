from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import mongo
from utils.decorators import role_required
from utils.helpers import serialize_doc
from bson import ObjectId
from datetime import datetime

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_all_users():
    """Get all users."""
    role = request.args.get("role", "")
    query = {}
    if role:
        query["role"] = role

    users = list(mongo.db.users.find(query, {"password": 0}).sort("createdAt", -1))
    return jsonify({"users": serialize_doc(users)}), 200


@admin_bp.route("/shops", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_all_shops():
    """Get all shops."""
    status = request.args.get("status", "")
    query = {}
    if status:
        query["approvalStatus"] = status

    shops = list(mongo.db.shops.find(query).sort("createdAt", -1))

    for shop in shops:
        owner = mongo.db.users.find_one({"_id": shop["ownerId"]}, {"password": 0})
        if owner:
            shop["owner"] = serialize_doc(owner)

    return jsonify({"shops": serialize_doc(shops)}), 200


@admin_bp.route("/approve-shop/<shop_id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def approve_shop(shop_id):
    """Approve or reject a shop."""
    data = request.get_json()
    status = data.get("status")  # approved or rejected

    if status not in ["approved", "rejected"]:
        return jsonify({"error": "Status must be 'approved' or 'rejected'"}), 400

    result = mongo.db.shops.update_one(
        {"_id": ObjectId(shop_id)},
        {"$set": {"approvalStatus": status}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "Shop not found or status unchanged"}), 404

    return jsonify({"message": f"Shop {status} successfully"}), 200


@admin_bp.route("/block-user/<user_id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def block_user(user_id):
    """Block or unblock a user."""
    data = request.get_json()
    blocked = data.get("isBlocked", True)

    result = mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"isBlocked": blocked}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "User not found or status unchanged"}), 404

    # If user is a shop owner, also block/unblock their shop
    if blocked:
        mongo.db.shops.update_one(
            {"ownerId": ObjectId(user_id)},
            {"$set": {"isBlocked": True}}
        )
    else:
        mongo.db.shops.update_one(
            {"ownerId": ObjectId(user_id)},
            {"$set": {"isBlocked": False}}
        )

    action = "blocked" if blocked else "unblocked"
    return jsonify({"message": f"User {action} successfully"}), 200


@admin_bp.route("/block-shop/<shop_id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def block_shop(shop_id):
    """Block or unblock a shop."""
    data = request.get_json()
    blocked = data.get("isBlocked", True)

    result = mongo.db.shops.update_one(
        {"_id": ObjectId(shop_id)},
        {"$set": {"isBlocked": blocked}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "Shop not found or status unchanged"}), 404

    action = "blocked" if blocked else "unblocked"
    return jsonify({"message": f"Shop {action} successfully"}), 200


@admin_bp.route("/orders", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_all_orders():
    """Get all orders."""
    status = request.args.get("status", "")
    query = {}
    if status:
        query["orderStatus"] = status

    orders = list(mongo.db.orders.find(query).sort("createdAt", -1))

    for order in orders:
        user = mongo.db.users.find_one({"_id": order["userId"]}, {"password": 0})
        shop = mongo.db.shops.find_one({"_id": order["shopId"]})
        if user:
            order["userName"] = user["name"]
        if shop:
            order["shopName"] = shop["shopName"]

    return jsonify({"orders": serialize_doc(orders)}), 200


@admin_bp.route("/analytics", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_analytics():
    """Get platform-wide analytics."""
    total_users = mongo.db.users.count_documents({"role": "user"})
    total_shop_owners = mongo.db.users.count_documents({"role": "shopowner"})
    total_shops = mongo.db.shops.count_documents({})
    active_shops = mongo.db.shops.count_documents({"approvalStatus": "approved", "isBlocked": False})
    pending_shops = mongo.db.shops.count_documents({"approvalStatus": "pending"})

    total_food_items = mongo.db.food_items.count_documents({})
    active_food_items = mongo.db.food_items.count_documents({"isActive": True})

    total_orders = mongo.db.orders.count_documents({})
    completed_orders = mongo.db.orders.count_documents({"orderStatus": "completed"})
    pending_orders = mongo.db.orders.count_documents({"orderStatus": "pending"})
    cancelled_orders = mongo.db.orders.count_documents({"orderStatus": "cancelled"})

    # Revenue
    revenue_pipeline = [
        {"$match": {"orderStatus": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}
    ]
    revenue_result = list(mongo.db.orders.aggregate(revenue_pipeline))
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    # Food saved (total quantity sold)
    saved_pipeline = [
        {"$match": {"orderStatus": "completed"}},
        {"$unwind": "$items"},
        {"$group": {"_id": None, "totalSaved": {"$sum": "$items.quantity"}}}
    ]
    saved_result = list(mongo.db.orders.aggregate(saved_pipeline))
    total_food_saved = saved_result[0]["totalSaved"] if saved_result else 0

    # Recent orders
    recent_orders = list(mongo.db.orders.find().sort("createdAt", -1).limit(10))
    for order in recent_orders:
        user = mongo.db.users.find_one({"_id": order["userId"]}, {"password": 0})
        shop = mongo.db.shops.find_one({"_id": order["shopId"]})
        if user:
            order["userName"] = user["name"]
        if shop:
            order["shopName"] = shop["shopName"]

    # Top shops by revenue
    top_shops_pipeline = [
        {"$match": {"orderStatus": "completed"}},
        {"$group": {"_id": "$shopId", "revenue": {"$sum": "$totalAmount"}, "orders": {"$sum": 1}}},
        {"$sort": {"revenue": -1}},
        {"$limit": 5}
    ]
    top_shops = list(mongo.db.orders.aggregate(top_shops_pipeline))
    for ts in top_shops:
        shop = mongo.db.shops.find_one({"_id": ts["_id"]})
        if shop:
            ts["shopName"] = shop["shopName"]
        ts["_id"] = str(ts["_id"])

    return jsonify({
        "analytics": {
            "totalUsers": total_users,
            "totalShopOwners": total_shop_owners,
            "totalShops": total_shops,
            "activeShops": active_shops,
            "pendingShops": pending_shops,
            "totalFoodItems": total_food_items,
            "activeFoodItems": active_food_items,
            "totalOrders": total_orders,
            "completedOrders": completed_orders,
            "pendingOrders": pending_orders,
            "cancelledOrders": cancelled_orders,
            "totalRevenue": round(total_revenue, 2),
            "totalFoodSaved": total_food_saved,
            "recentOrders": serialize_doc(recent_orders),
            "topShops": top_shops,
        }
    }), 200
