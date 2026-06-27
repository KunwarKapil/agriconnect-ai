from typing import Dict, Any

def get_weather_for_location(location: str) -> Dict[str, Any]:
    """Generates mock weather data based on the requested location."""
    loc_clean = location.strip().lower()
    
    if "dehradun" in loc_clean:
        return {
            "location": "Dehradun",
            "temperature": "28°C",
            "humidity": "80%",
            "forecast": "Rainy / Thunderstorms"
        }
    elif "haridwar" in loc_clean:
        return {
            "location": "Haridwar",
            "temperature": "32°C",
            "humidity": "65%",
            "forecast": "Humid / Partly Cloudy"
        }
    elif "delhi" in loc_clean:
        return {
            "location": "Delhi",
            "temperature": "38°C",
            "humidity": "45%",
            "forecast": "Sunny / Hot"
        }
    else:
        # Default mock response for other regions
        return {
            "location": location.title(),
            "temperature": "30°C",
            "humidity": "70%",
            "forecast": "Clear Skies"
        }
