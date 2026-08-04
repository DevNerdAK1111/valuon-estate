'use client';
import { useState } from 'react';

const BACKEND_URL = 'https://valuon-estate-backend.onrender.com';

// Hilfsfunktionen für deutsches Zahlenformat
const formatEuro = (val) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatEuroInteger = (val) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(val || 0);
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
  const [authenticated, setAuthenticated] = useState(true);
  const [userEmail] = useState('developer@valuon-estate.de');
  const [navChoice, setNavChoice] = useState('Analyse');

  // Formular-State exakt nach deinen Screenshots
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

  // Dynamische Abhängigkeiten (Bundesland, Objektart etc.)
  const updateField = (field, value) => {
    let updated = { ...formData, [field]: value };

    // Bundesland-Änderung passt Grunderwerbsteuer an
    if (field === 'bundesland' && grunderwerbsteuerSätze[value] !== undefined) {
      updated.grwt_p = grunderwerbsteuerSätze[value];
    }

    // Objektart-Änderung passt Instandhaltungsansatz an
    if (field === 'objektart') {
      if (value === 'Mehrfamilienhaus') updated.inst_sqm = 15.0;
      else if (value === 'Eigentumswohnung') updated.inst_sqm = 12.0;
      else if (value === 'Einfamilienhaus') updated.inst_sqm = 10.0;
    }

    setFormData(updated);
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
      alert('Fehler bei der Verbindung zum Backend auf Render.');
    } finally {
      setLoading(false);
    }
  };

  // Nebenkosten-Berechnungen für die Vorschau-Kästchen
  const grwt_euro = (formData.kaufpreis * formData.grwt_p) / 100;
  const notar_euro = (formData.kaufpreis * formData.notar_p) / 100;
  const makler_euro = (formData.kaufpreis * formData.makler_p) / 100;
  const summe_nk = grwt_euro + notar_euro + makler_euro + Number(formData.sonst_nk || 0);

  if (!authenticated) {
    return (
      <main style={{ minHeight: '100vh', background: '#13381A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => setAuthenticated(true)} style={{ padding: '12px 24px', background: '#A37841', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Suite Entsperren
        </button>
      </main>
    );
  }

  const navItems = ['Objekt Datenbank', 'Analyse', 'Immobilienwissen', 'Einstellungen'];

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 3rem', background: '#F7F4EC', color: '#13381A', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2D9CE', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#13381A' }}>Valuon Estate</div>
          <div style={{ fontSize: '0.8rem', color: '#A37841', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Institutional Grade Investment Suite</div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#555759' }}>Konto: <strong>{userEmail}</strong></div>
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
              cursor: 'pointer'
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {navChoice === 'Analyse' && (
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
            
            {/* LINKE SPALTE: PARAMETRISIERUNG (EXAKT WIE AUF DEINEN SCREENSHOTS) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#13381A' }}>Parametrisierung</div>

              {/* SCREENSHOT 1: OBJEKTDATEN */}
              <Expander title="1. Objektdaten (Exposé)" defaultOpen={true}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div>
                    <label style={labelStyle}>Objektbezeichnung</label>
                    <input type="text" value={formData.obj_name} onChange={(e) => updateField('obj_name', e.target.value)} style={inputTextStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Objektart / Typ</label>
                    <select value={formData.objektart} onChange={(e) => updateField('objektart', e.target.value)} style={inputTextStyle}>
                      <option value="Eigentumswohnung">Eigentumswohnung</option>
                      <option value="Mehrfamilienhaus">Mehrfamilienhaus</option>
                      <option value="Einfamilienhaus">Einfamilienhaus</option>
                      <option value="Doppelhaushälfte">Doppelhaushälfte</option>
                      <option value="Reihenhaus">Reihenhaus</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Bundesland</label>
                    <select value={formData.bundesland} onChange={(e) => updateField('bundesland', e.target.value)} style={inputTextStyle}>
                      {Object.keys(grunderwerbsteuerSätze).map((land) => (
                        <option key={land} value={land}>{land}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={labelStyle}>Stadt</label>
                      <input type="text" value={formData.stadt} onChange={(e) => updateField('stadt', e.target.value)} style={inputTextStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Stadtteil</label>
                      <input type="text" value={formData.stadtteil} onChange={(e) => updateField('stadtteil', e.target.value)} style={inputTextStyle} />
                    </div>
                  </div>

                  <StepperInput label="Kaufpreis (€) *" value={formData.kaufpreis} onChange={(v) => updateField('kaufpreis', v)} step={5000} />
                  <StepperInput label="Wohnfläche (m²) *" value={formData.qm} onChange={(v) => updateField('qm', v)} step={1} />
                  <StepperInput label="Baujahr" value={formData.baujahr} onChange={(v) => updateField('baujahr', v)} step={1} />

                  <hr style={hrStyle} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <StepperInput label="Gesamtkaltmiete (€/Monat)" value={formData.kaltmiete_monat} onChange={(v) => updateField('kaltmiete_monat', v)} step={50} />
                    <div>
                      <label style={labelStyle}>Kaltmiete (€/m²)</label>
                      <div style={readOnlyBoxStyle}>{formatEuro(formData.qm > 0 ? formData.kaltmiete_monat / formData.qm : 0)}</div>
                    </div>
                  </div>

                  <hr style={hrStyle} />

                  <StepperInput label="Hausgeld gesamt (€/Monat)" value={formData.hausgeld} onChange={(v) => updateField('hausgeld', v)} step={10} />

                  <SubExpander title="Hausgeld-Aufteilung">
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Details zu umlegbaren und nicht-umlegbaren Teilen.</div>
                  </SubExpander>

                  <StepperInput label="Sanierungsaufwand (€)" value={formData.sanierung} onChange={(v) => updateField('sanierung', v)} step={1000} />

                </div>
              </Expander>

              {/* SCREENSHOT 2: FINANZIERUNG & NEBENKOSTEN */}
              <Expander title="2. Finanzierung & Nebenkosten">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <StepperInput label="1. Grunderwerbsteuer (%)" value={formData.grwt_p} onChange={(v) => updateField('grwt_p', v)} step={0.1} />
                      <div style={badgeStyle}>{formatEuroInteger(grwt_euro)} €</div>
                    </div>
                    <div>
                      <StepperInput label="2. Notar & Grundbuch (%)" value={formData.notar_p} onChange={(v) => updateField('notar_p', v)} step={0.1} />
                      <div style={badgeStyle}>{formatEuroInteger(notar_euro)} €</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <StepperInput label="3. Maklerprovision (%)" value={formData.makler_p} onChange={(v) => updateField('makler_p', v)} step={0.01} />
                      <div style={badgeStyle}>{formatEuroInteger(makler_euro)} €</div>
                    </div>
                    <div>
                      <StepperInput label="4. Sonst. NK (€)" value={formData.sonst_nk} onChange={(v) => updateField('sonst_nk', v)} step={100} />
                      <div style={badgeStyle}>{formatEuroInteger(formData.sonst_nk)} €</div>
                    </div>
                  </div>

                  {/* Die gelbe Vorschau-Box aus deinem Screenshot */}
                  <div style={{ background: '#F4EFE6', padding: '12px', borderRadius: '8px', border: '1px solid #E2D9CE', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <span>Summe Kaufnebenkosten:</span>
                    <span>{formatEuroInteger(summe_nk)} €</span>
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <label style={labelStyle}>Darlehensart</label>
                    <select value={formData.loan_type} onChange={(e) => updateField('loan_type', e.target.value)} style={inputTextStyle}>
                      <option value="Annuitätendarlehen">Annuitätendarlehen</option>
                      <option value="Endfälliges Darlehen">Endfälliges Darlehen</option>
                    </select>
                  </div>

                  <StepperInput label="Hausbank Zins (%)" value={formData.hb_zins} onChange={(v) => updateField('hb_zins', v)} step={0.1} />
                  <StepperInput label="Hausbank Tilgung (%)" value={formData.hb_tilg} onChange={(v) => updateField('hb_tilg', v)} step={0.1} />
                  <StepperInput label="Jährliche Sondertilgung (€)" value={formData.sondertilg} onChange={(v) => updateField('sondertilg', v)} step={500} tooltip="Freiwillige jährliche Sondertilgung" />
                  <StepperInput label="Tilgungsfreie Jahre" value={formData.grace_years} onChange={(v) => updateField('grace_years', v)} step={1} />

                  <SubExpander title="Anschlussfinanzierung & Zinsbindung (Optional)" />
                  <SubExpander title="KfW-Darlehen (Optional)" />

                  <hr style={hrStyle} />

                  <StepperInput label="Eingesetztes Eigenkapital (€)" value={formData.ek_euro} onChange={(v) => updateField('ek_euro', v)} step={1000} />

                </div>
              </Expander>

              {/* SCREENSHOT 3: ZIELMIETE & BEWIRTSCHAFTUNG */}
              <Expander title="3. Zielmiete & Bewirtschaftung">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <StepperInput label="Zielkaltmiete (€/Monat)" value={formData.kaltmiete_monat} onChange={(v) => updateField('kaltmiete_monat', v)} step={50} />
                    <div>
                      <label style={labelStyle}>Zielkaltmiete (€/m²)</label>
                      <div style={readOnlyBoxStyle}>{formatEuro(formData.qm > 0 ? formData.kaltmiete_monat / formData.qm : 0)}</div>
                    </div>
                  </div>

                  <StepperInput label="Anpassung in Jahr" value={formData.adj_year} onChange={(v) => updateField('adj_year', v)} step={1} />

                  <hr style={hrStyle} />

                  <StepperInput label="Instandhaltung (€/m²/Jahr)" value={formData.inst_sqm} onChange={(v) => updateField('inst_sqm', v)} step={1} />
                  <StepperInput label="Verwaltung (€/Monat)" value={formData.mgt_monat} onChange={(v) => updateField('mgt_monat', v)} step={5} />

                  {/* Roter Slider für Leerstandsquote */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      <span style={{ color: '#4A5568' }}>Leerstandsquote (%)</span>
                      <span style={{ color: '#E53E3E', fontWeight: 'bold' }}>{formatPct(formData.vac_rate_pct)} %</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={formData.vac_rate_pct}
                      onChange={(e) => updateField('vac_rate_pct', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#E53E3E', cursor: 'pointer' }}
                    />
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#13381A' }}>Flexible Sonderinvestitionen (Capex)</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096', margin: '4px 0 8px 0' }}>Füge zielgerichtete Instandhaltungen oder Modernisierungen für spezifische Jahre hinzu.</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <StepperInput label="Jahr #1" value={3} onChange={() => {}} disabled={true} />
                      <StepperInput label="Betrag (€) #1" value={0} onChange={() => {}} disabled={true} />
                    </div>
                  </div>

                </div>
              </Expander>

              {/* SCREENSHOT 4: STEUERN, MAKRO & EXIT */}
              <Expander title="4. Steuern, Makro & Exit">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Roter Slider für Grenzsteuersatz */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      <span style={{ color: '#4A5568' }}>Grenzsteuersatz (%)</span>
                      <span style={{ color: '#E53E3E', fontWeight: 'bold' }}>{formatPct(formData.tax_rate_pct)} %</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={formData.tax_rate_pct}
                      onChange={(e) => updateField('tax_rate_pct', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#E53E3E', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>AfA-Modell</label>
                    <select value={formData.afa_model} onChange={(e) => updateField('afa_model', e.target.value)} style={inputTextStyle}>
                      <option value="Linear Standard">Linear Standard</option>
                      <option value="Linear Neubau">Linear Neubau (3%)</option>
                      <option value="Denkmalgeschützt">Denkmalgeschützt</option>
                    </select>
                  </div>

                  <StepperInput label="AfA linear (%)" value={formData.afa_lin} onChange={(v) => updateField('afa_lin', v)} step={0.1} />
                  <StepperInput label="Mietsteigerung p.a. (%)" value={formData.miet_inc} onChange={(v) => updateField('miet_inc', v)} step={0.1} />
                  <StepperInput label="Wertsteigerung p.a. (%)" value={formData.val_inc} onChange={(v) => updateField('val_inc', v)} step={0.1} />

                  <hr style={hrStyle} />

                  <StepperInput label="Verkaufsnebenkosten / Exit (%)" value={formData.exit_cost} onChange={(v) => updateField('exit_cost', v)} step={0.1} tooltip="Geschätzte Kosten beim Verkauf" />

                </div>
              </Expander>

              <button type="submit" disabled={loading} style={{ padding: '14px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Berechne...' : '🚀 Investition analysieren'}
              </button>

            </div>

            {/* RECHTE SPALTE: ERGEBNISSE & TAFELN */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#13381A' }}>Investment-Auswertung & Cashflows</h3>

              {!result ? (
                <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', border: '2px dashed #E2D9CE', borderRadius: '8px' }}>
                  Klicke links auf "Investition analysieren".
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <MetricCard title="Gesamtinvestment" value={`${formatEuroInteger(result.summary.total_investment)} €`} />
                    <MetricCard title="Eigenkapitalbedarf" value={`${formatEuroInteger(result.summary.equity_absolute)} €`} />
                    <MetricCard title="IRR (Rendite)" value={`${formatPct(result.summary.irr * 100)} %`} highlight={true} />
                    <MetricCard title="AfA-Basis" value={`${formatEuroInteger(result.summary.afa_base)} €`} />
                  </div>

                  <h4 style={{ margin: '0 0 10px 0' }}>Projektionsverlauf (Jahre)</h4>
                  <div style={{ maxHeight: '450px', overflowY: 'auto', border: '1px solid #E2D9CE', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#FAF8F5', borderBottom: '1px solid #E2D9CE' }}>
                          <th style={{ padding: '8px' }}>Jahr</th>
                          <th style={{ padding: '8px' }}>Miete IST</th>
                          <th style={{ padding: '8px' }}>Cashflow Netto</th>
                          <th style={{ padding: '8px' }}>Restschuld</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.projection && result.projection.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{row['Jahr'] || idx + 1}</td>
                            <td style={{ padding: '8px' }}>{formatEuroInteger(row['Mieteinnahmen IST'])} €</td>
                            <td style={{ padding: '8px' }}>{formatEuroInteger(row['Cashflow Netto'])} €</td>
                            <td style={{ padding: '8px' }}>{formatEuroInteger(row['Restschuld'])} €</td>
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

    </main>
  );
}

// Custom Stepper-Komponente für die Minus/Plus-Eingabefelder wie in Streamlit
function StepperInput({ label, value, onChange, step = 1, disabled = false, tooltip = null }) {
  const handleDecrement = () => {
    if (disabled) return;
    const next = Math.max(0, Number((value - step).toFixed(2)));
    onChange(next);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const next = Number((value + step).toFixed(2));
    onChange(next);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <label style={labelStyle}>{label}</label>
        {tooltip && <span title={tooltip} style={tooltipStyle}>?</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', background: disabled ? '#EDF2F7' : 'white', border: '1px solid #CBD5E0', borderRadius: '8px', padding: '4px 8px' }}>
        <input
          type="text"
          disabled={disabled}
          value={formatEuro(value)}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value.replace(/\./g, '').replace(',', '.'));
            if (!isNaN(parsed)) onChange(parsed);
          }}
          style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: '500', color: disabled ? '#A0AEC0' : '#2D3748' }}
        />
        {!disabled && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button type="button" onClick={handleDecrement} style={stepBtnStyle}>–</button>
            <button type="button" onClick={handleIncrement} style={stepBtnStyle}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Expander({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} style={{ background: 'white', borderRadius: '8px', border: '1px solid #E2D9CE', overflow: 'hidden' }}>
      <summary style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', background: '#FAF8F5', color: '#13381A' }}>
        {title}
      </summary>
      <div style={{ padding: '16px', borderTop: '1px solid #E2D9CE' }}>
        {children}
      </div>
    </details>
  );
}

function SubExpander({ title, children }) {
  return (
    <details style={{ background: '#FAF8F5', borderRadius: '6px', border: '1px solid #E2D9CE', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer' }}>
      <summary style={{ fontWeight: '600', color: '#13381A' }}>{title}</summary>
      {children && <div style={{ marginTop: '8px' }}>{children}</div>}
    </details>
  );
}

function MetricCard({ title, value, highlight = false }) {
  return (
    <div style={{ background: highlight ? '#F4EFE6' : '#FAF8F5', padding: '1rem', borderRadius: '8px', border: '1px solid #E2D9CE' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#555759' }}>{title}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: highlight ? '#A37841' : '#13381A' }}>{value}</div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568' };
const inputTextStyle = { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' };
const readOnlyBoxStyle = { padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', fontWeight: '500', background: '#EDF2F7', color: '#4A5568' };
const badgeStyle = { marginTop: '4px', background: '#F4EFE6', padding: '6px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#13381A', textAlign: 'center', border: '1px solid #E2D9CE' };
const hrStyle = { border: 'none', borderTop: '1px solid #E2D9CE', margin: '6px 0' };
const stepBtnStyle = { border: 'none', background: '#E2E8F0', color: '#2D3748', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tooltipStyle = { cursor: 'pointer', fontSize: '0.75rem', color: '#718096', border: '1px solid #CBD5E0', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
