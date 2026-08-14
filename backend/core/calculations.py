import math
from typing import List, Dict, Any
import numpy_financial as npf


def calculate_irr(cashflows: List[float]) -> float:
    """Berechnet den internen Zinsfuß (IRR) mittels numpy-financial."""
    if not cashflows or len(cashflows) < 2:
        return 0.0
    try:
        val = npf.irr(cashflows)
        if val is None or math.isnan(val) or math.isinf(val):
            return 0.0
        return float(val)
    except Exception:
        return 0.0


def _get_val(payload: Any, key: str, default: Any = None) -> Any:
    """Sicheres Auslesen aus Dictionaries und Pydantic-Objekten."""
    if isinstance(payload, dict):
        return payload.get(key, default)
    return getattr(payload, key, default)


def _safe_pct(val: float, is_large: bool = False) -> float:
    """
    Konvertiert Prozentwerte intelligent, um alte Datenbank-Einträge (z. B. 0.04 = 4%) 
    und neue Frontend-Eingaben (z. B. 0.8 = 0.8% oder 3.8 = 3.8%) korrekt zu handhaben.
    """
    if val is None or val == 0.0:
        return 0.0
    
    # Für Steuern (42.0) oder Gebäudeanteil (80.0) liegt der Schwellenwert bei 1.0.
    # Für Zinsen, Tilgung, AfA etc. (kleine Werte) liegt er bei 0.15 (15 %).
    threshold = 1.0 if is_large else 0.15
    if val > threshold:
        return val / 100.0
    return val


def calculate_investment_metrics(payload: Any) -> Dict[str, Any]:
    # 1. STAMMDATEN & BASISWERTE
    kaufpreis = float(_get_val(payload, "kaufpreis", 0.0) or 0.0)
    qm = float(_get_val(payload, "qm", 0.0) or 0.0)
    baujahr = int(_get_val(payload, "baujahr", 2000) or 2000)
    ek_euro = float(_get_val(payload, "ek_euro", 0.0) or 0.0)
    sanierung = float(_get_val(payload, "sanierung", 0.0) or 0.0)

    # KAUFNEBENKOSTEN
    grwt_proz = _safe_pct(float(_get_val(payload, "grwt_proz", 0.0) or _get_val(payload, "grwt_p", 5.0) or 5.0))
    notar_proz = _safe_pct(float(_get_val(payload, "notar_proz", 0.0) or _get_val(payload, "notar_p", 2.0) or 2.0))
    makler_proz = _safe_pct(float(_get_val(payload, "makler_proz", 0.0) or _get_val(payload, "makler_p", 3.57) or 3.57))
    sonst_nk = float(_get_val(payload, "sonst_nk", 0.0) or 0.0)

    grwt_euro = kaufpreis * grwt_proz
    notar_euro = kaufpreis * notar_proz
    makler_euro = kaufpreis * makler_proz
    nk_total = grwt_euro + notar_euro + makler_euro + sonst_nk

    gesamt_kosten = kaufpreis + nk_total
    total_investment = gesamt_kosten + sanierung
    is_ek_covering_nk = round(ek_euro) >= round(nk_total)

    kaufpreis_pro_qm = kaufpreis / qm if qm > 0 else 0.0
    gesamt_kosten_pro_qm = gesamt_kosten / qm if qm > 0 else 0.0

    # 2. FINANZIERUNGSSTRUKTUR
    gesamt_darlehen = max(0.0, gesamt_kosten - ek_euro)
    kfw_amt = float(_get_val(payload, "kfw_amt", 0.0) or 0.0)
    kfw_loan = min(gesamt_darlehen, kfw_amt)
    hb_loan = max(0.0, gesamt_darlehen - kfw_loan)

    ltv = (gesamt_darlehen / kaufpreis) * 100.0 if kaufpreis > 0 else 0.0
    ek_quote = (ek_euro / gesamt_kosten) * 100.0 if gesamt_kosten > 0 else 0.0

    hb_zins = _safe_pct(float(_get_val(payload, "hb_zins", 3.8) or 3.8))
    hb_tilg = _safe_pct(float(_get_val(payload, "hb_tilg", 2.0) or 2.0))

    grace_years = int(_get_val(payload, "grace_years", 0) or 0)
    zinsbindung = int(_get_val(payload, "zinsbindung", 10) or 10)
    sondertilg = float(_get_val(payload, "sondertilg", 0.0) or 0.0)

    folge_zins = _safe_pct(float(_get_val(payload, "folge_zins", 3.8) or 3.8))
    folge_mode = str(_get_val(payload, "folge_mode", "Rate konstant halten (Annuität)") or "Rate konstant halten (Annuität)")
    folge_tilg = _safe_pct(float(_get_val(payload, "folge_tilg", 2.0) or 2.0))

    kfw_zins = _safe_pct(float(_get_val(payload, "kfw_zins", 2.1) or 2.1))
    kfw_tilg = _safe_pct(float(_get_val(payload, "kfw_tilg", 3.0) or 3.0))
    kfw_grace_years = int(_get_val(payload, "kfw_grace_years", 0) or 0)

    # 3. STEUER- & AFA-MODELL
    tax_rate = _safe_pct(float(_get_val(payload, "tax_rate", 0.0) or _get_val(payload, "tax_rate_pct", 42.0) or 42.0), is_large=True)

    gebaeude_anteil = _safe_pct(float(_get_val(payload, "gebaeude_anteil_pct", 80.0) or 80.0), is_large=True)
    gebaeude_wert = kaufpreis * gebaeude_anteil
    gebaeude_wert_pro_qm = gebaeude_wert / qm if qm > 0 else 0.0

    afa_model = str(_get_val(payload, "afa_model", "Linear Standard") or "Linear Standard")
    afa_lin = _safe_pct(float(_get_val(payload, "afa_lin", 2.0) or 2.0))

    ist_sonder_afa_berechtigt = gebaeude_wert_pro_qm > 0 and gebaeude_wert_pro_qm <= 5200.0
    sonder_afa_bemessungsgrundlage = min(gebaeude_wert, 4000.0 * qm)

    denkmal_sanierung_euro = float(_get_val(payload, "denkmal_sanierung_euro", sanierung) or sanierung)
    denkmal_fertigstellung_jahr = int(_get_val(payload, "denkmal_fertigstellung_jahr", 1) or 1)

    # 4. OPERATIVE INITIALWERTE
    kaltmiete_monat = float(_get_val(payload, "kaltmiete_monat", 0.0) or 0.0)
    target_monat = float(_get_val(payload, "target_monat", kaltmiete_monat) or kaltmiete_monat)
    miete_initial_pa = kaltmiete_monat * 12.0

    hausgeld_nicht_umlegbar = float(_get_val(payload, "hausgeld_nicht_umlegbar", 0.0) or 0.0)
    mgt_monat = float(_get_val(payload, "mgt_monat", 30.0) or 30.0)
    inst_sqm = float(_get_val(payload, "inst_sqm", 12.0) or 12.0)

    vac_rate = _safe_pct(float(_get_val(payload, "vac_rate", 0.0) or _get_val(payload, "vac_rate_pct", 2.0) or 2.0))

    vac_initial_pa = miete_initial_pa * vac_rate
    opex_initial_pa = (hausgeld_nicht_umlegbar + mgt_monat) * 12.0 + (inst_sqm * qm) + vac_initial_pa
    noi_initial_pa = miete_initial_pa - opex_initial_pa

    kaufpreisfaktor = kaufpreis / miete_initial_pa if miete_initial_pa > 0 else 0.0
    netto_kaufpreisfaktor = gesamt_kosten / noi_initial_pa if noi_initial_pa > 0 else 0.0
    brutto_mietrendite_initial = (miete_initial_pa / kaufpreis) * 100.0 if kaufpreis > 0 else 0.0
    netto_mietrendite_initial = (noi_initial_pa / gesamt_kosten) * 100.0 if gesamt_kosten > 0 else 0.0

    # CAPEX MAP
    capex_map: Dict[int, float] = {}
    capex_list_raw = _get_val(payload, "capex_list", [])
    if capex_list_raw:
        for item in capex_list_raw:
            if isinstance(item, dict):
                yr = int(item.get("jahr") or item.get("year") or 1)
                amt = float(item.get("betrag") or item.get("amount") or 0.0)
            else:
                yr = int(getattr(item, "jahr", None) or getattr(item, "year", None) or 1)
                amt = float(getattr(item, "betrag", None) or getattr(item, "amount", None) or 0.0)
            capex_map[yr] = capex_map.get(yr, 0.0) + amt

    # 5. JAHRESPROJEKTION (BIS ZU 50 JAHRE)
    hb_rest = hb_loan
    kfw_rest = kfw_loan
    current_gebaeude_buchwert = gebaeude_wert

    hb_annuity_constant = hb_loan * (hb_zins + hb_tilg)
    kfw_annuity_constant = kfw_loan * (kfw_zins + kfw_tilg)

    cum_cashflow_vor_steuer = -ek_euro
    cum_cashflow_nach_steuer = -ek_euro

    projection: List[Dict[str, Any]] = []
    cashflows_for_irr: List[float] = [-ek_euro]
    property_value = kaufpreis

    adj_year = int(_get_val(payload, "adj_year", 1) or 1)
    miet_inc = _safe_pct(float(_get_val(payload, "miet_inc", 1.0) or 1.0))
    cost_inc = _safe_pct(float(_get_val(payload, "cost_inc", 2.0) or 2.0))
    val_inc = _safe_pct(float(_get_val(payload, "val_inc", 1.0) or 1.0))

    for year in range(1, 51):
        if year < adj_year:
            annual_rent_base = kaltmiete_monat * 12.0
        else:
            target_base = target_monat * 12.0
            growth_factor = (1.0 + miet_inc) ** (year - adj_year)
            annual_rent_base = target_base * growth_factor

        vac_loss = annual_rent_base * vac_rate
        effective_rent = annual_rent_base - vac_loss

        cost_growth = (1.0 + cost_inc) ** (year - 1)
        mgt_cost = mgt_monat * 12.0 * cost_growth
        inst_cost = inst_sqm * qm * cost_growth
        non_rec_hausgeld = hausgeld_nicht_umlegbar * 12.0 * cost_growth

        opex_pa = mgt_cost + inst_cost + non_rec_hausgeld + vac_loss
        total_non_rec_costs = mgt_cost + inst_cost + non_rec_hausgeld
        noi_pa = annual_rent_base - opex_pa

        capex_current = capex_map.get(year, 0.0)
        if year == 1:
            capex_current += sanierung

        # HAUSBANK LOAN ANNUITÄT
        hb_zins_rate = hb_zins if year <= zinsbindung else folge_zins
        hb_interest = hb_rest * hb_zins_rate

        if hb_rest <= 0:
            hb_principal = 0.0
            hb_interest = 0.0
        elif year <= grace_years:
            hb_principal = 0.0
        else:
            loan_type = str(_get_val(payload, "loan_type", "Annuitätendarlehen") or "Annuitätendarlehen")
            if loan_type == "Endfälliges Darlehen":
                hb_principal = 0.0
            else:
                if year <= zinsbindung:
                    target_annuity = hb_annuity_constant
                else:
                    if folge_mode == "Rate konstant halten (Annuität)":
                        target_annuity = hb_annuity_constant
                    else:
                        target_annuity = hb_rest * (hb_zins_rate + folge_tilg)

                calculated_principal = max(0.0, target_annuity - hb_interest) + sondertilg
                hb_principal = min(hb_rest, calculated_principal)

        hb_debt_service = hb_interest + hb_principal
        hb_rest = max(0.0, hb_rest - hb_principal)

        # KFW LOAN ANNUITÄT
        kfw_interest = kfw_rest * kfw_zins
        if kfw_rest <= 0:
            kfw_principal = 0.0
            kfw_interest = 0.0
        elif year <= kfw_grace_years:
            kfw_principal = 0.0
        else:
            calculated_kfw_principal = max(0.0, kfw_annuity_constant - kfw_interest)
            kfw_principal = min(kfw_rest, calculated_kfw_principal)

        kfw_debt_service = kfw_interest + kfw_principal
        kfw_rest = max(0.0, kfw_rest - kfw_principal)

        total_interest = hb_interest + kfw_interest
        total_principal = hb_principal + kfw_principal
        total_debt_service = hb_debt_service + kfw_debt_service
        total_remaining_debt = hb_rest + kfw_rest

        # AFA BERECHNUNG
        afa_amount = 0.0
        if afa_model == "Linear Standard":
            afa_amount = gebaeude_wert * afa_lin
        elif afa_model == "Linear Neubau":
            afa_amount = gebaeude_wert * afa_lin
        elif afa_model == "Degressiv":
            degressive_afa = current_gebaeude_buchwert * 0.05
            lineare_afa = gebaeude_wert * afa_lin
            afa_amount = max(degressive_afa, lineare_afa)
            current_gebaeude_buchwert = max(0.0, current_gebaeude_buchwert - afa_amount)
        elif afa_model == "Kombination: Degressiv + Sonder-AfA":
            degressive_afa = current_gebaeude_buchwert * 0.05
            lineare_afa = gebaeude_wert * afa_lin
            base_afa = max(degressive_afa, lineare_afa)
            sonder_part = (sonder_afa_bemessungsgrundlage * 0.05) if (year <= 4 and ist_sonder_afa_berechtigt) else 0.0
            afa_amount = base_afa + sonder_part
            current_gebaeude_buchwert = max(0.0, current_gebaeude_buchwert - afa_amount)
        elif afa_model == "Denkmalgeschützt":
            altbestand_afa = gebaeude_wert * 0.02
            denkmal_afa = 0.0
            if year >= denkmal_fertigstellung_jahr:
                denkmal_year = year - denkmal_fertigstellung_jahr + 1
                if denkmal_year <= 8:
                    denkmal_afa = denkmal_sanierung_euro * 0.09
                elif denkmal_year <= 12:
                    denkmal_afa = denkmal_sanierung_euro * 0.07
            afa_amount = altbestand_afa + denkmal_afa

        taxable_income = noi_pa - total_interest - afa_amount
        tax_amount = taxable_income * tax_rate

        cashflow_vor_steuer_pa = annual_rent_base - opex_pa - total_debt_service - capex_current
        net_cashflow = cashflow_vor_steuer_pa - tax_amount

        property_value *= (1.0 + val_inc)
        net_equity = max(0.0, property_value - total_remaining_debt)

        cum_cashflow_vor_steuer += cashflow_vor_steuer_pa
        cum_cashflow_nach_steuer += net_cashflow

        total_return_nach_steuer = cum_cashflow_nach_steuer + net_equity
        dscr = noi_pa / total_debt_service if total_debt_service > 0 else 0.0

        cashflows_for_irr.append(net_cashflow)

        # SPALTENMAPPING
        projection.append({
            "Jahr": year,
            "jahr": year,
            "jahrLabel": f"{year}",
            "Mieteinnahmen IST": round(annual_rent_base, 2),
            "miete": round(annual_rent_base, 2),
            "Kaltmiete p.a.": round(annual_rent_base, 2),
            "Effektive Miete": round(effective_rent, 2),
            "Bewirtschaftungskosten": round(total_non_rec_costs, 2),
            "opex": round(opex_pa, 2),
            "noi": round(noi_pa, 2),
            "Capex": round(capex_current, 2),
            "capex": round(capex_current, 2),
            "Zinsen": round(total_interest, 2),
            "zins": round(total_interest, 2),
            "Tilgung": round(total_principal, 2),
            "tilgung": round(total_principal, 2),
            "Kapitaldienst": round(total_debt_service, 2),
            "kapitaldienst": round(total_debt_service, 2),
            "AfA": round(afa_amount, 2),
            "afaEuro": round(afa_amount, 2),
            "zuVersteuerndesEinkommen": round(taxable_income, 2),
            "Steuer": round(tax_amount, 2),
            "steuerErgebnis": round(tax_amount, 2),
            "Cashflow Netto": round(net_cashflow, 2),
            "cashflowNachSteuer": round(net_cashflow, 2),
            "cashflowNachSteuerMo": round(net_cashflow / 12.0, 2),
            "cashflowVorSteuer": round(cashflow_vor_steuer_pa, 2),
            "cashflowVorSteuerMo": round(cashflow_vor_steuer_pa / 12.0, 2),
            "Restschuld": round(total_remaining_debt, 2),
            "restschuld": round(total_remaining_debt, 2),
            "Immobilienwert": round(property_value, 2),
            "immobilienwert": round(property_value, 2),
            "netEquity": round(net_equity, 2),
            "cumCashflowNachSteuer": round(cum_cashflow_nach_steuer, 2),
            "totalReturnNachSteuer": round(total_return_nach_steuer, 2),
            "dscr": round(dscr, 2)
        })

        if total_remaining_debt <= 0 and year >= 30:
            break

    # 6. AGGREGATIONEN & KPIS FÜR DEN HORIZONT (10 JAHRE STANDARD)
    horizon_years = 10
    sliced_projection = projection[:horizon_years]

    totals = {
        "miete": sum(r["miete"] for r in sliced_projection),
        "opex": sum(r["opex"] for r in sliced_projection),
        "noi": sum(r["noi"] for r in sliced_projection),
        "zins": sum(r["zins"] for r in sliced_projection),
        "tilgung": sum(r["tilgung"] for r in sliced_projection),
        "kapitaldienst": sum(r["kapitaldienst"] for r in sliced_projection),
        "afaEuro": sum(r["afaEuro"] for r in sliced_projection),
        "zuVersteuerndesEinkommen": sum(r["zuVersteuerndesEinkommen"] for r in sliced_projection),
        "steuerErgebnis": sum(r["steuerErgebnis"] for r in sliced_projection),
        "cashflowNachSteuerPa": sum(r["cashflowNachSteuer"] for r in sliced_projection)
    }

    avg_monthly_cashflow = totals["cashflowNachSteuerPa"] / (horizon_years * 12.0)
    avg_brutto_rendite = (totals["miete"] / horizon_years / kaufpreis) * 100.0 if kaufpreis > 0 else 0.0

    last_row_horizon = sliced_projection[-1] if sliced_projection else projection[0]
    exit_property_value = last_row_horizon["immobilienwert"]
    exit_restschuld = last_row_horizon["restschuld"]
    
    exit_cost_rate = _safe_pct(float(_get_val(payload, "exit_cost", 0.0) or 0.0))
    exit_costs = exit_property_value * exit_cost_rate
    net_exit_proceeds = exit_property_value - exit_costs - exit_restschuld

    irr_cashflows = [-ek_euro]
    for idx, r in enumerate(sliced_projection):
        if idx == len(sliced_projection) - 1:
            irr_cashflows.append(r["cashflowNachSteuer"] + net_exit_proceeds)
        else:
            irr_cashflows.append(r["cashflowNachSteuer"])

    irr_val = calculate_irr(irr_cashflows) if ek_euro > 0 else 0.0
    valid_irr = (irr_val * 100.0) if not (math.isnan(irr_val) or math.isinf(irr_val)) else 0.0

    gesamt_gewinn = totals["cashflowNachSteuerPa"] + (net_exit_proceeds - ek_euro)

    year1_row = projection[0] if projection else {}
    cash_on_cash_return = (year1_row.get("cashflowNachSteuer", 0.0) / ek_euro) * 100.0 if ek_euro > 0 else 0.0

    critical_miete_pa = year1_row.get("opex", 0.0) + year1_row.get("kapitaldienst", 0.0) + year1_row.get("steuerErgebnis", 0.0)
    break_even_miete_mo = critical_miete_pa / 12.0
    break_even_miete_sqm_mo = break_even_miete_mo / qm if qm > 0 else 0.0

    return {
        "stammDaten": {
            "kaufpreis": round(kaufpreis, 2),
            "qm": round(qm, 2),
            "baujahr": baujahr,
            "kaufpreisProQm": round(kaufpreis_pro_qm, 2),
            "gesamtKostenProQm": round(gesamt_kosten_pro_qm, 2)
        },
        "kaufnebenkosten": {
            "grwtEuro": round(grwt_euro, 2),
            "notarEuro": round(notar_euro, 2),
            "maklerEuro": round(makler_euro, 2),
            "sonstNk": round(sonst_nk, 2),
            "nkTotal": round(nk_total, 2),
            "gesamtKosten": round(gesamt_kosten, 2),
            "isEkCoveringNk": is_ek_covering_nk
        },
        "finanzierung": {
            "gesamtDarlehen": round(gesamt_darlehen, 2),
            "hauptDarlehen": round(hb_loan, 2),
            "kfwDarlehen": round(kfw_loan, 2),
            "ekEuro": round(ek_euro, 2),
            "ltv": round(ltv, 2),
            "ekQuote": round(ek_quote, 2)
        },
        "kpis": {
            "avgMonthlyCashflow": round(avg_monthly_cashflow, 2),
            "isCfPositive": avg_monthly_cashflow >= 0,
            "avgBruttoRendite": round(avg_brutto_rendite, 2),
            "validIrr": round(valid_irr, 2),
            "gesamtGewinn": round(gesamt_gewinn, 2),
            "horizonYears": horizon_years,
            "kaufpreisfaktor": round(kaufpreisfaktor, 2),
            "nettoKaufpreisfaktor": round(netto_kaufpreisfaktor, 2),
            "bruttoMietrenditeInitial": round(brutto_mietrendite_initial, 2),
            "nettoMietrenditeInitial": round(netto_mietrendite_initial, 2),
            "cashOnCashReturn": round(cash_on_cash_return, 2),
            "dscrInitial": round(year1_row.get("dscr", 0.0), 2),
            "breakEvenMieteMo": round(break_even_miete_mo, 2),
            "breakEvenMieteSqmMo": round(break_even_miete_sqm_mo, 2)
        },
        "summary": {
            "total_investment": round(total_investment, 2),
            "purchase_price": round(kaufpreis, 2),
            "ancillary_costs": round(nk_total, 2),
            "equity_absolute": round(ek_euro, 2),
            "hb_loan": round(hb_loan, 2),
            "kfw_loan": round(kfw_loan, 2),
            "afa_base": round(gebaeude_wert, 2),
            "irr": round(valid_irr / 100.0, 4)
        },
        "totals": totals,
        "projection": projection
    }
