from typing import List, Dict, Any, Optional

# Private global dictionary simulating our database collections
_STORE: Dict[str, List[Dict[str, Any]]] = {
    "farmers": [
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
    ],
    "crops": [
        {
            "id": 1,
            "farmer_id": 1,
            "name": "Wheat",
            "season": "Rabi",
            "expected_yield_kg": 1200
        },
        {
            "id": 2,
            "farmer_id": 2,
            "name": "Rice",
            "season": "Kharif",
            "expected_yield_kg": 2000
        }
    ],
    "weather": []
}

class MockCollection:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self.data = _STORE[collection_name]
        self._current_id = max([item["id"] for item in self.data]) if self.data else 0

    def find(self) -> List[Dict[str, Any]]:
        """Returns all documents in the collection."""
        return self.data.copy()

    def find_one(self, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Finds a single document matching the key-value filters."""
        for item in self.data:
            match = True
            for key, value in filter_dict.items():
                if item.get(key) != value:
                    match = False
                    break
            if match:
                return item.copy()
        return None

    def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Inserts a new document, automatically generating an incremented ID."""
        self._current_id += 1
        new_doc = document.copy()
        new_doc["id"] = self._current_id
        self.data.append(new_doc)
        return new_doc.copy()

    def update_one(self, filter_dict: Dict[str, Any], updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates matching fields in a single document."""
        for item in self.data:
            match = True
            for key, value in filter_dict.items():
                if item.get(key) != value:
                    match = False
                    break
            if match:
                # Update item in-place
                for key, val in updates.items():
                    # Mimics MongoDB $set: do not update 'id' field
                    if key != "id":
                        item[key] = val
                return item.copy()
        return None

    def delete_one(self, filter_dict: Dict[str, Any]) -> bool:
        """Deletes a single document matching the filters."""
        for idx, item in enumerate(self.data):
            match = True
            for key, value in filter_dict.items():
                if item.get(key) != value:
                    match = False
                    break
            if match:
                self.data.pop(idx)
                return True
        return False

class Database:
    def __init__(self):
        self.farmers = MockCollection("farmers")
        self.crops = MockCollection("crops")
        self.weather = MockCollection("weather")

# Global export of the database client
db = Database()
