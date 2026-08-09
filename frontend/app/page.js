'use client';
import { useState, useEffect } from 'react';

// Relative Imports
import Header from '../components/layout/Header';
import LandingPage from '../components/landing/LandingPage';
import StartseiteView from '../components/landing/StartseiteView';
import DevNoticeModal from '../components/ui/DevNoticeModal';
import Parametrisierung from '../components/analyse/Parametrisierung';
import ExecutiveDashboard from '../components/analyse/ExecutiveDashboard';
import DatabaseView from '../components/database/DatabaseView';
import ProfileView from '../components/profile/ProfileView';
import OnboardingView from '../components/profile/OnboardingView';
import ScenarioComparisonView from '../components/scenario/ScenarioComparisonView';

import { IconGear } from '../components/ui/Icons';
import { supabase } from '../lib/supabaseClient';
import { loadUserProfileFromSupabase, saveUserProfileToSupabase } from '../lib/profileApi';
import {
  pingBackendApi,
  calculateInvestmentApi,
  fetchPropertiesApi,
  savePropertyApi,
  deletePropertyApi
} from '../lib/propertyApi';
import { usePropertyForm } from '../hooks/usePropertyForm';

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [navChoice, setNavChoice] = useState('Startseite');

  const [userProfile, setUserProfile] = useState({
    profilname: '', vorname: '', nachname: '', geburtsdatum: '', telefon: '', strasse: '', plz: '', ort: '', land: 'Deutschland',
    bruttoEinkommen: 65000, steuerklasse: '1', familienstand: 'Ledig', kinderAnzahl: 0, kirchensteuer: false,
    kirchensteuersatz: 9.0, grenzsteuersatz: 42.0, onboarded: false
  });

  const {
    formData,
    setFormData,
    capexList,
    setCapexList,
    handleReset: resetPropertyForm,
    addCapexRow,
    removeCapexRow,
    handleCapexChange
  } = usePropertyForm(userProfile.grenzsteuersatz || 42.0);

  const [activeDashboardTab, setActiveDashboardTab] = useState('Executive Dashboard');
  const [tableTheme, setTableTheme] = useState('Kapitaldienst & Steuern');
  const [projectionHorizon, setProjectionHorizon] = useState('10');
  const [chartView, setChartView] = useState('1. Vermögensstruktur & NAV (Netto-Eigenkapital)');

  const [devNotice, setDevNotice] = useState(null);
  const [backendStatus, setBackendStatus] = useState('sleeping');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [dbProperties, setDbProperties] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);

  const pingBackend = async () => {
    if (backendStatus === 'ready') return;
    setBackendStatus('waking');
    const isOk = await pingBackendApi();
    setBackendStatus(isOk ? 'ready' : 'sleeping');
  };

  const fetchProfileFromSupabase = async (uid) => {
    const dbProfile = await loadUserProfileFromSupabase(uid);
    if (dbProfile) {
      const formatted = {
        profilname: dbProfile.profilname || '', vorname: dbProfile.vorname || '', nachname: dbProfile.nachname || '',
        geburtsdatum: dbProfile.geburtsdatum || '', telefon: dbProfile.telefon || '', strasse: dbProfile.strasse || '',
        plz: dbProfile.plz || '', ort: dbProfile.ort || '', land: dbProfile.land || 'Deutschland',
        bruttoEinkommen: dbProfile.brutto_einkommen || 65000, steuerklasse: dbProfile.steuerklasse || '1',
        familienstand: dbProfile.familienstand || 'Ledig', kinderAnzahl: dbProfile.kinder_anzahl || 0,
        kirchensteuer: !!dbProfile.kirchensteuer, kirchensteuersatz: dbProfile.kirchensteuersatz || 9.0,
        grenzsteuersatz: dbProfile.grenzsteuersatz || 42.0, onboarded: dbProfile.onboarded
      };
      setUserProfile(formatted);
      setFormData((prev) => ({ ...prev, tax_rate_pct: formatted.grenzsteuersatz || prev.tax_rate_pct }));
    } else {
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
        fetchProfileFromSupabase(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
        setAuthenticated(true);
        setShowApp(true);
        fetchProfileFromSupabase(session.user.id);
      } else {
        setAuthenticated(false);
        setShowApp(false);
        setUserId(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if ((navChoice === 'Objekt Datenbank' || navChoice === 'Startseite') && showApp) {
      fetchDatabaseProperties();
    }
  }, [navChoice, showApp, userEmail]);

  const fetchDatabaseProperties = async () => {
    setLoadingDb(true);
    try {
      const userList = await fetchPropertiesApi(userEmail);
      setDbProperties(userList);
    } catch (err) {
      console.error('Fehler beim Laden der Datenbank:', err);
    } fontally {
      setLoadingDb(false);
    }
  };

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setCalcError(null);
    setSaveSuccess(null);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const data = await calculateInvestmentApi(formData, capexList);
      setResult(data);
      setBackendStatus('ready');
    } catch (err) {
      setCalcError(err.message || 'Verbindung zum Backend fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = async (status = 'pipeline') => {
    if (!result) return;
    setSaving(true);
    setSaveSuccess(null);
    try {
      await savePropertyApi(formData, capexList, result, userEmail, status);
      const statusText = status === 'bestand' ? 'im Bestand' : 'in der Pipeline';
      setSaveSuccess(`Objekt erfolgreich ${statusText} gespeichert.`);
      fetchDatabaseProperties();
    } catch (err) {
      setSaveSuccess(err.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    setUserProfile(updatedProfile);
    if (userId) await saveUserProfileToSupabase(userId, userEmail, updatedProfile);
    setFormData((prev) => ({ ...prev, tax_rate_pct: updatedProfile.grenzsteuersatz || prev.tax_rate_pct }));
  };

  const handleCompleteOnboarding = async (completedProfile) => {
    const updated = { ...completedProfile, onboarded: true };
    setUserProfile(updated);
    if (userId) await saveUserProfileToSupabase(userId, userEmail, updated);
    setFormData((prev) => ({ ...prev, tax_rate_pct: updated.grenzsteuersatz || prev.tax_rate_pct }));
    setNavChoice('Startseite');
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
      await deletePropertyApi(id);
      fetchDatabaseProperties();
    } catch (err) {
      alert('Fehler beim Löschen des Objekts.');
    }
  };

  const handleReset = () => {
    resetPropertyForm(userProfile.grenzsteuersatz || 42.0);
    setResult(null);
    setCalcError(null);
    setSaveSuccess(null);
  };

  // KAUFNEBENKOSTEN FÜR DASHBOARD-SUMMEN
  const grwt_euro = (formData.kaufpreis * (formData.grwt_p || 0)) / 100;
  const notar_euro = (formData.kaufpreis * (formData.notar_p || 0)) / 100;
  const makler_euro = (formData.kaufpreis * (formData.makler_p || 0)) / 100;
  const summe_nk = grwt_euro + notar_euro + makler_euro + Number(formData.sonst_nk || 0);

  const firstYearCashflow = result?.projection?.[0]?.['Cashflow Netto'] || 0;
  const monthlyCashflow = firstYearCashflow / 12;
  const bruttoMietrendite = formData.kaufpreis > 0 ? ((formData.kaltmiete_monat * 12) / formData.kaufpreis) * 100 : 0;

  let slicedProjection = [];
  let actualHorizonYears = 10;
  if (result?.projection && result.projection.length > 0) {
    if (projectionHorizon === 'payoff') {
      const payoffIdx = result.projection.findIndex(r => (r['Restschuld'] || 0) <= 0);
      slicedProjection = payoffIdx !== -1 ? result.projection.slice(0, payoffIdx + 1) : result.projection;
    } else {
      const numYears = parseInt(projectionHorizon, 10) || 10;
      slicedProjection = result.projection.slice(0, numYears);
    }
    actualHorizonYears = slicedProjection.length;
  }

  const cumulatedCashflowHorizon = slicedProjection.reduce((acc, curr) => acc + (curr['Cashflow Netto'] || 0), 0);
  const endYearObj = slicedProjection[slicedProjection.length - 1];
  const endNav = endYearObj ? ((endYearObj['Immobilienwert'] || 0) - (endYearObj['Restschuld'] || 0)) : 0;
  const gesamtGewinnHorizon = cumulatedCashflowHorizon + (endNav - (formData.ek_euro || 0));
  const greetingName = userProfile.profilname || userProfile.vorname || (userEmail ? userEmail.split('@')[0] : 'Investor');

  if (!showApp) return <LandingPage setShowApp={setShowApp} setAuthenticated={setAuthenticated} userEmail={userEmail} setUserEmail={setUserEmail} />;

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow-y: scroll !important;
          scrollbar-gutter: stable;
          background-color: #F7F4EC;
          color: #13381A;
          font-family: system-ui, -apple-system, sans-serif;
        }
        *, *:before, *:after {
          box-sizing: border-box;
        }
      `}</style>

      {!userProfile.onboarded ? (
        <main style={{ minHeight: '100vh', padding: '2rem 3rem', background: '#F7F4EC', color: '#13381A' }}>
          <OnboardingView userEmail={userEmail} userProfile={userProfile} setUserProfile={setUserProfile} onCompleteOnboarding={handleCompleteOnboarding} />
        </main>
      ) : (
        <main style={{ minHeight: '100vh', padding: '2rem 3rem', background: '#F7F4EC', color: '#13381A', position: 'relative' }}>
          <DevNoticeModal devNotice={devNotice} onClose={() => setDevNotice(null)} />
          <Header navChoice={navChoice} setNavChoice={setNavChoice} backendStatus={backendStatus} userEmail={userEmail} userProfile={userProfile} onLogout={handleLogout} />

          {navChoice === 'Startseite' && (
            <StartseiteView 
              greetingName={greetingName}
              setNavChoice={setNavChoice}
              setDevNotice={setDevNotice}
              loadingDb={loadingDb}
              dbProperties={dbProperties}
              loadPropertyFromDb={loadPropertyFromDb}
            />
          )}

          {navChoice === 'Analyse' && (
            <form onSubmit={handleCalculate}>
              <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
                <Parametrisierung 
                  formData={formData} 
                  setFormData={setFormData} 
                  capexList={capexList} 
                  setCapexList={setCapexList} 
                  handleCapexChange={handleCapexChange}
                  addCapexRow={addCapexRow}
                  removeCapexRow={removeCapexRow}
                  loading={loading} 
                  pingBackend={pingBackend} 
                  handleReset={handleReset} 
                />
                <ExecutiveDashboard formData={formData} result={result} projectionHorizon={projectionHorizon} setProjectionHorizon={setProjectionHorizon} handleSaveToDatabase={handleSaveToDatabase} saving={saving} saveSuccess={saveSuccess} calcError={calcError} monthlyCashflow={monthlyCashflow} bruttoMietrendite={bruttoMietrendite} actualHorizonYears={actualHorizonYears} gesamtGewinnHorizon={gesamtGewinnHorizon} activeDashboardTab={activeDashboardTab} setActiveDashboardTab={setActiveDashboardTab} chartView={chartView} setChartView={setChartView} slicedProjection={slicedProjection} summe_nk={summe_nk} tableTheme={tableTheme} setTableTheme={setTableTheme} cumulatedCashflowHorizon={cumulatedCashflowHorizon} endNav={endNav} />
              </div>
            </form>
          )}

          {navChoice === 'Szenario-Vergleich' && (
            <ScenarioComparisonView basePropertyData={formData} />
          )}

          {navChoice === 'Objekt Datenbank' && <DatabaseView loadingDb={loadingDb} dbProperties={dbProperties} fetchDatabaseProperties={fetchDatabaseProperties} loadPropertyFromDb={loadPropertyFromDb} deletePropertyFromDb={deletePropertyFromDb} />}
          {navChoice === 'Profil' && <ProfileView userEmail={userEmail} setUserEmail={setUserEmail} userProfile={userProfile} setUserProfile={setUserProfile} onSaveProfile={handleSaveProfile} onPasswordChange={() => {}} onDeleteAccount={() => {}} onLogout={handleLogout} />}
          {navChoice === 'Einstellungen' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}><IconGear /><h2 style={{ margin: 0, color: '#13381A' }}>System-Einstellungen</h2></div>
              <p style={{ color: '#555759', marginBottom: '1.5rem' }}>Konfiguriere deine globalen Parameter-Standards für zukünftige Objektanalysen.</p>
            </div>
          )}
        </main>
      )}
    </>
  );
}
