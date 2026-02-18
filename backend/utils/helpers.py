from bson import ObjectId
from datetime import datetime
from flask import jsonify


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize_doc(v) if isinstance(v, dict) else str(v) if isinstance(v, ObjectId) else v for v in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result


def success_response(message, data=None, status=200):
    body = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
        if isinstance(data, dict):
            # Provide flat keys for backwards compatibility with existing frontend code
            body.update(data)
    return jsonify(body), status


def error_response(message, status=400, data=None):
    body = {"success": False, "message": message}
    if data is not None:
        body["data"] = data
        if isinstance(data, dict):
            body.update(data)
    return jsonify(body), status


def ensure_objectid(value):
    """Validate and convert to ObjectId; return None if invalid."""
    if not value or not ObjectId.is_valid(value):
        return None
    return ObjectId(value)


def validate_required(data, required_fields):
    missing = [field for field in required_fields if not data.get(field)]
    return missing


def validate_positive_number(value, allow_zero=False):
    try:
        num = float(value)
    except (TypeError, ValueError):
        return None
    if num < 0 or (not allow_zero and num == 0):
        return None
    return num
