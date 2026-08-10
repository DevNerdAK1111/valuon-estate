'use client';
import { useState } from 'react';
import StepperInput from '../ui/StepperInput';

export default function ProfileView({
  userEmail,
  setUserEmail,
  userProfile,
  setUserProfile,
  onSaveProfile,
  onPasswordChange,
  onDeleteAccount,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('persoenlich'); // 'persoenlich' | 'steuer' | 'sicherheit'
  
  const [emailForm, setEmailForm] = useState({ newEmail: userEmail || '' });
  const [emailStatus, setEmailStatus] = useState(null);

  const [pwdForm, setPwdForm] = useState({ oldPwd: '', newPwd: '', confirmPwd: '' });
  const [pwdStatus, setPwdStatus] = useState(null);

  const [saveStatus, setSaveStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fallback: Falls userProfile noch null ist, nutzen wir ein lokales Standard-Objekt
  const activeProfile = userProfile || {
    profilname: userEmail ? userEmail.split('@')[0] : 'Nutzer',
    vorname: '',
    nachname: '',
    bruttoEinkommen: 65000,
    steuerklasse: '1',
    familienstand: 'Ledig',
    kinderAnzahl: 0,
    kirchensteuer: false,
    grenzsteuersatz: 42.0
  };

  const handleProfileChange = (field, value) => {
    if (setUserProfile) {
      setUserProfile((prev) => ({ ...(prev || activeProfile), [field]: value }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onSaveProfile) onSaveProfile(activeProfile);
    setSaveStatus('Profildaten erfolgreich gespeichert!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.newEmail.includes('@')) {
      setEmailStatus({ type: 'error', text: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
      return;
    }
    if (setUserEmail) setUserEmail(emailForm.newEmail);
    setEmailStatus({ type: 'success', text: 'E-Mail-Adresse erfolgreich aktualisiert!' });
    setTimeout(() => setEmailStatus(null), 3000);
  };

  const handlePwdSubmit = (e) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirmPwd) {
      setPwdStatus({ type: 'error', text: 'Die neuen Passwörter stimmen nicht überein.' });
      return;
    }
    if (pwdForm.newPwd.length < 6) {
      setPwdStatus({ type: 'error', text: 'Das Passwort muss mindestens 6 Zeichen lang sein.' });
      return;
    }
    
    if (onPasswordChange) onPasswordChange(pwdForm.oldPwd, pwdForm.newPwd);
    setPwdStatus({ type: 'success', text: 'Passwort erfolgreich geändert!' });
    setPwdForm({ oldPwd: '', newPwd: '', confirmPwd: '' });
    setTimeout(() => setPwdStatus(null), 4000);
  };

  const displayName = activeProfile.profilname || (activeProfile.vorname ? `${activeProfile.vorname} ${activeProfile.nachname || ''}` : 'Nutzerprofil');

  const labelClass = "block text-[0.8rem] font-semibold text-slate-600 mb-1 h-[18px]";
  const inputClass = "w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-800 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border transition-colors";

  return (
    <div className="max-w-[900px] mx-auto flex flex-col gap-6">
      
      {/* HEADER DES PROFILS */}
      <div className="bg-white p-7 rounded-2xl border border-valuon-border flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-valuon-green text-white flex items-center justify-center text-2xl font-black">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="m-0 text-2xl text-valuon-green font-black tracking-tight">
              {displayName}
            </h1>
            <div className="text-[0.85rem] text-slate-500 mt-0.5">{userEmail}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="py-2 px-4 bg-red-50 text-valuon-red border border-red-200 rounded-lg font-extrabold text-[0.85rem] cursor-pointer hover:bg-red-100 transition-colors"
        >
          Abmelden
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-4 border-b-2 border-valuon-border pb-1 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('persoenlich')}
          className={`bg-transparent border-none py-2 px-3 text-[0.95rem] font-extrabold cursor-pointer -mb-[3px] transition-colors border-b-3 ${
            activeTab === 'persoenlich' ? 'text-valuon-green border-valuon-green' : 'text-slate-500 border-transparent hover:text-valuon-green'
          }`}
        >
          Persönliche Daten
        </button>
        <button
          onClick={() => setActiveTab('steuer')}
          className={`bg-transparent border-none py-2 px-3 text-[0.95rem] font-extrabold cursor-pointer -mb-[3px] transition-colors border-b-3 ${
            activeTab === 'steuer' ? 'text-valuon-green border-valuon-green' : 'text-slate-500 border-transparent hover:text-valuon-green'
          }`}
        >
          Steuer- & Gehaltsprofil
        </button>
        <button
          onClick={() => setActiveTab('sicherheit')}
          className={`bg-transparent border-none py-2 px-3 text-[0.95rem] font-extrabold cursor-pointer -mb-[3px] transition-colors border-b-3 ${
            activeTab === 'sicherheit' ? 'text-valuon-green border-valuon-green' : 'text-slate-500 border-transparent hover:text-valuon-green'
          }`}
        >
          Sicherheit & Account
        </button>
      </div>

      {/* TAB 1: PERSÖNLICHE DATEN */}
      {activeTab === 'persoenlich' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl border border-valuon-border flex flex-col gap-5 shadow-sm">
          
          <div>
            <label className={labelClass}>Profilname / Anzeigename *</label>
            <input type="text" required value={activeProfile.profilname || ''} onChange={(e) => handleProfileChange('profilname', e.target.value)} className={inputClass} placeholder="z.B. ImmoInvestor99" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Vorname *</label>
              <input type="text" required value={activeProfile.vorname || ''} onChange={(e) => handleProfileChange('vorname', e.target.value)} className={inputClass} placeholder="Max" />
            </div>
            <div>
              <label className={labelClass}>Nachname *</label>
              <input type="text" required value={activeProfile.nachname || ''} onChange={(e) => handleProfileChange('nachname', e.target.value)} className={inputClass} placeholder="Mustermann" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Geburtsdatum</label>
              <input type="date" value={activeProfile.geburtsdatum || ''} onChange={(e) => handleProfileChange('geburtsdatum', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefonnummer</label>
              <input type="tel" value={activeProfile.telefon || ''} onChange={(e) => handleProfileChange('telefon', e.target.value)} className={inputClass} placeholder="+49 170 1234567" />
            </div>
          </div>

          <hr className="border-none border-t border-valuon-border my-1" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Straße & Hausnummer</label>
              <input type="text" value={activeProfile.strasse || ''} onChange={(e) => handleProfileChange('strasse', e.target.value)} className={inputClass} placeholder="Musterstraße 12" />
            </div>
            <div>
              <label className={labelClass}>Postleitzahl (PLZ)</label>
              <input type="text" value={activeProfile.plz || ''} onChange={(e) => handleProfileChange('plz', e.target.value)} className={inputClass} placeholder="10115" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Ort / Stadt</label>
              <input type="text" value={activeProfile.ort || ''} onChange={(e) => handleProfileChange('ort', e.target.value)} className={inputClass} placeholder="Berlin" />
            </div>
            <div>
              <label className={labelClass}>Land</label>
              <input type="text" value={activeProfile.land || 'Deutschland'} onChange={(e) => handleProfileChange('land', e.target.value)} className={inputClass} placeholder="Deutschland" />
            </div>
          </div>

          {saveStatus && (
            <div className="py-2.5 px-3.5 bg-emerald-50 text-emerald-800 rounded-lg text-[0.85rem] font-bold border border-emerald-200">
              {saveStatus}
            </div>
          )}

          <button type="submit" className="mt-2 py-3 px-6 bg-valuon-green text-white border-none rounded-lg font-extrabold cursor-pointer self-start hover:bg-valuon-green-light transition-colors shadow-sm">
            Persönliche Daten speichern
          </button>
        </form>
      )}

      {/* TAB 2: STEUER- & GEHALTSPROFIL */}
      {activeTab === 'steuer' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl border border-valuon-border flex flex-col gap-5 shadow-sm">
          
          <div className="bg-blue-50 text-blue-800 border border-blue-200 p-4 rounded-lg text-[0.85rem] leading-relaxed">
            💡 <strong>Warum sind diese Angaben wichtig?</strong> Dein persönliches Einkommen und deine Steuerklasse bestimmen deinen Grenzsteuersatz. Dieser entscheidet darüber, wie viel Steuern du durch Abschreibungen (AfA) und Zinsen bei deinen Immobilien sparen kannst.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StepperInput
              label="Bruttojahreseinkommen (€) *"
              value={activeProfile.bruttoEinkommen || 65000}
              onChange={(v) => handleProfileChange('bruttoEinkommen', v)}
              step={2500}
              isCurrency={true}
            />

            <div>
              <label className={labelClass}>Steuerklasse *</label>
              <select
                value={activeProfile.steuerklasse || '1'}
                onChange={(e) => handleProfileChange('steuerklasse', e.target.value)}
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
                value={activeProfile.familienstand || 'Ledig'}
                onChange={(e) => handleProfileChange('familienstand', e.target.value)}
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
              value={activeProfile.kinderAnzahl || 0}
              onChange={(v) => handleProfileChange('kinderAnzahl', v)}
              step={0.5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Kirchensteuerpflichtig?</label>
              <select
                value={activeProfile.kirchensteuer ? 'ja' : 'nein'}
                onChange={(e) => handleProfileChange('kirchensteuer', e.target.value === 'ja')}
                className={inputClass}
              >
                <option value="nein">Nein (0%)</option>
                <option value="ja">Ja</option>
              </select>
            </div>

            {activeProfile.kirchensteuer ? (
              <div>
                <label className={labelClass}>Kirchensteuersatz (Bundesland)</label>
                <select
                  value={activeProfile.kirchensteuersatz || 9.0}
                  onChange={(e) => handleProfileChange('kirchensteuersatz', parseFloat(e.target.value))}
                  className={inputClass}
                >
                  <option value={8.0}>8 % (Bayern & Baden-Württemberg)</option>
                  <option value={9.0}>9 % (Übrige Bundesländer)</option>
                </select>
              </div>
            ) : (
              <StepperInput
                label="Individueller Grenzsteuersatz (%) *"
                value={activeProfile.grenzsteuersatz || 42.0}
                onChange={(v) => handleProfileChange('grenzsteuersatz', v)}
                step={0.5}
                isPercent={true}
              />
            )}
          </div>

          {activeProfile.kirchensteuer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <StepperInput
                label="Individueller Grenzsteuersatz (%) *"
                value={activeProfile.grenzsteuersatz || 42.0}
                onChange={(v) => handleProfileChange('grenzsteuersatz', v)}
                step={0.5}
                isPercent={true}
              />
              <div />
            </div>
          )}

          {saveStatus && (
            <div className="py-2.5 px-3.5 bg-emerald-50 text-emerald-800 rounded-lg text-[0.85rem] font-bold border border-emerald-200">
              {saveStatus}
            </div>
          )}

          <button type="submit" className="mt-2 py-3 px-6 bg-valuon-green text-white border-none rounded-lg font-extrabold cursor-pointer self-start hover:bg-valuon-green-light transition-colors shadow-sm">
            Steuerprofil speichern
          </button>
        </form>
      )}

      {/* TAB 3: SICHERHEIT & ACCOUNT */}
      {activeTab === 'sicherheit' && (
        <div className="flex flex-col gap-6">
          
          <form onSubmit={handleEmailSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-valuon-border flex flex-col gap-4 shadow-sm">
            <h3 className="m-0 text-valuon-green text-[1.1rem] font-black">E-Mail-Adresse verwalten</h3>
            
            <div>
              <label className={labelClass}>Aktuelle E-Mail-Adresse</label>
              <input type="email" required value={emailForm.newEmail} onChange={(e) => setEmailForm({ newEmail: e.target.value })} className={inputClass} />
            </div>

            {emailStatus && (
              <div className={`py-2.5 px-3.5 rounded-lg text-[0.85rem] font-bold border ${emailStatus.type === 'error' ? 'bg-red-50 text-valuon-red border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                {emailStatus.text}
              </div>
            )}

            <button type="submit" className="mt-1 py-2.5 px-5 bg-valuon-green text-white border-none rounded-lg font-extrabold cursor-pointer self-start hover:bg-valuon-green-light transition-colors">
              E-Mail-Adresse aktualisieren
            </button>
          </form>

          <form onSubmit={handlePwdSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-valuon-border flex flex-col gap-4 shadow-sm">
            <h3 className="m-0 text-valuon-green text-[1.1rem] font-black">Passwort ändern</h3>
            
            <div>
              <label className={labelClass}>Aktuelles Passwort</label>
              <input type="password" required value={pwdForm.oldPwd} onChange={(e) => setPwdForm({ ...pwdForm, oldPwd: e.target.value })} className={inputClass} placeholder="••••••••" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Neues Passwort</label>
                <input type="password" required value={pwdForm.newPwd} onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })} className={inputClass} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelClass}>Neues Passwort bestätigen</label>
                <input type="password" required value={pwdForm.confirmPwd} onChange={(e) => setPwdForm({ ...pwdForm, confirmPwd: e.target.value })} className={inputClass} placeholder="••••••••" />
              </div>
            </div>

            {pwdStatus && (
              <div className={`py-2.5 px-3.5 rounded-lg text-[0.85rem] font-bold border ${pwdStatus.type === 'error' ? 'bg-red-50 text-valuon-red border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                {pwdStatus.text}
              </div>
            )}

            <button type="submit" className="mt-1 py-2.5 px-5 bg-valuon-green text-white border-none rounded-lg font-extrabold cursor-pointer self-start hover:bg-valuon-green-light transition-colors">
              Passwort aktualisieren
            </button>
          </form>

          <div className="bg-red-50 p-6 md:p-8 rounded-2xl border border-red-200 flex flex-col gap-4 shadow-sm">
            <h3 className="m-0 text-valuon-red text-[1.1rem] font-black">Account dauerhaft löschen</h3>
            <p className="m-0 text-[0.85rem] text-red-900/80 leading-relaxed">
              Wenn du deinen Account löschst, werden all deine gespeicherten Objekte, Berechnungen und persönlichen Einstellungen unwiderruflich aus der Datenbank entfernt.
            </p>

            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-1 py-2.5 px-5 bg-valuon-red text-white border-none rounded-lg font-extrabold cursor-pointer self-start hover:bg-red-800 transition-colors"
              >
                Account löschen...
              </button>
            ) : (
              <div className="bg-white p-5 rounded-lg border border-red-500 flex flex-col gap-3 mt-2">
                <div className="font-extrabold text-valuon-red text-[0.9rem]">
                  Bist du absolut sicher? Diese Aktion kann nicht rückgängig gemacht werden!
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={onDeleteAccount}
                    className="py-2.5 px-5 bg-valuon-red text-white border-none rounded-md font-extrabold cursor-pointer hover:bg-red-800 transition-colors"
                  >
                    Ja, mein Konto endgültig löschen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-2.5 px-5 bg-slate-100 text-slate-600 border-none rounded-md font-bold cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
