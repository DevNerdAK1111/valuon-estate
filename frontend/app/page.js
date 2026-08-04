'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState('Verbinde mit Render-Backend...');

  useEffect(() => {
    // Hier wird dein Render-Backend abgefragt (ersetze die URL später durch deine echte Render-URL)
    fetch('https://valuon-estate-backend.onrender.com/')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(err => setBackendStatus('Verbindung zum Backend fehlgeschlagen (CORS oder URL prüfen)'));
  }, []);

  return (
    <main style={{ padding: '4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#A37841', marginBottom: '8px' }}>
        Institutional Grade Suite
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#13381A', margin: '0 0 15px 0' }}>
        Valuon Estate
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#555759', maxWidth: '650px', margin: '0 auto 30px auto', fontWeight: '300' }}>
        Die neue, ultraschnelle und flexible Analyseumgebung ohne Streamlit-Einschränkungen.
      </p>

      <div style={{ display: 'inline-block', padding: '15px 25px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #E2D9CE' }}>
        <strong>Backend-Status:</strong> <span style={{ color: '#13381A' }}>{backendStatus}</span>
      </div>
    </main>
  );
}
