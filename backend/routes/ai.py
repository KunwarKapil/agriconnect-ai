from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from typing import Optional
import urllib.request
import urllib.error
import json
from config import settings

router = APIRouter()

class AdvisorRequest(BaseModel):
    crop: str
    problem: str
    soil: Optional[str] = None
    temperature: Optional[str] = None
    humidity: Optional[str] = None
    notes: Optional[str] = None

@router.get("/")
def ai_advisor():
    return {
        "advice": "Irrigate the wheat crop in the evening and monitor soil moisture."
    }

@router.post("/advisor")
def get_ai_advice(request: AdvisorRequest, response: Response):
    if not settings.GEMINI_API_KEY:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {
            "success": False,
            "message": "Google Gemini API key is missing. Please set GEMINI_API_KEY in the backend .env file."
        }
    
    # Formulate Prompt
    soil_info = f"- Soil Type: {request.soil}" if request.soil else ""
    temp_info = f"- Temperature: {request.temperature}°C" if request.temperature else ""
    hum_info = f"- Humidity: {request.humidity}%" if request.humidity else ""
    notes_info = f"- Additional Notes: {request.notes}" if request.notes else ""
    
    prompt = (
        f"You are an experienced agricultural scientist and expert helping farmers solve their crop cultivation challenges.\n\n"
        f"Here are the details provided by the farmer:\n"
        f"- Crop Name: {request.crop}\n"
        f"- Problem Observed: {request.problem}\n"
        f"{soil_info}\n"
        f"{temp_info}\n"
        f"{hum_info}\n"
        f"{notes_info}\n\n"
        f"Please analyze this issue and generate a structured response containing these exact sections:\n"
        f"1. Problem Analysis: A clear analysis of what is happening with the crop.\n"
        f"2. Possible Causes: Explain the most likely underlying causes (e.g., pests, disease, nutrient deficiencies, or environmental factors).\n"
        f"3. Recommended Actions: Detailed step-by-step treatment or immediate actions.\n"
        f"4. Fertilizer Suggestions: Recommendations for specific fertilizers, organic options, or nutrients.\n"
        f"5. Prevention Tips: Strategies, irrigation advice, or crop care methods to prevent future recurrence.\n"
        f"6. Disclaimer: A standard brief agricultural disclaimer that advice is for informational purposes.\n\n"
        f"Tone: Professional, supportive, clear, and easy for farmers to understand.\n"
        f"Constraints: Respond in clean Markdown. Keep the total word count strictly between 200 and 300 words. Do not include unnecessary conversational filler."
    )
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        
        # Add a timeout of 15 seconds to handle Gemini timeout gracefully
        with urllib.request.urlopen(req, timeout=15) as res:
            res_data = json.loads(res.read().decode("utf-8"))
            
            # Extract content text
            try:
                ai_response = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "success": True,
                    "response": ai_response
                }
            except (KeyError, IndexError):
                response.status_code = status.HTTP_502_BAD_GATEWAY
                return {
                    "success": False,
                    "message": "Invalid response format from Gemini API."
                }
                
    except urllib.error.HTTPError as e:
        # Read the error body if available
        try:
            err_body = json.loads(e.read().decode("utf-8"))
            err_msg = err_body.get("error", {}).get("message", str(e))
        except Exception:
            err_msg = str(e)
        response.status_code = e.code if e.code in [400, 401, 403, 404, 429, 500, 503] else status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "success": False,
            "message": f"Gemini API Error: {err_msg}"
        }
    except urllib.error.URLError as e:
        response.status_code = status.HTTP_504_GATEWAY_TIMEOUT
        return {
            "success": False,
            "message": f"Network error or timeout connecting to Gemini API: {str(e.reason)}"
        }
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "success": False,
            "message": f"An unexpected error occurred: {str(e)}"
        }