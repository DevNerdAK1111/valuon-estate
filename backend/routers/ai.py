from fastapi import APIRouter, HTTPException
from schemas import AiAnalysisRequest
from core.ai_service import analyze_text_with_gemini, fetch_text_from_url

router = APIRouter(prefix="/api", tags=["AI"])


@router.post("/ai-analysis")
async def ai_analysis(payload: AiAnalysisRequest):
    try:
        raw_text = payload.text or ""
        if payload.url:
            raw_text = fetch_text_from_url(payload.url)

        if not raw_text:
            raise HTTPException(status_code=400, detail="Kein Text oder Inhalt über die URL gefunden.")

        result = analyze_text_with_gemini(raw_text)
        return {"status": "success", "data": result}
    except HTTPException:
        # Fange HTTPExceptions ab und reiche sie unverändert weiter, 
        # damit sie nicht vom generellen Exception-Block in einen 500er verwandelt werden.
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KI-Analysefehler: {str(e)}")
