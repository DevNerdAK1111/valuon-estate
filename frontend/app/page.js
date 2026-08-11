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
import AiParserView from '../components/ai/AiParserView'; // <--- Neu!

import { useAuthProfile } from '../hooks/useAuthProfile';
import { useProperty } from '../context/PropertyContext';
import { 
  useProperties, 
  useSaveProperty, 
  useDeleteProperty, 
  useCalculateInvestment 
} from '../hooks/usePropertiesQuery';

export default function Home() {
  const [navChoice, setNavChoice] = useState('Startseite');
  const [backendStatus, setBackendStatus] = useState('waking'); // Startet im Status "waking"

  // Backend-Erreichbarkeit beim Start prüfen
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      const { pingBackendApi } = await import('../lib/propertyApi');
      const isReady = await pingBackendApi();
      if (isMounted) {
        setBackendStatus(isReady ? 'ready' : 'sleeping');
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000); // Alle 30 Sek. prüfen
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
      />

      <main className="w-full">
        {navChoice === 'Startseite' && (
          <StartseiteView 
            dbProperties={dbProperties} 
            loadPropertyFromDb={loadPropertyFromDb} 
            setNavChoice={setNavChoice}
          />
        )}
        
        {/* NEUE ROUTE FÜR DEN PARSER */}
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
      </main>

    </div>
  );
}
