from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import mongo, socketio
from utils.decorators import role_required
from utils.helpers import (
    serialize_doc,
    success_response,
    error_response,
    ensure_objectid,
    validate_required,
    validate_positive_number,
)
from bson import ObjectId
from datetime import datetime

user_bp = Blueprint("user", __name__)


@user_bp.route("/foods", methods=["GET"])
def get_foods():
    """Get all available surplus food items."""
    city = request.args.get("city", "")
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    skip = (page - 1) * limit

    query = {"isActive": True, "quantityAvailable": {"$gt": 0}}

    if city:
        # Find shops in the city, then get their food items
        shops = mongo.db.shops.find({"city": {"$regex": city, "$options": "i"}, "approvalStatus": "approved", "isBlocked": False})
        shop_ids = [shop["_id"] for shop in shops]
        query["shopId"] = {"$in": shop_ids}
    else:
        # Only show food from approved, non-blocked shops
        approved_shops = mongo.db.shops.find({"approvalStatus": "approved", "isBlocked": False})
        shop_ids = [shop["_id"] for shop in approved_shops]
        query["shopId"] = {"$in": shop_ids}

    if search:
        query["$or"] = [
            {"foodName": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    total = mongo.db.food_items.count_documents(query)
    foods = list(mongo.db.food_items.find(query).sort("createdAt", -1).skip(skip).limit(limit))

    # Attach shop info to each food item
    for food in foods:
        shop = mongo.db.shops.find_one({"_id": food["shopId"]})
        if shop:
            food["shop"] = {
                "_id": shop["_id"],
                "shopName": shop["shopName"],
                "address": shop["address"],
                "city": shop["city"],
            }

    return success_response("Foods fetched", {
        "foods": serialize_doc(foods),
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    })


@user_bp.route("/foods/<food_id>", methods=["GET"])
def get_food_detail(food_id):
    """Get single food item details."""
    oid = ensure_objectid(food_id)
    if not oid:
        return error_response("Invalid food id", 400)

    food = mongo.db.food_items.find_one({"_id": oid})
    if not food:
        return error_response("Food item not found", 404)

    shop = mongo.db.shops.find_one({"_id": food["shopId"]})
    if shop:
        food["shop"] = serialize_doc({
            "_id": shop["_id"],
            "shopName": shop["shopName"],
            "address": shop["address"],
            "city": shop["city"],
            "locationCoordinates": shop.get("locationCoordinates", {}),
        })

    return success_response("Food fetched", {"food": serialize_doc(food)})


@user_bp.route("/orders", methods=["POST"])
@jwt_required()
@role_required("user")
def place_order():
    """Place a new order."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    if not data.get("items") or not data.get("shopId"):
        return error_response("Items and shopId are required", 400)

    shop_oid = ensure_objectid(data.get("shopId"))
    if not shop_oid:
        return error_response("Invalid shop id", 400)

    shop = mongo.db.shops.find_one({"_id": shop_oid})
    if not shop or shop.get("approvalStatus") != "approved":
        return error_response("Shop not found or not approved", 404)

    total_amount = 0
    order_items = []

    for item in data["items"]:
        food_oid = ensure_objectid(item.get("foodId"))
        if not food_oid:
            return error_response("Invalid food id in items", 400)

        food = mongo.db.food_items.find_one({"_id": food_oid})
        if not food:
            return error_response(f"Food item {item.get('foodId')} not found", 404)
        if food["quantityAvailable"] < item["quantity"]:
            return error_response(f"Not enough stock for {food['foodName']}. Available: {food['quantityAvailable']}", 400)

        order_items.append({
            "foodId": food_oid,
            "foodName": food["foodName"],
            "quantity": item["quantity"],
            "price": food["discountedPrice"],
            "imageURL": food.get("imageURL", ""),
        })
        total_amount += food["discountedPrice"] * item["quantity"]

    # Create order
    order_doc = {
        "userId": ObjectId(user_id),
        "shopId": shop_oid,
        "items": order_items,
        "totalAmount": round(total_amount, 2),
        "orderStatus": "pending",
        "paymentStatus": "pending",
        "pickupTime": data.get("pickupTime", ""),
        "createdAt": datetime.utcnow(),
    }

    result = mongo.db.orders.insert_one(order_doc)

    # Update stock for each item
    for item in data["items"]:
        food = mongo.db.food_items.find_one({"_id": ensure_objectid(item["foodId"])})
        new_qty = food["quantityAvailable"] - item["quantity"]
        update = {"quantityAvailable": new_qty}
        if new_qty <= 0:
            update["isActive"] = False
        mongo.db.food_items.update_one({"_id": ObjectId(item["foodId"])}, {"$set": update})

    order_doc["_id"] = result.inserted_id

    # Emit socket event for real-time updates
    socketio.emit("new_order", {
        "shopId": data["shopId"],
        "order": serialize_doc(order_doc)
    })
    socketio.emit("dashboard_update", {"type": "new_order"})

    return success_response("Order placed successfully", {
        "order": serialize_doc(order_doc)
    }, status=201)


@user_bp.route("/my-orders", methods=["GET"])
@jwt_required()
@role_required("user")
def my_orders():
    """Get current user's orders."""
    user_id = get_jwt_identity()
    orders = list(mongo.db.orders.find({"userId": ObjectId(user_id)}).sort("createdAt", -1))

    for order in orders:
        shop = mongo.db.shops.find_one({"_id": order["shopId"]})
        if shop:
            order["shopName"] = shop["shopName"]
            order["shopAddress"] = shop["address"]

    return success_response("Orders fetched", {"orders": serialize_doc(orders)})


@user_bp.route("/orders/<order_id>/cancel", methods=["PUT"])
@jwt_required()
@role_required("user")
def cancel_order(order_id):
    """Cancel an order (only if pending)."""
    user_id = get_jwt_identity()
    oid = ensure_objectid(order_id)
    if not oid:
        return error_response("Invalid order id", 400)

    order = mongo.db.orders.find_one({"_id": oid, "userId": ObjectId(user_id)})

    if not order:
        return error_response("Order not found", 404)
    if order["orderStatus"] != "pending":
        return error_response("Only pending orders can be cancelled", 400)

    mongo.db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"orderStatus": "cancelled"}}
    )

    # Restore stock
    for item in order["items"]:
        mongo.db.food_items.update_one(
            {"_id": item["foodId"]},
            {"$inc": {"quantityAvailable": item["quantity"]}, "$set": {"isActive": True}}
        )

    socketio.emit("order_update", {"orderId": order_id, "status": "cancelled"})

    return success_response("Order cancelled successfully")


@user_bp.route("/shops/<shop_id>/rate", methods=["POST"])
@jwt_required()
@role_required("user")
def rate_shop(shop_id):
    """Rate a shop after pickup."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    rating = data.get("rating", 0)
    review = data.get("review", "")

    if not 1 <= rating <= 5:
        return error_response("Rating must be between 1 and 5", 400)

    shop_oid = ensure_objectid(shop_id)
    if not shop_oid:
        return error_response("Invalid shop id", 400)

    completed_order = mongo.db.orders.find_one({
        "userId": ObjectId(user_id),
        "shopId": shop_oid,
        "orderStatus": "completed"
    })

    if not completed_order:
        return error_response("You can only rate after completing an order", 400)

    rating_doc = {
        "userId": ObjectId(user_id),
        "shopId": shop_oid,
        "rating": rating,
        "review": review,
        "createdAt": datetime.utcnow(),
    }

    mongo.db.ratings.update_one(
        {"userId": ObjectId(user_id), "shopId": ObjectId(shop_id)},
        {"$set": rating_doc},
        upsert=True
    )

    # Update shop average rating
    pipeline = [
        {"$match": {"shopId": ObjectId(shop_id)}},
        {"$group": {"_id": None, "avgRating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = list(mongo.db.ratings.aggregate(pipeline))
    if result:
        mongo.db.shops.update_one(
            {"_id": ObjectId(shop_id)},
            {"$set": {"avgRating": round(result[0]["avgRating"], 1), "totalRatings": result[0]["count"]}}
        )

    return success_response("Rating submitted successfully")
