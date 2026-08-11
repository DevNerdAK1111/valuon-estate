import os
import json
import tempfile
import cloudscraper
import time
from bs4 import BeautifulSoup
import google.generativeai as genai

def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "")

def fetch_text_from_url(url: str) -> str:
    try:
        scraper = cloudscraper.create_scraper(browser={
            'browser': 'chrome',
            'platform': 'windows',
            'desktop': True
        })
        response = scraper.get(url, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for element in soup(["script", "style", "header", "footer", "nav", "noscript"]):
            element.extract()
            
        return ' '.join(line.strip() for line in soup.get_text(separator=' ').splitlines() if line.strip())
    except Exception as e:
        print(f"Fehler beim Abrufen der URL mit Cloudscraper: {e}")
        return ""

# ÄNDERUNG: Akzeptiert jetzt direkt pdf_bytes
def analyze_property_data(raw_text: str = "", pdf_bytes: bytes = None, api_key: str = None) -> dict:
    key = api_key or get_gemini_api_key()
    if not key:
        raise Exception("Kein GEMINI_API_KEY konfiguriert.")

    tmp_file_path = None
    gemini_file = None

    try:
        genai.configure(api_key=key)
        
        prompt = """
        Du bist ein hochpräziser Immobilien-Datenanalyst.
        Analysiere die folgenden Immobilien-Daten (Text oder PDF) und extrahiere NUR die relevanten Fakten.
        
        Verwende EXAKT diese JSON-Struktur und Datentypen. Erfinde keine eigenen Felder.
        Falls ein Wert nicht zu finden ist, setze numerische Werte auf 0.0 und Strings auf "".
        
        {
            "obj_name": "Titel der Anzeige oder Adresse (max 50 Zeichen)",
            "objektart": "Eigentumswohnung", # Aus: Eigentumswohnung, Einfamilienhaus, Zweifamilienhaus, Reihenhaus / Doppelhaushälfte, Mehrfamilienhaus, Wohn- und Geschäftshaus, Sonstiges
            "bundesland": "Bundesland, falls erkennbar",
            "stadt": "Stadtname",
            "stadtteil": "Stadtteilname",
            "kaufpreis": 0.0,
            "qm": 0.0,
            "baujahr": 2000,
            "kaltmiete_monat": 0.0,
            "hausgeld": 0.0,
            "sanierung": 0.0
        }
        """
        
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        contents = [prompt]
        
        # ÄNDERUNG: Arbeitet direkt mit den Bytes der echten Datei
        if pdf_bytes:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(pdf_bytes)
                tmp_file_path = tmp.name
            
            gemini_file = genai.upload_file(tmp_file_path, mime_type="application/pdf")
            
            while gemini_file.state.name == "PROCESSING":
                print("Warte auf Gemini-Verarbeitung des PDFs...")
                time.sleep(2)
                gemini_file = genai.get_file(gemini_file.name)
                
            if gemini_file.state.name == "FAILED":
                raise Exception("Gemini konnte das PDF nicht verarbeiten.")
                
            contents.append(gemini_file)
            
        if raw_text:
            contents.append(f"Hier ist der extrahierte Text:\n{raw_text[:15000]}")
            
        response = model.generate_content(
            contents,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Fehler bei KI-Analyse: {e}")
        raise Exception(f"Gemini API Fehler: {str(e)}")
        
    finally:
        if gemini_file:
            try:
                genai.delete_file(gemini_file.name)
            except Exception as cleanup_err:
                print(f"Fehler beim Löschen der Gemini Datei: {cleanup_err}")
                
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)
