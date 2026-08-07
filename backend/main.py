from typing import Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    CalculatePayload,
    PropertyDatabasePayload,
    PropertyStatusUpdatePayload,
    AiAnalysisRequest
)
from core.calculations import calculate_investment_metrics
from core.database import (
    save_property_to_db,
    fetch_properties_from_db,
    delete_property_from_db,
    update_property_status_in_db
)
from core.ai_service import analyze_text_with_gemini, fetch_text_from_url

app = FastAPI(title="Valuon Estate Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# API ENDPOINTS
# -----------------------------------------------------------------------------

@app.get("/")
async def root():
    return {"status": "ok", "message": "Valuon Estate Backend ist erreichbar."}


@app.post("/api/calculate")
async def calculate_investment(payload: CalculatePayload):
    try:
        results = calculate_investment_metrics(payload)
        return results
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Berechnungsfehler: {str(e)}")


@app.post("/api/ai-analysis")
async def ai_analysis(payload: AiAnalysisRequest):
    try:
        raw_text = payload.text or ""
        if payload.url:
            raw_text = fetch_text_from_url(payload.url)

        if not raw_text:
            raise HTTPException(status_code=400, detail="Kein Text oder Inhalt über die URL gefunden.")

        result = analyze_text_with_gemini(raw_text)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KI-Analysefehler: {str(e)}")


@app.post("/api/properties")
async def save_property(payload: PropertyDatabasePayload):
    try:
        data = {
            "name": payload.name or payload.obj_name or "Unbenanntes Objekt",
            "obj_name": payload.obj_name or payload.name or "Unbenanntes Objekt",
            "objektart": payload.objektart,
            "stadt": payload.stadt,
            "bundesland": payload.bundesland,
            "kaufpreis": payload.kaufpreis,
            "qm": payload.qm,
            "irr": payload.irr,
            "cashflow_y1": payload.cashflow_y1 or payload.cashflow_netto_y1 or 0.0,
            "cashflow_netto_y1": payload.cashflow_netto_y1 or payload.cashflow_y1 or 0.0,
            "user_email": payload.user_email,
            "status": payload.status or "pipeline",
            "form_data": payload.form_data,
            "capex_list": payload.capex_list
        }
        res_data = save_property_to_db(data)
        return {"status": "success", "data": res_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {str(e)}")


@app.get("/api/properties")
async def get_properties():
    try:
        properties = fetch_properties_from_db()
        return {"properties": properties}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Laden: {str(e)}")


@app.patch("/api/properties/{property_id}")
async def update_property_status(property_id: Union[int, str], payload: PropertyStatusUpdatePayload):
    try:
        res_data = update_property_status_in_db(property_id, payload.status)
        return {"status": "updated", "data": res_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren: {str(e)}")


@app.delete("/api/properties/{property_id}")
async def delete_property(property_id: Union[int, str]):
    try:
        res_data = delete_property_from_db(property_id)
        return {"status": "deleted", "data": res_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Löschen: {str(e)}")
