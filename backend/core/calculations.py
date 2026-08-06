import math
from typing import List, Dict, Any


def calculate_irr(cashflows: List[float]) -> float:
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


def calculate_investment_metrics(payload) -> Dict[str, Any]:
    grwt_euro = payload.kaufpreis * (payload.grwt_proz or (payload.grwt_p / 100.0 if payload.grwt_p else 0.05))
    notar_euro = payload.kaufpreis * (payload.notar_proz or (payload.notar_p / 100.0 if payload.notar_p else 0.02))
    makler_euro = payload.kaufpreis * (payload.makler_proz or (payload.makler_p / 100.0 if payload.makler_p else 0.0357))
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

    hb_zins_initial = payload.hb_zins if payload.hb_zins is not None else 0.04
    hb_tilg_initial = payload.hb_tilg if payload.hb_tilg is not None else 0.02

    hb_annuity_constant = hb_loan * (hb_zins_initial + hb_tilg_initial)
    kfw_annuity_constant = kfw_loan * ((payload.kfw_zins or 0.021) + (payload.kfw_tilg or 0.03))

    projection = []
    cashflows_for_irr = [-equity_absolute]

    property_value = payload.kaufpreis
    tax_rate = payload.tax_rate if payload.tax_rate is not None else ((payload.tax_rate_pct or 42.0) / 100.0)

    # BERECHNUNG BIS ZU 50 JAHRE FÜR DIE VOLLSTÄNDIGE TILGUNG
    for year in range(1, 51):
        if year < (payload.adj_year or 1):
            annual_rent_base = payload.kaltmiete_monat * 12.0
        else:
            target_base = (payload.target_monat or payload.kaltmiete_monat) * 12.0
            growth_factor = (1.0 + (payload.miet_inc or 0.01)) ** (year - (payload.adj_year or 1))
            annual_rent_base = target_base * growth_factor

        vac_loss = annual_rent_base * (payload.vac_rate or 0.02)
        effective_rent = annual_rent_base - vac_loss

        cost_growth = (1.0 + (payload.cost_inc or 0.02)) ** (year - 1)
        mgt_cost = (payload.mgt_monat or 30.0) * 12.0 * cost_growth
        inst_cost = (payload.inst_sqm or 12.0) * payload.qm * cost_growth
        non_recoverable_hausgeld = (payload.hausgeld_nicht_umlegbar or 0.0) * 12.0 * cost_growth

        total_non_rec_costs = mgt_cost + inst_cost + non_recoverable_hausgeld
        capex_current = capex_map.get(year, 0.0)

        # HB LOAN ANNUITÄT
        hb_zins_rate = hb_zins_initial if year <= (payload.zinsbindung or 10) else (payload.folge_zins or 0.038)
        hb_interest = hb_rest * hb_zins_rate

        if year <= (payload.grace_years or 0) or hb_rest <= 0:
            hb_principal = 0.0
            hb_interest = 0.0
        else:
            if payload.loan_type == "Endfälliges Darlehen":
                hb_principal = 0.0
            else:
                target_annuity = hb_annuity_constant if year <= (payload.zinsbindung or 10) else (hb_loan * (hb_zins_rate + (payload.folge_tilg or 0.02)))
                calculated_principal = max(0.0, target_annuity - hb_interest) + (payload.sondertilg or 0.0)
                hb_principal = min(hb_rest, calculated_principal)

        hb_debt_service = hb_interest + hb_principal
        hb_rest = max(0.0, hb_rest - hb_principal)

        # KFW LOAN ANNUITÄT
        kfw_interest = kfw_rest * (payload.kfw_zins or 0.021)
        if year <= (payload.kfw_grace_years or 0) or kfw_rest <= 0:
            kfw_principal = 0.0
            kfw_interest = 0.0
        else:
            calculated_kfw_principal = max(0.0, kfw_annuity_constant - kfw_interest)
            kfw_principal = min(kfw_rest, calculated_kfw_principal)

        kfw_debt_service = kfw_interest + kfw_principal
        kfw_rest = max(0.0, kfw_rest - kfw_principal)

        total_interest = hb_interest + kfw_interest
        total_principal = hb_principal + kfw_principal
        total_debt_service = hb_debt_service + kfw_debt_service
        total_remaining_debt = hb_rest + kfw_rest

        # AfA
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

        taxable_income = effective_rent - total_non_rec_costs - total_interest - afa_amount
        tax_amount = taxable_income * tax_rate

        net_cashflow = effective_rent - total_non_rec_costs - capex_current - total_debt_service - tax_amount

        property_value *= (1.0 + (payload.val_inc or 0.01))

        # CASHFLOW FÜR IRR HINZUFÜGEN
        cashflows_for_irr.append(net_cashflow)

        projection.append({
            "Jahr": year,
            "Mieteinnahmen IST": round(annual_rent_base, 2),
            "Effektive Miete": round(effective_rent, 2),
            "Bewirtschaftungskosten": round(total_non_rec_costs, 2),
            "Capex": round(capex_current, 2),
            "Zinsen": round(total_interest, 2),
            "Tilgung": round(total_principal, 2),
            "AfA": round(afa_amount, 2),
            "Steuer": round(tax_amount, 2),
            "Cashflow Netto": round(net_cashflow, 2),
            "Restschuld": round(total_remaining_debt, 2),
            "Immobilienwert": round(property_value, 2)
        })

        # SCHLEIFE BEENDEN, WENN VOLLSTÄNDIG GETILGT UND MINDESTENS JAHR 30 ERREICHT
        if total_remaining_debt <= 0 and year >= 30:
            break

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
