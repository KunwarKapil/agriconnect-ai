from fastapi import HTTPException, status
from datetime import datetime, timezone
from typing import Dict, Any
from database.connection import db
from models.user import UserCreate, UserLogin
from utils.security import hash_password, verify_password, create_access_token

def register_user(user_data: UserCreate) -> Dict[str, str]:
    """Registers a new user inside the database, hashing the password."""
    # Check if email is already taken
    existing_user = db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    # Exclude password & confirm_password from model dump
    user_dict = user_data.model_dump(exclude={"password", "confirm_password"})
    
    # Hash password and store only the hash
    user_dict["password_hash"] = hash_password(user_data.password)
    
    # Add timestamps
    now_str = datetime.now(timezone.utc).isoformat()
    user_dict["created_at"] = now_str
    user_dict["updated_at"] = now_str
    
    # Insert user (id is auto-generated integer via counter wrapper)
    db.users.insert_one(user_dict)
    
    return {"message": "User registered successfully"}

def login_user(login_data: UserLogin) -> Dict[str, Any]:
    """Authenticates user credentials and generates a signed JWT access token."""
    # Lookup user by email
    user = db.users.find_one({"email": login_data.email.strip().lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password hash
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Prepare token data payload
    token_data = {
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"]
    }
    
    # Generate token
    token = create_access_token(data=token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"]
        }
    }
