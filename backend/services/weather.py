from fastapi import HTTPException, status
from typing import List, Dict, Any
from database.connection import db
from models.weather import WeatherCreate, WeatherUpdate

def get_all_weather() -> List[Dict[str, Any]]:
    """Retrieves all weather records from the database."""
    return db.weather.find()

def get_weather_by_id(weather_id: int) -> Dict[str, Any]:
    """Retrieves a single weather record by ID. Raises 404 if not found."""
    weather = db.weather.find_one({"id": weather_id})
    if not weather:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weather record with ID {weather_id} not found"
        )
    return weather

def create_weather(weather_data: WeatherCreate) -> Dict[str, Any]:
    """Creates a new weather record."""
    weather_dict = weather_data.model_dump()
    return db.weather.insert_one(weather_dict)

def update_weather(weather_id: int, update_data: WeatherUpdate) -> Dict[str, Any]:
    """Updates an existing weather record. Raises 404 if not found."""
    # Ensure weather record exists
    get_weather_by_id(weather_id)
    
    update_dict = update_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update parameters provided"
        )
        
    updated_weather = db.weather.update_one({"id": weather_id}, update_dict)
    if not updated_weather:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update weather record"
        )
    return updated_weather

def delete_weather(weather_id: int) -> None:
    """Deletes an existing weather record. Raises 404 if not found."""
    # Ensure weather record exists
    get_weather_by_id(weather_id)
    
    success = db.weather.delete_one({"id": weather_id})
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete weather record"
        )

def search_weather_by_location(location: str) -> List[Dict[str, Any]]:
    """Filters weather records by location containing the query string (case-insensitive)."""
    all_weather = db.weather.find()
    # Case-insensitive partial match
    filtered_weather = [
        record for record in all_weather
        if location.lower() in record.get("location", "").lower()
    ]
    return filtered_weather
