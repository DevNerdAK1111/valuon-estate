import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_calculate_endpoint_success():
    payload = {
        "obj_name": "Test Eigentumswohnung",
        "kaufpreis": 150000.0,
        "qm": 60.0,
        "kaltmiete_monat": 750.0,
        "hb_zins": 3.8,
        "hb_tilg": 2.0,
        "ek_euro": 30000.0,
        "tax_rate_pct": 42.0
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "summary" in data
    assert "kpis" in data
    assert "projection" in data
    assert len(data["projection"]) >= 10
    assert data["stammDaten"]["kaufpreis"] == 150000.0


def test_calculate_endpoint_invalid_payload():
    # Kaufpreis als ungültiger String
    payload = {
        "kaufpreis": "Ungültig",
        "qm": 50.0
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


def test_properties_get_endpoint():
    response = client.get("/api/properties")
    assert response.status_code == 200
    data = response.json()
    assert "properties" in data
    assert isinstance(data["properties"], list)


def test_ai_analysis_missing_input():
    # Leerer Request ohne Text oder URL
    payload = {}
    response = client.post("/api/ai-analysis", json=payload)
    assert response.status_code == 400
