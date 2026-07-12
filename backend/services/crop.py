from fastapi import HTTPException, status
from typing import List, Dict, Any
from database.connection import db
from models.crop import CropCreate, CropUpdate

def get_all_crops() -> List[Dict[str, Any]]:
    """Retrieves all crops from the database."""
    return db.crops.find()

def get_crop_by_id(crop_id: int) -> Dict[str, Any]:
    """Retrieves a single crop by ID. Raises 404 if not found."""
    crop = db.crops.find_one({"id": crop_id})
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop with ID {crop_id} not found"
        )
    return crop

def create_crop(crop_data: CropCreate) -> Dict[str, Any]:
    """Creates a new crop record."""
    crop_dict = crop_data.model_dump()
    return db.crops.insert_one(crop_dict)

def update_crop(crop_id: int, update_data: CropUpdate) -> Dict[str, Any]:
    """Updates an existing crop. Raises 404 if not found."""
    # Ensure crop exists
    get_crop_by_id(crop_id)
    
    update_dict = update_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update parameters provided"
        )
        
    updated_crop = db.crops.update_one({"id": crop_id}, update_dict)
    if not updated_crop:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update crop record"
        )
    return updated_crop

def delete_crop(crop_id: int) -> None:
    """Deletes an existing crop. Raises 404 if not found."""
    # Ensure crop exists
    get_crop_by_id(crop_id)
    
    success = db.crops.delete_one({"id": crop_id})
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete crop record"
        )

def search_crops_by_name(crop_name: str) -> List[Dict[str, Any]]:
    """Filters crops by crop_name containing the query string (case-insensitive)."""
    all_crops = db.crops.find()
    # Case-insensitive partial match
    filtered_crops = [
        crop for crop in all_crops
        if crop_name.lower() in crop.get("crop_name", "").lower()
    ]
    return filtered_crops
