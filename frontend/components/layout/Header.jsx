'use client';
import { useState, useRef, useEffect } from 'react';
import { IconGear, IconUser } from '../ui/Icons';

export default function Header({ navChoice, setNavChoice, backendStatus, userEmail, userProfile, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const mainNavItems = ['Startseite', 'Analyse', 'Objekt Datenbank', 'Szenario-Vergleich'];
  const dropdownItems = ['KI Exposé-Parser'];

  const displayName = userProfile?.profilname || userProfile?.vorname || (userEmail ? userEmail.split('@')[0] : 'Konto');

  // Klick außerhalb des Dropdowns schließt es
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      {/* NAVIGATION TABS MIT DROPDOWN */}
      <nav className="flex gap-2 bg-white/60 p-1.5 rounded-full border border-valuon-border backdrop-blur-md overflow-visible max-w-full">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {mainNavItems.map((item) => {
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
        </div>

        {/* 3-PUNKTE DROPDOWN */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`px-3 py-2 rounded-full font-bold cursor-pointer transition-all duration-150 flex items-center justify-center ${
              dropdownItems.includes(navChoice) || isDropdownOpen
                ? 'bg-valuon-green text-valuon-bg shadow-md'
                : 'bg-transparent text-slate-600 hover:text-valuon-green hover:bg-white'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-[110%] mt-1 w-52 bg-white border border-valuon-border rounded-xl shadow-lg py-2 z-50 overflow-hidden">
              {dropdownItems.map((item) => (
                <button
                  key={item}
                  onClick={() => { 
                    setNavChoice(item); 
                    setIsDropdownOpen(false); 
                  }}
                  className={`w-full text-left px-5 py-2.5 text-sm font-bold transition-colors ${
                    navChoice === item 
                      ? 'bg-valuon-cream text-valuon-green' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-valuon-green'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* RECHTE TOOLBAR */}
      <div className="flex items-center gap-2.5">
        
        {/* BACKEND STATUS BADGE */}
        <div className="hidden sm:flex h-[38px] px-3.5 items-center gap-2 bg-white rounded-full border border-valuon-border text-[0.8rem] font-bold text-valuon-green shadow-sm">
          {backendStatus === 'ready' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              <span>Backend Bereit</span>
            </>
          )}
          {backendStatus === 'waking' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
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
