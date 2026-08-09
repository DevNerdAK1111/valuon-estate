fontWeight: isActive ? '800' : '600'
```[cite: 7]
```jsx
'use client';
import { IconGear, IconUser } from '../ui/Icons';

export default function Header({ navChoice, setNavChoice, backendStatus, userEmail, userProfile, onLogout }) {
  const navItems = ['Startseite', 'Analyse', 'Objekt Datenbank', 'Immobilienwissen'];

  const displayName = userProfile?.profilname || userProfile?.vorname || (userEmail ? userEmail.split('@')[0] : 'Konto');

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      
      {/* BRANDING / LOGO */}
      <div 
        onClick={() => setNavChoice('Startseite')} 
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#13381A', letterSpacing: '-0.8px', lineHeight: '1' }}>
          Valuon Estate
        </div>
        <div style={{ fontSize: '0.7rem', color: '#A37841', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.8px', marginTop: '4px' }}>
          INVESTMENT SUITE
        </div>
      </div>

      {/* NAVIGATION TABS - SPRUNGFREI */}
      <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.6)', padding: '5px', borderRadius: '30px', border: '1px solid #E2D9CE', backdropFilter: 'blur(8px)' }}>
        {navItems.map((item) => {
          const isActive = navChoice === item;
          return (
            <button
              key={item}
              onClick={() => setNavChoice(item)}
              style={{
                padding: '8px 20px',
                background: isActive ? '#13381A' : 'transparent',
                color: isActive ? '#F7F4EC' : '#4A5568',
                border: 'none',
                borderRadius: '20px',
                fontWeight: '700', // Stabile Schriftstärke verhindert Breitenänderung
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                boxShadow: isActive ? '0 2px 8px rgba(19,56,26,0.18)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* RECHTE TOOLBAR / STATUS, EINSTELLUNGEN & PROFIL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* BACKEND STATUS BADGE */}
        <div style={{
          height: '38px',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          borderRadius: '20px',
          border: '1px solid #E2D9CE',
          fontSize: '0.8rem',
          fontWeight: '700',
          color: '#13381A',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          {backendStatus === 'ready' && (
            <>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38A169', display: 'inline-block' }}></span>
              <span>Backend Bereit</span>
            </>
          )}
          {backendStatus === 'waking' && (
            <>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D69E2E', display: 'inline-block' }}></span>
              <span style={{ color: '#D69E2E' }}>Startet...</span>
            </>
          )}
          {backendStatus === 'sleeping' && (
            <>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E53E3E', display: 'inline-block' }}></span>
              <span style={{ color: '#E53E3E' }}>Inaktiv</span>
            </>
          )}
        </div>

        {/* SETTINGS BUTTON */}
        <button
          onClick={() => setNavChoice('Einstellungen')}
          title="Einstellungen"
          style={{
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: navChoice === 'Einstellungen' ? '#13381A' : 'white',
            color: navChoice === 'Einstellungen' ? 'white' : '#13381A',
            border: '1px solid #E2D9CE',
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <IconGear />
        </button>

        {/* PROFIL / USER BADGE */}
        <div 
          onClick={() => setNavChoice('Profil')}
          title="Nutzerprofil öffnen"
          style={{
            height: '38px',
            padding: '0 12px 0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: navChoice === 'Profil' ? '#13381A' : 'white',
            color: navChoice === 'Profil' ? 'white' : '#13381A',
            borderRadius: '20px',
            border: '1px solid #E2D9CE',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '700',
            transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: navChoice === 'Profil' ? '#A37841' : '#FAF8F5',
            border: '1px solid #E2D9CE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: navChoice === 'Profil' ? 'white' : '#13381A'
          }}>
            <IconUser />
          </div>
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
        </div>

      </div>

    </header>
  );
}
