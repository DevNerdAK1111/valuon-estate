from typing import List, Optional, Dict, Any, Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
# PYDANTIC SCHEMAS
# -----------------------------------------------------------------------------

class CapexItem(BaseModel):
    year: Optional[int] = None
    jahr: Optional[int] = None
    amount: Optional[float] = None
    betrag: Optional[float] = None

    def get_year(self) -> int:
        return self.jahr if self.jahr is not None else (self.year if self.year is not None else 1)

    def get_amount(self) -> float:
        return self.betrag if self.betrag is not None else (self.amount if self.amount is not None else 0.0)


class CalculatePayload(BaseModel):
    obj_name: Optional[str] = "Objekt"
    objektart: Optional[str] = "Eigentumswohnung"
    bundesland: Optional[str] = "Niedersachsen"
    stadt: Optional[str] = "Weyhe"
    stadtteil: Optional[str] = ""
    kaufpreis: float
    qm: float
    baujahr: Optional[int] = 2000

    kaltmiete_monat: float
    ist_sqm: Optional[float] = 0.0
    target_monat: Optional[float] = 0.0
    target_sqm: Optional[float] = 0.0
    adj_year: Optional[int] = 1

    hausgeld: Optional[float] = 0.0
    hausgeld_nicht_umlegbar: Optional[float] = 0.0
    sanierung: Optional[float] = 0.0
    inst_sqm: Optional[float] = 12.0
    mgt_monat: Optional[float] = 30.0
    vac_rate_pct: Optional[float] = 2.0
    vac_rate: Optional[float] = 0.02

    grwt_p: Optional[float] = 5.0
    grwt_proz: Optional[float] = 0.05
    notar_p: Optional[float] = 2.0
    notar_proz: Optional[float] = 0.02
    makler_p: Optional[float] = 3.57
    makler_proz: Optional[float] = 0.0357
    sonst_nk: Optional[float] = 0.0

    loan_type: Optional[str] = "Annuitätendarlehen"
    hb_zins: Optional[float] = 0.04
    hb_tilg: Optional[float] = 0.02
    sondertilg: Optional[float] = 0.0
    grace_years: Optional[int] = 0
    ek_euro: Optional[float] = 0.0

    zinsbindung: Optional[int] = 10
    folge_zins: Optional[float] = 0.038
    folge_mode: Optional[str] = "Rate konstant halten (Annuität)"
    folge_tilg: Optional[float] = 0.02

    kfw_amt: Optional[float] = 0.0
    kfw_zins: Optional[float] = 0.021
    kfw_tilg: Optional[float] = 0.03
    kfw_grace_years: Optional[int] = 0
    kfw_grant: Optional[float] = 0.0

    tax_rate_pct: Optional[float] = 42.0
    tax_rate: Optional[float] = 0.42
    afa_model: Optional[str] = "Linear Standard"
    afa_lin: Optional[float] = 0.02
    miet_inc: Optional[float] = 0.01
    cost_inc: Optional[float] = 0.02
    val_inc: Optional[float] = 0.01
    exit_cost: Optional[float] = 0.0

    capex_list: Optional[List[CapexItem]] = []


class PropertyDatabasePayload(BaseModel):
    name: Optional[str] = None
    obj_name: Optional[str] = None
    objektart: Optional[str] = None
    stadt: Optional[str] = None
    stadtteil: Optional[str] = None
    bundesland: Optional[str] = None
    kaufpreis: Optional[float] = 0.0
    qm: Optional[float] = 0.0
    irr: Optional[float] = 0.0
    cashflow_y1: Optional[float] = 0.0
    cashflow_netto_y1: Optional[float] = 0.0
    user_email: Optional[str] = None
    status: Optional[str] = "pipeline"
    form_data: Optional[Dict[str, Any]] = None
    capex_list: Optional[Any] = None
    created_at: Optional[str] = None


class PropertyStatusUpdatePayload(BaseModel):
    status: str


class AiAnalysisRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None


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
