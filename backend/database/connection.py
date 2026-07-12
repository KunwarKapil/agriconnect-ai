import pymongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from typing import List, Dict, Any, Optional
from config import settings

print(f"Connecting to MongoDB Atlas at: {settings.MONGO_URI.split('@')[-1] if '@' in settings.MONGO_URI else settings.MONGO_URI}")

try:
    # Set a 5-second server selection timeout
    client = pymongo.MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
    # Check connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB Atlas!")
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print("\n" + "="*80)
    print("CRITICAL WARNING: FAILED TO CONNECT TO MONGO DB ATLAS!")
    print(f"Error: {e}")
    print("Please make sure your IP is whitelisted in MongoDB Atlas under Security -> Network Access.")
    print("="*80 + "\n")
    # Fallback to local client if connection fails, but keep trying
    client = pymongo.MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)

db_client = client[settings.DATABASE_NAME]

class MongoCollectionWrapper:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self.collection = db_client[collection_name]
        self.counters = db_client["counters"]

    def _get_next_id(self) -> int:
        """Atomically increments and returns the next integer ID for this collection."""
        res = self.counters.find_one_and_update(
            {"_id": self.collection_name},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=pymongo.ReturnDocument.AFTER
        )
        return res["seq"]

    def find(self) -> List[Dict[str, Any]]:
        """Returns all documents in the collection, removing the MongoDB _id field."""
        docs = list(self.collection.find({}, {"_id": 0}))
        return docs

    def find_one(self, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Finds a single document matching the filter, removing the MongoDB _id field."""
        doc = self.collection.find_one(filter_dict, {"_id": 0})
        return doc

    def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Inserts a new document, automatically generating an incremented ID."""
        new_doc = document.copy()
        # Generate next ID if it doesn't already have one (or is 0)
        if "id" not in new_doc or not new_doc["id"]:
            new_doc["id"] = self._get_next_id()
        self.collection.insert_one(new_doc)
        new_doc.pop("_id", None)
        return new_doc

    def update_one(self, filter_dict: Dict[str, Any], updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates matching fields in a single document and returns the updated document."""
        # Ensure we don't accidentally update the 'id' field in MongoDB
        clean_updates = {k: v for k, v in updates.items() if k != "id"}
        self.collection.update_one(filter_dict, {"$set": clean_updates})
        return self.find_one(filter_dict)

    def delete_one(self, filter_dict: Dict[str, Any]) -> bool:
        """Deletes a single document matching the filters. Returns True if deleted, False otherwise."""
        res = self.collection.delete_one(filter_dict)
        return res.deleted_count > 0

class Database:
    def __init__(self):
        self.farmers = MongoCollectionWrapper("farmers")
        self.crops = MongoCollectionWrapper("crops")
        self.weather = MongoCollectionWrapper("weather")
        self.users = MongoCollectionWrapper("users")

# Initialize database instance
db = Database()

def seed_database():
    """Seeds the database with default farmers, crops, and weather records if they don't exist."""
    try:
        # Check if farmers is empty
        if db.farmers.collection.count_documents({}) == 0:
            print("Seeding database with default farmers...")
            seed_farmers = [
                {
                    "id": 1,
                    "name": "Rahul",
                    "location": "Dehradun",
                    "contact": "9876543210",
                    "farm_size_acres": 5.2
                },
                {
                    "id": 2,
                    "name": "Amit",
                    "location": "Haridwar",
                    "contact": "8765432109",
                    "farm_size_acres": 3.5
                }
            ]
            db.farmers.collection.insert_many(seed_farmers)
            db.farmers.counters.update_one({"_id": "farmers"}, {"$set": {"seq": 2}}, upsert=True)
            print("Default farmers seeded successfully.")

        # Check if crops has old schema or is empty
        has_old_crops = db.crops.collection.find_one({"name": {"$exists": True}}) is not None
        if has_old_crops or db.crops.collection.count_documents({}) == 0:
            print("Seeding database with default crops...")
            db.crops.collection.delete_many({})
            seed_crops = [
                {
                    "id": 1,
                    "crop_name": "Wheat",
                    "crop_type": "Cereal",
                    "season": "Rabi",
                    "planting_date": "2026-11-15",
                    "expected_harvest_date": "2026-04-10",
                    "area_in_acres": 4.5,
                    "status": "Growing"
                },
                {
                    "id": 2,
                    "crop_name": "Rice",
                    "crop_type": "Cereal",
                    "season": "Kharif",
                    "planting_date": "2026-06-20",
                    "expected_harvest_date": "2026-10-30",
                    "area_in_acres": 5.0,
                    "status": "Harvested"
                }
            ]
            db.crops.collection.insert_many(seed_crops)
            db.crops.counters.update_one({"_id": "crops"}, {"$set": {"seq": 2}}, upsert=True)
            print("Default crops seeded successfully.")

        # Check if weather is empty
        if db.weather.collection.count_documents({}) == 0:
            print("Seeding database with default weather records...")
            seed_weather = [
                {
                    "id": 1,
                    "location": "Dehradun",
                    "temperature": 28.5,
                    "humidity": 80.0,
                    "rainfall": 12.4,
                    "wind_speed": 15.0,
                    "weather_condition": "Rainy",
                    "forecast_date": "2026-07-11"
                },
                {
                    "id": 2,
                    "location": "Haridwar",
                    "temperature": 32.0,
                    "humidity": 65.0,
                    "rainfall": 0.0,
                    "wind_speed": 10.5,
                    "weather_condition": "Cloudy",
                    "forecast_date": "2026-07-11"
                },
                {
                    "id": 3,
                    "location": "Delhi",
                    "temperature": 38.0,
                    "humidity": 45.0,
                    "rainfall": 0.0,
                    "wind_speed": 18.0,
                    "weather_condition": "Sunny",
                    "forecast_date": "2026-07-11"
                }
            ]
            db.weather.collection.insert_many(seed_weather)
            db.weather.counters.update_one({"_id": "weather"}, {"$set": {"seq": 3}}, upsert=True)
            print("Default weather records seeded successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")

# Run seed
seed_database()
