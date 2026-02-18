from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("MONGO_URI not set in .env (or environment). Check backend/.env")
    raise SystemExit(1)

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
try:
    # ping the server to verify connectivity
    client.admin.command("ping")
    print("SUCCESS: Connected to MongoDB")
except Exception as e:
    print("FAILED: Could not connect to MongoDB")
    print("Error:", e)
finally:
    client.close()
