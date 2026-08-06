'use client';
import { IconArrowRight, IconLock, IconFolder } from '../ui/Icons';
import { formatEuroInt } from '../../utils/formatters';

export default function StartseiteView({
  greetingName,
  setNavChoice,
  setDevNotice,
  loadingDb,
  dbProperties,
  loadPropertyFromDb
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* WILLKOMMENS-BANNER */}
      <div style={{
        background: '#13381A',
        color: '#FAF8F5',
        padding: '2.5rem',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(19,56,26,0.2)'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
            Dein Investment-Dashboard
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Willkommen zurück, {greetingName}
          </h2>
          <p style={{ margin: 0, color: '#A0AEC0', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Kalkuliere renditestarke Immobilien-Deals, simuliere AfA-Steuervorteile und verwalte dein Bestandskonto an einem Ort.
          </p>
        </div>

        <button
          onClick={() => setNavChoice('Analyse')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 28px',
            background: '#A37841',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(163,120,65,0.4)'
          }}
        >
          Neues Objekt analysieren <IconArrowRight />
        </button>
      </div>

      {/* MODULE & FEATURE-KARTEN */}
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#13381A', marginBottom: '1rem' }}>
          Funktionen & Analyse-Module
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          
          <div style={{ background: 'white', border: '2px solid #13381A', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(19,56,26,0.08)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#38A169', fontSize: '0.8rem', fontWeight: '800' }}>● Aktiv</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Investitions-Analyse</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A5568', lineHeight: '1.5' }}>
                Berechne echten Netto-Cashflow, Eigenkapitalrendite und steuerliche AfA-Vorteile deiner Wunsch-Immobilie.
              </p>
            </div>
            <button onClick={() => setNavChoice('Analyse')} style={{ marginTop: '1.5rem', padding: '11px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
              Rechner starten →
            </button>
          </div>

          <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#38A169', fontSize: '0.8rem', fontWeight: '800' }}>● Aktiv</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Objekt-Datenbank</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A5568', lineHeight: '1.5' }}>
                Alle kalkulierten Objekte im Überblick. Vergleiche Kennzahlen, lade alte Deals und behalte die Übersicht.
              </p>
            </div>
            <button onClick={() => setNavChoice('Objekt Datenbank')} style={{ marginTop: '1.5rem', padding: '11px', background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
              Zur Datenbank →
            </button>
          </div>

          <div onClick={() => setDevNotice('Multi-Objekt Portfolio-Dashboard')} style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLock /> In Entwicklung</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Portfolio Aggregator</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A5568', lineHeight: '1.5' }}>
                Führe deine Objekte zu einer Gesamtbilanz zusammen. Sieh deinen monatlichen Gesamtcashflow und Vermögensaufbau.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#A37841', fontWeight: '800' }}>Vorschau anzeigen →</div>
          </div>

          <div onClick={() => setDevNotice('Szenario-Vergleich & Stresstest')} style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLock /> In Entwicklung</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Szenario-Vergleich</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A5568', lineHeight: '1.5' }}>
                Stressteste deine Deals: Simuliere steigende Zinsen, Mietausfälle und unterschiedliche Eigenkapital-Einsätze.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#A37841', fontWeight: '800' }}>Vorschau anzeigen →</div>
          </div>

          <div onClick={() => setDevNotice('Bank-Exposé PDF-Generator')} style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLock /> In Entwicklung</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Bank-Exposé Generator</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A5568', lineHeight: '1.5' }}>
                Erstelle auf Knopfdruck ein Bank-Dossier als PDF – inklusive Cashflow-Prognose und Beleihungswert.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#A37841', fontWeight: '800' }}>Vorschau anzeigen →</div>
          </div>

          <div onClick={() => setDevNotice('KI-Exposé Scanner & Text-Parser')} style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLock /> In Entwicklung</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>KI-Exposé Scanner</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A5568', lineHeight: '1.5' }}>
                Füge den Angebotstext aus ImmoScout & Co. ein. Die KI liest Kaufpreis, Miete und Baujahr automatisch aus.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#A37841', fontWeight: '800' }}>Vorschau anzeigen →</div>
          </div>

        </div>
      </div>

      {/* QUICK-LOAD SEKTION */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#13381A', fontWeight: '800' }}>Deine gespeicherten Objekte (Quick Load)</h3>
          <button onClick={() => setNavChoice('Objekt Datenbank')} style={{ background: 'none', border: 'none', color: '#A37841', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
            Alle Objekte anzeigen →
          </button>
        </div>

        {loadingDb ? (
          <div style={{ fontSize: '0.85rem', color: '#718096', padding: '1rem 0' }}>Lade Objekte aus der Datenbank...</div>
        ) : dbProperties.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#718096', padding: '1rem 0' }}>Noch keine Objekte in deiner Datenbank gespeichert.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {dbProperties.slice(0, 3).map((item, idx) => (
              <div key={item.id || idx} style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#13381A', fontSize: '0.95rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name || item.obj_name || 'Unbenanntes Objekt'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                    {item.stadt || 'Keine Stadt'} · {formatEuroInt(item.kaufpreis)} € · {item.qm} m²
                  </div>
                </div>
                <button
                  onClick={() => loadPropertyFromDb(item)}
                  style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: '#13381A', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  <IconFolder /> In Analyse laden
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
