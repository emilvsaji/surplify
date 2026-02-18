"""
Seed script to create the initial admin user.
Run this once after setting up the database.

Usage: python seed_admin.py
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/surplify")

client = MongoClient(MONGO_URI)
db = client.get_default_database()

# Check if admin already exists
existing = db.users.find_one({"role": "admin"})
if existing:
    print(f"Admin already exists: {existing['email']}")
else:
    password = "admin123"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    admin = {
        "name": "Admin",
        "email": "admin@surplify.com",
        "password": hashed.decode("utf-8"),
        "role": "admin",
        "phone": "",
        "isBlocked": False,
        "createdAt": datetime.utcnow(),
    }

    db.users.insert_one(admin)
    print("=" * 40)
    print("Admin user created successfully!")
    print(f"  Email:    admin@surplify.com")
    print(f"  Password: admin123")
    print("=" * 40)
    print("IMPORTANT: Change the password after first login.")

client.close()
