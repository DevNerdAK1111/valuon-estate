from fastapi import APIRouter, HTTPException
from schemas import CalculatePayload
from core.calculations import calculate_investment_metrics

router = APIRouter(prefix="/api", tags=["Calculation"])


@router.post("/calculate")
async def calculate_investment(payload: CalculatePayload):
    try:
        results = calculate_investment_metrics(payload)
        return results
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Berechnungsfehler: {str(e)}")
