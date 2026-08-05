'use client';
import { IconGear, IconUser } from '@/components/ui/Icons';

export default function Header({ navChoice, setNavChoice, backendStatus, setDevNotice, userEmail }) {
  const mainNavItems = ['Startseite', 'Analyse', 'Objekt Datenbank', 'Immobilienwissen'];

  return (
    <>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        
        {/* LOGO (KLICKBAR -> STARTSEITE) */}
        <div 
          onClick={() => setNavChoice('Startseite')} 
          style={{ cursor: 'pointer', userSelect: 'none' }}
          title="Zurück zur Startseite"
        >
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#13381A', letterSpacing: '-0.5px' }}>Valuon Estate</div>
          <div style={{ fontSize: '0.8rem', color: '#A37841', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px' }}>INVESTMENT SUITE</div>
        </div>
        
        {/* AKTIONEN RECHTS (BACKEND STATUS, EINSTELLUNGEN & PROFIL) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* BACKEND STATUS DOT */}
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 14px', borderRadius: '20px', border: '1px solid #E2D9CE' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: backendStatus === 'ready' ? '#38A169' : (backendStatus === 'waking' ? '#D69E2E' : '#9B2C2C') }} />
            <span style={{ fontWeight: '700', color: '#13381A' }}>
              {backendStatus === 'ready' && 'Backend Bereit'}
              {backendStatus === 'waking' && 'Backend startet...'}
              {backendStatus === 'sleeping' && 'Backend inaktiv'}
            </span>
          </div>

          {/* EINSTELLUNGEN ZAHNRAD BUTTON */}
          <button
            onClick={() => setNavChoice('Einstellungen')}
            title="Einstellungen öffnen"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center',
              width: '38px',
              height: '38px',
              padding: 0,
              background: navChoice === 'Einstellungen' ? '#13381A' : 'white',
              color: navChoice === 'Einstellungen' ? 'white' : '#13381A',
              border: '1px solid #E2D9CE',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            <IconGear />
          </button>

          {/* PROFIL / KONTO BUTTON */}
          <button
            onClick={() => setDevNotice('Profil & Kontoverwaltung')}
            title={`Angemeldet als: ${userEmail}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center',
              width: '38px',
              height: '38px',
              padding: 0,
              background: 'white',
              color: '#13381A',
              border: '1px solid #E2D9CE',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            <IconUser />
          </button>

        </div>
      </div>

      {/* HAUPTNAVIGATION BAR (WIRD AUF DER STARTSEITE AUTOMATISCH AUSGEBLENDET) */}
      {navChoice !== 'Startseite' && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${mainNavItems.length}, 1fr)`, gap: '1rem', marginBottom: '2rem' }}>
          {mainNavItems.map((item) => {
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
                  borderRadius: '25px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(19,56,26,0.15)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
