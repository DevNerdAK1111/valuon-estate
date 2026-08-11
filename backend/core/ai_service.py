import os
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai

def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "")

def fetch_text_from_url(url: str) -> str:
    try:
        # Basis-Scraper. Hinweis: Große Portale blocken dies oft (403 Forbidden).
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
        }
        response = requests.get(url, headers=headers, timeout=12)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        for element in soup(["script", "style", "header", "footer", "nav", "noscript"]):
            element.extract()
        return ' '.join(line.strip() for line in soup.get_text(separator=' ').splitlines() if line.strip())
    except Exception as e:
        print(f"Fehler beim Abrufen der URL: {e}")
        return ""

def analyze_text_with_gemini(raw_text: str, api_key: str = None) -> dict:
    key = api_key or get_gemini_api_key()
    if not key:
        raise Exception("Kein GEMINI_API_KEY im Backend konfiguriert.")

    try:
        genai.configure(api_key=key)
        
        prompt = f"""
        Du bist ein hochpräziser Immobilien-Datenanalyst.
        Analysiere den folgenden Immobilien-Anzeigentext (Exposé) und extrahiere NUR die relevanten Fakten.
        
        Verwende EXAKT diese JSON-Struktur und Datentypen. Erfinde keine eigenen Felder:
        {{
            "obj_name": "Titel der Anzeige oder Adresse (max 50 Zeichen)",
            "objektart": "Eigentumswohnung", # Wähle aus: Eigentumswohnung, Einfamilienhaus, Zweifamilienhaus, Reihenhaus / Doppelhaushälfte, Mehrfamilienhaus, Wohn- und Geschäftshaus, Gewerbeimmobilie / Sonstiges
            "bundesland": "Bundesland, falls erkennbar",
            "stadt": "Stadtname",
            "stadtteil": "Stadtteilname",
            "kaufpreis": 0.0, # Float
            "qm": 0.0, # Float (Wohnfläche)
            "baujahr": 2000, # Int
            "kaltmiete_monat": 0.0, # Float (Ist-Kaltmiete pro Monat, falls vermietet)
            "hausgeld": 0.0, # Float (Hausgeld pro Monat)
            "sanierung": 0.0 # Float (Falls Sanierungskosten explizit genannt sind)
        }}
        
        Falls ein Wert im Text absolut nicht zu finden ist, setze numerische Werte auf 0.0 bzw. 0 und Strings auf "".
        
        Hier ist der Exposé-Text:
        {raw_text[:10000]}
        """
        
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Fehler bei KI-Analyse: {e}")
        raise Exception(f"Gemini API Fehler: {str(e)}")
