import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { loadUserProfileFromSupabase, saveUserProfileToSupabase } from '../lib/profileApi';

export function useAuthProfile(setFormData) {
  const [showApp, setShowApp] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);

  const [userProfile, setUserProfile] = useState({
    profilname: '', vorname: '', nachname: '', geburtsdatum: '', telefon: '', strasse: '', plz: '', ort: '', land: 'Deutschland',
    bruttoEinkommen: 65000, steuerklasse: '1', familienstand: 'Ledig', kinderAnzahl: 0, kirchensteuer: false,
    kirchensteuersatz: 9.0, grenzsteuersatz: 42.0, onboarded: false
  });

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
      if (setFormData) {
        setFormData((prev) => ({ ...prev, tax_rate_pct: formatted.grenzsteuersatz || prev.tax_rate_pct }));
      }
    } else {
      setUserProfile((prev) => ({ ...prev, onboarded: false }));
    }
  };

  useEffect(() => {
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

  const handleSaveProfile = async (updatedProfile) => {
    setUserProfile(updatedProfile);
    if (userId) await saveUserProfileToSupabase(userId, userEmail, updatedProfile);
    if (setFormData) {
      setFormData((prev) => ({ ...prev, tax_rate_pct: updatedProfile.grenzsteuersatz || prev.tax_rate_pct }));
    }
  };

  const handleCompleteOnboarding = async (completedProfile) => {
    const updated = { ...completedProfile, onboarded: true };
    setUserProfile(updated);
    if (userId) await saveUserProfileToSupabase(userId, userEmail, updated);
    if (setFormData) {
      setFormData((prev) => ({ ...prev, tax_rate_pct: updated.grenzsteuersatz || prev.tax_rate_pct }));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowApp(false);
    setAuthenticated(false);
    setUserId(null);
  };

  return {
    showApp, setShowApp,
    authenticated, setAuthenticated,
    userEmail, setUserEmail,
    userId,
    userProfile, setUserProfile,
    handleSaveProfile,
    handleCompleteOnboarding,
    handleLogout
  };
}
