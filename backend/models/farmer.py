from pydantic import BaseModel, Field
from typing import Optional

class FarmerBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name of the farmer")
    location: str = Field(..., min_length=2, max_length=100, description="Farming region/city")
    contact: str = Field(..., min_length=10, max_length=15, description="Contact phone number")
    farm_size_acres: float = Field(..., gt=0, description="Farm size in acres (must be greater than 0)")

class FarmerCreate(FarmerBase):
    pass

class FarmerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=2, max_length=100)
    contact: Optional[str] = Field(None, min_length=10, max_length=15)
    farm_size_acres: Optional[float] = Field(None, gt=0)

class FarmerResponse(FarmerBase):
    id: int

    class Config:
        from_attributes = True  # Integrates nicely with future ORM/ODM databases
