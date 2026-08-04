'use client';
import { useState } from 'react';

const BACKEND_URL = 'https://valuon-estate-backend.onrender.com';

// Hilfsfunktionen für deutsches Zahlenformat
const formatEuro = (val) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatPct = (val) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

// Grunderwerbsteuer-Tabelle nach Bundesland
const grunderwerbsteuerSätze = {
  'Baden-Württemberg': 5.0,
  'Bayern': 3.5,
  'Berlin': 6.0,
  'Brandenburg': 6.5,
  'Bremen': 5.0,
  'Hamburg': 5.5,
  'Hessen': 6.0,
  'Mecklenburg-Vorpommern': 6.0,
  'Niedersachsen': 5.0,
  'Nordrhein-Westfalen': 6.5,
  'Rheinland-Pfalz': 5.0,
  'Saarland': 6.5,
  'Sachsen': 5.5,
  'Sachsen-Anhalt': 5.0,
  'Schleswig-Holstein': 6.5,
  'Thüringen': 6.5
};

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [navChoice, setNavChoice] = useState('Analyse');

  const [formData, setFormData] = useState({
    obj_name: 'TEST Wohnung',
    objektart: 'Eigentumswohnung',
    bundesland: 'Niedersachsen',
    stadt: 'Weyhe',
    stadtteil: 'Sudweyhe',
    kaufpreis: 170000.0,
    qm: 85.0,
    baujahr: 1996,
    kaltmiete_monat: 850.0,
    hausgeld: 250.0,
    sanierung: 0.0,
    
    // Nebenkosten
    grwt_p: 5.0,
    notar_p: 2.0,
    makler_p: 3.57,
    sonst_nk: 0.0,

    // Finanzierung
    loan_type: 'Annuitätendarlehen',
    hb_zins: 4.0,
    hb_tilg: 2.0,
    sondertilg: 0.0,
    grace_years: 0,
    ek_euro: 17969.0,

    // Miete & Bewirtschaftung
    target_sqm: 10.0,
    adj_year: 1,
    inst_sqm: 12.0,
    mgt_monat: 30.0,
    vac_rate_pct: 2.0,

    // Steuern & Makro
    tax_rate_pct: 42.0,
    afa_model: 'Linear Standard',
    afa_lin: 2.0,
    miet_inc: 1.0,
    val_inc: 1.0,
    exit_cost: 0.0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Automatische Abhängigkeiten bei Änderungen
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let updatedData = { ...formData, [name]: type === 'number' ? parseFloat(value) || 0 : value };

    if (name === 'bundesland' && grunderwerbsteuerSätze[value] !== undefined) {
      updatedData.grwt_p = grunderwerbsteuerSätze[value];
    }

    if (name === 'objektart') {
      if (value === 'Mehrfamilienhaus') {
        updatedData.inst_sqm = 15.0;
      } else if (value === 'Eigentumswohnung') {
        updatedData.inst_sqm = 12.0;
      }
    }

    setFormData(updatedData);
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        ist_sqm: formData.qm > 0 ? formData.kaltmiete_monat / formData.qm : 10.0,
        grwt_proz: formData.grwt_p / 100,
        notar_proz: formData.notar_p / 100,
        makler_proz: formData.makler_p / 100,
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
          <button 
            onClick={() => { setAuthenticated(true); setUserEmail('developer@valuon-estate.de'); }}
            style={{ width: '100%', padding: '14px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '1rem' }}
          >
            Suite entsperren
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
          <span style={{ fontSize: '0.85rem', color: '#555759' }}>{userEmail}</span>
          <button onClick={() => setAuthenticated(false)} style={{ padding: '8px 16px', background: '#D9534F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Abmelden
          </button>
        </div>
      </div>

      {/* Navigation */}
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

      {navChoice === 'Analyse' && (
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
            
            {/* LINKE SPALTE: PARAMETRISIERUNG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#13381A' }}>Parametrisierung</div>

              {/* SEKTION 1 */}
              <Expander defaultOpen={true} title="1. Objektdaten (Exposé)">
                <div style={groupStyle}>
                  <div>
                    <label style={labelStyle}>Objektbezeichnung</label>
                    <input type="text" name="obj_name" value={formData.obj_name} onChange={handleChange} style={inputStyle} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Objektart / Typ</label>
                      <select name="objektart" value={formData.objektart} onChange={handleChange} style={inputStyle}>
                        <option value="Eigentumswohnung">Eigentumswohnung</option>
                        <option value="Mehrfamilienhaus">Mehrfamilienhaus</option>
                        <option value="Einfamilienhaus">Einfamilienhaus</option>
                        <option value="Doppelhaushälfte">Doppelhaushälfte</option>
                        <option value="Reihenhaus">Reihenhaus</option>
                        <option value="Gewerbeimmobilie">Gewerbeimmobilie</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Bundesland (Steuertarif automatisch)</label>
                      <select name="bundesland" value={formData.bundesland} onChange={handleChange} style={inputStyle}>
                        {Object.keys(grunderwerbsteuerSätze).map((land) => (
                          <option key={land} value={land}>{land} ({formatPct(grunderwerbsteuerSätze[land])} %)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Stadt</label>
                      <input type="text" name="stadt" value={formData.stadt} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Stadtteil</label>
                      <input type="text" name="stadtteil" value={formData.stadtteil} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Kaufpreis (€) *</label>
                    <input type="number" name="kaufpreis" value={formData.kaufpreis} onChange={handleChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Wohnfläche (m²) *</label>
                    <input type="number" name="qm" value={formData.qm} onChange={handleChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Baujahr</label>
                    <input type="number" name="baujahr" value={formData.baujahr} onChange={handleChange} style={inputStyle} />
                  </div>

                  <hr style={hrStyle} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Gesamtkaltmiete (€/Monat)</label>
                      <input type="number" name="kaltmiete_monat" value={formData.kaltmiete_monat} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Kaltmiete (€/m²)</label>
                      <input type="text" value={`${formatEuro(formData.qm > 0 ? formData.kaltmiete_monat / formData.qm : 0)} €`} disabled style={{ ...inputStyle, background: '#eee' }} />
                    </div>
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <label style={labelStyle}>Hausgeld gesamt (€/Monat)</label>
                    <input type="number" name="hausgeld" value={formData.hausgeld} onChange={handleChange} style={inputStyle} />
                  </div>

                  <details style={{ background: '#FAF8F5', borderRadius: '6px', border: '1px solid #E2D9CE', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <summary style={{ fontWeight: '600', color: '#13381A' }}>Hausgeld-Aufteilung</summary>
                    <div style={{ marginTop: '10px', color: '#555759' }}>Details zur nicht umlegbaren Hausgeldkomponente.</div>
                  </details>

                  <div>
                    <label style={labelStyle}>Sanierungsaufwand (€)</label>
                    <input type="number" name="sanierung" value={formData.sanierung} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </Expander>

              {/* SEKTION 2 */}
              <Expander title="2. Finanzierung & Nebenkosten">
                <div style={groupStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>1. Grunderwerbsteuer (%)</label>
                      <input type="number" step="0.1" name="grwt_p" value={formData.grwt_p} onChange={handleChange} style={inputStyle} />
                      <div style={badgeStyle}>{formatEuro((formData.kaufpreis * formData.grwt_p) / 100)} €</div>
                    </div>
                    <div>
                      <label style={labelStyle}>2. Notar & Grundbuch (%)</label>
                      <input type="number" step="0.1" name="notar_p" value={formData.notar_p} onChange={handleChange} style={inputStyle} />
                      <div style={badgeStyle}>{formatEuro((formData.kaufpreis * formData.notar_p) / 100)} €</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>3. Maklerprovision (%)</label>
                      <input type="number" step="0.01" name="makler_p" value={formData.makler_p} onChange={handleChange} style={inputStyle} />
                      <div style={badgeStyle}>{formatEuro((formData.kaufpreis * formData.makler_p) / 100)} €</div>
                    </div>
                    <div>
                      <label style={labelStyle}>4. Sonst. NK (€)</label>
                      <input type="number" name="sonst_nk" value={formData.sonst_nk} onChange={handleChange} style={inputStyle} />
                      <div style={badgeStyle}>{formatEuro(formData.sonst_nk)} €</div>
                    </div>
                  </div>

                  <div style={{ background: '#F4EFE6', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2D9CE', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.9rem' }}>
                    <span>Summe Kaufnebenkosten:</span>
                    <span>{formatEuro(((formData.kaufpreis * (formData.grwt_p + formData.notar_p + formData.makler_p)) / 100) + Number(formData.sonst_nk))} €</span>
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <label style={labelStyle}>Darlehensart</label>
                    <select name="loan_type" value={formData.loan_type} onChange={handleChange} style={inputStyle}>
                      <option value="Annuitätendarlehen">Annuitätendarlehen</option>
                      <option value="Endfälliges Darlehen">Endfälliges Darlehen</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Hausbank Zins (%)</label>
                      <input type="number" step="0.1" name="hb_zins" value={formData.hb_zins} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Hausbank Tilgung (%)</label>
                      <input type="number" step="0.1" name="hb_tilg" value={formData.hb_tilg} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Jährliche Sondertilgungsrate (€)</label>
                    <input type="number" name="sondertilg" value={formData.sondertilg} onChange={handleChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Tilgungsfreie Jahre</label>
                    <input type="number" name="grace_years" value={formData.grace_years} onChange={handleChange} style={inputStyle} />
                  </div>

                  <details style={{ background: '#FAF8F5', borderRadius: '6px', border: '1px solid #E2D9CE', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <summary style={{ fontWeight: '600', color: '#13381A' }}>Anschlussfinanzierung & Zinsbindung (Optional)</summary>
                  </details>

                  <details style={{ background: '#FAF8F5', borderRadius: '6px', border: '1px solid #E2D9CE', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <summary style={{ fontWeight: '600', color: '#13381A' }}>KfW-Darlehen (Optional)</summary>
                  </details>

                  <hr style={hrStyle} />

                  <div>
                    <label style={labelStyle}>Eingesetztes Eigenkapital (€)</label>
                    <input type="number" name="ek_euro" value={formData.ek_euro} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </Expander>

              {/* SEKTION 3 */}
              <Expander title="3. Zielmiete & Bewirtschaftung">
                <div style={groupStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Zielkaltmiete (€/Monat)</label>
                      <input type="number" value={formData.kaltmiete_monat} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Zielkaltmiete (€/m²)</label>
                      <input type="text" value={`${formatEuro(formData.qm > 0 ? formData.kaltmiete_monat / formData.qm : 0)} €`} disabled style={{ ...inputStyle, background: '#eee' }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Anpassung in Jahr</label>
                    <input type="number" name="adj_year" value={formData.adj_year} onChange={handleChange} style={inputStyle} />
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <label style={labelStyle}>Instandhaltung (€/m²/Jahr)</label>
                    <input type="number" name="inst_sqm" value={formData.inst_sqm} onChange={handleChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Verwaltung (€/Monat)</label>
                    <input type="number" name="mgt_monat" value={formData.mgt_monat} onChange={handleChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Leerstandsquote (%) - {formatPct(formData.vac_rate_pct)} %</label>
                    <input type="range" min="0" max="10" step="0.5" name="vac_rate_pct" value={formData.vac_rate_pct} onChange={handleChange} style={{ width: '100%', accentColor: '#13381A' }} />
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Flexible Sonderinvestitionen (Capex)</div>
                    <div style={{ fontSize: '0.8rem', color: '#555759', marginBottom: '10px' }}>Füge zielgerichtete Instandhaltungen oder Modernisierungen für spezifische Jahre hinzu.</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Jahr #1</label>
                        <input type="number" value="3" readOnly style={{ ...inputStyle, background: '#eee' }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Betrag (€) #1</label>
                        <input type="number" value="0" readOnly style={{ ...inputStyle, background: '#eee' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Expander>

              {/* SEKTION 4 */}
              <Expander title="4. Steuern, Makro & Exit">
                <div style={groupStyle}>
                  <div>
                    <label style={labelStyle}>Grenzsteuersatz (%) - {formatPct(formData.tax_rate_pct)} %</label>
                    <input type="range" min="0" max="50" step="1" name="tax_rate_pct" value={formData.tax_rate_pct} onChange={handleChange} style={{ width: '100%', accentColor: '#13381A' }} />
                  </div>

                  <div>
                    <label style={labelStyle}>AfA-Modell</label>
                    <select name="afa_model" value={formData.afa_model} onChange={handleChange} style={inputStyle}>
                      <option value="Linear Standard">Linear Standard (2%)</option>
                      <option value="Linear Neubau">Linear Neubau (3%)</option>
                      <option value="Denkmalgeschützt">Denkmalgeschützt / Sanierungsgebiet</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>AfA linear (%)</label>
                    <input type="number" step="0.1" name="afa_lin" value={formData.afa_lin} onChange={handleChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Mietsteigerung p.a. (%)</label>
                    <input type="number" step="0.1" name="miet_inc" value={formData.miet_inc} onChange={handleChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Wertsteigerung p.a. (%)</label>
                    <input type="number" step="0.1" name="val_inc" value={formData.val_inc} onChange={handleChange} style={inputStyle} />
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <label style={labelStyle}>Verkaufsnebenkosten / Exit (%)</label>
                    <input type="number" step="0.1" name="exit_cost" value={formData.exit_cost} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </Expander>

              <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '16px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(19,56,26,0.2)' }}>
                {loading ? 'Berechne Analyse...' : '🚀 Investition analysieren'}
              </button>
            </div>

            {/* RECHTE SPALTE: AUSWERTUNG */}
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
                    <MetricCard title="Gesamtinvestment" value={`${formatEuro(result.summary.total_investment)} €`} />
                    <MetricCard title="Eigenkapitalbedarf" value={`${formatEuro(result.summary.equity_absolute)} €`} />
                    <MetricCard title="IRR (Rendite)" value={`${formatPct(result.summary.irr * 100)} %`} highlight={true} />
                    <MetricCard title="AfA-Basis" value={`${formatEuro(result.summary.afa_base)} €`} />
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
                            <td style={{ padding: '8px 10px' }}>{formatEuro(row['Mieteinnahmen IST'])} €</td>
                            <td style={{ padding: '8px 10px' }}>{formatEuro(row['Cashflow Netto'])} €</td>
                            <td style={{ padding: '8px 10px' }}>{formatEuro(row['Restschuld'])} €</td>
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
          <p style={{ color: '#555759' }}>Übersicht aller gespeicherten Immobilienobjekte.</p>
        </div>
      )}

      {navChoice === 'Immobilienwissen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Immobilienwissen & KI-Assistent</h2>
        </div>
      )}

      {navChoice === 'Einstellungen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Einstellungen & Anlagestrategien</h2>
        </div>
      )}

    </main>
  );
}

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
const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: 'white' };
const hrStyle = { border: 'none', borderTop: '1px solid #E2D9CE', margin: '5px 0' };
const badgeStyle = { marginTop: '4px', background: '#F4EFE6', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#13381A', textAlign: 'center', border: '1px solid #E2D9CE' };
