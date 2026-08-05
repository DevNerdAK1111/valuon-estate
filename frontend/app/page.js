'use client';
import { useState, useEffect } from 'react';

// Relative Imports
import Header from '../components/layout/Header';
import LandingPage from '../components/landing/LandingPage';
import DevNoticeModal from '../components/ui/DevNoticeModal';
import Parametrisierung from '../components/analyse/Parametrisierung';
import ExecutiveDashboard from '../components/analyse/ExecutiveDashboard';
import DatabaseView from '../components/database/DatabaseView';
import ProfileView from '../components/profile/ProfileView';
import OnboardingView from '../components/profile/OnboardingView';

import { IconGear, IconFolder, IconLock, IconArrowRight } from '../components/ui/Icons';
import { formatEuroInt } from '../utils/formatters';
import { supabase } from '../lib/supabaseClient';
import { loadUserProfileFromSupabase, saveUserProfileToSupabase } from '../lib/profileApi';

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
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [navChoice, setNavChoice] = useState('Startseite');

  const [userProfile, setUserProfile] = useState({
    profilname: '',
    vorname: '',
    nachname: '',
    geburtsdatum: '',
    telefon: '',
    strasse: '',
    plz: '',
    ort: '',
    land: 'Deutschland',
    bruttoEinkommen: 65000,
    steuerklasse: '1',
    familienstand: 'Ledig',
    kinderAnzahl: 0,
    kirchensteuer: false,
    kirchensteuersatz: 9.0,
    grenzsteuersatz: 42.0,
    onboarded: false
  });

  const [activeDashboardTab, setActiveDashboardTab] = useState('Executive Dashboard');
  const [tableTheme, setTableTheme] = useState('Kapitaldienst & Steuern');
  const [projectionHorizon, setProjectionHorizon] = useState('10');
  const [chartView, setChartView] = useState('1. Vermögensstruktur & NAV (Netto-Eigenkapital)');

  const [devNotice, setDevNotice] = useState(null);
  const [isTargetCustomized, setIsTargetCustomized] = useState(false);
  const [isHausgeldCustomized, setIsHausgeldCustomized] = useState(false);
  const [backendStatus, setBackendStatus] = useState('sleeping');

  // LADE PROFIL DIREKT AUS SUPABASE
  const fetchProfileFromSupabase = async (uid, email) => {
    const dbProfile = await loadUserProfileFromSupabase(uid);
    if (dbProfile) {
      const formatted = {
        profilname: dbProfile.profilname || '',
        vorname: dbProfile.vorname || '',
        nachname: dbProfile.nachname || '',
        geburtsdatum: dbProfile.geburtsdatum || '',
        telefon: dbProfile.telefon || '',
        strasse: dbProfile.strasse || '',
        plz: dbProfile.plz || '',
        ort: dbProfile.ort || '',
        land: dbProfile.land || 'Deutschland',
        bruttoEinkommen: dbProfile.brutto_einkommen || 65000,
        steuerklasse: dbProfile.steuerklasse || '1',
        familienstand: dbProfile.familienstand || 'Ledig',
        kinderAnzahl: dbProfile.kinder_anzahl || 0,
        kirchensteuer: !!dbProfile.kirchensteuer,
        kirchensteuersatz: dbProfile.kirchensteuersatz || 9.0,
        grenzsteuersatz: dbProfile.grenzsteuersatz || 42.0,
        onboarded: dbProfile.onboarded
      };
      setUserProfile(formatted);
      setFormData((prev) => ({
        ...prev,
        tax_rate_pct: formatted.grenzsteuersatz || prev.tax_rate_pct
      }));
    } else {
      // Neues Profil anlegen
      setUserProfile((prev) => ({ ...prev, onboarded: false }));
    }
  };

  useEffect(() => {
    pingBackend();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
        setAuthenticated(true);
        setShowApp(true);
        fetchProfileFromSupabase(session.user.id, session.user.email);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
        setAuthenticated(true);
        setShowApp(true);
        fetchProfileFromSupabase(session.user.id, session.user.email);
      } else {
        setAuthenticated(false);
        setShowApp(false);
        setUserId(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const pingBackend = () => {
    if (backendStatus === 'ready') return;
    setBackendStatus('waking');
    fetch(`${BACKEND_URL}/`)
      .then((res) => { if (res.ok) setBackendStatus('ready'); else setBackendStatus('sleeping'); })
      .catch(() => setBackendStatus('sleeping'));
  };

  const [formData, setFormData] = useState({
    obj_name: '',
    objektart: 'Eigentumswohnung',
    bundesland: 'Niedersachsen',
    stadt: '',
    stadtteil: '',
    kaufpreis: 0.0,
    qm: 0.0,
    baujahr: 2000,
    kaltmiete_monat: 0.0,
    ist_sqm: 0.0,
    target_monat: 0.0,
    target_sqm: 0.0,
    adj_year: 1,
    hausgeld: 0.0,
    hausgeld_nicht_umlegbar: 0.0,
    sanierung: 0.0,
    inst_sqm: 12.0,
    mgt_monat: 30.0,
    vac_rate_pct: 2.0,
    grwt_p: 5.0,
    notar_p: 2.0,
    makler_p: 3.57,
    sonst_nk: 0.0,
    loan_type: 'Annuitätendarlehen',
    hb_zins: 3.8,
    hb_tilg: 2.0,
    sondertilg: 0.0,
    grace_years: 0,
    ek_euro: 0.0,
    zinsbindung: 10,
    folge_zins: 3.8,
    folge_mode: 'Rate konstant halten (Annuität)',
    folge_tilg: 2.0,
    kfw_amt: 0.0,
    kfw_zins: 2.1,
    kfw_tilg: 3.0,
    kfw_grace_years: 0,
    kfw_grant: 0.0,
    tax_rate_pct: userProfile.grenzsteuersatz || 42.0,
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
  }, [navChoice, showApp, userEmail]);

  const fetchDatabaseProperties = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/properties`);
      if (res.ok) {
        const data = await res.json();
        const rawList = data.properties || data || [];
        const userList = rawList.filter(item => !item.user_email || item.user_email === userEmail);
        setDbProperties(userList);
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
        name: formData.obj_name || 'Unbenanntes Objekt',
        obj_name: formData.obj_name || 'Unbenanntes Objekt',
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
        setSaveSuccess('Objekt erfolgreich in deiner Datenbank gespeichert.');
        fetchDatabaseProperties();
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

  const handleSaveProfile = async (updatedProfile) => {
    setUserProfile(updatedProfile);
    if (userId) {
      await saveUserProfileToSupabase(userId, userEmail, updatedProfile);
    }
    setFormData((prev) => ({
      ...prev,
      tax_rate_pct: updatedProfile.grenzsteuersatz || prev.tax_rate_pct
    }));
  };

  const handleCompleteOnboarding = async (completedProfile) => {
    const updated = { ...completedProfile, onboarded: true };
    setUserProfile(updated);
    if (userId) {
      await saveUserProfileToSupabase(userId, userEmail, updated);
    }
    setFormData((prev) => ({
      ...prev,
      tax_rate_pct: updated.grenzsteuersatz || prev.tax_rate_pct
    }));
    setNavChoice('Startseite');
  };

  const handlePasswordChange = (oldPwd, newPwd) => {
    console.log('Passwort geändert für:', userEmail);
  };

  const handleDeleteAccount = async () => {
    if (userId) {
      await supabase.from('profiles').delete().eq('id', userId);
    }
    alert('Account wurde erfolgreich gelöscht.');
    handleLogout();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowApp(false);
    setAuthenticated(false);
    setNavChoice('Startseite');
    setResult(null);
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
    if (!confirm('Möchtest du dieses Objekt wirklich aus deiner Datenbank löschen?')) return;
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

  const greetingName = userProfile.profilname || userProfile.vorname || (userEmail ? userEmail.split('@')[0] : 'Investor');

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

  // FORCE ONBOARDING ERST-EINRICHTUNG WENN PROFIL NOCH NICHT ERSTELLT IST
  if (!userProfile.onboarded) {
    return (
      <main style={{ minHeight: '100vh', padding: '2rem 3rem', background: '#F7F4EC', color: '#13381A', fontFamily: 'sans-serif' }}>
        <OnboardingView 
          userEmail={userEmail}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 3rem', background: '#F7F4EC', color: '#13381A', fontFamily: 'sans-serif', position: 'relative' }}>
      
      <DevNoticeModal devNotice={devNotice} onClose={() => setDevNotice(null)} />

      <Header 
        navChoice={navChoice} 
        setNavChoice={setNavChoice} 
        backendStatus={backendStatus} 
        userEmail={userEmail} 
        userProfile={userProfile}
        onLogout={handleLogout}
      />

      {/* MODUL: STARTSEITE */}
      {navChoice === 'Startseite' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: '#13381A', color: '#FAF8F5', padding: '2.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(19,56,26,0.2)' }}>
            <div style={{ maxWidth: '650px' }}>
              <div style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                Zentrale Immobilien-Suite
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
                Willkommen zurück, {greetingName}
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
                    Umfassender Rechner für Cashflow, Annuitätendynamik, AfA-Modelle, Steuerschild und Netto-Eigenkapitalentwicklung.
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

      {/* MODUL 1: ANALYSE TOOL */}
      {navChoice === 'Analyse' && (
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
            <Parametrisierung 
              formData={formData}
              updateField={updateField}
              pingBackend={pingBackend}
              handleQmChange={handleQmChange}
              handleIstMonatChange={handleIstMonatChange}
              handleIstSqmChange={handleIstSqmChange}
              handleHausgeldChange={handleHausgeldChange}
              handleHausgeldNichtUmlegbarChange={handleHausgeldNichtUmlegbarChange}
              handleTargetMonatChange={handleTargetMonatChange}
              handleTargetSqmChange={handleTargetSqmChange}
              grunderwerbsteuerSätze={grunderwerbsteuerSätze}
              summe_nk={summe_nk}
              grwt_euro={grwt_euro}
              notar_euro={notar_euro}
              makler_euro={makler_euro}
              capexList={capexList}
              handleCapexChange={handleCapexChange}
              removeCapexRow={removeCapexRow}
              addCapexRow={addCapexRow}
              loading={loading}
            />

            <ExecutiveDashboard 
              formData={formData}
              result={result}
              projectionHorizon={projectionHorizon}
              setProjectionHorizon={setProjectionHorizon}
              handleSaveToDatabase={handleSaveToDatabase}
              saving={saving}
              saveSuccess={saveSuccess}
              calcError={calcError}
              monthlyCashflow={monthlyCashflow}
              bruttoMietrendite={bruttoMietrendite}
              actualHorizonYears={actualHorizonYears}
              gesamtGewinnHorizon={gesamtGewinnHorizon}
              activeDashboardTab={activeDashboardTab}
              setActiveDashboardTab={setActiveDashboardTab}
              chartView={chartView}
              setChartView={setChartView}
              slicedProjection={slicedProjection}
              summe_nk={summe_nk}
              tableTheme={tableTheme}
              setTableTheme={setTableTheme}
              cumulatedCashflowHorizon={cumulatedCashflowHorizon}
              endNav={endNav}
            />
          </div>
        </form>
      )}

      {/* MODUL 2: OBJEKT DATENBANK */}
      {navChoice === 'Objekt Datenbank' && (
        <DatabaseView 
          loadingDb={loadingDb}
          dbProperties={dbProperties}
          fetchDatabaseProperties={fetchDatabaseProperties}
          loadPropertyFromDb={loadPropertyFromDb}
          deletePropertyFromDb={deletePropertyFromDb}
        />
      )}

      {/* MODUL 3: NUTZERPROFIL */}
      {navChoice === 'Profil' && (
        <ProfileView 
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onSaveProfile={handleSaveProfile}
          onPasswordChange={handlePasswordChange}
          onDeleteAccount={handleDeleteAccount}
          onLogout={handleLogout}
        />
      )}

      {/* MODUL 4: IMMOBILIENWISSEN */}
      {navChoice === 'Immobilienwissen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2>Immobilienwissen & Leitfäden</h2>
          <p style={{ color: '#555759' }}>Fachartikel zu AfA-Sonderformen, Annuitätenlogik und steuerlichen Verlustverrechnungen.</p>
        </div>
      )}

      {/* MODUL 5: EINSTELLUNGEN */}
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
              <input type="number" value={userProfile.grenzsteuersatz || 42} onChange={(e) => setUserProfile({ ...userProfile, grenzsteuersatz: parseFloat(e.target.value) })} style={inputTextStyle} />
            </div>
            <button onClick={() => alert('Einstellungen übernommen.')} style={{ padding: '12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', width: 'fit-content' }}>
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
