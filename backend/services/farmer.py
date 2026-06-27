from fastapi import HTTPException, status
from typing import List, Dict, Any, Optional
from database.connection import db
from models.farmer import FarmerCreate, FarmerUpdate

def get_all_farmers() -> List[Dict[str, Any]]:
    """Retrieves all farmers from the database."""
    return db.farmers.find()

def get_farmer_by_id(farmer_id: int) -> Dict[str, Any]:
    """Retrieves a single farmer by ID. Raises 404 if not found."""
    farmer = db.farmers.find_one({"id": farmer_id})
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farmer with ID {farmer_id} not found"
        )
    return farmer

def create_farmer(farmer_data: FarmerCreate) -> Dict[str, Any]:
    """Creates a new farmer record."""
    # Convert Pydantic model to a standard dictionary
    farmer_dict = farmer_data.model_dump()
    return db.farmers.insert_one(farmer_dict)

def update_farmer(farmer_id: int, update_data: FarmerUpdate) -> Dict[str, Any]:
    """Updates an existing farmer. Raises 404 if not found."""
    # First ensure the farmer exists
    get_farmer_by_id(farmer_id)
    
    # Exclude unset fields (only update what is passed)
    update_dict = update_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update parameters provided"
        )
    
    updated_farmer = db.farmers.update_one({"id": farmer_id}, update_dict)
    if not updated_farmer:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update farmer record"
        )
    return updated_farmer

def delete_farmer(farmer_id: int) -> None:
    """Deletes an existing farmer. Raises 404 if not found."""
    # First ensure the farmer exists
    get_farmer_by_id(farmer_id)
    
    success = db.farmers.delete_one({"id": farmer_id})
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete farmer record"
        )

def search_farmers_by_name(name: str) -> List[Dict[str, Any]]:
    """Filters farmers by name containing the query string (case-insensitive)."""
    all_farmers = db.farmers.find()
    # Case-insensitive partial match
    filtered_farmers = [
        farmer for farmer in all_farmers
        if name.lower() in farmer["name"].lower()
    ]
    return filtered_farmers
