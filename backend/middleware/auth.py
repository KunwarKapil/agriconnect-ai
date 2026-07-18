from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from utils.security import decode_access_token

# Set auto_error=False to customize missing credentials message
security = HTTPBearer(auto_error=False)

def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    """FastAPI dependency to extract and verify the JWT access token from the Authorization header."""
    if not credentials:
        print("DEBUG AUTH: No credentials provided in Authorization header.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    print(f"DEBUG AUTH: Received token (first 15 chars): {token[:15]}...")
    try:
        payload = decode_access_token(token)
        print("DEBUG AUTH: Token successfully verified.")
        return payload
    except Exception as e:
        print(f"DEBUG AUTH: Token verification failed: {str(e)}")
        raise e
