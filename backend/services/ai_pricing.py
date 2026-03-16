import json
import google.generativeai as genai
from config import Config


def calculate_demand_metrics(db, category, shop_id=None):
    """Calculate demand metrics from MongoDB order history for a given category."""
    match_stage = {"orderStatus": "completed"}
    if shop_id:
        match_stage["shopId"] = shop_id

    # Total completed orders containing items in this category
    pipeline = [
        {"$match": match_stage},
        {"$unwind": "$items"},
        {
            "$lookup": {
                "from": "food_items",
                "localField": "items.foodId",
                "foreignField": "_id",
                "as": "foodInfo",
            }
        },
        {"$unwind": {"path": "$foodInfo", "preserveNullAndEmptyArrays": True}},
        {"$match": {"foodInfo.category": category}},
        {
            "$group": {
                "_id": None,
                "totalOrders": {"$sum": 1},
                "totalQuantitySold": {"$sum": "$items.quantity"},
            }
        },
    ]

    try:
        result = list(db.orders.aggregate(pipeline))
    except Exception:
        return {"demandLevel": "low", "totalOrders": 0, "avgQuantitySold": 0}

    if not result:
        return {"demandLevel": "low", "totalOrders": 0, "avgQuantitySold": 0}

    total_orders = result[0]["totalOrders"]
    total_qty = result[0]["totalQuantitySold"]
    avg_qty = round(total_qty / max(total_orders, 1), 1)

    if total_orders >= 20:
        demand_level = "high"
    elif total_orders >= 5:
        demand_level = "medium"
    else:
        demand_level = "low"

    return {
        "demandLevel": demand_level,
        "totalOrders": total_orders,
        "avgQuantitySold": avg_qty,
    }


def generate_fallback_price_recommendation(food_data, demand_metrics):
    original_price = float(food_data.get("originalPrice") or 0)
    quantity_available = int(food_data.get("quantityAvailable") or 0)
    demand_level = str(demand_metrics.get("demandLevel") or "medium").lower()

    base_discount = {
        "high": 20,
        "medium": 30,
        "low": 40,
    }.get(demand_level, 30)

    if quantity_available >= 20:
        base_discount += 5
    elif quantity_available <= 5:
        base_discount -= 5

    discount_percent = max(10, min(80, base_discount))
    recommended_price = round(max(1.0, original_price * (1 - discount_percent / 100)), 2)

    reason = "Recommendation based on demand and stock levels"

    return {
        "recommendedPrice": recommended_price,
        "discountPercent": round(float(discount_percent), 1),
        "demandLevel": demand_level if demand_level in {"low", "medium", "high"} else "medium",
        "reason": reason,
    }


def generate_ai_price_recommendation(food_data, demand_metrics):
    """Send food data and demand metrics to Gemini API and return a structured price recommendation."""
    api_key = Config.GEMINI_API_KEY
    if not api_key:
        return (
            generate_fallback_price_recommendation(
                food_data, demand_metrics
            ),
            None,
        )

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""You are an AI food marketplace pricing assistant helping reduce food waste.

Suggest the best discounted selling price for a surplus food item.

Food Details:
- Food Name: {food_data.get("foodName", "Unknown")}
- Original Price: {food_data.get("originalPrice", 0)}
- Quantity Available: {food_data.get("quantityAvailable", 0)}
- Expiry Time: {food_data.get("expiryTime", "Not specified")}
- Category: {food_data.get("category", "other")}

Market Demand:
- Demand Level: {demand_metrics.get("demandLevel", "unknown")}
- Total Orders in Category: {demand_metrics.get("totalOrders", 0)}
- Average Quantity Sold per Order: {demand_metrics.get("avgQuantitySold", 0)}

Goal:
Sell the food before expiry while maintaining reasonable profit. Prioritize reducing food waste.

Return ONLY valid JSON in this exact format, no other text:
{{"recommendedPrice": <number>, "discountPercent": <number>, "demandLevel": "<low|medium|high>", "reason": "<short explanation>"}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines).strip()

        result = json.loads(text)

        # Validate required fields
        required = ["recommendedPrice", "discountPercent", "demandLevel", "reason"]
        for field in required:
            if field not in result:
                return None, f"AI response missing field: {field}"

        result["recommendedPrice"] = round(float(result["recommendedPrice"]), 2)
        result["discountPercent"] = round(float(result["discountPercent"]), 1)
        demand_level = str(result.get("demandLevel") or "").lower()
        result["demandLevel"] = demand_level if demand_level in {"low", "medium", "high"} else str(demand_metrics.get("demandLevel") or "medium").lower()

        if result["recommendedPrice"] <= 0:
            return (
                generate_fallback_price_recommendation(
                    food_data, demand_metrics
                ),
                None,
            )

        return result, None

    except json.JSONDecodeError:
        return (
            generate_fallback_price_recommendation(
                food_data, demand_metrics
            ),
            None,
        )
    except Exception as e:
        return (
            generate_fallback_price_recommendation(
                food_data, demand_metrics
            ),
            None,
        )
