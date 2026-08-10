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
    <div className="min-h-screen bg-[#0D1F12] text-[#F7F4EC] font-sans overflow-x-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(163,120,65,0.2)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(19,56,26,0.4)_0%,transparent_70%)] pointer-events-none" />

      {/* TOP BAR */}
      <nav className="flex justify-between items-center py-5 px-6 md:px-16 backdrop-blur-md border-b border-[#E2D9CE]/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#A37841] rounded-full"></div>
          <span className="text-2xl md:text-[1.8rem] font-black tracking-tight text-white">Valuon Estate</span>
        </div>

        <div className="flex gap-4 md:gap-6 items-center">
          <button 
            onClick={() => { setAuthMode('login'); document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' }); }} 
            className="bg-transparent border-none text-[#F7F4EC] font-semibold cursor-pointer text-sm md:text-[0.95rem] hover:text-white transition-colors"
          >
            Anmelden
          </button>
          <button 
            onClick={() => { setAuthMode('register'); document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' }); }} 
            className="bg-[#A37841] text-white border-none py-2 px-4 md:py-2.5 md:px-6 rounded-full font-extrabold cursor-pointer text-sm md:text-[0.95rem] shadow-[0_4px_14px_rgba(163,120,65,0.3)] hover:bg-[#8A6333] transition-colors"
          >
            Jetzt Registrieren
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="pt-16 pb-12 md:pt-20 md:pb-16 px-6 text-center max-w-5xl mx-auto relative z-10">
        <div className="inline-block bg-[#A37841]/15 border border-[#A37841] py-1.5 px-4 rounded-full text-[0.75rem] md:text-[0.8rem] font-extrabold text-[#A37841] uppercase tracking-[1.5px] mb-6">
          Kalkulieren statt spekulieren
        </div>
        <h1 className="text-4xl md:text-[3.6rem] font-black leading-tight md:leading-[1.15] tracking-tight mb-6 text-white">
          Entdecke, welche Immobilie sich wirklich rechnet.
        </h1>
        <p className="text-lg md:text-[1.2rem] text-[#A0AEC0] max-w-3xl mx-auto mb-12 leading-relaxed">
          Tauche ein in die Welt der Immobilieninvestments. Berechne Cashflows, Zinseszinsen, Steuereffekte und langfristige Vermögenswerte spielerisch und präzise.
        </p>
      </header>

      {/* AUTH BEREICH */}
      <section id="auth-section" className="px-6 pb-20 max-w-[520px] mx-auto relative z-10">
        <div className="bg-white/5 border border-[#E2D9CE]/20 rounded-2xl p-6 md:p-10 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          
          <div className="grid grid-cols-2 bg-black/30 p-1 rounded-xl mb-7">
            <button 
              type="button" 
              onClick={() => { setAuthMode('login'); setMessage(null); }} 
              className={`py-2.5 rounded-lg font-bold text-sm transition-colors ${authMode === 'login' ? 'bg-[#13381A] text-white shadow-md' : 'bg-transparent text-white/70 hover:text-white'}`}
            >
              Anmelden
            </button>
            <button 
              type="button" 
              onClick={() => { setAuthMode('register'); setMessage(null); }} 
              className={`py-2.5 rounded-lg font-bold text-sm transition-colors ${authMode === 'register' ? 'bg-[#A37841] text-white shadow-md' : 'bg-transparent text-white/70 hover:text-white'}`}
            >
              Registrieren
            </button>
          </div>

          <h2 className="text-2xl font-black text-center mb-6 text-white">
            {authMode === 'login' && 'Willkommen zurück'}
            {authMode === 'register' && 'Konto erstellen'}
            {authMode === 'forgot' && 'Passwort zurücksetzen'}
          </h2>

          <form onSubmit={authMode === 'login' ? handleLogin : (authMode === 'register' ? handleRegister : handleResetPassword)}>
            <div className="flex flex-col gap-4">
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-[#A0AEC0] mb-1.5">Vollständiger Name</label>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="Max Mustermann" 
                    required 
                    className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-white outline-none focus:border-[#A37841] focus:ring-1 focus:ring-[#A37841] transition-all" 
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#A0AEC0] mb-1.5">E-Mail-Adresse</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="deine@email.de" 
                  required 
                  className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-white outline-none focus:border-[#A37841] focus:ring-1 focus:ring-[#A37841] transition-all" 
                />
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-[#A0AEC0]">Passwort</label>
                    {authMode === 'login' && (
                      <button 
                        type="button" 
                        onClick={() => { setAuthMode('forgot'); setMessage(null); }} 
                        className="bg-transparent border-none text-[#A37841] text-xs font-bold cursor-pointer hover:text-[#8A6333]"
                      >
                        Passwort vergessen?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-white outline-none focus:border-[#A37841] focus:ring-1 focus:ring-[#A37841] transition-all" 
                  />
                </div>
              )}

              {message && (
                <div className={`p-3.5 rounded-xl text-sm leading-relaxed border ${message.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-emerald-500/20 border-emerald-500 text-emerald-200'}`}>
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className={`mt-2 p-3.5 text-white border-none rounded-xl text-base font-black cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-all ${authMode === 'login' ? 'bg-[#13381A] hover:bg-[#1a4a23]' : 'bg-[#A37841] hover:bg-[#8A6333]'} disabled:opacity-70`}
              >
                {loading ? 'Lade...' : (
                  authMode === 'login' ? 'Anmelden' : (authMode === 'register' ? 'Registrieren & E-Mail senden' : 'Passwort-Reset-Mail senden')
                )}
              </button>

              {authMode === 'forgot' && (
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('login'); setMessage(null); }} 
                  className="bg-transparent border-none text-[#A0AEC0] text-sm font-bold cursor-pointer mt-2 hover:text-white"
                >
                  ← Zurück zum Login
                </button>
              )}

            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 text-center border-t border-[#E2D9CE]/10 bg-black/40 relative z-10">
        <div className="text-sm text-[#718096] mb-6">Valuon Estate Investment Suite v2.4</div>
        <button 
          onClick={() => { if (onDevLogin) onDevLogin(); }} 
          className="inline-flex items-center gap-2 py-3 px-6 bg-transparent text-[#A37841] border-2 border-dashed border-[#A37841] rounded-full font-black text-sm cursor-pointer hover:bg-[#A37841]/10 transition-colors"
        >
          <IconLightning /> Developer Direktzugang (Ohne Login zur Analyse)
        </button>
      </footer>
    </div>
  );
}
