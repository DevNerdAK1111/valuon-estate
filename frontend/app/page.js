'use client';
import { useState } from 'react';

const BACKEND_URL = 'https://valuon-estate-backend.onrender.com'; // Hier deine echte Render-URL eintragen

export default function Home() {
  // Session State (analog zu deinem Streamlit Session State)
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [navChoice, setNavChoice] = useState('Objekt Datenbank');
  
  // Analysedaten / Formular State
  const [formData, setFormData] = useState({
    kaufpreis: 250000,
    qm: 75,
    ist_sqm: 11.5,
    hb_zins: 3.8,
    hb_tilg: 2.0,
    ek_euro: 50000,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login-Handler
  const handleLogin = (email) => {
    setAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUserEmail('');
  };

  // Berechnungs-Handler
  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Fehler bei der Verbindung zum Backend');
    } finally {
      setLoading(false);
    }
  };

  // --- 1. AUTH GATE (ANMELDUNG) ---
  if (!authenticated) {
    return (
      <main style={{ minHeight: '100vh', background: '#13381A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#F7F4EC', padding: '3rem', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#A37841', marginBottom: '8px' }}>Institutional Grade Suite</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#13381A', margin: '0 0 10px 0' }}>Valuon Estate</h1>
          <p style={{ color: '#555759', marginBottom: '2rem', fontSize: '0.95rem' }}>Die hochentwickelte Analyse- und Bewertungsumgebung.</p>
          
          <button 
            onClick={() => handleLogin('developer@valuon-estate.de')}
            style={{ width: '100%', padding: '14px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginBottom: '1rem' }}
          >
            Als Entwickler einloggen (Permanenter Modus)
          </button>
        </div>
      </main>
    );
  }

  // --- 2. HAUPT-APP MIT VOLLER BREITE & NAVIGATION ---
  const navItems = ['Objekt Datenbank', 'Analyse', 'Immobilienwissen', 'Einstellungen'];

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 4rem', background: '#F7F4EC', color: '#13381A' }}>
      
      {/* Header & Konto */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2D9CE', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.8px', color: '#13381A', lineHeight: '1.1' }}>Valuon Estate</div>
          <div style={{ fontSize: '0.85rem', color: '#A37841', fontWeight: '600', texttransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>Investment Suite</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#555759' }}>Konto: {userEmail}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#D9534F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Abmelden
          </button>
        </div>
      </div>

      {/* Top Navigation Bar (Tabs) */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${navItems.length}, 1fr)`, gap: '1rem', marginBottom: '2rem' }}>
        {navItems.map((item) => {
          const isActive = navChoice === item;
          return (
            <button
              key={item}
              onClick={() => setNavChoice(item)}
              style={{
                padding: '12px',
                background: isActive ? '#13381A' : 'white',
                color: isActive ? 'white' : '#13381A',
                border: '1px solid #E2D9CE',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', marginBottom: '2rem' }} />

      {/* --- MODUL-ROUTING --- */}
      
      {/* ANSICHT 1: OBJEKT DATENBANK (Pipeline) */}
      {navChoice === 'Objekt Datenbank' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Objekt Datenbank & Pipeline</h2>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <p style={{ color: '#555759' }}>Hier werden deine gespeicherten Immobilien aus Supabase übersichtlich in einer Tabelle angezeigt.</p>
            {/* Supabase-Datenanbindung folgt im nächsten Schritt */}
          </div>
        </div>
      )}

      {/* ANSICHT 2: ANALYSE (Die Berechnungsmaske) */}
      {navChoice === 'Analyse' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '700' }}>Objekt-Parameter</h3>
            <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: '#555759' }}>Kaufpreis (€)</label>
                <input type="number" value={formData.kaufpreis} onChange={(e) => setFormData({...formData, kaufpreis: parseFloat(e.target.value)})} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: '#555759' }}>Wohnfläche (qm)</label>
                <input type="number" value={formData.qm} onChange={(e) => setFormData({...formData, qm: parseFloat(e.target.value)})} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: '#555759' }}>Ist-Miete (€/qm)</label>
                <input type="number" step="0.1" value={formData.ist_sqm} onChange={(e) => setFormData({...formData, ist_sqm: parseFloat(e.target.value)})} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: '#555759' }}>Eigenkapital (€)</label>
                <input type="number" value={formData.ek_euro} onChange={(e) => setFormData({...formData, ek_euro: parseFloat(e.target.value)})} style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? 'Berechne...' : 'Berechnung starten'}
              </button>
            </form>
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '700' }}>Ergebnisse & Kennzahlen</h3>
            {!result ? (
              <p style={{ color: '#888' }}>Bitte starte eine Analyse über das Formular.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                <div style={{ background: '#FAF8F5', padding: '15px', borderRadius: '8px', border: '1px solid #E2D9CE' }}>
                  <div style={{ fontSize: '0.8rem', color: '#555759', fontWeight: '600' }}>IRR (Rendite)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#A37841' }}>{(result.summary.irr * 100).toFixed(2)} %</div>
                </div>
                <div style={{ background: '#FAF8F5', padding: '15px', borderRadius: '8px', border: '1px solid #E2D9CE' }}>
                  <div style={{ fontSize: '0.8rem', color: '#555759', fontWeight: '600' }}>Gesamtinvestment</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#13381A' }}>{result.summary.total_investment.toLocaleString('de-DE', {maximumFractionDigits:0})} €</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANSICHT 3: IMMOBILIENWISSEN */}
      {navChoice === 'Immobilienwissen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Immobilienwissen & KI-Assistent</h2>
          <p style={{ color: '#555759' }}>Hier findest du deine Fachartikel, Kennzahlen-Erklärungen und den integrierten KI-Assistenten.</p>
        </div>
      )}

      {/* ANSICHT 4: EINSTELLUNGEN */}
      {navChoice === 'Einstellungen' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Einstellungen & Strategien</h2>
          <p style={{ color: '#555759' }}>Verwalte hier deine Anlage-Strategien (Konservativ, Aggressiv etc.) und API-Schlüssel.</p>
        </div>
      )}

    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #CCC',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'box-sizing'
};
