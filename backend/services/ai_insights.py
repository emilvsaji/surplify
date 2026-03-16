import json
from bson import ObjectId
from config import Config


def _build_genai_client(api_key):
    try:
        from google import genai

        return genai.Client(api_key=api_key)
    except Exception:
        return None


def gather_shop_analytics(db, shop_id):
    """Gather shop analytics data from MongoDB for AI analysis."""
    # Total orders
    total_orders = db.orders.count_documents({"shopId": shop_id})
    completed_orders = db.orders.count_documents({"shopId": shop_id, "orderStatus": "completed"})
    pending_orders = db.orders.count_documents({"shopId": shop_id, "orderStatus": "pending"})

    # Revenue
    revenue_pipeline = [
        {"$match": {"shopId": shop_id, "orderStatus": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}},
    ]
    revenue_result = list(db.orders.aggregate(revenue_pipeline))
    total_revenue = round(revenue_result[0]["total"], 2) if revenue_result else 0

    # Items sold
    sold_pipeline = [
        {"$match": {"shopId": shop_id, "orderStatus": "completed"}},
        {"$unwind": "$items"},
        {"$group": {"_id": None, "totalSold": {"$sum": "$items.quantity"}}},
    ]
    sold_result = list(db.orders.aggregate(sold_pipeline))
    total_items_sold = sold_result[0]["totalSold"] if sold_result else 0

    # Top selling foods (top 5)
    top_pipeline = [
        {"$match": {"shopId": shop_id, "orderStatus": "completed"}},
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.foodName", "count": {"$sum": "$items.quantity"}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_selling = list(db.orders.aggregate(top_pipeline))
    top_selling_foods = [f"{item['_id']} ({item['count']} sold)" for item in top_selling]

    # Slow moving foods (active items with low or no sales)
    slow_pipeline = [
        {"$match": {"shopId": shop_id, "isActive": True}},
        {
            "$lookup": {
                "from": "orders",
                "let": {"foodName": "$foodName"},
                "pipeline": [
                    {"$match": {"shopId": shop_id, "orderStatus": "completed"}},
                    {"$unwind": "$items"},
                    {"$match": {"$expr": {"$eq": ["$items.foodName", "$$foodName"]}}},
                    {"$group": {"_id": None, "totalSold": {"$sum": "$items.quantity"}}},
                ],
                "as": "salesData",
            }
        },
        {
            "$addFields": {
                "totalSold": {
                    "$ifNull": [{"$arrayElemAt": ["$salesData.totalSold", 0]}, 0]
                }
            }
        },
        {"$sort": {"totalSold": 1}},
        {"$limit": 5},
        {"$project": {"foodName": 1, "totalSold": 1}},
    ]
    slow_items = list(db.food_items.aggregate(slow_pipeline))
    slow_moving_foods = [
        f"{item['foodName']} ({item['totalSold']} sold)" for item in slow_items
    ]

    return {
        "totalOrders": total_orders,
        "completedOrders": completed_orders,
        "pendingOrders": pending_orders,
        "revenue": total_revenue,
        "itemsSold": total_items_sold,
        "topSellingFoods": top_selling_foods,
        "slowMovingFoods": slow_moving_foods,
    }


def generate_fallback_insights(shop_name, analytics, unavailable_reason=None):
    total_orders = int(analytics.get("totalOrders", 0) or 0)
    completed_orders = int(analytics.get("completedOrders", 0) or 0)
    pending_orders = int(analytics.get("pendingOrders", 0) or 0)
    revenue = float(analytics.get("revenue", 0) or 0)
    items_sold = int(analytics.get("itemsSold", 0) or 0)
    top_selling = analytics.get("topSellingFoods", [])
    slow_moving = analytics.get("slowMovingFoods", [])

    if total_orders == 0:
        return {
            "salesSummary": f"{shop_name} has no orders yet. Start by adding food items and promoting your shop to attract customers.",
            "smartTips": [
                "Add a variety of food items with attractive discounts to draw in first-time buyers.",
                "Ensure your shop profile is complete with a clear address and operating hours.",
                "Consider offering combo deals or bundle discounts to encourage larger orders.",
            ],
            "observations": [
                "No sales data available yet to analyze trends.",
                "Focus on building your initial customer base.",
            ],
        }

    completion_rate = round((completed_orders / max(total_orders, 1)) * 100, 1)

    summary = (
        f"{shop_name} has {total_orders} total orders with {completion_rate}% completed, "
        f"₹{revenue:.2f} in completed-order revenue, and {items_sold} items sold."
    )

    tips = [
        "Keep high-demand items available during peak pickup windows to avoid missed sales.",
        "Bundle slower-moving foods with popular items at a small combined discount.",
        "Review inventory earlier in the day and apply time-based markdowns as expiry approaches.",
    ]

    observations = [
        f"Pending orders currently stand at {pending_orders}.",
        f"Top-selling items: {', '.join(top_selling[:3]) if top_selling else 'No clear top sellers yet.'}",
        f"Slow-moving items: {', '.join(slow_moving[:3]) if slow_moving else 'No slow-moving items detected.'}",
    ]

    if unavailable_reason:
        observations.append("AI live generation is temporarily unavailable, so these insights are data-driven fallback recommendations.")

    return {
        "salesSummary": summary,
        "smartTips": tips,
        "observations": observations,
    }


def generate_ai_insights(db, shop):
    """Generate AI insights for a shop using the Gemini API."""
    shop_id = shop["_id"]
    shop_name = shop.get("shopName", "Unknown Shop")

    try:
        analytics = gather_shop_analytics(db, shop_id)
    except Exception:
        analytics = {
            "totalOrders": 0,
            "completedOrders": 0,
            "pendingOrders": 0,
            "revenue": 0,
            "itemsSold": 0,
            "topSellingFoods": [],
            "slowMovingFoods": [],
        }

    if analytics["totalOrders"] == 0:
        return generate_fallback_insights(shop_name, analytics), None

    api_key = Config.GEMINI_API_KEY
    if not api_key:
        return generate_fallback_insights(shop_name, analytics, "missing_api_key"), None

    client = _build_genai_client(api_key)
    if client is None:
        return generate_fallback_insights(shop_name, analytics, "genai_sdk_unavailable"), None

    prompt = f"""You are an AI restaurant business assistant.

Analyze the following shop performance data and provide insights to improve food sales and reduce waste.

Shop: {shop_name}

Shop Data:
* Total Orders: {analytics['totalOrders']}
* Completed Orders: {analytics['completedOrders']}
* Pending Orders: {analytics['pendingOrders']}
* Revenue: ₹{analytics['revenue']}
* Items Sold: {analytics['itemsSold']}
* Top Selling Foods: {', '.join(analytics['topSellingFoods']) or 'None'}
* Slow Moving Foods: {', '.join(analytics['slowMovingFoods']) or 'None'}

Generate the response in JSON format. Return ONLY valid JSON, no other text:
{{"smartTips": ["tip1", "tip2", "tip3"], "salesSummary": "short summary of shop performance", "observations": ["observation1", "observation2"]}}"""

    try:
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        text = response.text.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines).strip()

        result = json.loads(text)

        # Validate required fields
        required = ["smartTips", "salesSummary", "observations"]
        for field in required:
            if field not in result:
                return None, f"AI response missing field: {field}"

        # Ensure correct types
        if not isinstance(result["smartTips"], list):
            result["smartTips"] = [str(result["smartTips"])]
        if not isinstance(result["observations"], list):
            result["observations"] = [str(result["observations"])]
        result["salesSummary"] = str(result["salesSummary"])

        return result, None

    except json.JSONDecodeError:
        return generate_fallback_insights(shop_name, analytics, "invalid_ai_json"), None
    except Exception as e:
        return generate_fallback_insights(shop_name, analytics, str(e)), None
