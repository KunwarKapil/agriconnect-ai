from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from utils.security import decode_access_token

# Set auto_error=False to customize missing credentials message
security = HTTPBearer(auto_error=False)

def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    """FastAPI dependency to extract and verify the JWT access token from the Authorization header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    # decode_access_token decodes and raises 401 on invalid/expired signatures
    return decode_access_token(token)
