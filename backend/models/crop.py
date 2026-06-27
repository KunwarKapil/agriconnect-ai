from pydantic import BaseModel, Field
from typing import Optional

class CropBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name of the crop (e.g. Wheat, Rice)")
    season: str = Field(..., min_length=2, max_length=50, description="Growth season (e.g. Rabi, Kharif, Zaid)")
    expected_yield_kg: float = Field(..., gt=0, description="Expected yield in kilograms (must be greater than 0)")

class CropCreate(CropBase):
    farmer_id: int = Field(..., description="ID of the farmer growing this crop")

class CropUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    season: Optional[str] = Field(None, min_length=2, max_length=50)
    expected_yield_kg: Optional[float] = Field(None, gt=0)

class CropResponse(CropBase):
    id: int
    farmer_id: int

    class Config:
        from_attributes = True
