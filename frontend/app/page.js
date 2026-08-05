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

// --- SVG PIKTOGRAMME (KEINE EMOJIS) ---
const IconGear = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const IconFolder = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const IconLightning = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('developer@valuon-estate.de');
  const [navChoice, setNavChoice] = useState('Startseite'); // 'Startseite' | 'Analyse' | 'Objekt Datenbank' | 'Immobilienwissen' | 'Einstellungen'

  const [activeDashboardTab, setActiveDashboardTab] = useState('Executive Dashboard');
  const [tableTheme, setTableTheme] = useState('Kapitaldienst & Steuern');
  const [projectionHorizon, setProjectionHorizon] = useState('10');
  const [chartView, setChartView] = useState('1. Vermögensstruktur & NAV (Netto-Eigenkapital)');

  const [devNotice, setDevNotice] = useState(null); // Für Modal-Hinweis bei Features in Entwicklung
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
    obj_name: 'Muster Wohnung',
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
    if ((navChoice === 'Objekt Datenbank' || navChoice === 'Startseite') && showApp) {
      fetchDatabaseProperties();
    }
  }, [navChoice, showApp]);

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
        setSaveSuccess('Objekt erfolgreich in der Datenbank gespeichert.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        const detailMsg = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail || errorData.message || `Status HTTP ${res.status}`);
        setSaveSuccess(`Fehler beim Speichern: ${detailMsg}`);
      }
    } catch (err) {
      setSaveSuccess(`Verbindung fehlgeschlagen: ${err.message || 'Backend nicht erreichbar.'}`);
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

  let slicedProjection = [];
  let actualHorizonYears = 10;

  if (result?.projection && result.projection.length > 0) {
    if (projectionHorizon === 'payoff') {
      const payoffIdx = result.projection.findIndex(r => (r['Restschuld'] || 0) <= 0);
      if (payoffIdx !== -1) {
        slicedProjection = result.projection.slice(0, payoffIdx + 1);
      } else {
        slicedProjection = result.projection;
      }
    } else {
      const numYears = parseInt(projectionHorizon, 10) || 10;
      slicedProjection = result.projection.slice(0, numYears);
    }
    actualHorizonYears = slicedProjection.length;
  }

  const cumulatedCashflowHorizon = slicedProjection.reduce((acc, curr) => acc + (curr['Cashflow Netto'] || 0), 0);
  const endYearObj = slicedProjection[slicedProjection.length - 1];
  const endNav = endYearObj ? ((endYearObj['Immobilienwert'] || 0) - (endYearObj['Restschuld'] || 0)) : 0;
  const gesamtGewinnHorizon = cumulatedCashflowHorizon + (endNav - formData.ek_euro);

  const mainNavItems = ['Startseite', 'Analyse', 'Objekt Datenbank', 'Immobilienwissen'];

  // ----------------------------------------------------------------------------------
  // 1. EXTERNE LANDING PAGE (WENN showApp === false)
  // ----------------------------------------------------------------------------------
  if (!showApp) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1F12', color: '#F7F4EC', fontFamily: 'sans-serif', overflowX: 'hidden', position: 'relative' }}>
        
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(163,120,65,0.2) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(19,56,26,0.4) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        {/* TOP BAR */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(226,217,206,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', background: '#A37841', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px', color: 'white' }}>Valuon Estate</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button onClick={() => { setAuthMode('login'); document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: 'transparent', border: 'none', color: '#F7F4EC', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>
              Anmelden
            </button>
            <button onClick={() => { setAuthMode('register'); document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: '#A37841', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '25px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(163,120,65,0.3)' }}>
              Jetzt Registrieren
            </button>
          </div>
        </nav>

        {/* HERO SECTION */}
        <header style={{ padding: '4rem 4rem 2rem 4rem', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(163,120,65,0.15)', border: '1px solid #A37841', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', color: '#A37841', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.5rem' }}>
            Kalkulieren statt spekulieren
          </div>
          <h1 style={{ fontSize: '3.6rem', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-1.5px', marginBottom: '1.5rem' }}>
            Entdecke, welche Immobilie sich wirklich rechnet.
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#A0AEC0', maxWidth: '750px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
            Tauche ein in die Welt der Immobilieninvestments. Berechne Cashflows, Zinseszinsen, Steuereffekte und langfristige Vermögenswerte spielerisch und präzise.
          </p>
        </header>

        {/* KACHEL-GRID (SERIÖSE IMMOBILIEN) */}
        <section style={{ padding: '1rem 4rem 4rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(226,217,206,0.12)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" 
                  alt="Mehrfamilienhaus" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(19,56,26,0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  Bestands-Mehrfamilienhaus
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'white' }}>Mehrparteienhäuser analysieren</h3>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#A0AEC0' }}>Kalkuliere Mieteinnahmen, Instandhaltungsrücklagen und Abschreibungen über Jahrzehnte.</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '0.85rem', color: '#A37841', fontWeight: 'bold' }}>
                  Analyse starten
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(226,217,206,0.12)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" 
                  alt="Eigentumswohnung" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(163,120,65,0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  Eigentumswohnung (ETW)
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'white' }}>Klassische Kapitalanlage</h3>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#A0AEC0' }}>Simuliere Hausgeld-Aufteilungen, Leerstandsquoten und den perfekten Eigenkapital-Hebel.</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '0.85rem', color: '#A37841', fontWeight: 'bold' }}>
                  Rendite berechnen
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(226,217,206,0.12)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" 
                  alt="Wohngebäude" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(19,56,26,0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  Sanierung & AfA
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'white' }}>Sanierung & Abschreibung</h3>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#A0AEC0' }}>Beachte degressive Abschreibungen, KfW-Fördermittel und steuerliche Verlustverrechnungen.</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '0.85rem', color: '#A37841', fontWeight: 'bold' }}>
                  Steuerpotenzial prüfen
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* AUTH BEREICH */}
        <section id="auth-section" style={{ padding: '2rem 4rem 4rem 4rem', maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(226,217,206,0.2)', borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(15px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', marginBottom: '1.8rem' }}>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                style={{
                  padding: '10px',
                  background: authMode === 'login' ? '#13381A' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Anmelden
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                style={{
                  padding: '10px',
                  background: authMode === 'register' ? '#A37841' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Registrieren
              </button>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.5rem' }}>
              {authMode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
            </h2>
            <p style={{ textAlign: 'center', color: '#A0AEC0', fontSize: '0.85rem', marginBottom: '1.8rem' }}>
              {authMode === 'login' ? 'Greife auf deine gespeicherten Objekte zu' : 'Starte direkt mit deinen eigenen Immobilienkalkulationen'}
            </p>

            <form onSubmit={(e) => { e.preventDefault(); setShowApp(true); setAuthenticated(true); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {authMode === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '4px', fontWeight: '600' }}>Vollständiger Name</label>
                    <input type="text" placeholder="Max Mustermann" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '4px', fontWeight: '600' }}>E-Mail-Adresse</label>
                  <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '4px', fontWeight: '600' }}>Passwort</label>
                  <input type="password" placeholder="••••••••" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" style={{ marginTop: '0.5rem', padding: '14px', background: authMode === 'login' ? '#13381A' : '#A37841', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
                  {authMode === 'login' ? 'Anmelden & Rechner starten' : 'Konto anlegen & loslegen'}
                </button>
              </div>
            </form>

          </div>
        </section>

        {/* DEVELOPER FOOTER */}
        <footer style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(226,217,206,0.1)', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
            Valuon Estate Investment Suite v2.4
          </div>
          
          <button
            onClick={() => { setShowApp(true); setAuthenticated(true); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              background: 'transparent',
              color: '#A37841',
              border: '2px dashed #A37841',
              borderRadius: '30px',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <IconLightning /> Developer Direktzugang (Ohne Login zur Analyse)
          </button>
        </footer>

      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // 2. INTERNE TOOL-ANSICHT (WENN showApp === true)
  // ----------------------------------------------------------------------------------
  return (
    <main style={{ minHeight: '100vh', padding: '2rem 3rem', background: '#F7F4EC', color: '#13381A', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* MODAL FÜR FEATURES IN ENTWICKLUNG */}
      {devNotice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(13,31,18,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', border: '2px solid #13381A', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A37841', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              <IconLock /> Funktion in Entwicklung
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', color: '#13381A', fontWeight: '800' }}>
              {devNotice}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#4A5568', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Dieses Modul wird derzeit entwickelt und steht in Kürze zur Verfügung. Nutze in der Zwischenzeit unser voll funktionsfähiges Investitions-Analyse Tool für deine detaillierten Objektberechnungen.
            </p>
            <button
              onClick={() => setDevNotice(null)}
              style={{ width: '100%', padding: '12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              Verstanden & Schließen
            </button>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#13381A', letterSpacing: '-0.5px' }}>Valuon Estate</div>
          <div style={{ fontSize: '0.8rem', color: '#A37841', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px' }}>INVESTMENT SUITE</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          
          {/* BACKEND STATUS DOT */}
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 14px', borderRadius: '20px', border: '1px solid #E2D9CE' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: backendStatus === 'ready' ? '#38A169' : (backendStatus === 'waking' ? '#D69E2E' : '#9B2C2C') }} />
            <span style={{ fontWeight: '700', color: '#13381A' }}>
              {backendStatus === 'ready' && 'Backend Bereit'}
              {backendStatus === 'waking' && 'Backend startet...'}
              {backendStatus === 'sleeping' && 'Backend inaktiv'}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#555759' }}>
            Konto: <strong>{userEmail}</strong>
          </div>

          {/* EINSTELLUNGEN ZAHNRAD BUTTON */}
          <button
            onClick={() => setNavChoice('Einstellungen')}
            title="Einstellungen öffnen"
            style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              width: '38px',
              height: '38px',
              background: navChoice === 'Einstellungen' ? '#13381A' : 'white',
              color: navChoice === 'Einstellungen' ? 'white' : '#13381A',
              border: '1px solid #E2D9CE',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            <IconGear />
          </button>

          <button onClick={() => setShowApp(false)} style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', color: '#13381A' }}>
            Startseite verlassen
          </button>
        </div>
      </div>

      {/* HAUPTNAVIGATION BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${mainNavItems.length}, 1fr)`, gap: '1rem', marginBottom: '2rem' }}>
        {mainNavItems.map((item) => {
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

      {/* ================================================================================== */}
      {/* MODUL: INTERNE STARTSEITE (DASHBOARD ÜBERSICHT) */}
      {/* ================================================================================== */}
      {navChoice === 'Startseite' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* HERO SCHNELLSTART BANNER */}
          <div style={{ background: '#13381A', color: '#FAF8F5', padding: '2.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(19,56,26,0.2)' }}>
            <div style={{ maxWidth: '650px' }}>
              <div style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                Zentrale Immobilien-Suite
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
                Willkommen bei Valuon Estate
              </h2>
              <p style={{ margin: 0, color: '#A0AEC0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Ihre professionelle Plattform für präzise Cashflow-Rechnungen, 50-Jahre-Prognosen, Abschreibungsmodelle und Portfolioverwaltung.
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

          {/* WIDGET GRID (HAUPTFUNKTION + ERWEITERUNGEN) */}
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#13381A', marginBottom: '1rem' }}>
              Funktionen & Analyse-Module
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              
              {/* KACHEL 1: ANALYSE TOOL (AKTIV - HERVORGEHOBEN) */}
              <div style={{ background: 'white', border: '2px solid #13381A', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(19,56,26,0.08)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#13381A', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                      Haupt-Tool
                    </span>
                    <span style={{ color: '#38A169', fontSize: '0.8rem', fontWeight: 'bold' }}>Aktiv</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Investitions-Analyse</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Umfassender Rechner für Cashflow, Annuitätendynamik, AfA-Modelle (Linear, Degressiv, Denkmal), Steuerschild und Netto-Eigenkapitalentwicklung.
                  </p>
                </div>
                <button
                  onClick={() => setNavChoice('Analyse')}
                  style={{ marginTop: '1.5rem', padding: '10px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Rechner öffnen
                </button>
              </div>

              {/* KACHEL 2: OBJEKT DATENBANK (AKTIV) */}
              <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                      Verwaltung
                    </span>
                    <span style={{ color: '#38A169', fontSize: '0.8rem', fontWeight: 'bold' }}>Aktiv</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Objekt-Datenbank</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Verwalte deine gespeicherten Immobilienkalkulationen, rufe frühere Berechnungen ab oder entferne alte Datensätze.
                  </p>
                </div>
                <button
                  onClick={() => setNavChoice('Objekt Datenbank')}
                  style={{ marginTop: '1.5rem', padding: '10px', background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Zur Datenbank
                </button>
              </div>

              {/* KACHEL 3: PORTFOLIO AGGREGATOR (IN ENTWICKLUNG) */}
              <div 
                onClick={() => setDevNotice('Multi-Objekt Portfolio-Dashboard')}
                style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(163,120,65,0.1)', color: '#A37841', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                      Erweiterung
                    </span>
                    <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconLock /> In Entwicklung
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Portfolio Aggregator</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Kombiniert alle Objekte deiner Datenbank zu einer Gesamtbilanz. Ermittelt kumulierten Cashflow und Gesamt-LTV.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#A37841', fontWeight: '800' }}>
                  Vorschau anzeigen →
                </div>
              </div>

              {/* KACHEL 4: SZENARIO-VERGLEICH (IN ENTWICKLUNG) */}
              <div 
                onClick={() => setDevNotice('Szenario-Vergleich & Stresstest')}
                style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(163,120,65,0.1)', color: '#A37841', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                      Simulation
                    </span>
                    <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconLock /> In Entwicklung
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Szenario-Vergleich</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Analysiere 'What-If'-Szenarien: Zinserhöhungen, schwankende Leerstände oder alternative Eigenkapital-Einsätze im direkten Vergleich.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#A37841', fontWeight: '800' }}>
                  Vorschau anzeigen →
                </div>
              </div>

              {/* KACHEL 5: BANK-EXPOSÉ GENERATOR (IN ENTWICKLUNG) */}
              <div 
                onClick={() => setDevNotice('Bank-Exposé PDF-Generator')}
                style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(163,120,65,0.1)', color: '#A37841', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                      Export
                    </span>
                    <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconLock /> In Entwicklung
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Bank-Exposé Generator</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Erstelle ein druckfertiges, strukturiertes PDF-Exposé für Bankgespräche mit allen betriebswirtschaftlichen Kennzahlen.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#A37841', fontWeight: '800' }}>
                  Vorschau anzeigen →
                </div>
              </div>

              {/* KACHEL 6: KI-EXPOSÉ SCANNER (IN ENTWICKLUNG) */}
              <div 
                onClick={() => setDevNotice('KI-Exposé Scanner & Text-Parser')}
                style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(163,120,65,0.1)', color: '#A37841', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                      Smart Import
                    </span>
                    <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconLock /> In Entwicklung
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>KI-Exposé Scanner</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Füge Freitext aus Online-Portalen ein. Die KI extrahiert Kaufpreis, Quadratmeter und Mieteinzeldaten automatisch in den Rechner.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#A37841', fontWeight: '800' }}>
                  Vorschau anzeigen →
                </div>
              </div>

            </div>
          </div>

          {/* SCHNELLZUGRIFF AUF DIE ZULETZT GESPEICHERTEN OBJEKTE */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#13381A', fontWeight: '800' }}>
                Gespeicherte Objekte (Quick Load)
              </h3>
              <button onClick={() => setNavChoice('Objekt Datenbank')} style={{ background: 'none', border: 'none', color: '#A37841', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                Alle Objekte anzeigen →
              </button>
            </div>

            {loadingDb ? (
              <div style={{ fontSize: '0.85rem', color: '#718096', padding: '1rem 0' }}>Lade Objekte aus der Datenbank...</div>
            ) : dbProperties.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#718096', padding: '1rem 0' }}>Noch keine Objekte in der Datenbank gespeichert.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {dbProperties.slice(0, 3).map((item, idx) => (
                  <div key={item.id || idx} style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#13381A', fontSize: '0.95rem', marginBottom: '4px' }}>
                        {item.name || item.obj_name || 'Unbenanntes Objekt'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                        {item.stadt || 'Keine Stadt'} · {formatEuroInt(item.kaufpreis)} € · {item.qm} m²
                      </div>
                    </div>
                    <button
                      onClick={() => loadPropertyFromDb(item)}
                      style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: '#13381A', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      <IconFolder /> In Analyse laden
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ================================================================================== */}
      {/* MODUL 1: ANALYSE TOOL */}
      {/* ================================================================================== */}
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
                      Standard 75 / 25 % Verteilung: 75% umlegbar, 25% nicht umlegbar.
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
                      EK-Empfehlung: Wir empfehlen mind. Kaufnebenkosten ({formatEuroInt(summe_nk)} €) einzubringen.
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
                            <IconTrash />
                          </button>
                        )}
                      </div>
                    ))}

                    <button type="button" onClick={addCapexRow} style={{ marginTop: '6px', padding: '8px 12px', background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                      + Weitere Sonderinvestition hinzufügen
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
                {loading ? 'Berechne Investment...' : 'Investition analysieren'}
              </button>

            </div>

            {/* RECHTE SPALTE: DASHBOARD & RESULTATE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2D9CE', paddingBottom: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#13381A', margin: '0 0 4px 0', letterSpacing: '-0.8px' }}>
                    {formData.obj_name || 'Muster Wohnung'}
                  </h1>
                  <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '500' }}>
                    Kaufpreis: {formatEuroInt(formData.kaufpreis)} € | EK: {formatEuroInt(formData.ek_euro)} € ({formatPct(formData.kaufpreis > 0 ? (formData.ek_euro / formData.kaufpreis) * 100 : 0)} %)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Projektionshorizont:</label>
                    <select
                      value={projectionHorizon}
                      onChange={(e) => setProjectionHorizon(e.target.value)}
                      style={{ ...inputTextStyle, background: '#FAF8F5', fontWeight: 'bold', padding: '6px 12px' }}
                    >
                      <option value="10">10 Jahre (Standard)</option>
                      <option value="15">15 Jahre</option>
                      <option value="20">20 Jahre</option>
                      <option value="25">25 Jahre</option>
                      <option value="30">30 Jahre</option>
                      <option value="payoff">Bis Darlehen vollständig getilgt ist</option>
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
                <div style={{ padding: '12px', background: '#E6FFFA', color: '#234E52', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #B2F5EA' }}>
                  {saveSuccess}
                </div>
              )}

              {calcError && (
                <div style={{ padding: '14px 18px', background: '#FFF5F5', color: '#9B2C2C', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #FEB2B2' }}>
                  <strong>Fehler bei der Berechnung:</strong> {calcError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <MetricCard title="CASHFLOW NETTO" value={`${formatEuro(monthlyCashflow)} €/M`} isNegative={monthlyCashflow < 0} />
                <MetricCard title="BRUTTOMIETRENDITE" value={`${formatPct(bruttoMietrendite)} %`} />
                <MetricCard title={`GESAMTGEWINN (${actualHorizonYears} J.)`} value={`${formatEuroInt(result ? gesamtGewinnHorizon : 0)} €`} />
                <MetricCard title="EK-RENDITE P.A. (IRR)" value={`${formatPct((result?.summary?.irr || 0) * 100)} %`} highlight={true} />
              </div>

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

              {activeDashboardTab === 'Liquiditätsverlauf & Tilgung' && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800', color: '#13381A' }}>
                    Liquiditätsverlauf, steuerliche Abschreibung & Kapitalentwicklung
                  </h3>
                  <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.85rem', color: '#718096' }}>
                    Wähle einen Themenbereich, um alle Kennzahlen übersichtlich zu betrachten.
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
                                    {taxVal < 0 
                                      ? `-${formatEuroInt(Math.abs(taxVal))} € (Erstattung)` 
                                      : (taxVal > 0 ? `+${formatEuroInt(taxVal)} €` : '0 €')}
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
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

          </div>
        </form>
      )}

      {/* ================================================================================== */}
      {/* MODUL 2: OBJEKT DATENBANK */}
      {/* ================================================================================== */}
      {navChoice === 'Objekt Datenbank' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#13381A' }}>Objekt Datenbank & Pipeline</h2>
            <button onClick={fetchDatabaseProperties} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              <IconRefresh /> Aktualisieren
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
                        <button onClick={() => loadPropertyFromDb(item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <IconFolder /> In Analyse laden
                        </button>
                        <button onClick={() => deletePropertyFromDb(item.id)} style={{ padding: '6px 10px', background: '#FFF5F5', color: '#9B2C2C', border: '1px solid #FEB2B2', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <IconTrash />
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

      {/* ================================================================================== */}
      {/* MODUL 3: IMMOBILIENWISSEN */}
      {/* ================================================================================== */}
      {navChoice === 'Immobilienwissen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Immobilienwissen & Leitfäden</h2>
          <p style={{ color: '#555759' }}>Fachartikel zu AfA-Sonderformen, Annuitätenlogik und steuerlichen Verlustverrechnungen.</p>
        </div>
      )}

      {/* ================================================================================== */}
      {/* MODUL 4: EINSTELLUNGEN (ÜBER ZAHNRAD ERREICHBAR) */}
      {/* ================================================================================== */}
      {navChoice === 'Einstellungen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <IconGear />
            <h2 style={{ margin: 0, color: '#13381A' }}>System-Einstellungen</h2>
          </div>
          <p style={{ color: '#555759', marginBottom: '1.5rem' }}>
            Konfiguriere deine globalen Parameter-Standards für zukünftige Objektanalysen.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '500px' }}>
            <div>
              <label style={labelStyle}>Standard Grenzsteuersatz (%)</label>
              <input type="number" defaultValue={42} style={inputTextStyle} />
            </div>
            <div>
              <label style={labelStyle}>Standard Maklerprovision (%)</label>
              <input type="number" step="0.01" defaultValue={3.57} style={inputTextStyle} />
            </div>
            <div>
              <label style={labelStyle}>Standard Notar & Grundbuch (%)</label>
              <input type="number" step="0.1" defaultValue={2.0} style={inputTextStyle} />
            </div>
            <button style={{ padding: '12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', width: 'fit-content' }}>
              Einstellungen speichern
            </button>
          </div>
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
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg width="100%" height="100%" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E2D9CE" strokeWidth="4.5" />
          
          <circle
            cx="21" cy="21" r="15.915"
            fill="transparent" stroke="#13381A" strokeWidth="4.5"
            strokeDasharray={`${hbPct} ${100 - hbPct}`}
            strokeDashoffset="25"
          />

          <circle
            cx="21" cy="21" r="15.915"
            fill="transparent" stroke="#A37841" strokeWidth="4.5"
            strokeDasharray={`${eqPct} ${100 - eqPct}`}
            strokeDashoffset={`${25 - hbPct}`}
          />

          {kfwPct > 0 && (
            <circle
              cx="21" cy="21" r="15.915"
              fill="transparent" stroke="#2B6CB0" strokeWidth="4.5"
              strokeDasharray={`${kfwPct} ${100 - kfwPct}`}
              strokeDashoffset={`${25 - hbPct - eqPct}`}
            />
          )}

          <text x="21" y="19" textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#718096">GESAMT</text>
          <text x="21" y="24.5" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#13381A">{formatEuroInt(totalInvestment)} €</text>
        </svg>
      </div>

      <div style={{ marginTop: '1rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2D9CE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: '#13381A', borderRadius: '3px', display: 'inline-block' }}></span>
            <span>Hausbank Darlehen</span>
          </div>
          <span style={{ fontWeight: '800', color: '#13381A' }}>{formatEuroInt(hb)} € ({formatPct(hbPct)}%)</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2D9CE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: '#A37841', borderRadius: '3px', display: 'inline-block' }}></span>
            <span>Eigenkapital</span>
          </div>
          <span style={{ fontWeight: '800', color: '#A37841' }}>{formatEuroInt(equity)} € ({formatPct(eqPct)}%)</span>
        </div>

        {kfwPct > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2D9CE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#2B6CB0', borderRadius: '3px', display: 'inline-block' }}></span>
              <span>KfW-Darlehen</span>
            </div>
            <span style={{ fontWeight: '800', color: '#2B6CB0' }}>{formatEuroInt(kfw)} € ({formatPct(kfwPct)}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getNiceScale(maxVal) {
  if (!maxVal || maxVal <= 0) return { niceMax: 10000, ticks: [10000, 7500, 5000, 2500, 0] };

  const allowedSteps = [
    100, 200, 250, 500,
    1000, 1500, 2000, 2500, 3000, 4000, 5000,
    10000, 15000, 20000, 25000, 30000, 40000, 50000,
    100000, 150000, 200000, 250000, 300000, 500000, 1000000
  ];

  const minNiceMax = maxVal * 1.05;
  let chosenStep = 25000;

  for (let s of allowedSteps) {
    if (s * 4 >= minNiceMax) {
      chosenStep = s;
      break;
    }
  }

  const niceMax = chosenStep * 4;
  const ticks = [niceMax, chosenStep * 3, chosenStep * 2, chosenStep * 1, 0];
  return { niceMax, ticks };
}

function ProjectionChart({ projection, kaufpreis, view }) {
  if (!projection || projection.length === 0) {
    return <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Keine Projektionsdaten vorhanden.</div>;
  }

  const isNavView = view.includes('Vermögensstruktur');

  if (isNavView) {
    const rawMax = Math.max(...projection.map(r => r['Immobilienwert'] || kaufpreis || 100000));
    const { niceMax, ticks } = getNiceScale(rawMax);

    return (
      <div style={{ width: '100%', marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', height: '220px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.68rem', color: '#718096', textAlign: 'right', paddingRight: '8px', fontVariantNumeric: 'tabular-nums' }}>
            {ticks.map((val, idx) => (
              <span key={idx}>{formatEuroInt(val)} €</span>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
              
              {[0, 42, 85, 127, 170].map((y, idx) => (
                <line key={idx} x1="0" y1={y} x2="500" y2={y} stroke="#E2D9CE" strokeDasharray="3 3" />
              ))}

              {projection.map((r, i) => {
                const x = (i / projection.length) * 480 + 5;
                const nav = (r['Immobilienwert'] || 0) - (r['Restschuld'] || 0);
                const barHeight = (nav / niceMax) * 170;
                const y = 170 - barHeight;

                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={380 / projection.length}
                    height={Math.max(0, barHeight)}
                    fill="#A37841"
                    opacity="0.85"
                    rx="3"
                  />
                );
              })}

              <polyline
                fill="none"
                stroke="#13381A"
                strokeWidth="3.5"
                points={projection.map((r, i) => {
                  const x = (i / projection.length) * 480 + 20;
                  const y = 170 - ((r['Immobilienwert'] || 0) / niceMax) * 170;
                  return `${x},${y}`;
                }).join(' ')}
              />

              <polyline
                fill="none"
                stroke="#9B2C2C"
                strokeWidth="3.5"
                points={projection.map((r, i) => {
                  const x = (i / projection.length) * 480 + 20;
                  const y = 170 - ((r['Restschuld'] || 0) / niceMax) * 170;
                  return `${x},${y}`;
                }).join(' ')}
              />

              <line x1="0" y1="170" x2="500" y2="170" stroke="#13381A" strokeWidth="2" />

              {projection.map((r, i) => {
                const x = (i / projection.length) * 480 + 20;
                return (
                  <g key={i}>
                    <line x1={x} y1="170" x2={x} y2="175" stroke="#13381A" strokeWidth="1.5" />
                    <text x={x} y="195" textAnchor="middle" fontSize="11" fontWeight="700" fill="#13381A">
                      {r['Jahr'] || i + 1}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#718096', marginTop: '2px' }}>
          Projektionsjahre
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '4px', background: '#13381A', borderRadius: '2px' }}></span>
            <span>Objektwert</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '4px', background: '#9B2C2C', borderRadius: '2px' }}></span>
            <span>Restschuld</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#A37841', borderRadius: '3px' }}></span>
            <span>Netto-EK (NAV)</span>
          </div>
        </div>
      </div>
    );
  } else {
    const rawRentMax = Math.max(...projection.map(r => r['Mieteinnahmen IST'] || 10000));
    const { niceMax, ticks } = getNiceScale(rawRentMax);
    const absMaxCf = Math.max(1000, ...projection.map(r => Math.abs(r['Cashflow Netto'] || 0))) * 1.5;

    return (
      <div style={{ width: '100%', marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', height: '220px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.68rem', color: '#718096', textAlign: 'right', paddingRight: '8px', fontVariantNumeric: 'tabular-nums' }}>
            {ticks.map((val, idx) => (
              <span key={idx}>{formatEuroInt(val)} €</span>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
              
              {[0, 42, 85, 127].map((y, idx) => (
                <line key={idx} x1="0" y1={y} x2="500" y2={y} stroke="#E2D9CE" strokeDasharray="3 3" />
              ))}

              <line x1="0" y1="130" x2="500" y2="130" stroke="#718096" strokeWidth="1" strokeDasharray="2 2" />

              {projection.map((r, i) => {
                const x = (i / projection.length) * 480 + 8;
                const cf = r['Cashflow Netto'] || 0;
                const barHeight = (Math.abs(cf) / absMaxCf) * 45;
                const y = cf >= 0 ? 130 - barHeight : 130;

                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={360 / projection.length}
                    height={Math.max(4, barHeight)}
                    fill={cf >= 0 ? '#38A169' : '#9B2C2C'}
                    opacity="0.9"
                    rx="2"
                  />
                );
              })}

              <polyline
                fill="none"
                stroke="#A37841"
                strokeWidth="3.5"
                points={projection.map((r, i) => {
                  const x = (i / projection.length) * 480 + 20;
                  const y = 130 - ((r['Mieteinnahmen IST'] || 0) / niceMax) * 120;
                  return `${x},${y}`;
                }).join(' ')}
              />

              <line x1="0" y1="170" x2="500" y2="170" stroke="#13381A" strokeWidth="2" />

              {projection.map((r, i) => {
                const x = (i / projection.length) * 480 + 20;
                return (
                  <g key={i}>
                    <line x1={x} y1="170" x2={x} y2="175" stroke="#13381A" strokeWidth="1.5" />
                    <text x={x} y="195" textAnchor="middle" fontSize="11" fontWeight="700" fill="#13381A">
                      {r['Jahr'] || i + 1}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#718096', marginTop: '2px' }}>
          Projektionsjahre
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '4px', background: '#A37841', borderRadius: '2px' }}></span>
            <span>Kaltmiete (brutto)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#38A169', borderRadius: '3px' }}></span>
            <span>Cashflow Netto (+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#9B2C2C', borderRadius: '3px' }}></span>
            <span>Cashflow Netto (-)</span>
          </div>
        </div>
      </div>
    );
  }
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
