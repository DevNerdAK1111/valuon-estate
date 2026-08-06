import numpy as np
from constants import GRUNDERWERBSTEUER_MAP


def fmt_de(val, decimals=2, suffix=""):
    if val is None or np.isnan(val):
        return "-"
    formatted = f"{val:,.{decimals}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"{formatted} {suffix}".strip() if suffix else formatted


def fmt_eur(val, decimals=0):
    return fmt_de(val, decimals, "€")


def fmt_pct(val, decimals=2):
    return fmt_de(val, decimals, "%")


def fmt_sqm(val, decimals=0):
    return fmt_de(val, decimals, "m²")


def get_smart_defaults(baujahr, objektart):
    bj = int(baujahr) if baujahr else 2000
    obj = str(objektart) if objektart else "Eigentumswohnung"
    age = max(0, 2026 - bj)

    if any(k in obj for k in ["Mehrfamilienhaus", "Einfamilienhaus", "Zweifamilienhaus", "Reihenhaus", "Wohn- und Geschäftshaus"]):
        category = "MFH"
    elif "Gewerbe" in obj:
        category = "GEWERBE"
    else:
        category = "ETW"

    if age < 5:
        inst = 7.0 if category == "ETW" else (10.0 if category == "MFH" else 6.0)
    elif age <= 15:
        inst = 9.0 if category == "ETW" else (14.0 if category == "MFH" else 8.0)
    elif age <= 30:
        inst = 12.0 if category == "ETW" else (18.0 if category == "MFH" else 10.0)
    else:
        inst = 16.0 if category == "ETW" else (24.0 if category == "MFH" else 14.0)

    if "Mikroapartment" in obj:
        mgt = 45.0
    elif category == "MFH":
        mgt = 20.0
    elif category == "GEWERBE":
        mgt = 40.0
    else:
        mgt = 30.0

    if "Mikroapartment" in obj:
        vac = 4.0
    elif category == "GEWERBE":
        vac = 7.5
    else:
        vac = 2.0

    return inst, mgt, vac


def check_input_sanity(d: dict) -> list:
    warnings = []
    if d.get('hb_zins', 0) > 0.15:
        warnings.append(f"Zinssatz Hausbank ({fmt_pct(d['hb_zins'] * 100)}) ist ungewöhnlich hoch.")
    if d.get('tax_rate', 0) > 0.50:
        warnings.append(f"Grenzsteuersatz ({fmt_pct(d['tax_rate'] * 100)}) liegt über dem Höchstsatz.")
    return warnings
