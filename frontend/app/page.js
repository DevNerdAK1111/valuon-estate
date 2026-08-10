'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
import { calculateInvestmentApi } from '../lib/propertyApi';
import { useProperties, useSaveProperty, useDeleteProperty } from '../hooks/usePropertiesQuery';
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

  const [projectionHorizon, setProjectionHorizon] = useState('10');
  const [activeDashboardTab, setActiveDashboardTab] = useState('Executive Dashboard');

  // React Query Hooks
  const propertiesQuery = useProperties(userEmail);
  const saveMutation = useSaveProperty();
  const deleteMutation = useDeleteProperty(userEmail);

  const dbProperties = propertiesQuery.data || [];
  const loadingDb = propertiesQuery.isPending;

  const pingBackend = async () => {};

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoadingCalc(true);
    try {
      const res = await calculateInvestmentApi(formData, capexList);
      setCalcResult(res);
      toast.success('Kalkulation erfolgreich abgeschlossen!');
    } catch (err) {
      toast.error(err.message || 'Fehler bei der Berechnung');
    } finally {
      setLoadingCalc(false);
    }
  };

  const handleSaveToDatabase = (statusTarget = 'pipeline') => {
    saveMutation.mutate({
      formData,
      capexList,
      calcResult,
      userEmail,
      statusTarget
    });
  };

  const loadPropertyFromDb = (item) => {
    if (item.form_data) {
      setFormData(item.form_data);
    }
    setNavChoice('Analyse');
  };

  const deletePropertyFromDb = (id) => {
    if (confirm('Möchtest du dieses Objekt wirklich aus der Datenbank löschen?')) {
      deleteMutation.mutate(id);
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
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-valuon-bg flex items-center justify-center text-valuon-green font-bold text-sm">
        Authentifizierung wird geprüft...
      </div>
    );
  }

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
        backendStatus={backendStatus} 
        navChoice={navChoice} 
        onLogout={handleLogout} 
        setNavChoice={setNavChoice} 
        userEmail={userEmail} 
        userProfile={userProfile}
      />

      {/* HAUPTINHALT NATIVE ROUTING */}
      <main className="w-full">
        {navChoice === 'Startseite' && (
          <StartseiteView 
            dbProperties={dbProperties} 
            loadPropertyFromDb={loadPropertyFromDb} 
            setNavChoice={setNavChoice}
          />
        )}

        {navChoice === 'Analyse' && (
          <form onSubmit={handleCalculate} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
            <Parametrisierung 
              addCapexRow={addCapexRow} 
              capexList={capexList} 
              formData={formData} 
              grunderwerbsteuerSätze={BUNDESLAENDER_DEFAULT} 
              handleCapexChange={handleCapexChange} 
              handleHausgeldChange={handleHausgeldChange} 
              handleHausgeldNichtUmlegbarChange={handleHausgeldNichtUmlegbarChange} 
              handleQmChange={handleQmChange} 
              handleReset={handleReset} 
              loading={loadingCalc} 
              pingBackend={pingBackend} 
              removeCapexRow={removeCapexRow} 
              setFormData={setFormData} 
              updateField={updateField}
            />

            <ExecutiveDashboard 
              activeDashboardTab={activeDashboardTab} 
              formData={formData} 
              handleSaveToDatabase={handleSaveToDatabase} 
              isSaving={saveMutation.isPending} 
              projectionHorizon={projectionHorizon} 
              result={calcResult} 
              setActiveDashboardTab={setActiveDashboardTab} 
              setProjectionHorizon={setProjectionHorizon}
            />
          </form>
        )}

        {navChoice === 'Objekt Datenbank' && (
          <DatabaseView 
            dbProperties={dbProperties} 
            fetchDatabaseProperties={() => propertiesQuery.refetch()} 
            loadingDb={loadingDb} 
            userEmail={userEmail} 
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
            onLogout={handleLogout} 
            onSaveProfile={updateUserProfile} 
            setUserEmail={setUserEmail} 
            setUserProfile={setUserProfile} 
            userEmail={userEmail} 
            userProfile={userProfile}
          />
        )}
      </main>

    </div>
  );
}
