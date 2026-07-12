# pyrefly: ignore [missing-import]
from fastapi import APIRouter, status, Query
from typing import List
from models.weather import WeatherCreate, WeatherUpdate, WeatherResponse
import services.weather as weather_service

router = APIRouter()

@router.get("/", response_model=List[WeatherResponse], status_code=status.HTTP_200_OK)
def list_weather():
    """Retrieve all weather records."""
    return weather_service.get_all_weather()

@router.get("/search", response_model=List[WeatherResponse], status_code=status.HTTP_200_OK)
def search_weather(location: str = Query(..., description="Location name to search weather for (case-insensitive)")):
    """Search weather records by location (case-insensitive)."""
    return weather_service.search_weather_by_location(location)

@router.get("/{weather_id}", response_model=WeatherResponse, status_code=status.HTTP_200_OK)
def get_weather(weather_id: int):
    """Retrieve details of a single weather record by ID."""
    return weather_service.get_weather_by_id(weather_id)

@router.post("/", response_model=WeatherResponse, status_code=status.HTTP_201_CREATED)
def create_weather(weather_data: WeatherCreate):
    """Create a new weather record."""
    return weather_service.create_weather(weather_data)

@router.put("/{weather_id}", response_model=WeatherResponse, status_code=status.HTTP_200_OK)
def update_weather(weather_id: int, update_data: WeatherUpdate):
    """Update an existing weather record's details."""
    return weather_service.update_weather(weather_id, update_data)

@router.delete("/{weather_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weather(weather_id: int):
    """Delete a weather record."""
    weather_service.delete_weather(weather_id)
    return None