'use client';
import { useState } from 'react';

const BACKEND_URL = 'https://valuon-estate-backend.onrender.com';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [navChoice, setNavChoice] = useState('Analyse');

  const [formData, setFormData] = useState({
    obj_name: 'Muster-Immobilie',
    objektart: 'Eigentumswohnung',
    bundesland: 'Niedersachsen',
    kaufpreis: 250000.0,
    qm: 75.0,
    baujahr: 1995,
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
      alert('Fehler bei der Verbindung zum Backend auf Render');
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
          <p style={{ color: '#555759', marginBottom: '2rem', fontSize: '0.95rem' }}>Authentifizierung erforderlich.</p>
          <button 
            onClick={() => { setAuthenticated(true); setUserEmail('developer@valuon-estate.de'); }}
            style={{ width: '100%', padding: '14px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
          >
            Anmelden & Suite starten
          </button>
        </div>
      </main>
    );
  }

  const navItems = ['Objekt Datenbank', 'Analyse', 'Immobilienwissen', 'Einstellungen'];

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 4rem', background: '#F7F4EC', color: '#13381A' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2D9CE', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.8px', color: '#13381A', lineHeight: '1.1' }}>Valuon Estate</div>
          <div style={{ fontSize: '0.85rem', color: '#A37841', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>Institutional Grade Investment Suite</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#555759' }}>Angemeldet als: <strong>{userEmail}</strong></span>
          <button onClick={() => setAuthenticated(false)} style={{ padding: '8px 16px', background: '#D9534F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Abmelden
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
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

      {/* --- MODUL: ANALYSE --- */}
      {navChoice === 'Analyse' && (
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
            
            {/* LINKE SPALTE: EINGABEN & EXPANDER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Expander 1: Objektdaten */}
              <Expander title="📌 1. Objektdaten & Stammdaten" defaultOpen={true}>
                <div style={groupStyle}>
                  <div>
                    <label style={labelStyle}>Objektname</label>
                    <input type="text" name="obj_name" value={formData.obj_name} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Kaufpreis (€)</label>
                      <input type="number" name="kaufpreis" value={formData.kaufpreis} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Wohnfläche (qm)</label>
                      <input type="number" name="qm" value={formData.qm} onChange={handleChange} style={inputStyle} />
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
                </div>
              </Expander>

              {/* Expander 2: Kaufnebenkosten */}
              <Expander title="🏛️ 2. Kaufnebenkosten">
                <div style={groupStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Grunderwerbsteuer (%)</label>
                      <input type="number" step="0.1" name="grwt_p" value={formData.grwt_p} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Notar & Grundbuch (%)</label>
                      <input type="number" step="0.1" name="notar_p" value={formData.notar_p} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Maklerprovision (%)</label>
                      <input type="number" step="0.01" name="makler_p" value={formData.makler_p} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Sonstige Nebenkosten (€)</label>
                      <input type="number" name="sonst_nk" value={formData.sonst_nk} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>
                </div>
              </Expander>

              {/* Expander 3: Finanzierung */}
              <Expander title="💰 3. Finanzierung & Eigenkapital">
                <div style={groupStyle}>
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
                      <label style={labelStyle}>Tilg.-freie Jahre</label>
                      <input type="number" name="grace_years" value={formData.grace_years} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>
                </div>
              </Expander>

              {/* Expander 4: Miete & Bewirtschaftung */}
              <Expander title="🏢 4. Miete & Bewirtschaftungskosten">
                <div style={groupStyle}>
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
                </div>
              </Expander>

              {/* Expander 5: Steuern & Makro */}
              <Expander title="📈 5. Steuern & Makro-Annahmen">
                <div style={groupStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Steuersatz (%)</label>
                      <input type="number" name="tax_rate_pct" value={formData.tax_rate_pct} onChange={handleChange} style={inputStyle} />
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
                </div>
              </Expander>

              <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '16px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(19,56,26,0.2)' }}>
                {loading ? 'Berechne vollständige Analyse...' : '🚀 Investition analysieren'}
              </button>
            </div>

            {/* RECHTE SPALTE: ERGEBNISSE & KENNZAHLEN */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '700', borderBottom: '1px solid #E2D9CE', paddingBottom: '10px' }}>Investment-Auswertung & Cashflows</h3>

              {!result ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#888', border: '2px dashed #E2D9CE', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>Bereit für die Auswertung.</p>
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

                  <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '10px' }}>Projektionsverlauf (Jahre)</h4>
                  <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #E2D9CE', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#FAF8F5', borderBottom: '1px solid #E2D9CE', position: 'sticky', top: 0 }}>
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

      {navChoice === 'Objekt Datenbank' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Objekt Datenbank & Pipeline</h2>
          <p style={{ color: '#555759' }}>Übersicht aller gespeicherten Immobilienobjekte aus Supabase.</p>
        </div>
      )}

      {navChoice === 'Immobilienwissen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Immobilienwissen & KI-Assistent</h2>
          <p style={{ color: '#555759' }}>Fachartikel, Kennzahlen und interaktiver KI-Support.</p>
        </div>
      )}

      {navChoice === 'Einstellungen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Einstellungen & Anlagestrategien</h2>
          <p style={{ color: '#555759' }}>Konfiguration deiner Parameter-Standards und Profile.</p>
        </div>
      )}

    </main>
  );
}

// Hilfskomponente für einklappbare Abschnitte (wie st.expander)
function Expander({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} style={{ background: 'white', borderRadius: '10px', border: '1px solid #E2D9CE', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <summary style={{ padding: '14px 18px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', background: '#FAF8F5', color: '#13381A', outline: 'none', userSelect: 'none' }}>
        {title}
      </summary>
      <div style={{ padding: '18px', borderTop: '1px solid #E2D9CE' }}>
        {children}
      </div>
    </details>
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

const groupStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: '#555759' };
const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
