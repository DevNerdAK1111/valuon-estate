'use client';
import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import LandingPage from '../components/landing/LandingPage';
import StartseiteView from '../components/landing/StartseiteView';
import Parametrisierung from '../components/analyse/Parametrisierung';
import ExecutiveDashboard from '../components/analyse/ExecutiveDashboard';
import DatabaseView from '../components/database/DatabaseView';
import ScenarioComparisonView from '../components/scenario/ScenarioComparisonView';
import ProfileView from '../components/profile/ProfileView';

import { useAuthProfile } from '../hooks/useAuthProfile';
import { usePropertyForm } from '../hooks/usePropertyForm';
import { calculateInvestmentApi, fetchPropertiesApi, savePropertyApi, deletePropertyApi } from '../lib/propertyApi';
import { BUNDESLAENDER_DEFAULT } from '../constants/realEstate';

export default function Home() {
  const [navChoice, setNavChoice] = useState('Startseite');
  const [backendStatus, setBackendStatus] = useState('ready');

  const {
    user,
    userEmail,
    setUserEmail,
    userProfile,
    setUserProfile,
    loadingProfile,
    updateUserProfile,
    handleLogout
  } = useAuthProfile();

  const {
    formData,
    setFormData,
    updateField,
    handleQmChange,
    handleHausgeldChange,
    handleHausgeldNichtUmlegbarChange,
    handleReset,
    capexList,
    handleCapexChange,
    addCapexRow,
    removeCapexRow
  } = usePropertyForm();

  const [calcResult, setCalcResult] = useState(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [calcError, setCalcError] = useState(null);

  const [projectionHorizon, setProjectionHorizon] = useState('10');
  const [activeDashboardTab, setActiveDashboardTab] = useState('Executive Dashboard');

  const [dbProperties, setDbProperties] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const pingBackend = async () => {};

  const fetchDatabaseProperties = async () => {
    if (!userEmail) return;
    setLoadingDb(true);
    try {
      const data = await fetchPropertiesApi(userEmail);
      const list = Array.isArray(data) ? data : (data?.properties || []);
      setDbProperties(list);
    } catch (err) {
      console.error('Fehler beim Laden der Objekte:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchDatabaseProperties();
    }
  }, [userEmail]);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoadingCalc(true);
    setCalcError(null);
    try {
      const res = await calculateInvestmentApi(formData, capexList);
      setCalcResult(res);
    } catch (err) {
      setCalcError(err.message || 'Fehler bei der Berechnung');
    } finally {
      setLoadingCalc(false);
    }
  };

  const handleSaveToDatabase = async (statusTarget = 'pipeline') => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      await savePropertyApi(formData, capexList, calcResult, userEmail, statusTarget);
      setSaveSuccess(`Objekt erfolgreich in ${statusTarget === 'bestand' ? 'Bestand' : 'Pipeline'} gespeichert!`);
      await fetchDatabaseProperties();
    } catch (err) {
      setSaveSuccess(`Fehler beim Speichern: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const loadPropertyFromDb = (item) => {
    if (item.form_data) {
      setFormData(item.form_data);
    }
    setNavChoice('Analyse');
  };

  const deletePropertyFromDb = async (id) => {
    if (!confirm('Möchtest du dieses Objekt wirklich löschen?')) return;
    try {
      await deletePropertyApi(id);
      await fetchDatabaseProperties();
    } catch (err) {
      alert(`Fehler beim Löschen: ${err.message}`);
    }
  };

  // Handler für den Developer Direktzugang / Quick Login
  const handleDevLogin = (mockEmail = 'developer@valuon.de') => {
    if (setUserEmail) setUserEmail(mockEmail);
    if (setUserProfile) {
      setUserProfile({
        profilname: 'Dev-User',
        vorname: 'Developer',
        nachname: 'Mode',
        bruttoEinkommen: 80000,
        steuerklasse: '1',
        grenzsteuersatz: 42.0
      });
    }
  };

  // -------------------------------------------------------------
  // AUTH GATEKEEPER
  // -------------------------------------------------------------
  // Solange Supabase den Auth-State prüft, Ladeanzeige zeigen
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-valuon-bg flex items-center justify-center text-valuon-green font-bold text-sm">
        Authentifizierung wird geprüft...
      </div>
    );
  }

  // Wenn weder Session noch manuell gesetzte E-Mail vorhanden ist -> LandingPage
  if (!userEmail) {
    return (
      <LandingPage
        onLoginSuccess={(email) => {
          if (email && setUserEmail) setUserEmail(email);
          else window.location.reload();
        }}
        onDevLogin={handleDevLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-valuon-bg text-valuon-green p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto box-border">
      
      {/* HEADER NAVIGATION */}
      <Header
        navChoice={navChoice}
        setNavChoice={setNavChoice}
        backendStatus={backendStatus}
        userEmail={userEmail}
        userProfile={userProfile}
        onLogout={handleLogout}
      />

      {/* HAUPTINHALT NATIVE ROUTING */}
      <main className="w-full">
        {navChoice === 'Startseite' && (
          <StartseiteView
            setNavChoice={setNavChoice}
            dbProperties={dbProperties}
            loadPropertyFromDb={loadPropertyFromDb}
          />
        )}

        {navChoice === 'Analyse' && (
          <form onSubmit={handleCalculate} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
            <Parametrisierung
              formData={formData}
              updateField={updateField}
              pingBackend={pingBackend}
              handleQmChange={handleQmChange}
              handleHausgeldChange={handleHausgeldChange}
              handleHausgeldNichtUmlegbarChange={handleHausgeldNichtUmlegbarChange}
              grunderwerbsteuerSätze={BUNDESLAENDER_DEFAULT}
              capexList={capexList}
              handleCapexChange={handleCapexChange}
              removeCapexRow={removeCapexRow}
              addCapexRow={addCapexRow}
              loading={loadingCalc}
              handleReset={handleReset}
              setFormData={setFormData}
            />

            <ExecutiveDashboard
              formData={formData}
              result={calcResult}
              projectionHorizon={projectionHorizon}
              setProjectionHorizon={setProjectionHorizon}
              handleSaveToDatabase={handleSaveToDatabase}
              saving={saving}
              saveSuccess={saveSuccess}
              calcError={calcError}
              activeDashboardTab={activeDashboardTab}
              setActiveDashboardTab={setActiveDashboardTab}
            />
          </form>
        )}

        {navChoice === 'Objekt Datenbank' && (
          <DatabaseView
            loadingDb={loadingDb}
            dbProperties={dbProperties}
            fetchDatabaseProperties={fetchDatabaseProperties}
            loadPropertyFromDb={loadPropertyFromDb}
            deletePropertyFromDb={deletePropertyFromDb}
          />
        )}

        {navChoice === 'Szenario-Vergleich' && (
          <ScenarioComparisonView
            basePropertyData={formData}
            dbProperties={dbProperties}
            setFormData={setFormData}
          />
        )}

        {navChoice === 'Profil' && (
          <ProfileView
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onSaveProfile={updateUserProfile}
            onLogout={handleLogout}
          />
        )}
      </main>

    </div>
  );
}
