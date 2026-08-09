import pytest
from core.calculations import calculate_investment_metrics, calculate_irr


def test_calculate_irr_standard():
    # Testfall: -100k Investment, 10k jährlicher Cashflow über 10 Jahre + 100k Exit
    cashflows = [-100000.0] + [10000.0] * 9 + [110000.0]
    irr = calculate_irr(cashflows)
    assert round(irr, 4) == 0.1000  # Exakt 10.0 % IRR


def test_grace_years_interest_payment():
    # Testfall: 1 Jahr tilgungsfrei -> Zins muss anfallen, Tilgung 0
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

    # Im 1. Jahr muss Zins = 100.000 * 0.04 + Nebenkosten-Zins bezahlt werden, Tilgung = 0
    assert year1["tilgung"] == 0.0
    assert year1["zins"] > 0.0


def test_linear_afa_calculation():
    payload = {
        "kaufpreis": 200000.0,
        "qm": 100.0,
        "gebaeude_anteil_pct": 80.0,  # Gebäudewert = 160.000 €
        "afa_model": "Linear Standard",
        "afa_lin": 0.02,  # 2% AfA = 3.200 € p.a.
        "kaltmiete_monat": 800.0,
    }
    res = calculate_investment_metrics(payload)
    year1 = res["projection"][0]

    assert year1["afaEuro"] == 3200.0
