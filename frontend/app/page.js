'use client';
import { useState } from 'react';

// ⚠️ ERSETZE HIER DEINE ECHTE RENDER-URL (ohne Schrägstrich am Ende)
const BACKEND_URL = 'https://valuon-estate-backend.onrender.com';

export default function Home() {
  const [formData, setFormData] = useState({
    kaufpreis: 250000,
    qm: 75,
    ist_sqm: 11.5,
    hb_zins: 3.8,
    hb_tilg: 2.0,
    ek_euro: 50000,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Berechnung im Backend');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Verbindung zum Backend fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '3rem 4rem', background: '#F7F4EC', color: '#13381A' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2D9CE', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#A37841', marginBottom: '4px' }}>
            Institutional Grade Suite
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', margin: 0 }}>
            Valuon Estate
          </h1>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#555759', fontWeight: '500' }}>
          Next.js Enterprise Frontend
        </div>
      </div>

      {/* Grid Layout (Volle Breite, kein Quetschen!) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
        
        {/* Eingabemaske */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 v 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '700' }}>Objektdaten & Finanzierung</h3>
          
          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#555759' }}>Kaufpreis (€)</label>
              <input type="number" name="kaufpreis" value={formData.kaufpreis} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#555759' }}>Wohnfläche (qm)</label>
                <input type="number" name="qm" value={formData.qm} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#555759' }}>Ist-Miete (€/qm)</label>
                <input type="number" step="0.1" name="ist_sqm" value={formData.ist_sqm} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#555759' }}>Soll-Zins (%)</label>
                <input type="number" step="0.1" name="hb_zins" value={formData.hb_zins} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#555759' }}>Tilgung (%)</label>
                <input type="number" step="0.1" name="hb_tilg" value={formData.hb_tilg} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#555759' }}>Eigenkapital (€)</label>
              <input type="number" name="ek_euro" value={formData.ek_euro} onChange={handleChange} style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '14px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
              {loading ? 'Berechne in der Cloud...' : 'Investition analysieren'}
            </button>
          </form>

          {error && <div style={{ marginTop: '1rem', padding: '10px', background: '#FDE8E8', color: '#9B1C1C', borderRadius: '6px', fontSize: '0.85rem' }}>{error}</div>}
        </div>

        {/* Ergebnisanzeige */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '700' }}>Investment-Ergebnisse</h3>

          {!result ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#888', border: '2px dashed #E2D9CE', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>Noch keine Berechnung durchgeführt.</p>
              <p style={{ fontSize: '0.85rem', margin: '5px 0 0 0' }}>Klicke links auf "Investition analysieren".</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <MetricCard title="Gesamtinvestment" value={`${result.summary.total_investment.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`} />
                <MetricCard title="Eigenkapitalbedarf" value={`${result.summary.equity_absolute.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`} />
                <MetricCard title="IRR (Rendite)" value={`${(result.summary.irr * 100).toFixed(2)} %`} highlight={true} />
                <MetricCard title="AfA-Basis" value={`${result.summary.afa_base.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`} />
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Projektionsverlauf (Vorschau Jahr 1)</h4>
              {result.projection && result.projection.length > 0 && (
                <div style={{ background: '#FAF8F5', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #E2D9CE' }}>
                  <div><strong>Mieteinnahmen (Jahr 1):</strong> {result.projection[0]['Mieteinnahmen IST']?.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</div>
                  <div><strong>Cashflow Netto (Jahr 1):</strong> {result.projection[0]['Cashflow Netto']?.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</div>
                  <div><strong>Restschuld (Ende Jahr 1):</strong> {result.projection[0]['Restschuld']?.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

// Hilfskomponente für Kennzahlen-Karten
function MetricCard({ title, value, highlight = false }) {
  return (
    <div style={{ background: highlight ? '#F4EFE6' : '#FAF8F5', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2D9CE' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#555759', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: highlight ? '#A37841' : '#13381A' }}>{value}</div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #CCC',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'box-sizing'
};
