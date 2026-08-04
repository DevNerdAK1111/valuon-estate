import os
import math
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI(title="Valuon Estate Backend API")

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SUPABASE CLIENT INITIALISIERUNG ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase Init Warnung: {e}")


# --- PURE PYTHON IRR RECHNER ---
def calculate_irr(cashflows: List[float]) -> float:
    """Berechnet den internen Zinsfuß (IRR) mittels Newton-Raphson Verfahren."""
    if not cashflows or len(cashflows) < 2:
        return 0.0

    def npv(rate: float, cfs: List[float]) -> float:
        val = 0.0
        for t, cf in enumerate(cfs):
            val += cf / ((1.0 + rate) ** t)
        return val

    def npv_prime(rate: float, cfs: List[float]) -> float:
        val = 0.0
        for t, cf in enumerate(cfs):
            val -= t * cf / ((1.0 + rate) ** (t + 1))
        return val

    rate = 0.05
    for _ in range(100):
        f_val = npv(rate, cashflows)
        if abs(f_val) < 1e-6:
            return rate
        f_prime = npv_prime(rate, cashflows)
        if abs(f_prime) < 1e-12:
            break
        new_rate = rate - f_val / f_prime
        if new_rate <= -0.99 or new_rate > 5.0:
            break
        rate = new_rate

    return rate if not math.isnan(rate) else 0.0


# --- PYDANTIC MODELLE ---
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
    bundesland: Optional[str] = None
    kaufpreis: Optional[float] = 0.0
    qm: Optional[float] = 0.0
    irr: Optional[float] = 0.0
    cashflow_y1: Optional[float] = 0.0
    cashflow_netto_y1: Optional[float] = 0.0
    user_email: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None
    capex_list: Optional[Any] = None
    created_at: Optional[str] = None


# --- ROUTEN ---

@app.get("/")
async def root():
    return {"status": "ok", "message": "Valuon Estate Backend ist erreichbar."}


@app.post("/api/calculate")
async def calculate_investment(payload: CalculatePayload):
    try:
        grwt_euro = payload.kaufpreis * payload.grwt_proz
        notar_euro = payload.kaufpreis * payload.notar_proz
        makler_euro = payload.kaufpreis * payload.makler_proz
        summe_nk = grwt_euro + notar_euro + makler_euro + (payload.sonst_nk or 0.0)

        total_investment = payload.kaufpreis + summe_nk + (payload.sanierung or 0.0)
        afa_base = (payload.kaufpreis + summe_nk) * 0.80 + (payload.sanierung or 0.0)

        kfw_loan = payload.kfw_amt or 0.0
        hb_loan = max(0.0, total_investment - (payload.ek_euro or 0.0) - (payload.kfw_grant or 0.0) - kfw_loan)
        equity_absolute = payload.ek_euro or 0.0

        capex_map: Dict[int, float] = {}
        if payload.capex_list:
            for item in payload.capex_list:
                yr = item.get_year()
                amt = item.get_amount()
                capex_map[yr] = capex_map.get(yr, 0.0) + amt

        hb_rest = hb_loan
        kfw_rest = kfw_loan
        afa_book_value = afa_base

        # KORREKTE ANNUITÄTEN-RATE (Zins + Tilgung im ersten Jahr)
        initial_hb_annuity_rate = hb_loan * ((payload.hb_zins or 0.04) + (payload.hb_tilg or 0.02))
        initial_kfw_annuity_rate = kfw_loan * ((payload.kfw_zins or 0.021) + (payload.kfw_tilg or 0.03))

        projection = []
        cashflows_for_irr = [-equity_absolute]

        property_value = payload.kaufpreis

        for year in range(1, 31):
            # 1. Mieteinnahmen
            if year < (payload.adj_year or 1):
                annual_rent_base = payload.kaltmiete_monat * 12.0
            else:
                target_base = (payload.target_monat or payload.kaltmiete_monat) * 12.0
                growth_factor = (1.0 + payload.miet_inc) ** (year - (payload.adj_year or 1))
                annual_rent_base = target_base * growth_factor

            vac_loss = annual_rent_base * (payload.vac_rate or 0.02)
            effective_rent = annual_rent_base - vac_loss

            # 2. Bewirtschaftungskosten
            cost_growth = (1.0 + payload.cost_inc) ** (year - 1)
            mgt_cost = (payload.mgt_monat or 30.0) * 12.0 * cost_growth
            inst_cost = (payload.inst_sqm or 12.0) * payload.qm * cost_growth
            non_recoverable_hausgeld = (payload.hausgeld_nicht_umlegbar or 0.0) * 12.0 * cost_growth

            total_non_rec_costs = mgt_cost + inst_cost + non_recoverable_hausgeld
            capex_current = capex_map.get(year, 0.0)

            # 3. Darlehensdienst Hausbank (Dynamic Annuity Logic)
            hb_zins_rate = payload.hb_zins if year <= payload.zinsbindung else payload.folge_zins
            hb_interest = hb_rest * hb_zins_rate

            if year <= payload.grace_years or hb_rest <= 0:
                hb_principal = 0.0
            else:
                if payload.loan_type == "Endfälliges Darlehen":
                    hb_principal = 0.0
                else:
                    # Dynamischer Tilgungsanteil: Tilgung = Rate - Zinsen
                    current_rate = initial_hb_annuity_rate if year <= payload.zinsbindung else (hb_loan * (hb_zins_rate + (payload.folge_tilg or 0.02)))
                    calculated_principal = max(0.0, current_rate - hb_interest) + (payload.sondertilg or 0.0)
                    hb_principal = min(hb_rest, calculated_principal)

            hb_debt_service = hb_interest + hb_principal
            hb_rest = max(0.0, hb_rest - hb_principal)

            # 4. Darlehensdienst KfW (Dynamic Annuity Logic)
            kfw_interest = kfw_rest * payload.kfw_zins
            if year <= payload.kfw_grace_years or kfw_rest <= 0:
                kfw_principal = 0.0
            else:
                calculated_kfw_principal = max(0.0, initial_kfw_annuity_rate - kfw_interest)
                kfw_principal = min(kfw_rest, calculated_kfw_principal)

            kfw_debt_service = kfw_interest + kfw_principal
            kfw_rest = max(0.0, kfw_rest - kfw_principal)

            total_interest = hb_interest + kfw_interest
            total_debt_service = hb_debt_service + kfw_debt_service
            total_remaining_debt = hb_rest + kfw_rest

            # 5. AfA Berechnung
            afa_model = payload.afa_model or "Linear Standard"
            afa_amount = 0.0

            if afa_model == "Linear Standard":
                afa_amount = afa_base * (payload.afa_lin or 0.02)
            elif afa_model == "Linear Neubau":
                afa_amount = afa_base * 0.03
            elif afa_model == "Degressiv":
                afa_amount = afa_book_value * 0.05
            elif afa_model == "Kombination: Degressiv + Sonder-AfA":
                degressiv_part = afa_book_value * 0.05
                sonder_part = (afa_base * 0.05) if year <= 4 else 0.0
                afa_amount = degressiv_part + sonder_part
            elif afa_model == "Denkmalgeschützt":
                if year <= 8:
                    afa_amount = afa_base * 0.09
                elif year <= 12:
                    afa_amount = afa_base * 0.07
                else:
                    afa_amount = 0.0

            afa_amount = min(afa_amount, afa_book_value)
            afa_book_value = max(0.0, afa_book_value - afa_amount)

            # 6. Steuerberechnung mit Steuerschild (Negative Steuer = Steuererstattung)
            taxable_income = effective_rent - total_non_rec_costs - total_interest - afa_amount
            tax_amount = taxable_income * (payload.tax_rate or 0.42)

            # Netto-Cashflow (Negative Steuer wirkt als Erstattung ertragssteigernd)
            net_cashflow = effective_rent - total_non_rec_costs - capex_current - total_debt_service - tax_amount

            property_value *= (1.0 + payload.val_inc)

            if year == 30:
                net_exit_proceeds = property_value * (1.0 - payload.exit_cost) - total_remaining_debt
                cashflows_for_irr.append(net_cashflow + net_exit_proceeds)
            else:
                cashflows_for_irr.append(net_cashflow)

            projection.append({
                "Jahr": year,
                "Mieteinnahmen IST": round(annual_rent_base, 2),
                "Effektive Miete": round(effective_rent, 2),
                "Bewirtschaftungskosten": round(total_non_rec_costs, 2),
                "Capex": round(capex_current, 2),
                "Zinsen": round(total_interest, 2),
                "Tilgung": round(hb_principal + kfw_principal, 2),
                "AfA": round(afa_amount, 2),
                "Steuer": round(tax_amount, 2),
                "Cashflow Netto": round(net_cashflow, 2),
                "Restschuld": round(total_remaining_debt, 2),
                "Immobilienwert": round(property_value, 2)
            })

        irr_val = calculate_irr(cashflows_for_irr)

        return {
            "summary": {
                "total_investment": round(total_investment, 2),
                "purchase_price": round(payload.kaufpreis, 2),
                "ancillary_costs": round(summe_nk, 2),
                "equity_absolute": round(equity_absolute, 2),
                "hb_loan": round(hb_loan, 2),
                "kfw_loan": round(kfw_loan, 2),
                "afa_base": round(afa_base, 2),
                "irr": round(irr_val, 4)
            },
            "projection": projection
        }

    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Berechnungsfehler: {str(e)}")


@app.post("/api/properties")
async def save_property(payload: PropertyDatabasePayload):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase ist im Backend nicht konfiguriert.")

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
            "form_data": payload.form_data,
            "capex_list": payload.capex_list
        }
        res = supabase.table("properties").insert(data).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {str(e)}")


@app.get("/api/properties")
async def get_properties():
    if not supabase:
        return {"properties": []}
    try:
        res = supabase.table("properties").select("*").order("id", desc=True).execute()
        return {"properties": res.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Laden: {str(e)}")


@app.delete("/api/properties/{property_id}")
async def delete_property(property_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase nicht konfiguriert.")
    try:
        res = supabase.table("properties").delete().eq("id", property_id).execute()
        return {"status": "deleted", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Löschen: {str(e)}")
