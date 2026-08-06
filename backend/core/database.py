import os
from typing import Optional, List, Dict, Any
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase Init Warnung: {e}")


def get_supabase_client() -> Optional[Client]:
    return supabase


def save_property_to_db(payload_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not supabase:
        raise Exception("Supabase ist im Backend nicht konfiguriert.")
    
    res = supabase.table("properties").insert(payload_data).execute()
    return res.data


def fetch_properties_from_db() -> List[Dict[str, Any]]:
    if not supabase:
        return []
    
    res = supabase.table("properties").select("*").order("id", desc=True).execute()
    return res.data or []


def delete_property_from_db(property_id: int) -> Any:
    if not supabase:
        raise Exception("Supabase nicht konfiguriert.")
    
    res = supabase.table("properties").delete().eq("id", property_id).execute()
    return res.data


def update_property_status_in_db(property_id: int, new_status: str):
    supabase = get_supabase_client()
    res = supabase.table("properties").update({"status": new_status}).eq("id", property_id).execute()
    return res.data
