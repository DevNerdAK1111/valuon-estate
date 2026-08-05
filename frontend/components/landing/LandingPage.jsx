'use client';
import { useState } from 'react';
import { IconLightning } from '@/components/ui/Icons';

export default function LandingPage({ setShowApp, setAuthenticated, userEmail, setUserEmail }) {
  const [authMode, setAuthMode] = useState('login');

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

      {/* KACHEL-GRID */}
      <section style={{ padding: '1rem 4rem 4rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(226,217,206,0.12)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
            <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" alt="Mehrfamilienhaus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(19,56,26,0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                Bestands-Mehrfamilienhaus
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'white' }}>Mehrparteienhäuser analysieren</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#A0AEC0' }}>Kalkuliere Mieteinnahmen, Instandhaltungsrücklagen und Abschreibungen über Jahrzehnte.</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '0.85rem', color: '#A37841', fontWeight: 'bold' }}>Analyse starten</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(226,217,206,0.12)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
            <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" alt="Eigentumswohnung" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(163,120,65,0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                Eigentumswohnung (ETW)
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'white' }}>Klassische Kapitalanlage</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#A0AEC0' }}>Simuliere Hausgeld-Aufteilungen, Leerstandsquoten und den perfekten Eigenkapital-Hebel.</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '0.85rem', color: '#A37841', fontWeight: 'bold' }}>Rendite berechnen</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(226,217,206,0.12)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
            <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" alt="Wohngebäude" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(19,56,26,0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                Sanierung & AfA
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'white' }}>Sanierung & Abschreibung</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#A0AEC0' }}>Beachte degressive Abschreibungen, KfW-Fördermittel und steuerliche Verlustverrechnungen.</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '0.85rem', color: '#A37841', fontWeight: 'bold' }}>Steuerpotenzial prüfen</div>
            </div>
          </div>

        </div>
      </section>

      {/* AUTH BEREICH */}
      <section id="auth-section" style={{ padding: '2rem 4rem 4rem 4rem', maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(226,217,206,0.2)', borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(15px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', marginBottom: '1.8rem' }}>
            <button type="button" onClick={() => setAuthMode('login')} style={{ padding: '10px', background: authMode === 'login' ? '#13381A' : 'transparent', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>Anmelden</button>
            <button type="button" onClick={() => setAuthMode('register')} style={{ padding: '10px', background: authMode === 'register' ? '#A37841' : 'transparent', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>Registrieren</button>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.5rem' }}>{authMode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}</h2>
          <p style={{ textAlign: 'center', color: '#A0AEC0', fontSize: '0.85rem', marginBottom: '1.8rem' }}>{authMode === 'login' ? 'Greife auf deine gespeicherten Objekte zu' : 'Starte direkt mit deinen eigenen Immobilienkalkulationen'}</p>

          <form onSubmit={(e) => { e.preventDefault(); setShowApp(true); setAuthenticated(true); }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '4px', fontWeight: '600' }}>Vollständiger Name</label>
                  <input type="text" placeholder="Max Mustermann" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '4px', fontWeight: '600' }}>E-Mail-Adresse</label>
                <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '4px', fontWeight: '600' }}>Passwort</label>
                <input type="password" placeholder="••••••••" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ marginTop: '0.5rem', padding: '14px', background: authMode === 'login' ? '#13381A' : '#A37841', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
                {authMode === 'login' ? 'Anmelden & Rechner starten' : 'Konto anlegen & loslegen'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(226,217,206,0.1)', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>Valuon Estate Investment Suite v2.4</div>
        <button onClick={() => { setShowApp(true); setAuthenticated(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'transparent', color: '#A37841', border: '2px dashed #A37841', borderRadius: '30px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}>
          <IconLightning /> Developer Direktzugang (Ohne Login zur Analyse)
        </button>
      </footer>
    </div>
  );
}
