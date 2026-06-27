from fastapi import APIRouter, status
from typing import List
from models.farmer import FarmerCreate, FarmerUpdate, FarmerResponse
import services.farmer as farmer_service

router = APIRouter()

@router.get("/", response_model=List[FarmerResponse], status_code=status.HTTP_200_OK)
def list_farmers():
    """Retrieve all farmers."""
    return farmer_service.get_all_farmers()

@router.get("/search", response_model=List[FarmerResponse], status_code=status.HTTP_200_OK)
def search_farmers(name: str):
    """Search farmers by name (case-insensitive)."""
    return farmer_service.search_farmers_by_name(name)

@router.get("/{farmer_id}", response_model=FarmerResponse, status_code=status.HTTP_200_OK)
def get_farmer(farmer_id: int):
    """Retrieve details of a single farmer by ID."""
    return farmer_service.get_farmer_by_id(farmer_id)

@router.post("/", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
def create_farmer(farmer_data: FarmerCreate):
    """Register a new farmer."""
    return farmer_service.create_farmer(farmer_data)

@router.put("/{farmer_id}", response_model=FarmerResponse, status_code=status.HTTP_200_OK)
def update_farmer(farmer_id: int, update_data: FarmerUpdate):
    """Update an existing farmer's details."""
    return farmer_service.update_farmer(farmer_id, update_data)

@router.delete("/{farmer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farmer(farmer_id: int):
    """Delete a farmer record."""
    farmer_service.delete_farmer(farmer_id)
    return None