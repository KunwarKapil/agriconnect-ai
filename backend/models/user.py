from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
import re

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full Name of the user")
    email: str = Field(..., description="Email address")
    role: Literal["Admin", "Farmer"] = Field("Farmer", description="User role (Admin or Farmer)")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        # Simple email regex validation
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_regex, v):
            raise ValueError("Invalid email format")
        return v.strip().lower()

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, description="Password (at least 6 characters)")
    confirm_password: str = Field(..., min_length=6, max_length=100, description="Confirm Password")

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

class UserLogin(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

class UserResponse(UserBase):
    id: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
