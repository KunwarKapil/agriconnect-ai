from pydantic import BaseModel, Field
from typing import Optional

class WeatherBase(BaseModel):
    location: str = Field(..., min_length=2, max_length=100, description="Location of weather query")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage (0 to 100)")
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")
    wind_speed: float = Field(..., ge=0, description="Wind speed in km/h")
    weather_condition: str = Field(..., min_length=2, max_length=100, description="Weather condition (e.g., Sunny, Rainy, Cloudy)")
    forecast_date: str = Field(..., description="Forecast date in YYYY-MM-DD format")

class WeatherCreate(WeatherBase):
    pass

class WeatherUpdate(BaseModel):
    location: Optional[str] = Field(None, min_length=2, max_length=100)
    temperature: Optional[float] = Field(None)
    humidity: Optional[float] = Field(None, ge=0, le=100)
    rainfall: Optional[float] = Field(None, ge=0)
    wind_speed: Optional[float] = Field(None, ge=0)
    weather_condition: Optional[str] = Field(None, min_length=2, max_length=100)
    forecast_date: Optional[str] = Field(None)

class WeatherResponse(WeatherBase):
    id: int

    class Config:
        from_attributes = True
