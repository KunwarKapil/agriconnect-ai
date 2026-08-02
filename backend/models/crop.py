from pydantic import BaseModel, Field
from typing import Optional, Literal

class CropBase(BaseModel):
    crop_name: str = Field(..., min_length=2, max_length=100, description="Name of the crop (e.g. Wheat, Rice)")
    crop_type: str = Field(..., min_length=2, max_length=100, description="Type of the crop (e.g. Cereal, Vegetable)")
    season: str = Field(..., min_length=2, max_length=50, description="Growth season (e.g. Rabi, Kharif, Zaid)")
    planting_date: str = Field(..., description="Planting date in YYYY-MM-DD format")
    expected_harvest_date: str = Field(..., description="Expected harvest date in YYYY-MM-DD format")
    area_in_acres: float = Field(..., gt=0, description="Farm area in acres (must be greater than 0)")
    status: Literal["Planted", "Growing", "Ready for Harvest", "Harvested"] = Field(..., description="Status of the crop")
    farmer_id: int = Field(..., description="ID of the farmer associated with this crop")

class CropCreate(CropBase):
    pass

class CropUpdate(BaseModel):
    crop_name: Optional[str] = Field(None, min_length=2, max_length=100)
    crop_type: Optional[str] = Field(None, min_length=2, max_length=100)
    season: Optional[str] = Field(None, min_length=2, max_length=50)
    planting_date: Optional[str] = Field(None)
    expected_harvest_date: Optional[str] = Field(None)
    area_in_acres: Optional[float] = Field(None, gt=0)
    status: Optional[Literal["Planted", "Growing", "Ready for Harvest", "Harvested"]] = Field(None)
    farmer_id: Optional[int] = Field(None, description="ID of the associated farmer")

class CropResponse(CropBase):
    id: int
    farmer_id: Optional[int] = None
    farmer_name: Optional[str] = None

    class Config:
        from_attributes = True
