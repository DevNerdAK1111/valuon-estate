'use client';
import { useState } from 'react';

const BACKEND_URL = 'https://valuon-estate-backend.onrender.com'; // Ersetze dies mit deiner echten Render-URL

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [navChoice, setNavChoice] = useState('Analyse');

  const [formData, setFormData] = useState({
    obj_name: 'Beispielobjekt',
    objektart: 'Eigentumswohnung',
    bundesland: 'Niedersachsen',
    kaufpreis: 250000.0,
    qm: 75.0,
    baujahr: 2000,
    sanierung: 0.0,
    grund_anteil: 0.20,
    grwt_p: 5.0,
    notar_p: 2.0,
    makler_p: 3.57,
    sonst_nk: 0.0,
    disagio_p: 0.0,
    ek_euro: 50000.0,
    ek_quote: 0.20,
    loan_type: 'Annuitätendarlehen',
    hb_zins: 3.8,
    hb_tilg: 2.0,
    grace_years: 0,
    kfw_amt: 0.0,
    kfw_zins: 2.1,
    kfw_tilg: 3.0,
    kfw_grace_years: 0,
    kfw_grant: 0.0,
    sondertilg: 0.0,
    ist_sqm: 11.5,
    target_sqm: 13.0,
    adj_year: 3,
    park: 0.0,
    vac_rate_pct: 2.0,
    hausgeld: 250.0,
    hausgeld_nicht_umlegbar: 80.0,
    inst_sqm: 12.0,
    mgt_monat: 30.0,
    capex_j3: 0.0,
    capex_j6: 0.0,
    tax_rate_pct: 42.0,
    afa_model: '1_Linear_Standard',
    afa_lin: 2.0,
    miet_inc: 1.5,
    cost_inc: 2.0,
    val_inc: 1.5,
    wacc: 6.0,
    exit_cost: 2.0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        grwt_proz: formData.grwt_p / 100,
        notar_proz: formData.notar_p / 100,
        makler_proz: formData.makler_p / 100,
        disagio_proz: formData.disagio_p / 100,
        vac_rate: formData.vac_rate_pct / 100,
        tax_rate: formData.tax_rate_pct / 100,
      };

      const res = await fetch(`${BACKEND_URL}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Fehler bei der Verbindung zum Backend');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <main style={{ minHeight: '100vh', background: '#13381A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#F7F4EC', padding: '3rem', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#A37841', marginBottom: '8px' }}>Institutional Grade Suite</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#13381A', margin: '0 0 10px 0' }}>Valuon Estate</h1>
          <p style={{ color: '#555759', marginBottom: '2rem', fontSize: '0.95rem' }}>Die hochentwickelte Analyse- und Bewertungsumgebung.</p>
          <button 
            onClick={() => { setAuthenticated(true); setUserEmail('developer@valuon-estate.de'); }}
            style={{ width: '100%', padding: '14px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
          >
            Als Entwickler einloggen (Permanenter Modus)
          </button>
        </div>
      </main>
    );
  }

  const navItems = ['Objekt Datenbank', 'Analyse', 'Immobilienwissen', 'Einstellungen'];

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 4rem', background: '#F7F4EC', color: '#13381A' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2D9CE', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.8px', color: '#13381A', lineHeight: '1.1' }}>Valuon Estate</div>
          <div style={{ fontSize: '0.85rem', color: '#A37841', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>Investment Suite</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#555759' }}>Konto: {userEmail}</span>
          <button onClick={() => setAuthenticated(false)} style={{ padding: '8px 16px', background: '#D9534F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Abmelden
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${navItems.length}, 1fr)`, gap: '1rem', marginBottom: '2rem' }}>
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setNavChoice(item)}
            style={{
              padding: '12px',
              background: navChoice === item ? '#13381A' : 'white',
              color: navChoice === item ? 'white' : '#13381A',
              border: '1px solid #E2D9CE',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', marginBottom: '2rem' }} />

      {navChoice === 'Objekt Datenbank' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Objekt Datenbank & Pipeline</h2>
          <p style={{ color: '#555759' }}>Verwaltung aller gespeicherten Immobilienobjekte.</p>
        </div>
      )}

      {navChoice === 'Analyse' && (
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
            
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid #E2D9CE', paddingBottom: '10px' }}>1. Objektdaten & Stammdaten</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Objektname</label>
                  <input type="text" name="obj_name" value={formData.obj_name} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Objektart</label>
                  <input type="text" name="objektart" value={formData.objektart} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Kaufpreis (€)</label>
                  <input type="number" name="kaufpreis" value={formData.kaufpreis} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Fläche (qm)</label>
                  <input type="number" name="qm" value={formData.qm} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Baujahr</label>
                  <input type="number" name="baujahr" value={formData.baujahr} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Sanierungskosten (€)</label>
                  <input type="number" name="sanierung" value={formData.sanierung} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Grundstücksanteil (%)</label>
                  <input type="number" step="0.01" name="grund_anteil" value={formData.grund_anteil} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid #E2D9CE', paddingBottom: '10px', paddingTop: '10px' }}>2. Kaufnebenkosten</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>GrESt (%)</label>
                  <input type="number" step="0.1" name="grwt_p" value={formData.grwt_p} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Notar (%)</label>
                  <input type="number" step="0.1" name="notar_p" value={formData.notar_p} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Makler (%)</label>
                  <input type="number" step="0.01" name="makler_p" value={formData.makler_p} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sonst. NK (€)</label>
                  <input type="number" name="sonst_nk" value={formData.sonst_nk} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid #E2D9CE', paddingBottom: '10px', paddingTop: '10px' }}>3. Finanzierung & EK</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Eigenkapital (€)</label>
                  <input type="number" name="ek_euro" value={formData.ek_euro} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Disagio (%)</label>
                  <input type="number" step="0.1" name="disagio_p" value={formData.disagio_p} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>HBB Zins (%)</label>
                  <input type="number" step="0.1" name="hb_zins" value={formData.hb_zins} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>HBB Tilgung (%)</label>
                  <input type="number" step="0.1" name="hb_tilg" value={formData.hb_tilg} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>tilg.-fr. Jahre</label>
                  <input type="number" name="grace_years" value={formData.grace_years} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid #E2D9CE', paddingBottom: '10px', paddingTop: '10px' }}>4. Miete & Bewirtschaftung</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Ist-Miete (€/qm)</label>
                  <input type="number" step="0.1" name="ist_sqm" value={formData.ist_sqm} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Soll-Miete (€/qm)</label>
                  <input type="number" step="0.1" name="target_sqm" value={formData.target_sqm} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Hausgeld (€)</label>
                  <input type="number" name="hausgeld" value={formData.hausgeld} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nicht umlegbar (€)</label>
                  <input type="number" name="hausgeld_nicht_umlegbar" value={formData.hausgeld_nicht_umlegbar} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Instandhaltung (€/qm)</label>
                  <input type="number" name="inst_sqm" value={formData.inst_sqm} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid #E2D9CE', paddingBottom: '10px', paddingTop: '10px' }}>5. Steuern & Makro</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Steuersatz (%)</label>
                  <input type="number" step="1" name="tax_rate_pct" value={formData.tax_rate_pct} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Mietsteigerung (%)</label>
                  <input type="number" step="0.1" name="miet_inc" value={formData.miet_inc} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Kostensteigerung (%)</label>
                  <input type="number" step="0.1" name="cost_inc" value={formData.cost_inc} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '14px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? 'Berechne vollständige Analyse...' : 'Vollständige Analyse starten'}
              </button>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '700' }}>Investment-Auswertung & Cashflows</h3>
              {!result ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#888', border: '2px dashed #E2D9CE', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>Führe die Analyse aus, um alle Ergebnisse zu sehen.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <MetricCard title="Gesamtinvestment" value={`${result.summary.total_investment.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`} />
                    <MetricCard title="Eigenkapitalbedarf" value={`${result.summary.equity_absolute.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`} />
                    <MetricCard title="IRR (Rendite)" value={`${(result.summary.irr * 100).toFixed(2)} %`} highlight={true} />
                    <MetricCard title="AfA-Basis" value={`${result.summary.afa_base.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`} />
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Projektionsverlauf (Jahre)</h4>
                  <div style={{ maxHeight: '450px', overflowY: 'auto', border: '1px solid #E2D9CE', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#FAF8F5', borderBottom: '1px solid #E2D9CE' }}>
                          <th style={{ padding: '10px' }}>Jahr</th>
                          <th style={{ padding: '10px' }}>Miete IST</th>
                          <th style={{ padding: '10px' }}>Cashflow Netto</th>
                          <th style={{ padding: '10px' }}>Restschuld</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.projection && result.projection.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px' }}>{row['Jahr'] || idx + 1}</td>
                            <td style={{ padding: '8px 10px' }}>{row['Mieteinnahmen IST']?.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</td>
                            <td style={{ padding: '8px 10px' }}>{row['Cashflow Netto']?.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</td>
                            <td style={{ padding: '8px 10px' }}>{row['Restschuld']?.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </form>
      )}

      {navChoice === 'Immobilienwissen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Immobilienwissen & KI-Assistent</h2>
        </div>
      )}

      {navChoice === 'Einstellungen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Einstellungen & Strategien</h2>
        </div>
      )}
    </main>
  );
}

function MetricCard({ title, value, highlight = false }) {
  return (
    <div style={{ background: highlight ? '#F4EFE6' : '#FAF8F5', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2D9CE' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#555759', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: highlight ? '#A37841' : '#13381A' }}>{value}</div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: '#555759' };
const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
