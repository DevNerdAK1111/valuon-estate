from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

# Import aus deinem bestehenden Rechenkern
from core.calculations import calc_projection

app = FastAPI(title="Valuon Estate Backend", version="1.0")

# CORS erlauben, damit das Frontend (später von Vercel) auf dieses Backend zugreifen darf
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Später kannst du hier deine Vercel-Domain eintragen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic-Modell für die Validierung der Eingabedaten (entspricht deinem calc_data)
class CalculationInput(BaseModel, extra="allow"):
    kaufpreis: float
    sanierung: float = 0.0
    bundesland: str = "Niedersachsen"
    stadt: str = ""
    stadtteil: str = ""
    objektart: str = "Eigentumswohnung"
    grwt_proz: float = 0.05
    notar_proz: float = 0.02
    makler_proz: float = 0.0357
    sonst_nk: float = 0.0
    disagio_proz: float = 0.0
    ek_euro: float = 0.0
    ek_quote: float = 0.20
    loan_type: str = "Annuitätendarlehen"
    hb_zins: float = 0.038
    hb_tilg: float = 0.02
    sondertilg: float = 0.0
    capex_list: List[Dict[str, Any]] = []
    grace_years: int = 0
    zinsbindung: int = 10
    folge_zins: float = 0.038
    folge_mode: str = "Rate konstant halten (Annuität)"
    folge_tilg: float = 0.02
    kfw_amt: float = 0.0
    kfw_zins: float = 0.021
    kfw_tilg: float = 0.03
    kfw_grace_years: int = 0
    kfw_grant: float = 0.0
    ist_sqm: float = 0.0
    target_sqm: float = 0.0
    adj_year: int = 3
    park: float = 0.0
    vac_rate: float = 0.02
    qm: float = 0.0
    hausgeld: float = 0.0
    hausgeld_nicht_umlegbar: float = 0.0
    inst_sqm: float = 12.0
    mgt_monat: float = 30.0
    tax_rate: float = 0.42
    afa_model: str = "1_Linear_Standard"
    afa_lin: float = 0.02
    miet_inc: float = 0.015
    cost_inc: float = 0.02
    val_inc: float = 0.0
    wacc: float = 0.06
    exit_cost: float = 0.02
    grund_anteil: float = 0.20

@app.get("/")
def read_root():
    return {"status": "Valuon Estate Backend läuft einwandfrei", "version": "1.0"}

@app.post("/api/calculate")
def calculate_deal(data: CalculationInput, full_repayment: bool = False):
    try:
        # Pydantic-Modell in ein normales Dictionary umwandeln
        calc_data = data.model_dump()
        
        # Deine exakte Original-Berechnungsfunktion aufrufen
        df_proj, tot_inv, ek_abs, fk_tot, irr, afa_base, ek_quote_calc = calc_projection(
            calc_data, full_repayment=full_repayment
        )
        
        # DataFrame in ein JSON-kompatibles Format konvertieren
        df_json = df_proj.to_dict(orient="records")
        
        return {
            "success": True,
            "projection": df_json,
            "summary": {
                "total_investment": tot_inv,
                "equity_absolute": ek_abs,
                "debt_total": fk_tot,
                "irr": irr,
                "afa_base": afa_base,
                "equity_quote_calc": ek_quote_calc
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
