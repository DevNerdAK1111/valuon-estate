'use client';
import { useState } from 'react';
import StepperInput from '../ui/StepperInput';

export default function OnboardingView({ userEmail, userProfile, setUserProfile, onCompleteOnboarding }) {
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (field, value) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userProfile.profilname || !userProfile.vorname || !userProfile.nachname) {
      setErrorMsg('Bitte fülle die erforderlichen Angaben (*) aus.');
      return;
    }
    setErrorMsg(null);
    onCompleteOnboarding(userProfile);
  };

  const labelClass = "block text-[0.8rem] font-semibold text-slate-600 mb-1 h-[18px]";
  const inputClass = "w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-800 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border transition-colors";

  return (
    <div className="max-w-[850px] mx-auto my-8 bg-white p-8 md:p-10 rounded-2xl border border-valuon-border shadow-sm">
      
      <div className="text-center mb-10">
        <div className="text-[0.8rem] font-extrabold text-valuon-gold uppercase tracking-[1.5px] mb-1.5">
          Willkommen bei Valuon Estate
        </div>
        <h1 className="m-0 mb-2 text-3xl font-black text-valuon-green tracking-tight">
          Richte dein Investoren-Profil ein
        </h1>
        <p className="m-0 text-slate-500 text-[0.95rem]">
          Konto: <strong className="text-slate-700">{userEmail}</strong>. Bitte vervollständige deine Daten für präzise Analysen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* EINHEITLICHER FORMULAR-BLOCK */}
        <div>
          <label className={labelClass}>Profilname / Anzeigename *</label>
          <input
            type="text"
            required
            value={userProfile.profilname || ''}
            onChange={(e) => handleChange('profilname', e.target.value)}
            className={inputClass}
            placeholder="z.B. ImmoInvestor99 oder MaxM"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Vorname *</label>
            <input
              type="text"
              required
              value={userProfile.vorname || ''}
              onChange={(e) => handleChange('vorname', e.target.value)}
              className={inputClass}
              placeholder="Max"
            />
          </div>
          <div>
            <label className={labelClass}>Nachname *</label>
            <input
              type="text"
              required
              value={userProfile.nachname || ''}
              onChange={(e) => handleChange('nachname', e.target.value)}
              className={inputClass}
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Geburtsdatum</label>
            <input 
              type="date" 
              value={userProfile.geburtsdatum || ''} 
              onChange={(e) => handleChange('geburtsdatum', e.target.value)} 
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>Telefonnummer</label>
            <input 
              type="tel" 
              value={userProfile.telefon || ''} 
              onChange={(e) => handleChange('telefon', e.target.value)} 
              className={inputClass} 
              placeholder="+49 170 1234567" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Straße & Hausnummer</label>
            <input 
              type="text" 
              value={userProfile.strasse || ''} 
              onChange={(e) => handleChange('strasse', e.target.value)} 
              className={inputClass} 
              placeholder="Musterstraße 12" 
            />
          </div>
          <div>
            <label className={labelClass}>Postleitzahl (PLZ)</label>
            <input 
              type="text" 
              value={userProfile.plz || ''} 
              onChange={(e) => handleChange('plz', e.target.value)} 
              className={inputClass} 
              placeholder="10115" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Ort / Stadt</label>
            <input 
              type="text" 
              value={userProfile.ort || ''} 
              onChange={(e) => handleChange('ort', e.target.value)} 
              className={inputClass} 
              placeholder="Berlin" 
            />
          </div>
          <div>
            <label className={labelClass}>Land</label>
            <input 
              type="text" 
              value={userProfile.land || 'Deutschland'} 
              onChange={(e) => handleChange('land', e.target.value)} 
              className={inputClass} 
              placeholder="Deutschland" 
            />
          </div>
        </div>

        <hr className="border-none border-t border-valuon-border my-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StepperInput
            label="Bruttojahreseinkommen (€) *"
            value={userProfile.bruttoEinkommen || 65000}
            onChange={(v) => handleChange('bruttoEinkommen', v)}
            step={2500}
            isCurrency={true}
          />

          <div>
            <label className={labelClass}>Steuerklasse *</label>
            <select
              value={userProfile.steuerklasse || '1'}
              onChange={(e) => handleChange('steuerklasse', e.target.value)}
              className={inputClass}
            >
              <option value="1">Steuerklasse 1 (Ledig / Alleinstehend)</option>
              <option value="2">Steuerklasse 2 (Alleinerziehend)</option>
              <option value="3">Steuerklasse 3 (Verheiratet - Höheres Einkommen)</option>
              <option value="4">Steuerklasse 4 (Verheiratet - Gleichberechtigt)</option>
              <option value="5">Steuerklasse 5 (Verheiratet - Geringeres Einkommen)</option>
              <option value="6">Steuerklasse 6 (Zweitjob)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Familienstand</label>
            <select
              value={userProfile.familienstand || 'Ledig'}
              onChange={(e) => handleChange('familienstand', e.target.value)}
              className={inputClass}
            >
              <option value="Ledig">Ledig</option>
              <option value="Verheiratet">Verheiratet (Zusammenveranlagung)</option>
              <option value="Geschieden">Geschieden</option>
              <option value="Verwitwet">Verwitwet</option>
            </select>
          </div>

          <StepperInput
            label="Kinderfreibeträge (Anzahl Kinder)"
            value={userProfile.kinderAnzahl || 0}
            onChange={(v) => handleChange('kinderAnzahl', v)}
            step={0.5}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Kirchensteuerpflichtig?</label>
            <select
              value={userProfile.kirchensteuer ? 'ja' : 'nein'}
              onChange={(e) => handleChange('kirchensteuer', e.target.value === 'ja')}
              className={inputClass}
            >
              <option value="nein">Nein (0%)</option>
              <option value="ja">Ja</option>
            </select>
          </div>

          {userProfile.kirchensteuer ? (
            <div>
              <label className={labelClass}>Kirchensteuersatz (Bundesland)</label>
              <select
                value={userProfile.kirchensteuersatz || 9.0}
                onChange={(e) => handleChange('kirchensteuersatz', parseFloat(e.target.value))}
                className={inputClass}
              >
                <option value={8.0}>8 % (Bayern & Baden-Württemberg)</option>
                <option value={9.0}>9 % (Übrige Bundesländer)</option>
              </select>
            </div>
          ) : (
            <StepperInput
              label="Individueller Grenzsteuersatz (%) *"
              value={userProfile.grenzsteuersatz || 42.0}
              onChange={(v) => handleChange('grenzsteuersatz', v)}
              step={0.5}
              isPercent={true}
            />
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-valuon-red rounded-lg text-[0.85rem] font-bold border border-red-200">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          className="mt-4 p-4 bg-valuon-green text-white border-none rounded-xl text-[1.05rem] font-extrabold cursor-pointer shadow-md hover:bg-valuon-green-light transition-colors"
        >
          Profil speichern & Suite starten →
        </button>

      </form>
    </div>
  );
}
