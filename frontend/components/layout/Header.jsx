'use client';
import { IconGear, IconUser } from '../ui/Icons';

export default function Header({ navChoice, setNavChoice, backendStatus, userEmail, userProfile, onLogout }) {
  const navItems = ['Startseite', 'Analyse', 'Objekt Datenbank', 'Szenario-Vergleich'];

  const displayName = userProfile?.profilname || userProfile?.vorname || (userEmail ? userEmail.split('@')[0] : 'Konto');

  return (
    <header className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 lg:gap-0">
      
      {/* BRANDING / LOGO */}
      <div 
        onClick={() => setNavChoice('Startseite')} 
        className="cursor-pointer select-none text-center lg:text-left"
      >
        <div className="text-3xl font-black text-valuon-green tracking-tight leading-none">
          Valuon Estate
        </div>
        <div className="text-[0.7rem] text-valuon-gold font-extrabold uppercase tracking-[1.8px] mt-1">
          INVESTMENT SUITE
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <nav className="flex gap-2 bg-white/60 p-1.5 rounded-full border border-valuon-border backdrop-blur-md overflow-x-auto max-w-full">
        {navItems.map((item) => {
          const isActive = navChoice === item;
          return (
            <button
              key={item}
              onClick={() => setNavChoice(item)}
              className={`px-5 py-2 rounded-full font-bold text-[0.85rem] cursor-pointer transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-valuon-green text-valuon-bg shadow-md'
                  : 'bg-transparent text-slate-600 hover:text-valuon-green'
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* RECHTE TOOLBAR */}
      <div className="flex items-center gap-2.5">
        
        {/* BACKEND STATUS BADGE */}
        <div className="h-[38px] px-3.5 flex items-center gap-2 bg-white rounded-full border border-valuon-border text-[0.8rem] font-bold text-valuon-green shadow-sm">
          {backendStatus === 'ready' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              <span>Backend Bereit</span>
            </>
          )}
          {backendStatus === 'waking' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-amber-600">Startet...</span>
            </>
          )}
          {backendStatus === 'sleeping' && (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
              <span className="text-red-600">Inaktiv</span>
            </>
          )}
        </div>

        {/* SETTINGS BUTTON */}
        <button
          onClick={() => setNavChoice('Einstellungen')}
          title="Einstellungen"
          className={`w-[38px] h-[38px] flex items-center justify-center border border-valuon-border rounded-full cursor-pointer transition-colors duration-150 shadow-sm ${
            navChoice === 'Einstellungen'
              ? 'bg-valuon-green text-white'
              : 'bg-white text-valuon-green hover:bg-valuon-cream'
          }`}
        >
          <IconGear />
        </button>

        {/* PROFIL BADGE */}
        <div 
          onClick={() => setNavChoice('Profil')}
          title="Nutzerprofil öffnen"
          className={`h-[38px] px-3 pl-2 flex items-center gap-2 rounded-full border border-valuon-border cursor-pointer text-[0.8rem] font-bold transition-colors duration-150 shadow-sm ${
            navChoice === 'Profil'
              ? 'bg-valuon-green text-white'
              : 'bg-white text-valuon-green hover:bg-valuon-cream'
          }`}
        >
          <div className={`w-6 h-6 rounded-full border border-valuon-border flex items-center justify-center ${
            navChoice === 'Profil'
              ? 'bg-valuon-gold text-white'
              : 'bg-valuon-cream text-valuon-green'
          }`}>
            <IconUser />
          </div>
          <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
            {displayName}
          </span>
        </div>

      </div>

    </header>
  );
}
