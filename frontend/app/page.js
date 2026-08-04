'use client';
import { useState, useEffect } from 'react';

const BACKEND_URL = 'https://valuon-estate-backend.onrender.com';

const formatEuro = (val) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatEuroInt = (val) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(val || 0));
const formatPct = (val) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

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
  const [authenticated] = useState(true);
  const [userEmail] = useState('developer@valuon-estate.de');
  const [navChoice, setNavChoice] = useState('Analyse');

  const [activeDashboardTab, setActiveDashboardTab] = useState('Executive Dashboard');
  const [tableTheme, setTableTheme] = useState('Kapitaldienst & Steuern');
  const [projectionHorizon, setProjectionHorizon] = useState(10);
  const [chartView, setChartView] = useState('1. Vermögensstruktur & NAV (Netto-Eigenkapital)');

  const [isTargetCustomized, setIsTargetCustomized] = useState(false);
  const [isHausgeldCustomized, setIsHausgeldCustomized] = useState(false);
  const [backendStatus, setBackendStatus] = useState('sleeping');

  useEffect(() => {
    pingBackend();
  }, []);

  const pingBackend = () => {
    if (backendStatus === 'ready') return;
    setBackendStatus('waking');
    
    fetch(`${BACKEND_URL}/`)
      .then((res) => {
        if (res.ok) setBackendStatus('ready');
        else setBackendStatus('sleeping');
      })
      .catch(() => setBackendStatus('sleeping'));
  };

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
    ist_sqm: 10.0,
    target_monat: 850.0,
    target_sqm: 10.0,
    adj_year: 1,
    hausgeld: 250.0,
    hausgeld_nicht_umlegbar: 62.50,
    sanierung: 0.0,
    inst_sqm: 12.0,
    mgt_monat: 30.0,
    vac_rate_pct: 2.0,
    grwt_p: 5.0,
    notar_p: 2.0,
    makler_p: 3.57,
    sonst_nk: 0.0,
    loan_type: 'Annuitätendarlehen',
    hb_zins: 4.0,
    hb_tilg: 2.0,
    sondertilg: 0.0,
    grace_years: 0,
    ek_euro: 17969.0,
    zinsbindung: 10,
    folge_zins: 3.8,
    folge_mode: 'Rate konstant halten (Annuität)',
    folge_tilg: 2.0,
    kfw_amt: 0.0,
    kfw_zins: 2.1,
    kfw_tilg: 3.0,
    kfw_grace_years: 0,
    kfw_grant: 0.0,
    tax_rate_pct: 42.0,
    afa_model: 'Linear Standard',
    afa_lin: 2.0,
    miet_inc: 1.0,
    cost_inc: 2.0,
    val_inc: 1.0,
    exit_cost: 0.0
  });

  const [capexList, setCapexList] = useState([{ year: 3, amount: 0 }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [dbProperties, setDbProperties] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);

  useEffect(() => {
    if (navChoice === 'Objekt Datenbank') {
      fetchDatabaseProperties();
    }
  }, [navChoice]);

  const fetchDatabaseProperties = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/properties`);
      if (res.ok) {
        const data = await res.json();
        setDbProperties(data.properties || data || []);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Datenbank:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!result) return;
    setSaving(true);
    setSaveSuccess(null);

    try {
      const payload = {
        name: formData.obj_name,
        obj_name: formData.obj_name,
        objektart: formData.objektart,
        stadt: formData.stadt,
        bundesland: formData.bundesland,
        kaufpreis: Number(formData.kaufpreis),
        qm: Number(formData.qm),
        irr: Number(result?.summary?.irr || 0),
        cashflow_y1: Number(result?.projection?.[0]?.['Cashflow Netto'] || 0),
        cashflow_netto_y1: Number(result?.projection?.[0]?.['Cashflow Netto'] || 0),
        user_email: userEmail,
        form_data: formData,
        capex_list: capexList,
        created_at: new Date().toISOString()
      };

      const res = await fetch(`${BACKEND_URL}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess('✅ Objekt erfolgreich in der Datenbank gespeichert!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        const detailMsg = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail || errorData.message || `Status HTTP ${res.status}`);
        setSaveSuccess(`❌ Fehler beim Speichern: ${detailMsg}`);
      }
    } catch (err) {
      setSaveSuccess(`❌ Verbindung fehlgeschlagen: ${err.message || 'Backend nicht erreichbar.'}`);
    } finally {
      setSaving(false);
    }
  };

  const loadPropertyFromDb = (item) => {
    if (item.form_data) {
      setFormData(item.form_data);
      if (item.capex_list) setCapexList(item.capex_list);
      setNavChoice('Analyse');
      setResult(null);
      setCalcError(null);
    }
  };

  const deletePropertyFromDb = async (id) => {
    if (!confirm('Möchtest du dieses Objekt wirklich aus der Datenbank löschen?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/properties/${id}`, { method: 'DELETE' });
      fetchDatabaseProperties();
    } catch (err) {
      alert('Fehler beim Löschen des Objekts.');
    }
  };

  const handleQmChange = (newQm) => {
    pingBackend();
    const newIstSqm = newQm > 0 ? formData.kaltmiete_monat / newQm : 0;
    let updated = { ...formData, qm: newQm, ist_sqm: newIstSqm };
    if (!isTargetCustomized) {
      updated.target_monat = formData.kaltmiete_monat;
      updated.target_sqm = newIstSqm;
    } else {
      updated.target_sqm = newQm > 0 ? formData.target_monat / newQm : 0;
    }
    setFormData(updated);
  };

  const handleIstMonatChange = (val) => {
    pingBackend();
    const sqmVal = formData.qm > 0 ? val / formData.qm : 0;
    let updated = { ...formData, kaltmiete_monat: val, ist_sqm: sqmVal };
    if (!isTargetCustomized) {
      updated.target_monat = val;
      updated.target_sqm = sqmVal;
    }
    setFormData(updated);
  };

  const handleIstSqmChange = (val) => {
    pingBackend();
    const monatVal = val * formData.qm;
    let updated = { ...formData, ist_sqm: val, kaltmiete_monat: monatVal };
    if (!isTargetCustomized) {
      updated.target_monat = monatVal;
      updated.target_sqm = val;
    }
    setFormData(updated);
  };

  const handleTargetMonatChange = (val) => {
    setIsTargetCustomized(true);
    const sqmVal = formData.qm > 0 ? val / formData.qm : 0;
    setFormData({ ...formData, target_monat: val, target_sqm: sqmVal });
  };

  const handleTargetSqmChange = (val) => {
    setIsTargetCustomized(true);
    const monatVal = val * formData.qm;
    setFormData({ ...formData, target_sqm: val, target_monat: monatVal });
  };

  const handleHausgeldChange = (val) => {
    let updated = { ...formData, hausgeld: val };
    if (!isHausgeldCustomized) {
      updated.hausgeld_nicht_umlegbar = val * 0.25;
    }
    setFormData(updated);
  };

  const handleHausgeldNichtUmlegbarChange = (val) => {
    setIsHausgeldCustomized(true);
    setFormData({ ...formData, hausgeld_nicht_umlegbar: val });
  };

  const handleCapexChange = (index, field, value) => {
    const updated = [...capexList];
    updated[index][field] = value;
    setCapexList(updated);
  };

  const addCapexRow = () => {
    const nextYear = capexList.length > 0 ? capexList[capexList.length - 1].year + 3 : 3;
    setCapexList([...capexList, { year: nextYear, amount: 0 }]);
  };

  const removeCapexRow = (index) => {
    if (capexList.length > 1) {
      setCapexList(capexList.filter((_, i) => i !== index));
    }
  };

  const updateField = (field, value) => {
    pingBackend();
    let updated = { ...formData, [field]: value };

    if (field === 'bundesland' && grunderwerbsteuerSätze[value] !== undefined) {
      updated.grwt_p = grunderwerbsteuerSätze[value];
    }

    if (field === 'objektart') {
      if (value === 'Mehrfamilienhaus') updated.inst_sqm = 15.0;
      else if (value === 'Eigentumswohnung') updated.inst_sqm = 12.0;
      else if (value === 'Einfamilienhaus') updated.inst_sqm = 10.0;
    }

    if (field === 'afa_model') {
      if (value === 'Linear Standard') updated.afa_lin = 2.0;
      else if (value === 'Linear Neubau') updated.afa_lin = 3.0;
      else if (value === 'Degressiv') updated.afa_lin = 5.0;
      else if (value === 'Kombination: Degressiv + Sonder-AfA') updated.afa_lin = 5.0;
      else if (value === 'Denkmalgeschützt') updated.afa_lin = 9.0;
    }

    setFormData(updated);
  };

  const grwt_euro = (formData.kaufpreis * formData.grwt_p) / 100;
  const notar_euro = (formData.kaufpreis * formData.notar_p) / 100;
  const makler_euro = (formData.kaufpreis * formData.makler_p) / 100;
  const summe_nk = grwt_euro + notar_euro + makler_euro + Number(formData.sonst_nk || 0);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setCalcError(null);
    setSaveSuccess(null);

    try {
      const payload = {
        ...formData,
        grwt_proz: formData.grwt_p / 100,
        notar_proz: formData.notar_p / 100,
        makler_proz: formData.makler_p / 100,
        hb_zins: formData.hb_zins / 100,
        hb_tilg: formData.hb_tilg / 100,
        folge_zins: formData.folge_zins / 100,
        folge_tilg: formData.folge_tilg / 100,
        kfw_zins: formData.kfw_zins / 100,
        kfw_tilg: formData.kfw_tilg / 100,
        vac_rate: formData.vac_rate_pct / 100,
        tax_rate: formData.tax_rate_pct / 100,
        miet_inc: formData.miet_inc / 100,
        cost_inc: formData.cost_inc / 100,
        val_inc: formData.val_inc / 100,
        exit_cost: formData.exit_cost / 100,
        afa_lin: formData.afa_lin / 100,
        capex_list: capexList.map(item => ({
          jahr: Number(item.year),
          year: Number(item.year),
          betrag: Number(item.amount),
          amount: Number(item.amount)
        }))
      };

      const res = await fetch(`${BACKEND_URL}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server meldet Status ${res.status}`);
      }

      const data = await res.json();
      if (!data || !data.summary) {
        throw new Error('Das Backend hat keine vollständige Auswertung geliefert.');
      }

      setResult(data);
      setBackendStatus('ready');
    } catch (err) {
      setCalcError(err.message || 'Verbindung zum Backend fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const firstYearCashflow = result?.projection?.[0]?.['Cashflow Netto'] || 0;
  const monthlyCashflow = firstYearCashflow / 12;
  const bruttoMietrendite = formData.kaufpreis > 0 ? ((formData.kaltmiete_monat * 12) / formData.kaufpreis) * 100 : 0;

  const slicedProjection = result?.projection ? result.projection.slice(0, projectionHorizon) : [];
  const cumulatedCashflowHorizon = slicedProjection.reduce((acc, curr) => acc + (curr['Cashflow Netto'] || 0), 0);
  const endYearObj = slicedProjection[slicedProjection.length - 1];
  const endNav = endYearObj ? ((endYearObj['Immobilienwert'] || 0) - (endYearObj['Restschuld'] || 0)) : 0;
  const gesamtGewinnHorizon = cumulatedCashflowHorizon + (endNav - formData.ek_euro);

  const navItems = ['Objekt Datenbank', 'Analyse', 'Immobilienwissen', 'Einstellungen'];

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 3rem', background: '#F7F4EC', color: '#13381A', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#13381A', letterSpacing: '-0.5px' }}>Valuon Estate</div>
          <div style={{ fontSize: '0.8rem', color: '#A37841', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px' }}>INVESTMENT SUITE</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '6px 14px', borderRadius: '20px', border: '1px solid #E2D9CE' }}>
            {backendStatus === 'ready' && <span style={{ color: '#38A169', fontWeight: 'bold' }}>🟢 Backend Bereit</span>}
            {backendStatus === 'waking' && <span style={{ color: '#D69E2E', fontWeight: 'bold' }}>🟡 Backend wird aufgeweckt...</span>}
            {backendStatus === 'sleeping' && <span style={{ color: '#9B2C2C', fontWeight: 'bold' }}>🔴 Backend schläft</span>}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#555759' }}>
            <span>Konto: <strong>{userEmail}</strong></span>
          </div>
          <button style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', color: '#13381A' }}>
            Abmelden
          </button>
        </div>
      </div>

      {/* MAIN NAV TABS */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${navItems.length}, 1fr)`, gap: '1rem', marginBottom: '2rem' }}>
        {navItems.map((item) => {
          const isActive = navChoice === item;
          return (
            <button
              key={item}
              onClick={() => setNavChoice(item)}
              style={{
                padding: '12px',
                background: isActive ? '#13381A' : 'white',
                color: isActive ? 'white' : '#13381A',
                border: '1px solid #E2D9CE',
                borderRadius: '25px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(19,56,26,0.15)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* MODUL 1: ANALYSE */}
      {navChoice === 'Analyse' && (
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
            
            {/* LINKE SPALTE: PARAMETRISIERUNG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#13381A' }}>Parametrisierung</div>

              {/* 1. OBJEKTDATEN */}
              <Expander title="1. Objektdaten (Exposé)" defaultOpen={true}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Objektbezeichnung</label>
                    <input type="text" value={formData.obj_name} onFocus={pingBackend} onChange={(e) => updateField('obj_name', e.target.value)} style={inputTextStyle} />
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

                  <StepperInput label="Kaufpreis (€) *" value={formData.kaufpreis} onChange={(v) => updateField('kaufpreis', v)} step={5000} isCurrency={true} onFocus={pingBackend} />
                  <StepperInput label="Wohnfläche (m²) *" value={formData.qm} onChange={handleQmChange} step={1} onFocus={pingBackend} />
                  <StepperInput label="Baujahr" value={formData.baujahr} onChange={(v) => updateField('baujahr', v)} step={1} isYear={true} />

                  <hr style={hrStyle} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <StepperInput label="Gesamtkaltmiete (€/Monat)" value={formData.kaltmiete_monat} onChange={handleIstMonatChange} step={50} isCurrency={true} />
                    <StepperInput label="Kaltmiete (€/m²)" value={formData.ist_sqm} onChange={handleIstSqmChange} step={0.5} />
                  </div>

                  <hr style={hrStyle} />

                  <StepperInput label="Hausgeld gesamt (€/Monat)" value={formData.hausgeld} onChange={handleHausgeldChange} step={10} isCurrency={true} />

                  <SubExpander title="Hausgeld-Aufteilung">
                    <div style={infoBoxStyle}>
                      💡 <strong>Standard 75 / 25 % Verteilung:</strong> 75% umlegbar, 25% nicht umlegbar.
                    </div>
                    <StepperInput label="Nicht umlegbares Hausgeld (€/Monat)" value={formData.hausgeld_nicht_umlegbar} onChange={handleHausgeldNichtUmlegbarChange} step={5} isCurrency={true} />
                  </SubExpander>

                  <StepperInput label="Sanierungsaufwand (€)" value={formData.sanierung} onChange={(v) => updateField('sanierung', v)} step={1000} isCurrency={true} />
                </div>
              </Expander>

              {/* 2. FINANZIERUNG & NEBENKOSTEN */}
              <Expander title="2. Finanzierung & Nebenkosten">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <StepperInput label="1. Grunderwerbsteuer (%)" value={formData.grwt_p} onChange={(v) => updateField('grwt_p', v)} step={0.1} isPercent={true} />
                      <div style={badgeStyle}>{formatEuroInt(grwt_euro)} €</div>
                    </div>
                    <div>
                      <StepperInput label="2. Notar & Grundbuch (%)" value={formData.notar_p} onChange={(v) => updateField('notar_p', v)} step={0.1} isPercent={true} />
                      <div style={badgeStyle}>{formatEuroInt(notar_euro)} €</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <StepperInput label="3. Maklerprovision (%)" value={formData.makler_p} onChange={(v) => updateField('makler_p', v)} step={0.01} isPercent={true} />
                      <div style={badgeStyle}>{formatEuroInt(makler_euro)} €</div>
                    </div>
                    <div>
                      <StepperInput label="4. Sonst. NK (€)" value={formData.sonst_nk} onChange={(v) => updateField('sonst_nk', v)} step={100} isCurrency={true} />
                      <div style={badgeStyle}>{formatEuroInt(formData.sonst_nk)} €</div>
                    </div>
                  </div>

                  <div style={{ background: '#FAF8F5', padding: '12px', borderRadius: '8px', border: '1px solid #E2D9CE', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <span>Summe Kaufnebenkosten:</span>
                    <span>{formatEuroInt(summe_nk)} €</span>
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <label style={labelStyle}>Darlehensart</label>
                    <select value={formData.loan_type} onChange={(e) => updateField('loan_type', e.target.value)} style={inputTextStyle}>
                      <option value="Annuitätendarlehen">Annuitätendarlehen</option>
                      <option value="Endfälliges Darlehen">Endfälliges Darlehen</option>
                    </select>
                  </div>

                  <StepperInput label="Hausbank Zins (%)" value={formData.hb_zins} onChange={(v) => updateField('hb_zins', v)} step={0.1} isPercent={true} />
                  <StepperInput label="Hausbank Tilgung (%)" value={formData.hb_tilg} onChange={(v) => updateField('hb_tilg', v)} step={0.1} isPercent={true} />
                  <StepperInput label="Jährliche Sondertilgung (€)" value={formData.sondertilg} onChange={(v) => updateField('sondertilg', v)} step={500} isCurrency={true} tooltip="Freiwillige jährliche Sondertilgung" />
                  <StepperInput label="Tilgungsfreie Jahre" value={formData.grace_years} onChange={(v) => updateField('grace_years', v)} step={1} isInteger={true} />

                  <SubExpander title="Anschlussfinanzierung & Zinsbindung (Optional)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                      <StepperInput label="Zinsbindung (Jahre)" value={formData.zinsbindung} onChange={(v) => updateField('zinsbindung', v)} step={1} isInteger={true} />
                      <StepperInput label="Folge-Zinssatz (%)" value={formData.folge_zins} onChange={(v) => updateField('folge_zins', v)} step={0.1} isPercent={true} />
                      <div>
                        <label style={labelStyle}>Folge-Modus</label>
                        <select value={formData.folge_mode} onChange={(e) => updateField('folge_mode', e.target.value)} style={inputTextStyle}>
                          <option value="Rate konstant halten (Annuität)">Rate konstant halten (Annuität)</option>
                          <option value="Tilgung anpassen">Tilgung anpassen</option>
                        </select>
                      </div>
                      <StepperInput label="Folge-Tilgung (%)" value={formData.folge_tilg} onChange={(v) => updateField('folge_tilg', v)} step={0.1} isPercent={true} />
                    </div>
                  </SubExpander>

                  <SubExpander title="KfW-Darlehen (Optional)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                      <StepperInput label="KfW Darlehensbetrag (€)" value={formData.kfw_amt} onChange={(v) => updateField('kfw_amt', v)} step={5000} isCurrency={true} />
                      <StepperInput label="KfW Zinssatz (%)" value={formData.kfw_zins} onChange={(v) => updateField('kfw_zins', v)} step={0.1} isPercent={true} />
                      <StepperInput label="KfW Tilgung (%)" value={formData.kfw_tilg} onChange={(v) => updateField('kfw_tilg', v)} step={0.1} isPercent={true} />
                      <StepperInput label="KfW Tilgungsfreie Jahre" value={formData.kfw_grace_years} onChange={(v) => updateField('kfw_grace_years', v)} step={1} isInteger={true} />
                      <StepperInput label="KfW Tilgungszuschuss (€)" value={formData.kfw_grant} onChange={(v) => updateField('kfw_grant', v)} step={1000} isCurrency={true} />
                    </div>
                  </SubExpander>

                  <hr style={hrStyle} />

                  <div>
                    <StepperInput label="Eingesetztes Eigenkapital (€)" value={formData.ek_euro} onChange={(v) => updateField('ek_euro', v)} step={1000} isCurrency={true} />
                    <div style={infoBoxStyle}>
                      💡 <strong>EK-Empfehlung:</strong> Wir empfehlen mind. Kaufnebenkosten (<strong>{formatEuroInt(summe_nk)} €</strong>) einzubringen.
                    </div>
                  </div>
                </div>
              </Expander>

              {/* 3. ZIELMIETE & BEWIRTSCHAFTUNG */}
              <Expander title="3. Zielmiete & Bewirtschaftung">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <StepperInput label="Zielkaltmiete (€/Monat)" value={formData.target_monat} onChange={handleTargetMonatChange} step={50} isCurrency={true} />
                    <StepperInput label="Zielkaltmiete (€/m²)" value={formData.target_sqm} onChange={handleTargetSqmChange} step={0.5} />
                  </div>

                  <StepperInput label="Anpassung in Jahr" value={formData.adj_year} onChange={(v) => updateField('adj_year', v)} step={1} isInteger={true} />

                  <hr style={hrStyle} />

                  <StepperInput label="Instandhaltung (€/m²/Jahr)" value={formData.inst_sqm} onChange={(v) => updateField('inst_sqm', v)} step={1} />
                  <StepperInput label="Verwaltung (€/Monat)" value={formData.mgt_monat} onChange={(v) => updateField('mgt_monat', v)} step={5} isCurrency={true} />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      <span style={{ color: '#4A5568' }}>Leerstandsquote (%)</span>
                      <span style={{ color: '#9B2C2C', fontWeight: 'bold' }}>{formatPct(formData.vac_rate_pct)} %</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={formData.vac_rate_pct}
                      onChange={(e) => updateField('vac_rate_pct', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#13381A', cursor: 'pointer' }}
                    />
                  </div>

                  <hr style={hrStyle} />

                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#13381A' }}>Flexible Sonderinvestitionen (Capex)</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096', margin: '4px 0 10px 0' }}>Sonder-Instandhaltungen für spezifische Jahre.</div>
                    
                    {capexList.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                        <StepperInput label={`Jahr #${idx + 1}`} value={item.year} onChange={(v) => handleCapexChange(idx, 'year', v)} step={1} isInteger={true} />
                        <StepperInput label={`Betrag (€) #${idx + 1}`} value={item.amount} onChange={(v) => handleCapexChange(idx, 'amount', v)} step={500} isCurrency={true} />
                        {capexList.length > 1 && (
                          <button type="button" onClick={() => removeCapexRow(idx)} style={{ background: '#FFF5F5', color: '#9B2C2C', border: '1px solid #FEB2B2', borderRadius: '6px', padding: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}

                    <button type="button" onClick={addCapexRow} style={{ marginTop: '6px', padding: '8px 12px', background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                      ＋ Weitere Sonderinvestition hinzufügen
                    </button>
                  </div>
                </div>
              </Expander>

              {/* 4. STEUERN, MAKRO & EXIT */}
              <Expander title="4. Steuern, Makro & Exit">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      <span style={{ color: '#4A5568' }}>Grenzsteuersatz (%)</span>
                      <span style={{ color: '#13381A', fontWeight: 'bold' }}>{formatPct(formData.tax_rate_pct)} %</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={formData.tax_rate_pct}
                      onChange={(e) => updateField('tax_rate_pct', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#13381A', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>AfA-Modell</label>
                    <select value={formData.afa_model} onChange={(e) => updateField('afa_model', e.target.value)} style={inputTextStyle}>
                      <option value="Linear Standard">Linear Standard</option>
                      <option value="Linear Neubau">Linear Neubau (3%)</option>
                      <option value="Degressiv">Degressiv (5% p.a. nach § 7 Abs. 5a EStG)</option>
                      <option value="Kombination: Degressiv + Sonder-AfA">Kombination: Degressiv + Sonder-AfA</option>
                      <option value="Denkmalgeschützt">Denkmalgeschützt / Sanierung (§ 7h/7i EStG)</option>
                    </select>
                  </div>

                  <StepperInput label="AfA %" value={formData.afa_lin} onChange={(v) => updateField('afa_lin', v)} step={0.1} isPercent={true} />

                  <StepperInput label="Mietsteigerung p.a. (%)" value={formData.miet_inc} onChange={(v) => updateField('miet_inc', v)} step={0.1} isPercent={true} />
                  <StepperInput label="Wertsteigerung p.a. (%)" value={formData.val_inc} onChange={(v) => updateField('val_inc', v)} step={0.1} isPercent={true} />

                  <hr style={hrStyle} />

                  <StepperInput 
                    label="Verkaufsnebenkosten / Exit (%)" 
                    value={formData.exit_cost} 
                    onChange={(v) => updateField('exit_cost', v)} 
                    step={0.1} 
                    isPercent={true} 
                  />
                </div>
              </Expander>

              <button type="submit" disabled={loading} style={{ padding: '16px', background: '#13381A', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(19,56,26,0.25)' }}>
                {loading ? 'Berechne Investment...' : '🚀 Investition analysieren'}
              </button>

            </div>

            {/* RECHTE SPALTE: DASHBOARD & RESULTATE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* TOP HEADER & TOOLBAR (OBJEKTNAME LINKS, HORIZONT & SPEICHERN RECHTS) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2D9CE', paddingBottom: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#13381A', margin: '0 0 4px 0', letterSpacing: '-0.8px' }}>
                    {formData.obj_name || 'TEST Wohnung'}
                  </h1>
                  <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '500' }}>
                    Kaufpreis: {formatEuroInt(formData.kaufpreis)} € | EK: {formatEuroInt(formData.ek_euro)} € ({formatPct(formData.kaufpreis > 0 ? (formData.ek_euro / formData.kaufpreis) * 100 : 0)} %)
                  </div>
                </div>

                {/* PROJEKTIONSHORIZONT UND SPEICHER-BUTTON RECHTS BÜNDIG */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Projektionshorizont:</label>
                    <select
                      value={projectionHorizon}
                      onChange={(e) => setProjectionHorizon(Number(e.target.value))}
                      style={{ ...inputTextStyle, background: '#FAF8F5', fontWeight: 'bold', padding: '6px 12px' }}
                    >
                      <option value={5}>5 Jahre</option>
                      <option value={10}>10 Jahre (Standard)</option>
                      <option value={15}>15 Jahre</option>
                      <option value={20}>20 Jahre</option>
                      <option value={30}>30 Jahre</option>
                    </select>
                  </div>

                  {result && result.summary && (
                    <button
                      type="button"
                      onClick={handleSaveToDatabase}
                      disabled={saving}
                      style={{
                        padding: '10px 18px',
                        background: '#13381A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(19,56,26,0.2)',
                        height: '36px',
                        alignSelf: 'flex-end'
                      }}
                    >
                      {saving ? 'Speichere...' : 'In Datenbank speichern'}
                    </button>
                  )}
                </div>
              </div>

              {saveSuccess && (
                <div style={{
                  padding: '12px',
                  background: saveSuccess.startsWith('✅') ? '#E6FFFA' : '#FFF5F5',
                  color: saveSuccess.startsWith('✅') ? '#234E52' : '#9B2C2C',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  border: `1px solid ${saveSuccess.startsWith('✅') ? '#B2F5EA' : '#FEB2B2'}`
                }}>
                  {saveSuccess}
                </div>
              )}

              {calcError && (
                <div style={{ padding: '14px 18px', background: '#FFF5F5', color: '#9B2C2C', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #FEB2B2' }}>
                  <strong>⚠️ Fehler bei der Berechnung:</strong> {calcError}
                </div>
              )}

              {/* DIE 4 DYNAMISCHEN METRIC CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <MetricCard 
                  title="CASHFLOW NETTO" 
                  value={`${formatEuro(monthlyCashflow)} €/M`} 
                  isNegative={monthlyCashflow < 0}
                />
                <MetricCard 
                  title="BRUTTOMIETRENDITE" 
                  value={`${formatPct(bruttoMietrendite)} %`} 
                />
                <MetricCard 
                  title={`GESAMTGEWINN (${projectionHorizon} J.)`} 
                  value={`${formatEuroInt(result ? gesamtGewinnHorizon : 0)} €`} 
                />
                <MetricCard 
                  title="EK-RENDITE P.A. (IRR)" 
                  value={`${formatPct((result?.summary?.irr || 0) * 100)} %`} 
                  highlight={true}
                />
              </div>

              {/* TAB-MENÜ EXECUTIVE VS LIQUIDITÄT */}
              <div style={{ borderBottom: '2px solid #E2D9CE', display: 'flex', gap: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveDashboardTab('Executive Dashboard')}
                  style={{
                    background: 'none',
                    border: 'none',
                    paddingBottom: '10px',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    color: activeDashboardTab === 'Executive Dashboard' ? '#13381A' : '#718096',
                    borderBottom: activeDashboardTab === 'Executive Dashboard' ? '3px solid #13381A' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Executive Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDashboardTab('Liquiditätsverlauf & Tilgung')}
                  style={{
                    background: 'none',
                    border: 'none',
                    paddingBottom: '10px',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    color: activeDashboardTab === 'Liquiditätsverlauf & Tilgung' ? '#13381A' : '#718096',
                    borderBottom: activeDashboardTab === 'Liquiditätsverlauf & Tilgung' ? '3px solid #13381A' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Liquiditätsverlauf & Tilgung
                </button>
              </div>

              {/* TAB 1: EXECUTIVE DASHBOARD */}
              {activeDashboardTab === 'Executive Dashboard' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#13381A' }}>
                      Projektion & Wertentwicklung
                    </h3>
                    
                    <div style={{ marginBottom: '1.2rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginBottom: '4px' }}>Grafik-Ansicht wählen:</label>
                      <select 
                        value={chartView} 
                        onChange={(e) => setChartView(e.target.value)} 
                        style={{ ...inputTextStyle, background: '#FAF8F5', fontWeight: '600' }}
                      >
                        <option value="1. Vermögensstruktur & NAV (Netto-Eigenkapital)">1. Vermögensstruktur & NAV (Netto-Eigenkapital)</option>
                        <option value="2. Cashflow & Mieteinnahmen">2. Cashflow & Mieteinnahmen</option>
                      </select>
                    </div>

                    <ProjectionChart projection={slicedProjection} kaufpreis={formData.kaufpreis} view={chartView} />
                  </div>

                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#13381A' }}>
                      Kapitalstruktur (Initial)
                    </h3>

                    <DonutChart 
                      totalInvestment={result?.summary?.total_investment || (formData.kaufpreis + summe_nk)}
                      equity={formData.ek_euro}
                      kfw={formData.kfw_amt}
                      hb={Math.max(0, (formData.kaufpreis + summe_nk) - formData.ek_euro - formData.kfw_amt)}
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: LIQUIDITÄTSVERLAUF & TILGUNG */}
              {activeDashboardTab === 'Liquiditätsverlauf & Tilgung' && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800', color: '#13381A' }}>
                    Liquiditätsverlauf, steuerliche Abschreibung & Kapitalentwicklung
                  </h3>
                  <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.85rem', color: '#718096' }}>
                    Wählen Sie einen Themenbereich, um alle Kennzahlen übersichtlich zu betrachten.
                  </p>

                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.2rem', borderBottom: '1px solid #E2D9CE', paddingBottom: '8px' }}>
                    {['Mieten & Cashflow', 'Kapitaldienst & Steuern', 'Vermögen & Bilanz'].map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setTableTheme(theme)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          color: tableTheme === theme ? '#A37841' : '#718096',
                          cursor: 'pointer',
                          borderBottom: tableTheme === theme ? '2px solid #A37841' : 'none',
                          paddingBottom: '4px'
                        }}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>

                  <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      <thead>
                        <tr style={{ background: '#FAF8F5', borderBottom: '2px solid #E2D9CE', color: '#4A5568' }}>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Jahr</th>
                          
                          {tableTheme === 'Mieten & Cashflow' && (
                            <>
                              <th style={{ padding: '10px' }}>Mietrendite (brutto)</th>
                              <th style={{ padding: '10px' }}>Kaltmiete (brutto)</th>
                              <th style={{ padding: '10px' }}>Reinertrag (NOI)</th>
                              <th style={{ padding: '10px' }}>Cashflow (vor St.)</th>
                              <th style={{ padding: '10px' }}>Cashflow (nach St.)</th>
                            </>
                          )}

                          {tableTheme === 'Kapitaldienst & Steuern' && (
                            <>
                              <th style={{ padding: '10px' }}>Zinsen</th>
                              <th style={{ padding: '10px' }}>Tilgung (dynamisch)</th>
                              <th style={{ padding: '10px' }}>Kapitaldienst</th>
                              <th style={{ padding: '10px' }}>AfA</th>
                              <th style={{ padding: '10px' }}>Steuer / Erstattung</th>
                            </>
                          )}

                          {tableTheme === 'Vermögen & Bilanz' && (
                            <>
                              <th style={{ padding: '10px' }}>Immobilienwert</th>
                              <th style={{ padding: '10px' }}>Restschuld</th>
                              <th style={{ padding: '10px' }}>Netto-EK (NAV)</th>
                              <th style={{ padding: '10px' }}>LTV (%)</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {slicedProjection.map((row, idx) => {
                          const yr = row['Jahr'] || idx + 1;
                          const mietrendite = formData.kaufpreis > 0 ? ((row['Mieteinnahmen IST'] || 0) / formData.kaufpreis) * 100 : 0;
                          const noi = (row['Effektive Miete'] || row['Mieteinnahmen IST'] || 0) - (row['Bewirtschaftungskosten'] || 0);
                          const cfVorSteuer = (row['Cashflow Netto'] || 0) + (row['Steuer'] || 0);
                          const nav = (row['Immobilienwert'] || 0) - (row['Restschuld'] || 0);
                          const ltv = row['Immobilienwert'] > 0 ? ((row['Restschuld'] || 0) / row['Immobilienwert']) * 100 : 0;
                          const taxVal = row['Steuer'] || 0;

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #E2D9CE' }}>
                              <td style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 'bold' }}>{yr}</td>

                              {tableTheme === 'Mieten & Cashflow' && (
                                <>
                                  <td style={{ padding: '8px 10px' }}>{formatPct(mietrendite)} %</td>
                                  <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['Mieteinnahmen IST'])} €</td>
                                  <td style={{ padding: '8px 10px' }}>{formatEuroInt(noi)} €</td>
                                  <td style={{ padding: '8px 10px', color: cfVorSteuer < 0 ? '#9B2C2C' : 'inherit' }}>{formatEuroInt(cfVorSteuer)} €</td>
                                  <td style={{ padding: '8px 10px', fontWeight: 'bold', color: row['Cashflow Netto'] < 0 ? '#9B2C2C' : '#13381A' }}>
                                    {formatEuroInt(row['Cashflow Netto'])} €
                                  </td>
                                </>
                              )}

                              {tableTheme === 'Kapitaldienst & Steuern' && (
                                <>
                                  <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['Zinsen'])} €</td>
                                  <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#13381A' }}>{formatEuroInt(row['Tilgung'])} €</td>
                                  <td style={{ padding: '8px 10px' }}>{formatEuroInt((row['Zinsen'] || 0) + (row['Tilgung'] || 0))} €</td>
                                  <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['AfA'])} €</td>
                                  <td style={{ padding: '8px 10px', fontWeight: 'bold', color: taxVal < 0 ? '#38A169' : (taxVal > 0 ? '#9B2C2C' : 'inherit') }}>
                                    {taxVal < 0 ? `+${formatEuroInt(Math.abs(taxVal))} € (Erstattung)` : `${formatEuroInt(taxVal)} €`}
                                  </td>
                                </>
                              )}

                              {tableTheme === 'Vermögen & Bilanz' && (
                                <>
                                  <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['Immobilienwert'])} €</td>
                                  <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['Restschuld'])} €</td>
                                  <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#A37841' }}>{formatEuroInt(nav)} €</td>
                                  <td style={{ padding: '8px 10px' }}>{formatPct(ltv)} %</td>
                                </>
                              )}
                            </tr>
                          );
                        })}

                        {/* SUMMENZEILE */}
                        <tr style={{ background: '#FAF8F5', fontWeight: 'bold', borderTop: '2px solid #13381A' }}>
                          <td style={{ padding: '10px', textAlign: 'left' }}>Summe ({projectionHorizon} J.)</td>
                          {tableTheme === 'Mieten & Cashflow' && (
                            <>
                              <td style={{ padding: '10px' }}>
                                {formatPct(slicedProjection.reduce((acc, curr) => acc + (((curr['Mieteinnahmen IST'] || 0) / (formData.kaufpreis || 1)) * 100), 0) / (projectionHorizon || 1))} % (Ø)
                              </td>
                              <td style={{ padding: '10px' }}>{formatEuroInt(slicedProjection.reduce((acc, curr) => acc + (curr['Mieteinnahmen IST'] || 0), 0))} €</td>
                              <td style={{ padding: '10px' }}>{formatEuroInt(slicedProjection.reduce((acc, curr) => acc + ((curr['Effektive Miete'] || curr['Mieteinnahmen IST'] || 0) - (curr['Bewirtschaftungskosten'] || 0)), 0))} €</td>
                              <td style={{ padding: '10px' }}>{formatEuroInt(slicedProjection.reduce((acc, curr) => acc + ((curr['Cashflow Netto'] || 0) + (curr['Steuer'] || 0)), 0))} €</td>
                              <td style={{ padding: '10px', color: cumulatedCashflowHorizon < 0 ? '#9B2C2C' : '#13381A' }}>{formatEuroInt(cumulatedCashflowHorizon)} €</td>
                            </>
                          )}

                          {tableTheme === 'Kapitaldienst & Steuern' && (
                            <>
                              <td style={{ padding: '10px' }}>{formatEuroInt(slicedProjection.reduce((acc, curr) => acc + (curr['Zinsen'] || 0), 0))} €</td>
                              <td style={{ padding: '10px' }}>{formatEuroInt(slicedProjection.reduce((acc, curr) => acc + (curr['Tilgung'] || 0), 0))} €</td>
                              <td style={{ padding: '10px' }}>{formatEuroInt(slicedProjection.reduce((acc, curr) => acc + (curr['Zinsen'] || 0) + (curr['Tilgung'] || 0), 0))} €</td>
                              <td style={{ padding: '10px' }}>{formatEuroInt(slicedProjection.reduce((acc, curr) => acc + (curr['AfA'] || 0), 0))} €</td>
                              <td style={{ padding: '10px' }}>{formatEuroInt(slicedProjection.reduce((acc, curr) => acc + (curr['Steuer'] || 0), 0))} €</td>
                            </>
                          )}

                          {tableTheme === 'Vermögen & Bilanz' && (
                            <>
                              <td style={{ padding: '10px' }}>–</td>
                              <td style={{ padding: '10px' }}>–</td>
                              <td style={{ padding: '10px', color: '#A37841' }}>{formatEuroInt(endNav)} €</td>
                              <td style={{ padding: '10px' }}>–</td>
                            </>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '1.5rem', background: '#FAF8F5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2D9CE', fontSize: '0.78rem', color: '#555759', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#13381A' }}>Erläuterung der Kennzahlen & Steuereffekte</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <strong>Dynamische Tilgung:</strong> Bei einem Annuitätendarlehen bleibt die Gesamtrate konstant. Mit sinkender Restschuld sinkt der Zinsanteil, wodurch die Tilgung von Jahr zu Jahr automatisch ansteigt.<br />
                        <strong>Steuer / Erstattung:</strong> Positive Grüne Beträge (+) stellen eine Steuererstattung durch Verrechnung der Verluste aus Vermietung mit deiner Einkommensteuer dar.
                      </div>
                      <div>
                        <strong>Reinertrag (NOI):</strong> Mietertrag nach Abzug von Verwaltung, Instandhaltung und Leerstand (vor Zinsen/Steuer).<br />
                        <strong>Netto-EK (NAV):</strong> Dein kumulierter Netto-Vermögenswert im Objekt (Immobilienwert abzüglich Restschuld).
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        </form>
      )}

      {/* MODUL 2: OBJEKT DATENBANK */}
      {navChoice === 'Objekt Datenbank' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#13381A' }}>Objekt Datenbank & Pipeline</h2>
            <button onClick={fetchDatabaseProperties} style={{ padding: '8px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔄 Aktualisieren
            </button>
          </div>

          {loadingDb ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Lade Objekte aus Supabase...</div>
          ) : dbProperties.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888', border: '2px dashed #E2D9CE', borderRadius: '8px' }}>
              Noch keine Objekte in der Datenbank gespeichert.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#FAF8F5', borderBottom: '2px solid #E2D9CE' }}>
                    <th style={{ padding: '12px' }}>Objektname</th>
                    <th style={{ padding: '12px' }}>Typ</th>
                    <th style={{ padding: '12px' }}>Ort</th>
                    <th style={{ padding: '12px' }}>Kaufpreis</th>
                    <th style={{ padding: '12px' }}>Wohnfläche</th>
                    <th style={{ padding: '12px' }}>IRR Rendite</th>
                    <th style={{ padding: '12px' }}>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {dbProperties.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #E2D9CE' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#13381A' }}>{item.name || item.obj_name || item.form_data?.obj_name}</td>
                      <td style={{ padding: '12px' }}>{item.objektart || item.form_data?.objektart}</td>
                      <td style={{ padding: '12px' }}>{item.stadt || item.form_data?.stadt}</td>
                      <td style={{ padding: '12px' }}>{formatEuroInt(item.kaufpreis || item.form_data?.kaufpreis)} €</td>
                      <td style={{ padding: '12px' }}>{item.qm || item.form_data?.qm} m²</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#A37841' }}>
                        {item.irr ? formatPct(item.irr * 100) + ' %' : '–'}
                      </td>
                      <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => loadPropertyFromDb(item)} style={{ padding: '6px 12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          📂 In Analyse laden
                        </button>
                        <button onClick={() => deletePropertyFromDb(item.id)} style={{ padding: '6px 10px', background: '#FFF5F5', color: '#9B2C2C', border: '1px solid #FEB2B2', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          🗑️ Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODUL 3: IMMOBILIENWISSEN */}
      {navChoice === 'Immobilienwissen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Immobilienwissen & KI-Assistent</h2>
          <p style={{ color: '#555759' }}>Fachartikel, Kennzahlen und interaktiver KI-Support.</p>
        </div>
      )}

      {/* MODUL 4: EINSTELLUNGEN */}
      {navChoice === 'Einstellungen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Einstellungen & Anlagestrategien</h2>
          <p style={{ color: '#555759' }}>Konfiguration deiner Parameter-Standards und Profile.</p>
        </div>
      )}

    </main>
  );
}

// --- DONUT CHART KOMPONENTE ---
function DonutChart({ totalInvestment, equity, kfw, hb }) {
  const safeTotal = totalInvestment || 1;
  const eqPct = (equity / safeTotal) * 100;
  const kfwPct = (kfw / safeTotal) * 100;
  const hbPct = Math.max(0, 100 - eqPct - kfwPct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
      <svg width="180" height="180" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E2D9CE" strokeWidth="5" />
        <circle
          cx="21" cy="21" r="15.915"
          fill="transparent" stroke="#13381A" strokeWidth="5"
          strokeDasharray={`${hbPct} ${100 - hbPct}`}
          strokeDashoffset="25"
        />
        <circle
          cx="21" cy="21" r="15.915"
          fill="transparent" stroke="#2D3748" strokeWidth="5"
          strokeDasharray={`${eqPct} ${100 - eqPct}`}
          strokeDashoffset={`${25 - hbPct}`}
        />
        {kfwPct > 0 && (
          <circle
            cx="21" cy="21" r="15.915"
            fill="transparent" stroke="#A37841" strokeWidth="5"
            strokeDasharray={`${kfwPct} ${100 - kfwPct}`}
            strokeDashoffset={`${25 - hbPct - eqPct}`}
          />
        )}
      </svg>

      <div style={{ marginTop: '1.2rem', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', background: '#13381A', borderRadius: '2px' }}></span>
          <span>Hausbank Darlehen ({formatPct(hbPct)}%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', background: '#2D3748', borderRadius: '2px' }}></span>
          <span>Eigenkapital ({formatPct(eqPct)}%)</span>
        </div>
        {kfwPct > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', background: '#A37841', borderRadius: '2px' }}></span>
            <span>KfW-Darlehen ({formatPct(kfwPct)}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SVG PROJEKTIONS-CHART MIT SKALIERTEN ACHSEN UND ANPASSBARER ANSICHT ---
function ProjectionChart({ projection, kaufpreis, view }) {
  if (!projection || projection.length === 0) {
    return <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Keine Projektionsdaten vorhanden.</div>;
  }

  const isNavView = view.includes('Vermögensstruktur');

  // Max-Wert-Ermittlung für dyn. Y-Achsenskalierung
  let maxVal = 100000;
  if (isNavView) {
    maxVal = Math.max(...projection.map(r => r['Immobilienwert'] || kaufpreis || 100000)) * 1.1;
  } else {
    maxVal = Math.max(...projection.map(r => r['Mieteinnahmen IST'] || 10000)) * 1.25;
  }

  const yTicks = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

  return (
    <div style={{ width: '100%', height: '260px', position: 'relative', marginTop: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', height: '210px' }}>
        
        {/* Y-ACHSEN BESCHRIFTUNG */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.68rem', color: '#718096', textAlign: 'right', paddingRight: '8px', fontVariantNumeric: 'tabular-nums' }}>
          {yTicks.map((val, idx) => (
            <span key={idx}>{formatEuroInt(val)} €</span>
          ))}
        </div>

        {/* SVG GRAFIK FÜR BEIDE ANSICHTEN */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
            
            {/* Horizontal Gridlines */}
            {[0, 50, 100, 150, 200].map((y, idx) => (
              <line key={idx} x1="0" y1={y} x2="500" y2={y} stroke="#E2D9CE" strokeDasharray="3 3" />
            ))}

            {isNavView ? (
              <>
                {/* NAV BALKEN */}
                {projection.map((r, i) => {
                  const x = (i / projection.length) * 480 + 5;
                  const nav = (r['Immobilienwert'] || 0) - (r['Restschuld'] || 0);
                  const barHeight = (nav / maxVal) * 200;
                  const y = 200 - barHeight;

                  return (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width={380 / projection.length}
                      height={Math.max(0, barHeight)}
                      fill="#A37841"
                      opacity="0.85"
                      rx="2"
                    />
                  );
                })}

                {/* OBJEKTWERT LINIE (Grün) */}
                <polyline
                  fill="none"
                  stroke="#13381A"
                  strokeWidth="3"
                  points={projection.map((r, i) => {
                    const x = (i / projection.length) * 480 + 15;
                    const y = 200 - ((r['Immobilienwert'] || 0) / maxVal) * 200;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* RESTSCHULD LINIE (Burgund) */}
                <polyline
                  fill="none"
                  stroke="#9B2C2C"
                  strokeWidth="3"
                  points={projection.map((r, i) => {
                    const x = (i / projection.length) * 480 + 15;
                    const y = 200 - ((r['Restschuld'] || 0) / maxVal) * 200;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </>
            ) : (
              <>
                {/* CASHFLOW BALKEN (Grün für positiv, Burgund für negativ) */}
                {projection.map((r, i) => {
                  const x = (i / projection.length) * 480 + 5;
                  const cfYear = (r['Cashflow Netto'] || 0);
                  const absCf = Math.abs(cfYear);
                  const barHeight = (absCf / maxVal) * 200;
                  const y = cfYear >= 0 ? 200 - barHeight : 200;

                  return (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width={380 / projection.length}
                      height={Math.max(2, barHeight)}
                      fill={cfYear >= 0 ? '#13381A' : '#9B2C2C'}
                      opacity="0.85"
                      rx="2"
                    />
                  );
                })}

                {/* KALTMIETE LINIE (Gold) */}
                <polyline
                  fill="none"
                  stroke="#A37841"
                  strokeWidth="3"
                  points={projection.map((r, i) => {
                    const x = (i / projection.length) * 480 + 15;
                    const y = 200 - ((r['Mieteinnahmen IST'] || 0) / maxVal) * 200;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </>
            )}

          </svg>
        </div>
      </div>

      {/* X-ACHSEN BESCHRIFTUNG (Jahre J1, J2, J3...) */}
      <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${projection.length}, 1fr)`, fontSize: '0.68rem', color: '#718096', textAlign: 'center', marginTop: '4px' }}>
        <span></span>
        {projection.map((r, i) => (
          <span key={i}>J{r['Jahr'] || i + 1}</span>
        ))}
      </div>

      {/* LEGENDEDETAILS */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '10px' }}>
        {isNavView ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '14px', height: '3px', background: '#13381A' }}></span>
              <span>Objektwert</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '14px', height: '3px', background: '#9B2C2C' }}></span>
              <span>Restschuld</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', background: '#A37841', borderRadius: '2px' }}></span>
              <span>Netto-EK (NAV)</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '14px', height: '3px', background: '#A37841' }}></span>
              <span>Kaltmiete (brutto)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', background: '#13381A', borderRadius: '2px' }}></span>
              <span>Cashflow Netto (+)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', background: '#9B2C2C', borderRadius: '2px' }}></span>
              <span>Cashflow Netto (-)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, highlight = false, isNegative = false }) {
  return (
    <div style={{ 
      background: highlight ? '#FAF8F5' : 'white', 
      padding: '1.2rem', 
      borderRadius: '10px', 
      border: '1px solid #E2D9CE',
      borderLeft: isNegative ? '4px solid #9B2C2C' : (highlight ? '4px solid #A37841' : '1px solid #E2D9CE'),
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#555759', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '900', color: isNegative ? '#9B2C2C' : (highlight ? '#A37841' : '#13381A'), letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function StepperInput({ label, value, onChange, step = 1, isYear = false, isInteger = false, isCurrency = false, isPercent = false, disabled = false, tooltip = null, onFocus = null }) {
  const getFormattedValue = (v) => {
    if (isYear) return String(Math.round(v || 0));
    if (isInteger) return formatEuroInt(v);
    if (isPercent) return formatPct(v) + ' %';
    if (isCurrency) return formatEuro(v) + ' €';
    return formatEuro(v);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const minVal = isYear ? 1800 : 0;
    const next = Math.max(minVal, Number((value - step).toFixed(2)));
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
          onFocus={onFocus}
          value={getFormattedValue(value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9,-]/g, '').replace(',', '.');
            const parsed = parseFloat(raw);
            if (!isNaN(parsed)) onChange(parsed);
          }}
          style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: '500', color: disabled ? '#A0AEC0' : '#2D3748', fontVariantNumeric: 'tabular-nums' }}
        />
        {!disabled && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568' };
const inputTextStyle = { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' };
const badgeStyle = { marginTop: '4px', background: '#FAF8F5', padding: '6px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#13381A', textAlign: 'center', border: '1px solid #E2D9CE', fontVariantNumeric: 'tabular-nums' };
const infoBoxStyle = { marginTop: '6px', marginBottom: '8px', background: '#EBF8FF', color: '#2B6CB0', border: '1px solid #BEE3F8', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', lineHeight: '1.35' };
const hrStyle = { border: 'none', borderTop: '1px solid #E2D9CE', margin: '6px 0' };
const stepBtnStyle = { border: 'none', background: '#FAF8F5', color: '#13381A', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', border: '1px solid #E2D9CE', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tooltipStyle = { cursor: 'pointer', fontSize: '0.75rem', color: '#718096', border: '1px solid #CBD5E0', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
