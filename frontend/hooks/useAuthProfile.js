'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuthProfile() {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // 1. Initiale Session abrufen
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setUserEmail(session.user.email);
        }
      } catch (err) {
        console.error('Fehler beim Abrufen der Session:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    getInitialSession();

    // 2. Auth-State Listener für Logins/Logouts in Echtzeit
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserEmail(session.user.email);
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

  // 3. Robuste Logout-Funktion
  const handleLogout = async () => {
    try {
      setLoadingProfile(true);
      // Supabase Abmeldung ausführen
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Fehler beim Supabase-SignOut:', err);
    } finally {
      // Lokalen State sofort zurücksetzen
      setUser(null);
      setUserEmail(null);
      setUserProfile(null);
      setLoadingProfile(false);

      // Lokale Session-Keys im Browser zur Sicherheit löschen
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        // Seite neu laden und auf Startseite führen
        window.location.href = '/';
      }
    }
  };

  return {
    user,
    userEmail,
    userProfile,
    loadingProfile,
    handleLogout
  };
}
