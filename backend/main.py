from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from config import settings

# Import API Routers
from routes.auth import router as auth_router
from routes.farmers import router as farmer_router
from routes.crops import router as crop_router
from routes.weather import router as weather_router
from routes.ai import router as ai_router
from middleware.auth import verify_token

app = FastAPI(
    title="AgriConnect AI API",
    description="Smart Agriculture Management Platform Backend",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:5173",
    "https://agriconnect-ai-gamma.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Endpoints
@app.get("/")
def home():
    return {
        "message": "Welcome to AgriConnect AI Backend"
    }

from database.connection import client

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/system/status")
def system_status():
    db_status = "connected"
    try:
        client.admin.command("ping")
    except Exception:
        db_status = "degraded"
        
    return {
        "status": "online",
        "database": db_status,
        "ai_engine": "operational" if settings.GEMINI_API_KEY else "unconfigured",
        "weather_service": "operational" if settings.OPENWEATHER_API_KEY else "unconfigured",
        "environment": settings.ENVIRONMENT
    }

# Register API Routers with /api prefix
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(farmer_router, prefix="/api/farmers", tags=["Farmers"], dependencies=[Depends(verify_token)])
app.include_router(crop_router, prefix="/api/crops", tags=["Crops"], dependencies=[Depends(verify_token)])
app.include_router(weather_router, prefix="/api/weather", tags=["Weather"], dependencies=[Depends(verify_token)])
app.include_router(ai_router, prefix="/api/ai", tags=["AI Advisor"], dependencies=[Depends(verify_token)])