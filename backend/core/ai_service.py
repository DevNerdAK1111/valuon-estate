import os
import json
import io
import re
from pypdf import PdfReader
from openai import OpenAI
from playwright.async_api import async_playwright

def get_openai_api_key() -> str:
    return os.getenv("OPENAI_API_KEY", "")

async def fetch_text_from_url(url: str) -> str:
    url = url.strip()
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            
            # Verbesserte Tarnung: Wir simulieren einen echten Mac-Nutzer mit deutschem Chrome
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                locale="de-DE",
                timezone_id="Europe/Berlin"
            )
            page = await context.new_page()
            
            # Warten, bis das Netzwerk komplett ruhig ist (wichtig für ImmoScout, da viel nachgeladen wird)
            await page.goto(url, timeout=30000, wait_until="networkidle")
            
            # Ein kleiner künstlicher Delay von 2 Sekunden, um letzte Skripte laden zu lassen
            await page.wait_for_timeout(2000)
            
            # Gesamten Text der Seite ziehen
            page_text = await page.evaluate("document.body.innerText")
            
            # Guardrail entfernt: Wir übergeben den Text jetzt immer direkt an OpenAI.
            await browser.close()
            return page_text
            
    except Exception as e:
        print(f"Fehler beim Abrufen der URL mit Playwright: {e}")
        raise Exception(f"Fehler beim Laden der Webseite: {str(e)}")

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
