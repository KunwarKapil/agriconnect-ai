from fastapi import APIRouter, status
from typing import Dict, Any
from models.user import UserCreate, UserLogin
import services.auth as auth_service

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate) -> Dict[str, str]:
    """Register a new user account."""
    return auth_service.register_user(user_data)

@router.post("/login", status_code=status.HTTP_200_OK)
def login(login_data: UserLogin) -> Dict[str, Any]:
    """Authenticate and obtain JWT access token."""
    return auth_service.login_user(login_data)
