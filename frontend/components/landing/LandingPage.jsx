'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { IconLightning } from '../ui/Icons';

export default function LandingPage({ onLoginSuccess, onDevLogin }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 1. REGISTRIERUNG (Löst Bestätigungs-E-Mail aus)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'https://valuon-estate.vercel.app',
        data: { full_name: fullName }
      },
    });

    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: 'Fehler: ' + error.message });
    } else {
      setMessage({ 
        type: 'success', 
        text: 'Registrierung erfolgreich! Bitte prüfe dein Postfach und klicke auf den Bestätigungs-Link in der E-Mail, um dich anzumelden.' 
      });
    }
  };

  // 2. ANMELDUNG (Prüft E-Mail & Passwort)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setMessage({ type: 'error', text: 'Bitte bestätige zuerst deine E-Mail-Adresse über den Link in deinem Postfach.' });
      } else {
        setMessage({ type: 'error', text: 'Login fehlgeschlagen: ' + error.message });
      }
    } else {
      if (onLoginSuccess) onLoginSuccess(email);
    }
  };

  // 3. PASSWORT VERGESSEN (Sendet Reset-E-Mail)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://valuon-estate.vercel.app',
    });

    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: 'Fehler: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Eine E-Mail zum Zurücksetzen deines Passworts wurde versendet.' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0D1F12', color: '#F7F4EC', fontFamily: 'sans-serif', overflowX: 'hidden', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(163,120,65,0.2) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(19,56,26,0.4) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

      {/* TOP BAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(226,217,206,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '12px', height: '12px', background: '#A37841', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px', color: 'white' }}>Valuon Estate</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button onClick={() => { setAuthMode('login'); document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: 'transparent', border: 'none', color: '#F7F4EC', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>
            Anmelden
          </button>
          <button onClick={() => { setAuthMode('register'); document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: '#A37841', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '25px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(163,120,65,0.3)' }}>
            Jetzt Registrieren
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={{ padding: '4rem 4rem 2rem 4rem', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(163,120,65,0.15)', border: '1px solid #A37841', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', color: '#A37841', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.5rem' }}>
          Kalkulieren statt spekulieren
        </div>
        <h1 style={{ fontSize: '3.6rem', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-1.5px', marginBottom: '1.5rem' }}>
          Entdecke, welche Immobilie sich wirklich rechnet.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#A0AEC0', maxWidth: '750px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
          Tauche ein in die Welt der Immobilieninvestments. Berechne Cashflows, Zinseszinsen, Steuereffekte und langfristige Vermögenswerte spielerisch und präzise.
        </p>
      </header>

      {/* AUTH BEREICH */}
      <section id="auth-section" style={{ padding: '2rem 4rem 4rem 4rem', maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(226,217,206,0.2)', borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(15px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', marginBottom: '1.8rem' }}>
            <button type="button" onClick={() => { setAuthMode('login'); setMessage(null); }} style={{ padding: '10px', background: authMode === 'login' ? '#13381A' : 'transparent', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>Anmelden</button>
            <button type="button" onClick={() => { setAuthMode('register'); setMessage(null); }} style={{ padding: '10px', background: authMode === 'register' ? '#A37841' : 'transparent', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>Registrieren</button>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.5rem' }}>
            {authMode === 'login' && 'Willkommen zurück'}
            {authMode === 'register' && 'Konto erstellen'}
            {authMode === 'forgot' && 'Passwort zurücksetzen'}
          </h2>

          <form onSubmit={authMode === 'login' ? handleLogin : (authMode === 'register' ? handleRegister : handleResetPassword)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '4px', fontWeight: '600' }}>Vollständiger Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Max Mustermann" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '4px', fontWeight: '600' }}>E-Mail-Adresse</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.de" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#A0AEC0', fontWeight: '600' }}>Passwort</label>
                    {authMode === 'login' && (
                      <button type="button" onClick={() => { setAuthMode('forgot'); setMessage(null); }} style={{ background: 'none', border: 'none', color: '#A37841', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        Passwort vergessen?
                      </button>
                    )}
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}

              {message && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.4', background: message.type === 'error' ? 'rgba(229,62,62,0.2)' : 'rgba(56,161,105,0.2)', border: message.type === 'error' ? '1px solid #E53E3E' : '1px solid #38A169', color: message.type === 'error' ? '#FEB2B2' : '#9AE6B4' }}>
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ marginTop: '0.5rem', padding: '14px', background: authMode === 'login' ? '#13381A' : '#A37841', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
                {loading ? 'Lade...' : (
                  authMode === 'login' ? 'Anmelden' : (authMode === 'register' ? 'Registrieren & E-Mail senden' : 'Passwort-Reset-Mail senden')
                )}
              </button>

              {authMode === 'forgot' && (
                <button type="button" onClick={() => { setAuthMode('login'); setMessage(null); }} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center', marginTop: '8px' }}>
                  ← Zurück zum Login
                </button>
              )}

            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(226,217,206,0.1)', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>Valuon Estate Investment Suite v2.4</div>
        <button onClick={() => { if (onDevLogin) onDevLogin(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'transparent', color: '#A37841', border: '2px dashed #A37841', borderRadius: '30px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}>
          <IconLightning /> Developer Direktzugang (Ohne Login zur Analyse)
        </button>
      </footer>
    </div>
  );
}
