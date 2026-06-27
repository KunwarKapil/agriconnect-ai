from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def ai_advisor():
    return {
        "advice": "Irrigate the wheat crop in the evening and monitor soil moisture."
    }