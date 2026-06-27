from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

# Import API Routers
from routes.farmers import router as farmer_router
from routes.crops import router as crop_router
from routes.weather import router as weather_router
from routes.ai import router as ai_router

app = FastAPI(
    title="AgriConnect AI API",
    description="Smart Agriculture Management Platform Backend",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # React frontend
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

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

# Register API Routers with /api prefix
app.include_router(farmer_router, prefix="/api/farmers", tags=["Farmers"])
app.include_router(crop_router, prefix="/api/crops", tags=["Crops"])
app.include_router(weather_router, prefix="/api/weather", tags=["Weather"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI Advisor"])