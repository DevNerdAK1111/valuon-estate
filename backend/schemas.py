from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class CapexItem(BaseModel):
    jahr: Optional[int] = 1
    betrag: Optional[float] = 0.0


class CalculatePayload(BaseModel):
    obj_name: Optional[str] = "Objekt"
    objektart: Optional[str] = "Eigentumswohnung"
    bundesland: Optional[str] = "Niedersachsen"
    stadt: Optional[str] = "Weyhe"
    stadtteil: Optional[str] = ""
    kaufpreis: float = 0.0
    qm: float = 0.0
    baujahr: Optional[int] = 2000

    kaltmiete_monat: float = 0.0
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

    grwt_p: Optional[float] = 5.0
    notar_p: Optional[float] = 2.0
    makler_p: Optional[float] = 3.57
    sonst_nk: Optional[float] = 0.0

    loan_type: Optional[str] = "Annuitätendarlehen"
    hb_zins: Optional[float] = 3.8
    hb_tilg: Optional[float] = 2.0
    sondertilg: Optional[float] = 0.0
    grace_years: Optional[int] = 0
    ek_euro: Optional[float] = 0.0

    zinsbindung: Optional[int] = 10
    folge_zins: Optional[float] = 3.8
    folge_mode: Optional[str] = "Rate konstant halten (Annuität)"
    folge_tilg: Optional[float] = 2.0

    kfw_amt: Optional[float] = 0.0
    kfw_zins: Optional[float] = 2.1
    kfw_tilg: Optional[float] = 3.0
    kfw_grace_years: Optional[int] = 0
    kfw_grant: Optional[float] = 0.0

    tax_rate_pct: Optional[float] = 42.0
    afa_model: Optional[str] = "Linear Standard"
    afa_lin: Optional[float] = 2.0
    gebaeude_anteil_pct: Optional[float] = 80.0
    denkmal_sanierung_euro: Optional[float] = 0.0
    denkmal_fertigstellung_jahr: Optional[int] = 1

    miet_inc: Optional[float] = 1.0
    cost_inc: Optional[float] = 2.0
    val_inc: Optional[float] = 1.0
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
