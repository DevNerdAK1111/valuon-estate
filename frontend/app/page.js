'use client';
import { useState, useEffect } from 'react';

// Imports aus unseren neuen Modulen
import { formatEuro, formatEuroInt, formatPct } from '@/utils/formatters';
import { IconGear, IconTrash, IconFolder, IconRefresh, IconLock, IconArrowRight } from '@/components/ui/Icons';
import StepperInput from '@/components/ui/StepperInput';
import MetricCard from '@/components/ui/MetricCard';
import { Expander, SubExpander } from '@/components/ui/Expander';
import DevNoticeModal from '@/components/ui/DevNoticeModal';
import DonutChart from '@/components/charts/DonutChart';
import ProjectionChart from '@/components/charts/ProjectionChart';
import Header from '@/components/layout/Header';
import LandingPage from '@/components/landing/LandingPage';

const BACKEND_URL = 'https://valuon-estate-backend.onrender.com';

const grunderwerbsteuerSätze = {
  'Baden-Württemberg': 5.0, 'Bayern': 3.5, 'Berlin': 6.0, 'Brandenburg': 6.5,
  'Bremen': 5.0, 'Hamburg': 5.5, 'Hessen': 6.0, 'Mecklenburg-Vorpommern': 6.0,
  'Niedersachsen': 5.0, 'Nordrhein-Westfalen': 6.5, 'Rheinland-Pfalz': 5.0,
  'Saarland': 6.5, 'Sachsen': 5.5, 'Sachsen-Anhalt': 5.0, 'Schleswig-Holstein': 6.5,
  'Thüringen': 6.5
};

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('developer@valuon-estate.de');
  const [navChoice, setNavChoice] = useState('Startseite');

  const [activeDashboardTab, setActiveDashboardTab] = useState('Executive Dashboard');
  const [tableTheme, setTableTheme] = useState('Kapitaldienst & Steuern');
  const [projectionHorizon, setProjectionHorizon] = useState('10');
  const [chartView, setChartView] = useState('1. Vermögensstruktur & NAV (Netto-Eigenkapital)');

  const [devNotice, setDevNotice] = useState(null);
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
      .then((res) => { if (res.ok) setBackendStatus('ready'); else setBackendStatus('sleeping'); })
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

  // ----------------------------------------------------------------------------------
  // 1. EXTERNE LANDING PAGE (VOR LOGIN)
  // ----------------------------------------------------------------------------------
  if (!showApp) {
    return (
      <LandingPage 
        setShowApp={setShowApp} 
        setAuthenticated={setAuthenticated} 
        userEmail={userEmail} 
        setUserEmail={setUserEmail} 
      />
    );
  }

  // ----------------------------------------------------------------------------------
  // 2. INTERNE TOOL-ANSICHT
  // ----------------------------------------------------------------------------------
  return (
    <main style={{ minHeight: '100vh', padding: '2rem 3rem', background: '#F7F4EC', color: '#13381A', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* DEV NOTICE MODAL */}
      <DevNoticeModal devNotice={devNotice} onClose={() => setDevNotice(null)} />

      {/* HEADER & NAV BAR */}
      <Header 
        navChoice={navChoice} 
        setNavChoice={setNavChoice} 
        backendStatus={backendStatus} 
        setDevNotice={setDevNotice} 
        userEmail={userEmail} 
      />

      {/* ================================================================================== */}
      {/* MODUL: INTERNE STARTSEITE */}
      {/* ================================================================================== */}
      {navChoice === 'Startseite' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* HERO BANNER */}
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

          {/* WIDGET GRID */}
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#13381A', marginBottom: '1rem' }}>
              Funktionen & Analyse-Module
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              
              <div style={{ background: 'white', border: '2px solid #13381A', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(19,56,26,0.08)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#13381A', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>Haupt-Tool</span>
                    <span style={{ color: '#38A169', fontSize: '0.8rem', fontWeight: 'bold' }}>Aktiv</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Investitions-Analyse</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Umfassender Rechner für Cashflow, Annuitätendynamik, AfA-Modelle (Linear, Degressiv, Denkmal), Steuerschild und Netto-Eigenkapitalentwicklung.
                  </p>
                </div>
                <button onClick={() => setNavChoice('Analyse')} style={{ marginTop: '1.5rem', padding: '10px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Rechner öffnen
                </button>
              </div>

              <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>Verwaltung</span>
                    <span style={{ color: '#38A169', fontSize: '0.8rem', fontWeight: 'bold' }}>Aktiv</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Objekt-Datenbank</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Verwalte deine gespeicherten Immobilienkalkulationen, rufe frühere Berechnungen ab oder entferne alte Datensätze.
                  </p>
                </div>
                <button onClick={() => setNavChoice('Objekt Datenbank')} style={{ marginTop: '1.5rem', padding: '10px', background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Zur Datenbank
                </button>
              </div>

              <div onClick={() => setDevNotice('Multi-Objekt Portfolio-Dashboard')} style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(163,120,65,0.1)', color: '#A37841', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>Erweiterung</span>
                    <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLock /> In Entwicklung</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Portfolio Aggregator</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Kombiniert alle Objekte deiner Datenbank zu einer Gesamtbilanz. Ermittelt kumulierten Cashflow und Gesamt-LTV.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#A37841', fontWeight: '800' }}>Vorschau anzeigen →</div>
              </div>

              <div onClick={() => setDevNotice('Szenario-Vergleich & Stresstest')} style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(163,120,65,0.1)', color: '#A37841', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>Simulation</span>
                    <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLock /> In Entwicklung</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Szenario-Vergleich</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Analysiere 'What-If'-Szenarien: Zinserhöhungen, schwankende Leerstände oder alternative Eigenkapital-Einsätze.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#A37841', fontWeight: '800' }}>Vorschau anzeigen →</div>
              </div>

              <div onClick={() => setDevNotice('Bank-Exposé PDF-Generator')} style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(163,120,65,0.1)', color: '#A37841', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>Export</span>
                    <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLock /> In Entwicklung</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>Bank-Exposé Generator</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Erstelle ein druckfertiges, strukturiertes PDF-Exposé für Bankgespräche mit allen betriebswirtschaftlichen Kennzahlen.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#A37841', fontWeight: '800' }}>Vorschau anzeigen →</div>
              </div>

              <div onClick={() => setDevNotice('KI-Exposé Scanner & Text-Parser')} style={{ background: 'white', border: '1px dashed #A37841', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(163,120,65,0.1)', color: '#A37841', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>Smart Import</span>
                    <span style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLock /> In Entwicklung</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#13381A', fontWeight: '800' }}>KI-Exposé Scanner</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5' }}>
                    Füge Freitext aus Online-Portalen ein. Die KI extrahiert Kaufpreis, Quadratmeter und Mieteinzeldaten automatisch.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#A37841', fontWeight: '800' }}>Vorschau anzeigen →</div>
              </div>

            </div>
          </div>

          {/* SCHNELLZUGRIFF DATENBANK */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#13381A', fontWeight: '800' }}>Gespeicherte Objekte (Quick Load)</h3>
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
                    <div style={infoBoxStyle}>Standard 75 / 25 % Verteilung: 75% umlegbar, 25% nicht umlegbar.</div>
                    <StepperInput label="Nicht umlegbares Hausgeld (€/Monat)" value={formData.hausgeld_nicht_umlegbar} onChange={handleHausgeldNichtUmlegbarChange} step={5} isCurrency={true} />
                  </SubExpander>

                  <StepperInput label="Sanierungsaufwand (€)" value={formData.sanierung} onChange={(v) => updateField('sanierung', v)} step={1000} isCurrency={true} />
                </div>
              </Expander>

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

                  <StepperInput label="Verkaufsnebenkosten / Exit (%)" value={formData.exit_cost} onChange={(v) => updateField('exit_cost', v)} step={0.1} isPercent={true} />
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
      {/* MODUL 4: EINSTELLUNGEN */}
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

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568' };
const inputTextStyle = { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' };
const badgeStyle = { marginTop: '4px', background: '#FAF8F5', padding: '6px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#13381A', textAlign: 'center', border: '1px solid #E2D9CE', fontVariantNumeric: 'tabular-nums' };
const infoBoxStyle = { marginTop: '6px', marginBottom: '8px', background: '#EBF8FF', color: '#2B6CB0', border: '1px solid #BEE3F8', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', lineHeight: '1.35' };
const hrStyle = { border: 'none', borderTop: '1px solid #E2D9CE', margin: '6px 0' };
