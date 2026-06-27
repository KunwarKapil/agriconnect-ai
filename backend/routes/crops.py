from fastapi import APIRouter, status
from typing import List
from models.crop import CropCreate, CropUpdate, CropResponse
import services.crop as crop_service

router = APIRouter()

@router.get("/", response_model=List[CropResponse], status_code=status.HTTP_200_OK)
def list_crops():
    """Retrieve all crop records."""
    return crop_service.get_all_crops()

@router.get("/{crop_id}", response_model=CropResponse, status_code=status.HTTP_200_OK)
def get_crop(crop_id: int):
    """Retrieve details of a single crop by ID."""
    return crop_service.get_crop_by_id(crop_id)

@router.get("/farmer/{farmer_id}", response_model=List[CropResponse], status_code=status.HTTP_200_OK)
def get_farmer_crops(farmer_id: int):
    """Retrieve all crops belonging to a specific farmer."""
    return crop_service.get_crops_by_farmer(farmer_id)

@router.post("/", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def create_crop(crop_data: CropCreate):
    """Register a new crop for a farmer."""
    return crop_service.create_crop(crop_data)

@router.put("/{crop_id}", response_model=CropResponse, status_code=status.HTTP_200_OK)
def update_crop(crop_id: int, update_data: CropUpdate):
    """Update an existing crop's details."""
    return crop_service.update_crop(crop_id, update_data)

@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_crop(crop_id: int):
    """Delete a crop record."""
    crop_service.delete_crop(crop_id)
    return None