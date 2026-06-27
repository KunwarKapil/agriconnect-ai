from fastapi import APIRouter, status, Query
from models.weather import WeatherResponse
import services.weather as weather_service

router = APIRouter()

@router.get("/", response_model=WeatherResponse, status_code=status.HTTP_200_OK)
def get_weather(location: str = Query("Dehradun", description="Location name to fetch weather for")):
    """Retrieve weather data for a specific location (defaults to Dehradun)."""
    return weather_service.get_weather_for_location(location)