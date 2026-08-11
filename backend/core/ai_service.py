import os
import json
import cloudscraper
import io
from pypdf import PdfReader
from bs4 import BeautifulSoup
from openai import OpenAI

def get_openai_api_key() -> str:
    return os.getenv("OPENAI_API_KEY", "")

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

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Fehler bei der lokalen PDF-Textextraktion: {e}")
        return ""

def analyze_property_data(raw_text: str = "", pdf_bytes: bytes = None, api_key: str = None) -> dict:
    key = api_key or get_openai_api_key()
    if not key:
        raise Exception("Kein OPENAI_API_KEY konfiguriert.")

    try:
        client = OpenAI(api_key=key)
        
        combined_text = raw_text
        
        if pdf_bytes:
            pdf_text = extract_text_from_pdf(pdf_bytes)
            if pdf_text:
                combined_text += f"\n\n--- INHALT AUS PDF ---\n{pdf_text}"
                
        if not combined_text.strip():
            raise Exception("Weder Text noch lesbarer PDF-Inhalt gefunden.")

        prompt = f"""
        Du bist ein hochpräziser Immobilien-Datenanalyst.
        Analysiere die folgenden Immobilien-Daten und extrahiere NUR die relevanten Fakten.
        
        Verwende EXAKT diese JSON-Struktur und Datentypen. Erfinde keine eigenen Felder.
        Falls ein Wert nicht zu finden ist, setze numerische Werte auf 0.0 und Strings auf "".
        
        {{
            "obj_name": "Titel der Anzeige oder Adresse (max 50 Zeichen)",
            "objektart": "Eigentumswohnung",
            "bundesland": "Bundesland, falls erkennbar",
            "stadt": "Stadtname",
            "stadtteil": "Stadtteilname",
            "kaufpreis": 0.0,
            "qm": 0.0,
            "baujahr": 2000,
            "kaltmiete_monat": 0.0,
            "hausgeld": 0.0,
            "sanierung": 0.0
        }}
        
        Hier sind die extrahierten Daten:
        {combined_text[:25000]}
        """
        
        # Native JSON-Erzwingung durch OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": "Du bist ein hilfreicher Assistent, der ausschließlich in validem JSON antwortet."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Fehler bei KI-Analyse: {e}")
        raise Exception(f"OpenAI API Fehler: {str(e)}")
