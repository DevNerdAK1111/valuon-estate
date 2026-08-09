'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuthProfile() {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Profil Fetch Exception:', err);
    }
  };

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
        console.error('Session Error:', err);
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

  // Manueller Login-Handler, der den "missing email"-Fehler abfängt
  const handleLogin = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        setUserEmail(data.user.email);
        await fetchUserProfile(data.user.id);
        return { success: true };
      }
    } catch (err) {
      console.error('Login Fehler:', err.message);
      return { success: false, error: err.message };
    }
  };

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
      return { success: false, error: err.message };
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout Error:', err);
    } finally {
      setUser(null);
      setUserEmail(null);
      setUserProfile(null);
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  return {
    user,
    userEmail,
    setUserEmail,
    userProfile,
    setUserProfile,
    loadingProfile,
    handleLogin,
    updateUserProfile,
    handleLogout
  };
}
