'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuthProfile() {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 1. Profil-Daten aus Supabase-Tabelle 'profiles' laden
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fehler beim Laden des Profils:', error);
      }
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Profil Fetch Exception:', err);
    }
  };

  // 2. Auth Status Initialisierung & Listener
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setUserEmail(session.user.email);
          await fetchUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Fehler beim Abrufen der Session:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserEmail(session.user.email);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserEmail(null);
        setUserProfile(null);
      }
      setLoadingProfile(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 3. Profil aktualisieren / speichern
  const updateUserProfile = async (updatedFields) => {
    if (!user) return { success: false, error: 'Nicht eingeloggt' };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString(),
          ...updatedFields
        })
        .select()
        .single();

      if (error) throw error;
      setUserProfile(data);
      return { success: true, data };
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Profils:', err);
      return { success: false, error: err.message };
    }
  };

  // 4. Sicheres Abmelden
  const handleLogout = async () => {
    try {
      setLoadingProfile(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Fehler beim Supabase-SignOut:', err);
    } finally {
      setUser(null);
      setUserEmail(null);
      setUserProfile(null);
      setLoadingProfile(false);

      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  return {
    user,
    userEmail,
    userProfile,
    loadingProfile,
    updateUserProfile,
    handleLogout
  };
}
