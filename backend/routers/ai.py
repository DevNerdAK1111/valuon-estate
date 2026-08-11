from fastapi import APIRouter, HTTPException, File, Form, UploadFile
from typing import Optional
from core.ai_service import fetch_text_from_url, analyze_property_data

router = APIRouter()

@router.post("/ai-analysis")
async def analyze_expose(
    text: Optional[str] = Form(""),
    url: Optional[str] = Form(""),
    pdf_file: Optional[UploadFile] = File(None)
):
    try:
        content_to_analyze = text
        
        # Wenn eine URL gesendet wird, Text scrapen
        if url:
            scraped_text = fetch_text_from_url(url)
            if not scraped_text:
                raise HTTPException(status_code=400, detail="URL konnte nicht gelesen werden (evtl. Anti-Bot-Schutz). Bitte nutze Text oder PDF.")
            content_to_analyze = scraped_text
            
        if not content_to_analyze and not pdf_file:
            raise HTTPException(status_code=400, detail="Bitte Text, URL oder PDF übermitteln.")

        # Datei in Bytes lesen, falls hochgeladen
        pdf_bytes = None
        if pdf_file:
            pdf_bytes = await pdf_file.read()

        # Analyse starten
        result = analyze_property_data(raw_text=content_to_analyze, pdf_bytes=pdf_bytes)
        return {"data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
