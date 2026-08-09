'use client';
import { useState, useEffect } from 'react';

// Components
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
import { pingBackendApi, calculateInvestmentApi, savePropertyApi } from '../lib/propertyApi';
import { usePropertyForm } from '../hooks/usePropertyForm';
import { useAuthProfile } from '../hooks/useAuthProfile';
import { usePropertiesManager } from '../hooks/usePropertiesManager';

export default function Home() {
  const [navChoice, setNavChoice] = useState('Startseite');
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

  // Formular-Hook
  const {
    formData, setFormData, capexList, setCapexList, handleReset: resetPropertyForm,
    addCapexRow, removeCapexRow, handleCapexChange
  } = usePropertyForm(42.0);

  // Auth & Profil Custom Hook
  const {
    showApp, setShowApp, authenticated, setAuthenticated, userEmail, setUserEmail,
    userProfile, setUserProfile, handleSaveProfile, handleCompleteOnboarding, handleLogout: authLogout
  } = useAuthProfile(setFormData);

  // Datenbank Custom Hook
  const {
    dbProperties, loadingDb, fetchDatabaseProperties, deletePropertyFromDb
  } = usePropertiesManager(userEmail);

  const pingBackend = async () => {
    if (backendStatus === 'ready') return;
    setBackendStatus('waking');
    const isOk = await pingBackendApi();
    setBackendStatus(isOk ? 'ready' : 'sleeping');
  };

  useEffect(() => {
    pingBackend();
  }, []);

  useEffect(() => {
    if ((navChoice === 'Objekt Datenbank' || navChoice === 'Startseite' || navChoice === 'Szenario-Vergleich') && showApp) {
      fetchDatabaseProperties();
    }
  }, [navChoice, showApp, userEmail, fetchDatabaseProperties]);

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

  const handleLogout = async () => {
    await authLogout();
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

  const handleReset = () => {
    resetPropertyForm(userProfile.grenzsteuersatz || 42.0);
    setResult(null);
    setCalcError(null);
    setSaveSuccess(null);
  };

  // Kaufnebenkosten Summe für Dashboard Donut
  const grwt_euro = (formData.kaufpreis * (formData.grwt_p || 0)) / 100;
  const notar_euro = (formData.kaufpreis * (formData.notar_p || 0)) / 100;
  const makler_euro = (formData.kaufpreis * (formData.makler_p || 0)) / 100;
  const summe_nk = grwt_euro + notar_euro + makler_euro + Number(formData.sonst_nk || 0);

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
                <ExecutiveDashboard 
                  formData={formData} 
                  result={result} 
                  projectionHorizon={projectionHorizon} 
                  setProjectionHorizon={setProjectionHorizon} 
                  handleSaveToDatabase={handleSaveToDatabase} 
                  saving={saving} 
                  saveSuccess={saveSuccess} 
                  calcError={calcError} 
                  activeDashboardTab={activeDashboardTab} 
                  setActiveDashboardTab={setActiveDashboardTab} 
                  chartView={chartView} 
                  setChartView={setChartView} 
                  summe_nk={summe_nk} 
                  tableTheme={tableTheme} 
                  setTableTheme={setTableTheme} 
                />
              </div>
            </form>
          )}

          {navChoice === 'Szenario-Vergleich' && (
            <ScenarioComparisonView 
              basePropertyData={formData} 
              dbProperties={dbProperties} 
              setFormData={setFormData}
            />
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
