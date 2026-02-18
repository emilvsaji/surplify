from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import mongo, socketio
from utils.decorators import role_required
from utils.helpers import serialize_doc
from bson import ObjectId
from datetime import datetime

shop_bp = Blueprint("shop", __name__)


@shop_bp.route("/register", methods=["POST"])
@jwt_required()
@role_required("shopowner")
def register_shop():
    """Register a new shop."""
    user_id = get_jwt_identity()

    # Check if owner already has a shop
    existing = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})
    if existing:
        return jsonify({"error": "You already have a registered shop", "shop": serialize_doc(existing)}), 409

    data = request.get_json()
    required = ["shopName", "address", "city"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    shop_doc = {
        "ownerId": ObjectId(user_id),
        "shopName": data["shopName"],
        "address": data["address"],
        "city": data["city"],
        "locationCoordinates": data.get("locationCoordinates", {}),
        "approvalStatus": "pending",
        "isBlocked": False,
        "avgRating": 0,
        "totalRatings": 0,
        "createdAt": datetime.utcnow(),
    }

    result = mongo.db.shops.insert_one(shop_doc)
    shop_doc["_id"] = result.inserted_id

    return jsonify({
        "message": "Shop registration submitted for approval",
        "shop": serialize_doc(shop_doc)
    }), 201


@shop_bp.route("/my-shop", methods=["GET"])
@jwt_required()
@role_required("shopowner")
def get_my_shop():
    """Get current shop owner's shop details."""
    user_id = get_jwt_identity()
    shop = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})
    if not shop:
        return jsonify({"error": "No shop found. Please register your shop first."}), 404
    return jsonify({"shop": serialize_doc(shop)}), 200


@shop_bp.route("/food/add", methods=["POST"])
@jwt_required()
@role_required("shopowner")
def add_food():
    """Add a new food item."""
    user_id = get_jwt_identity()
    shop = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})

    if not shop:
        return jsonify({"error": "Register your shop first"}), 404
    if shop["approvalStatus"] != "approved":
        return jsonify({"error": "Your shop is not yet approved"}), 403
    if shop.get("isBlocked"):
        return jsonify({"error": "Your shop has been blocked"}), 403

    data = request.get_json()
    required = ["foodName", "originalPrice", "discountedPrice", "quantityAvailable"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    food_doc = {
        "shopId": shop["_id"],
        "foodName": data["foodName"],
        "description": data.get("description", ""),
        "originalPrice": float(data["originalPrice"]),
        "discountedPrice": float(data["discountedPrice"]),
        "quantityAvailable": int(data["quantityAvailable"]),
        "pickupStartTime": data.get("pickupStartTime", ""),
        "pickupEndTime": data.get("pickupEndTime", ""),
        "expiryTime": data.get("expiryTime", ""),
        "imageURL": data.get("imageURL", ""),
        "category": data.get("category", "other"),
        "isActive": True,
        "createdAt": datetime.utcnow(),
    }

    result = mongo.db.food_items.insert_one(food_doc)
    food_doc["_id"] = result.inserted_id

    socketio.emit("food_update", {"type": "added", "food": serialize_doc(food_doc)})

    return jsonify({
        "message": "Food item added successfully",
        "food": serialize_doc(food_doc)
    }), 201


@shop_bp.route("/food/<food_id>", methods=["PUT"])
@jwt_required()
@role_required("shopowner")
def update_food(food_id):
    """Update a food item."""
    user_id = get_jwt_identity()
    shop = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})
    if not shop:
        return jsonify({"error": "Shop not found"}), 404

    food = mongo.db.food_items.find_one({"_id": ObjectId(food_id), "shopId": shop["_id"]})
    if not food:
        return jsonify({"error": "Food item not found"}), 404

    data = request.get_json()
    update_fields = {}
    allowed = ["foodName", "description", "originalPrice", "discountedPrice",
               "quantityAvailable", "pickupStartTime", "pickupEndTime",
               "expiryTime", "imageURL", "isActive", "category"]

    for field in allowed:
        if field in data:
            if field in ["originalPrice", "discountedPrice"]:
                update_fields[field] = float(data[field])
            elif field == "quantityAvailable":
                update_fields[field] = int(data[field])
            else:
                update_fields[field] = data[field]

    mongo.db.food_items.update_one({"_id": ObjectId(food_id)}, {"$set": update_fields})

    updated = mongo.db.food_items.find_one({"_id": ObjectId(food_id)})
    socketio.emit("food_update", {"type": "updated", "food": serialize_doc(updated)})

    return jsonify({
        "message": "Food item updated",
        "food": serialize_doc(updated)
    }), 200


@shop_bp.route("/food/<food_id>", methods=["DELETE"])
@jwt_required()
@role_required("shopowner")
def delete_food(food_id):
    """Delete a food item."""
    user_id = get_jwt_identity()
    shop = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})
    if not shop:
        return jsonify({"error": "Shop not found"}), 404

    result = mongo.db.food_items.delete_one({"_id": ObjectId(food_id), "shopId": shop["_id"]})
    if result.deleted_count == 0:
        return jsonify({"error": "Food item not found"}), 404

    socketio.emit("food_update", {"type": "deleted", "foodId": food_id})

    return jsonify({"message": "Food item deleted"}), 200


@shop_bp.route("/foods", methods=["GET"])
@jwt_required()
@role_required("shopowner")
def get_shop_foods():
    """Get all food items for the current shop."""
    user_id = get_jwt_identity()
    shop = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})
    if not shop:
        return jsonify({"error": "Shop not found"}), 404

    foods = list(mongo.db.food_items.find({"shopId": shop["_id"]}).sort("createdAt", -1))
    return jsonify({"foods": serialize_doc(foods)}), 200


@shop_bp.route("/orders", methods=["GET"])
@jwt_required()
@role_required("shopowner")
def get_shop_orders():
    """Get all orders for the current shop."""
    user_id = get_jwt_identity()
    shop = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})
    if not shop:
        return jsonify({"error": "Shop not found"}), 404

    status = request.args.get("status", "")
    query = {"shopId": shop["_id"]}
    if status:
        query["orderStatus"] = status

    orders = list(mongo.db.orders.find(query).sort("createdAt", -1))

    for order in orders:
        user = mongo.db.users.find_one({"_id": order["userId"]})
        if user:
            order["customerName"] = user["name"]
            order["customerPhone"] = user.get("phone", "")

    return jsonify({"orders": serialize_doc(orders)}), 200


@shop_bp.route("/order/status/<order_id>", methods=["PUT"])
@jwt_required()
@role_required("shopowner")
def update_order_status(order_id):
    """Update order status."""
    user_id = get_jwt_identity()
    shop = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})
    if not shop:
        return jsonify({"error": "Shop not found"}), 404

    order = mongo.db.orders.find_one({"_id": ObjectId(order_id), "shopId": shop["_id"]})
    if not order:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()
    new_status = data.get("status")

    valid_statuses = ["pending", "confirmed", "ready", "completed", "cancelled"]
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400

    update = {"orderStatus": new_status}
    if new_status == "completed":
        update["paymentStatus"] = "paid"

    # If cancelling, restore stock
    if new_status == "cancelled" and order["orderStatus"] != "cancelled":
        for item in order["items"]:
            mongo.db.food_items.update_one(
                {"_id": item["foodId"]},
                {"$inc": {"quantityAvailable": item["quantity"]}, "$set": {"isActive": True}}
            )

    mongo.db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": update})

    socketio.emit("order_update", {
        "orderId": order_id,
        "status": new_status,
        "userId": str(order["userId"])
    })

    return jsonify({"message": f"Order status updated to {new_status}"}), 200


@shop_bp.route("/analytics", methods=["GET"])
@jwt_required()
@role_required("shopowner")
def shop_analytics():
    """Get shop analytics."""
    user_id = get_jwt_identity()
    shop = mongo.db.shops.find_one({"ownerId": ObjectId(user_id)})
    if not shop:
        return jsonify({"error": "Shop not found"}), 404

    # Total food items
    total_items = mongo.db.food_items.count_documents({"shopId": shop["_id"]})
    active_items = mongo.db.food_items.count_documents({"shopId": shop["_id"], "isActive": True})

    # Orders analytics
    total_orders = mongo.db.orders.count_documents({"shopId": shop["_id"]})
    completed_orders = mongo.db.orders.count_documents({"shopId": shop["_id"], "orderStatus": "completed"})
    pending_orders = mongo.db.orders.count_documents({"shopId": shop["_id"], "orderStatus": "pending"})

    # Revenue
    revenue_pipeline = [
        {"$match": {"shopId": shop["_id"], "orderStatus": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}
    ]
    revenue_result = list(mongo.db.orders.aggregate(revenue_pipeline))
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    # Items sold
    sold_pipeline = [
        {"$match": {"shopId": shop["_id"], "orderStatus": "completed"}},
        {"$unwind": "$items"},
        {"$group": {"_id": None, "totalSold": {"$sum": "$items.quantity"}}}
    ]
    sold_result = list(mongo.db.orders.aggregate(sold_pipeline))
    total_sold = sold_result[0]["totalSold"] if sold_result else 0

    # Most sold food
    most_sold_pipeline = [
        {"$match": {"shopId": shop["_id"], "orderStatus": "completed"}},
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.foodName", "count": {"$sum": "$items.quantity"}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    most_sold = list(mongo.db.orders.aggregate(most_sold_pipeline))

    # Remaining stock
    stock_pipeline = [
        {"$match": {"shopId": shop["_id"], "isActive": True}},
        {"$group": {"_id": None, "totalStock": {"$sum": "$quantityAvailable"}}}
    ]
    stock_result = list(mongo.db.food_items.aggregate(stock_pipeline))
    remaining_stock = stock_result[0]["totalStock"] if stock_result else 0

    return jsonify({
        "analytics": {
            "totalItems": total_items,
            "activeItems": active_items,
            "totalOrders": total_orders,
            "completedOrders": completed_orders,
            "pendingOrders": pending_orders,
            "totalRevenue": round(total_revenue, 2),
            "totalItemsSold": total_sold,
            "remainingStock": remaining_stock,
            "mostSoldFoods": serialize_doc(most_sold),
            "avgRating": shop.get("avgRating", 0),
            "totalRatings": shop.get("totalRatings", 0),
        }
    }), 200
