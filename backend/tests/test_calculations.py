import math
import pytest
from core.calculations import calculate_investment_metrics, calculate_irr


def test_calculate_irr_standard():
    # Testfall: -100k Investment, 10k jährlicher Cashflow über 9 Jahre + 110k Exit in Jahr 10
    cashflows = [-100000.0] + [10000.0] * 9 + [110000.0]
    irr = calculate_irr(cashflows)
    assert round(irr, 4) == 0.1000  # Exakt 10.0 % IRR


def test_calculate_irr_invalid_or_empty():
    assert calculate_irr([]) == 0.0
    assert calculate_irr([-100000.0]) == 0.0
    assert calculate_irr([10000.0, 10000.0]) == 0.0  # Kein negatives Initialinvestment


def test_grace_years_interest_payment():
    # Testfall: 1 Jahr tilgungsfrei -> Zins muss anfallen, Tilgung im 1. Jahr muss 0 sein
    payload = {
        "kaufpreis": 100000.0,
        "qm": 50.0,
        "ek_euro": 0.0,
        "hb_zins": 0.04,  # 4% Zins
        "hb_tilg": 0.02,  # 2% Tilgung
        "grace_years": 1,
        "kaltmiete_monat": 500.0,
    }
    res = calculate_investment_metrics(payload)
    year1 = res["projection"][0]

    assert year1["tilgung"] == 0.0
    assert year1["zins"] > 0.0


def test_linear_afa_calculation():
    # Gebäudewert = 200.000 € * 80% = 160.000 €. 2% AfA = 3.200 € p.a.
    payload = {
        "kaufpreis": 200000.0,
        "qm": 100.0,
        "gebaeude_anteil_pct": 80.0,
        "afa_model": "Linear Standard",
        "afa_lin": 0.02,
        "kaltmiete_monat": 800.0,
    }
    res = calculate_investment_metrics(payload)
    year1 = res["projection"][0]

    assert year1["afaEuro"] == 3200.0


def test_degressiv_and_sonder_afa():
    # Baukostenobergrenze 5.200 €/m² Check: Kaufpreis 200k / 50qm = 4.000 €/m² (berechtigt)
    payload = {
        "kaufpreis": 200000.0,
        "qm": 50.0,
        "gebaeude_anteil_pct": 80.0,  # Gebäudewert = 160.000 €
        "afa_model": "Kombination: Degressiv + Sonder-AfA",
        "kaltmiete_monat": 1000.0,
    }
    res = calculate_investment_metrics(payload)
    year1 = res["projection"][0]

    # Degressiv: 5% von 160.000 € = 8.000 €
    # Sonder-AfA: 5% von min(160.000, 4.000 * 50) = 5% von 160.000 € = 8.000 €
    # Gesamt AfA Jahr 1 = 16.000 €
    assert year1["afaEuro"] == 16000.0


def test_denkmal_afa():
    payload = {
        "kaufpreis": 100000.0,
        "qm": 50.0,
        "gebaeude_anteil_pct": 80.0,  # Altbestand = 80.000 € -> 2% = 1.600 €
        "afa_model": "Denkmalgeschützt",
        "denkmal_sanierung_euro": 50000.0,  # 9% = 4.500 € p.a.
        "denkmal_fertigstellung_jahr": 1,
        "kaltmiete_monat": 600.0,
    }
    res = calculate_investment_metrics(payload)
    year1 = res["projection"][0]

    assert year1["afaEuro"] == 16000.0 * 0.02 + 50000.0 * 0.09  # 1.600 + 4.500 = 6.100 €
    assert year1["afaEuro"] == 6100.0


def test_capex_integration():
    payload = {
        "kaufpreis": 100000.0,
        "qm": 50.0,
        "kaltmiete_monat": 500.0,
        "capex_list": [
            {"jahr": 3, "betrag": 5000.0}
        ]
    }
    res = calculate_investment_metrics(payload)
    year1 = res["projection"][0]
    year3 = res["projection"][2]

    assert year1["capex"] == 0.0
    assert year3["capex"] == 5000.0
