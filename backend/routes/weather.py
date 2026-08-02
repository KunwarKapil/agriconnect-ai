# pyrefly: ignore [missing-import]
from fastapi import APIRouter, status, Query
from typing import List
from models.weather import WeatherCreate, WeatherUpdate, WeatherResponse
import services.weather as weather_service

import urllib.request
import urllib.parse
import urllib.error
import json
from datetime import datetime
from fastapi import HTTPException
from config import settings

router = APIRouter()

@router.get("/", response_model=List[WeatherResponse], status_code=status.HTTP_200_OK)
def list_weather():
    """Retrieve all weather records."""
    return weather_service.get_all_weather()

@router.get("/search", response_model=List[WeatherResponse], status_code=status.HTTP_200_OK)
def search_weather(location: str = Query(..., description="Location name to search weather for (case-insensitive)")):
    """Search weather records by location (case-insensitive)."""
    return weather_service.search_weather_by_location(location)

@router.get("/live", status_code=status.HTTP_200_OK)
def get_live_weather(city: str = Query("Dehradun", description="City name to fetch live OpenWeather metrics for")):
    """Fetch real-time weather metrics from OpenWeather API with fallback."""
    if not city or not city.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City name cannot be empty."
        )

    city_clean = city.strip()

    if not settings.OPENWEATHER_API_KEY:
        return {
            "city": city_clean.title(),
            "country": "IN",
            "temperature": 28.5,
            "feels_like": 29.0,
            "humidity": 75,
            "pressure": 1012,
            "wind_speed": 3.6,
            "visibility": 10.0,
            "cloud_pct": 20,
            "weather_description": "Partly Cloudy",
            "weather_icon": "02d",
            "weather_main": "Clouds",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    
    url = f"https://api.openweathermap.org/data/2.5/weather?q={urllib.parse.quote(city_clean)}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=8) as res:
            data = json.loads(res.read().decode("utf-8"))
            
            return {
                "city": data.get("name", city_clean),
                "country": data.get("sys", {}).get("country", ""),
                "temperature": round(data.get("main", {}).get("temp", 28.5), 1),
                "feels_like": round(data.get("main", {}).get("feels_like", 29.0), 1),
                "humidity": data.get("main", {}).get("humidity", 75),
                "pressure": data.get("main", {}).get("pressure", 1012),
                "wind_speed": round(data.get("wind", {}).get("speed", 3.5), 1),
                "visibility": round(data.get("visibility", 10000) / 1000, 1),
                "cloud_pct": data.get("clouds", {}).get("all", 20),
                "weather_description": data.get("weather", [{}])[0].get("description", "clear sky").title(),
                "weather_icon": data.get("weather", [{}])[0].get("icon", "01d"),
                "weather_main": data.get("weather", [{}])[0].get("main", "Clear"),
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"City '{city_clean}' not found. Please enter a valid city name."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weather service returned error code {e.code}."
        )
    except Exception as e:
        print(f"OpenWeather API fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch weather data from service."
        )

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