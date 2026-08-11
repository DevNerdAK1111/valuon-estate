from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.ai_service import fetch_text_from_url, analyze_property_data

router = APIRouter()

# WICHTIG: Hier muss pdf_base64 als mögliches Feld definiert sein!
class AiParseRequest(BaseModel):
    text: Optional[str] = ""
    url: Optional[str] = ""
    pdf_base64: Optional[str] = ""

@router.post("/ai-analysis")
async def analyze_expose(req: AiParseRequest):
    try:
        content_to_analyze = req.text
        
        # Wenn eine URL gesendet wird, Text scrapen
        if req.url:
            scraped_text = fetch_text_from_url(req.url)
            if not scraped_text:
                raise HTTPException(status_code=400, detail="URL konnte nicht gelesen werden (evtl. Anti-Bot-Schutz). Bitte nutze Text oder PDF.")
            content_to_analyze = scraped_text
            
        # NEUE LOGIK: Prüft jetzt auch, ob pdf_base64 vorhanden ist!
        if not content_to_analyze and not req.pdf_base64:
            raise HTTPException(status_code=400, detail="Bitte Text, URL oder PDF übermitteln.")

        # Analyse starten (leitet pdf_base64 an den Service weiter)
        result = analyze_property_data(raw_text=content_to_analyze, pdf_base64=req.pdf_base64)
        return {"data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
