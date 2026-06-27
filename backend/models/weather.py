from pydantic import BaseModel, Field

class WeatherResponse(BaseModel):
    location: str = Field(..., description="Location queried for weather details")
    temperature: str = Field(..., description="Current temperature (e.g. 30°C)")
    humidity: str = Field(..., description="Humidity percentage (e.g. 70%)")
    forecast: str = Field(..., description="Weather condition/forecast (e.g. Sunny, Rainy)")

    class Config:
        from_attributes = True
