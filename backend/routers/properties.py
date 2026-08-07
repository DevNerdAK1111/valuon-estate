from typing import Union
from fastapi import APIRouter, HTTPException
from schemas import PropertyDatabasePayload, PropertyStatusUpdatePayload
from core.database import (
    save_property_to_db,
    fetch_properties_from_db,
    delete_property_from_db,
    update_property_status_in_db
)

router = APIRouter(prefix="/api/properties", tags=["Properties"])


@router.post("")
async def save_property(payload: PropertyDatabasePayload):
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
            "status": payload.status or "pipeline",
            "form_data": payload.form_data,
            "capex_list": payload.capex_list
        }
        res_data = save_property_to_db(data)
        return {"status": "success", "data": res_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {str(e)}")


@router.get("")
async def get_properties():
    try:
        properties = fetch_properties_from_db()
        return {"properties": properties}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Laden: {str(e)}")


@router.patch("/{property_id}")
async def update_property_status(property_id: Union[int, str], payload: PropertyStatusUpdatePayload):
    try:
        res_data = update_property_status_in_db(property_id, payload.status)
        return {"status": "updated", "data": res_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren: {str(e)}")


@router.delete("/{property_id}")
async def delete_property(property_id: Union[int, str]):
    try:
        res_data = delete_property_from_db(property_id)
        return {"status": "deleted", "data": res_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Löschen: {str(e)}")
