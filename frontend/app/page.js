'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Header from '../components/layout/Header';
import LandingPage from '../components/landing/LandingPage';
import StartseiteView from '../components/landing/StartseiteView';
import Parametrisierung from '../components/analyse/Parametrisierung';
import ExecutiveDashboard from '../components/analyse/ExecutiveDashboard';
import DatabaseView from '../components/database/DatabaseView';
import ScenarioComparisonView from '../components/scenario/ScenarioComparisonView';
import ProfileView from '../components/profile/ProfileView';
import AiParserView from '../components/ai/AiParserView';

import { useAuthProfile } from '../hooks/useAuthProfile';
import { useProperty } from '../context/PropertyContext';
import { 
  useProperties, 
  useSaveProperty, 
  useDeleteProperty, 
  useCalculateInvestment 
} from '../hooks/usePropertiesQuery';
import { pingBackendApi } from '../lib/propertyApi';

export default function Home() {
  const [navChoice, setNavChoice] = useState('Startseite');
  const [backendStatus, setBackendStatus] = useState('waking');

  const {
    userEmail,
    setUserEmail,
    setUserProfile,
    loadingProfile,
    updateUserProfile,
    handleLogout
  } = useAuthProfile();

  const { formData, setFormData, capexList } = useProperty();

  const [projectionHorizon, setProjectionHorizon] = useState('10');
  const [activeDashboardTab, setActiveDashboardTab] = useState('Executive Dashboard');

  const propertiesQuery = useProperties(userEmail);
  const saveMutation = useSaveProperty();
  const deleteMutation = useDeleteProperty(userEmail);
  const calculateMutation = useCalculateInvestment();

  const dbProperties = propertiesQuery.data || [];
  const loadingDb = propertiesQuery.isPending;
  const calcResult = calculateMutation.data || null;

  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      const isReady = await pingBackendApi();
      if (isMounted) {
        setBackendStatus(isReady ? 'ready' : 'sleeping');
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCalculate = (e) => {
    if (e) e.preventDefault();
    calculateMutation.mutate({ formData, capexList });
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
      
      <Header 
        backendStatus={backendStatus} 
        navChoice={navChoice} 
        onLogout={handleLogout} 
        setNavChoice={setNavChoice} 
        userEmail={userEmail} 
        userProfile={useAuthProfile().userProfile}
      />

      <main className="w-full">
        {navChoice === 'Startseite' && (
          <StartseiteView 
            dbProperties={dbProperties} 
            loadPropertyFromDb={loadPropertyFromDb} 
            setNavChoice={setNavChoice}
          />
        )}
        
        {navChoice === 'KI Exposé-Parser' && (
          <AiParserView setNavChoice={setNavChoice} />
        )}

        {navChoice === 'Analyse' && (
          <form onSubmit={handleCalculate} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
            <Parametrisierung loading={calculateMutation.isPending} />

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
          />
        )}

        {navChoice === 'Einstellungen' && (
          <div className="bg-white p-8 sm:p-12 rounded-xl border border-valuon-border shadow-sm text-center max-w-2xl mx-auto mt-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-valuon-cream text-valuon-green mb-6 border border-valuon-border shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-valuon-green mb-3 tracking-tight">Einstellungen</h2>
            <p className="text-slate-500 font-medium mb-8 text-[0.95rem] leading-relaxed">
              Dieses Modul befindet sich noch in der Entwicklung. Hier wirst du zukünftig globale Systemparameter, Standard-Vorgaben für Zinsen und persönliche API-Schnittstellen konfigurieren können.
            </p>
            <button 
              onClick={() => setNavChoice('Startseite')} 
              className="py-2.5 px-6 bg-valuon-green text-white rounded-lg font-bold text-sm hover:bg-valuon-green-light transition-colors shadow-sm cursor-pointer"
            >
              Zurück zur Startseite
            </button>
          </div>
        )}
      </main>

    </div>
  );
}
