import { supabase } from './supabaseClient';

// Profil aus Supabase laden
export const loadUserProfileFromSupabase = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Fehler beim Laden des Profils:', error.message);
    return null;
  }
  return data;
};

// Profil in Supabase speichern (Insert or Update)
export const saveUserProfileToSupabase = async (userId, userEmail, profileData) => {
  if (!userId) return null;

  const payload = {
    id: userId,
    user_email: userEmail,
    profilname: profileData.profilname || '',
    vorname: profileData.vorname || '',
    nachname: profileData.nachname || '',
    geburtsdatum: profileData.geburtsdatum || '',
    telefon: profileData.telefon || '',
    strasse: profileData.strasse || '',
    plz: profileData.plz || '',
    ort: profileData.ort || '',
    land: profileData.land || 'Deutschland',
    brutto_einkommen: profileData.bruttoEinkommen || 65000,
    steuerklasse: profileData.steuerklasse || '1',
    familienstand: profileData.familienstand || 'Ledig',
    kinder_anzahl: profileData.kinderAnzahl || 0,
    kirchensteuer: !!profileData.kirchensteuer,
    kirchensteuersatz: profileData.kirchensteuersatz || 9.0,
    grenzsteuersatz: profileData.grenzsteuersatz || 42.0,
    onboarded: profileData.onboarded !== undefined ? profileData.onboarded : true,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Fehler beim Speichern des Profils:', error.message);
    throw error;
  }
  return data;
};
