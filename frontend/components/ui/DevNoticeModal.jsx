'use client';
import { IconLock } from '@/components/ui/Icons';

export default function DevNoticeModal({ devNotice, onClose }) {
  if (!devNotice) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(13,31,18,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', border: '2px solid #13381A', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A37841', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          <IconLock /> Funktion in Entwicklung
        </div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', color: '#13381A', fontWeight: '800' }}>
          {devNotice}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#4A5568', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          Dieses Modul wird derzeit entwickelt und steht in Kürze zur Verfügung. Nutze in der Zwischenzeit unser voll funktionsfähiges Investitions-Analyse Tool für deine detaillierten Objektberechnungen.
        </p>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}
        >
          Verstanden & Schließen
        </button>
      </div>
    </div>
  );
}
