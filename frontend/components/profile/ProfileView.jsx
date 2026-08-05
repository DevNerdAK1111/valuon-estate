'use client';
import { useState } from 'react';
import StepperInput from '../ui/StepperInput';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568', marginBottom: '4px', height: '18px' };
const inputTextStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };
const infoBoxStyle = { background: '#EBF8FF', color: '#2B6CB0', border: '1px solid #BEE3F8', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.4' };

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
  
  const [emailForm, setEmailForm] = useState({ newEmail: userEmail });
  const [emailStatus, setEmailStatus] = useState(null);

  const [pwdForm, setPwdForm] = useState({ oldPwd: '', newPwd: '', confirmPwd: '' });
  const [pwdStatus, setPwdStatus] = useState(null);

  const [saveStatus, setSaveStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProfileChange = (field, value) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveProfile(userProfile);
    setSaveStatus('Profildaten erfolgreich gespeichert!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.newEmail.includes('@')) {
      setEmailStatus({ type: 'error', text: 'Bitte gib eine gültige E-Mail-Adresse ein.' });
      return;
    }
    setUserEmail(emailForm.newEmail);
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
    
    onPasswordChange(pwdForm.oldPwd, pwdForm.newPwd);
    setPwdStatus({ type: 'success', text: 'Passwort erfolgreich geändert!' });
    setPwdForm({ oldPwd: '', newPwd: '', confirmPwd: '' });
    setTimeout(() => setPwdStatus(null), 4000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER DES PROFILS */}
      <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', border: '1px solid #E2D9CE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#13381A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900' }}>
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#13381A', fontWeight: '900' }}>
              {userProfile.vorname || userProfile.nachname ? `${userProfile.vorname || ''} ${userProfile.nachname || ''}` : 'Nutzerprofil'}
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '2px' }}>{userEmail}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{ padding: '8px 16px', background: '#FFF5F5', color: '#9B2C2C', border: '1px solid #FEB2B2', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Abmelden
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2D9CE', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('persoenlich')}
          style={{
            background: 'none', border: 'none', padding: '8px 12px', fontSize: '0.95rem', fontWeight: '800',
            color: activeTab === 'persoenlich' ? '#13381A' : '#718096',
            borderBottom: activeTab === 'persoenlich' ? '3px solid #13381A' : 'none',
            cursor: 'pointer'
          }}
        >
          Persönliche Daten
        </button>
        <button
          onClick={() => setActiveTab('steuer')}
          style={{
            background: 'none', border: 'none', padding: '8px 12px', fontSize: '0.95rem', fontWeight: '800',
            color: activeTab === 'steuer' ? '#13381A' : '#718096',
            borderBottom: activeTab === 'steuer' ? '3px solid #13381A' : 'none',
            cursor: 'pointer'
          }}
        >
          Steuer- & Gehaltsprofil
        </button>
        <button
          onClick={() => setActiveTab('sicherheit')}
          style={{
            background: 'none', border: 'none', padding: '8px 12px', fontSize: '0.95rem', fontWeight: '800',
            color: activeTab === 'sicherheit' ? '#13381A' : '#718096',
            borderBottom: activeTab === 'sicherheit' ? '3px solid #13381A' : 'none',
            cursor: 'pointer'
          }}
        >
          Sicherheit & Account
        </button>
      </div>

      {/* TAB 1: PERSÖNLICHE DATEN */}
      {activeTab === 'persoenlich' && (
        <form onSubmit={handleSave} style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Vorname</label>
              <input type="text" value={userProfile.vorname || ''} onChange={(e) => handleProfileChange('vorname', e.target.value)} style={inputTextStyle} placeholder="Max" />
            </div>
            <div>
              <label style={labelStyle}>Nachname</label>
              <input type="text" value={userProfile.nachname || ''} onChange={(e) => handleProfileChange('nachname', e.target.value)} style={inputTextStyle} placeholder="Mustermann" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Geburtsdatum</label>
              <input type="date" value={userProfile.geburtsdatum || ''} onChange={(e) => handleProfileChange('geburtsdatum', e.target.value)} style={inputTextStyle} />
            </div>
            <div>
              <label style={labelStyle}>Telefonnummer</label>
              <input type="tel" value={userProfile.telefon || ''} onChange={(e) => handleProfileChange('telefon', e.target.value)} style={inputTextStyle} placeholder="+49 170 1234567" />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '4px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Straße & Hausnummer</label>
              <input type="text" value={userProfile.strasse || ''} onChange={(e) => handleProfileChange('strasse', e.target.value)} style={inputTextStyle} placeholder="Musterstraße 12" />
            </div>
            <div>
              <label style={labelStyle}>Postleitzahl (PLZ)</label>
              <input type="text" value={userProfile.plz || ''} onChange={(e) => handleProfileChange('plz', e.target.value)} style={inputTextStyle} placeholder="10115" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Ort / Stadt</label>
              <input type="text" value={userProfile.ort || ''} onChange={(e) => handleProfileChange('ort', e.target.value)} style={inputTextStyle} placeholder="Berlin" />
            </div>
            <div>
              <label style={labelStyle}>Land</label>
              <input type="text" value={userProfile.land || 'Deutschland'} onChange={(e) => handleProfileChange('land', e.target.value)} style={inputTextStyle} placeholder="Deutschland" />
            </div>
          </div>

          {saveStatus && (
            <div style={{ padding: '10px 14px', background: '#E6FFFA', color: '#234E52', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {saveStatus}
            </div>
          )}

          <button type="submit" style={{ marginTop: '0.5rem', padding: '12px 24px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', alignSelf: 'flex-start' }}>
            Persönliche Daten speichern
          </button>
        </form>
      )}

      {/* TAB 2: STEUER- & GEHALTSPROFIL */}
      {activeTab === 'steuer' && (
        <form onSubmit={handleSave} style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={infoBoxStyle}>
            💡 <strong>Warum sind diese Angaben wichtig?</strong> Dein persönliches Einkommen und deine Steuerklasse bestimmen deinen Grenzsteuersatz. Dieser entscheidet darüber, wie viel Steuern du durch Abschreibungen (AfA) und Zinsen bei deinen Immobilien sparen kannst.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <StepperInput
              label="Bruttojahreseinkommen (€)"
              value={userProfile.bruttoEinkommen || 65000}
              onChange={(v) => handleProfileChange('bruttoEinkommen', v)}
              step={2500}
              isCurrency={true}
            />

            <div>
              <label style={labelStyle}>Steuerklasse</label>
              <select
                value={userProfile.steuerklasse || '1'}
                onChange={(e) => handleProfileChange('steuerklasse', e.target.value)}
                style={inputTextStyle}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Familienstand</label>
              <select
                value={userProfile.familienstand || 'Ledig'}
                onChange={(e) => handleProfileChange('familienstand', e.target.value)}
                style={inputTextStyle}
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
              onChange={(v) => handleProfileChange('kinderAnzahl', v)}
              step={0.5}
            />
          </div>

          {/* EXAKTE KIRCHENSTEUER-STEUERUNG */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Kirchensteuerpflichtig?</label>
              <select
                value={userProfile.kirchensteuer ? 'ja' : 'nein'}
                onChange={(e) => handleProfileChange('kirchensteuer', e.target.value === 'ja')}
                style={inputTextStyle}
              >
                <option value="nein">Nein (0%)</option>
                <option value="ja">Ja</option>
              </select>
            </div>

            {userProfile.kirchensteuer ? (
              <div>
                <label style={labelStyle}>Kirchensteuersatz (Bundesland)</label>
                <select
                  value={userProfile.kirchensteuersatz || 9.0}
                  onChange={(e) => handleProfileChange('kirchensteuersatz', parseFloat(e.target.value))}
                  style={inputTextStyle}
                >
                  <option value={8.0}>8 % (Bayern & Baden-Württemberg)</option>
                  <option value={9.0}>9 % (Übrige Bundesländer)</option>
                </select>
              </div>
            ) : (
              <StepperInput
                label="Individueller Grenzsteuersatz (%)"
                value={userProfile.grenzsteuersatz || 42.0}
                onChange={(v) => handleProfileChange('grenzsteuersatz', v)}
                step={0.5}
                isPercent={true}
              />
            )}
          </div>

          {userProfile.kirchensteuer && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <StepperInput
                label="Individueller Grenzsteuersatz (%)"
                value={userProfile.grenzsteuersatz || 42.0}
                onChange={(v) => handleProfileChange('grenzsteuersatz', v)}
                step={0.5}
                isPercent={true}
              />
              <div />
            </div>
          )}

          {saveStatus && (
            <div style={{ padding: '10px 14px', background: '#E6FFFA', color: '#234E52', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {saveStatus}
            </div>
          )}

          <button type="submit" style={{ marginTop: '0.5rem', padding: '12px 24px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', alignSelf: 'flex-start' }}>
            Steuerprofil speichern
          </button>
        </form>
      )}

      {/* TAB 3: SICHERHEIT & ACCOUNT */}
      {activeTab === 'sicherheit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* E-MAIL ADRESSE ÄNDERN */}
          <form onSubmit={handleEmailSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#13381A', fontSize: '1.1rem', fontWeight: '800' }}>E-Mail-Adresse verwalten</h3>
            
            <div>
              <label style={labelStyle}>Aktuelle E-Mail-Adresse</label>
              <input type="email" required value={emailForm.newEmail} onChange={(e) => setEmailForm({ newEmail: e.target.value })} style={inputTextStyle} />
            </div>

            {emailStatus && (
              <div style={{ padding: '10px 14px', background: emailStatus.type === 'error' ? '#FFF5F5' : '#E6FFFA', color: emailStatus.type === 'error' ? '#9B2C2C' : '#234E52', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {emailStatus.text}
              </div>
            )}

            <button type="submit" style={{ padding: '10px 20px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', alignSelf: 'flex-start' }}>
              E-Mail-Adresse aktualisieren
            </button>
          </form>

          {/* PASSWORT ÄNDERN */}
          <form onSubmit={handlePwdSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#13381A', fontSize: '1.1rem', fontWeight: '800' }}>Passwort ändern</h3>
            
            <div>
              <label style={labelStyle}>Aktuelles Passwort</label>
              <input type="password" required value={pwdForm.oldPwd} onChange={(e) => setPwdForm({ ...pwdForm, oldPwd: e.target.value })} style={inputTextStyle} placeholder="••••••••" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Neues Passwort</label>
                <input type="password" required value={pwdForm.newPwd} onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })} style={inputTextStyle} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>Neues Passwort bestätigen</label>
                <input type="password" required value={pwdForm.confirmPwd} onChange={(e) => setPwdForm({ ...pwdForm, confirmPwd: e.target.value })} style={inputTextStyle} placeholder="••••••••" />
              </div>
            </div>

            {pwdStatus && (
              <div style={{ padding: '10px 14px', background: pwdStatus.type === 'error' ? '#FFF5F5' : '#E6FFFA', color: pwdStatus.type === 'error' ? '#9B2C2C' : '#234E52', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {pwdStatus.text}
              </div>
            )}

            <button type="submit" style={{ padding: '10px 20px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', alignSelf: 'flex-start' }}>
              Passwort aktualisieren
            </button>
          </form>

          {/* DANGER ZONE: ACCOUNT LÖSCHEN */}
          <div style={{ background: '#FFF5F5', padding: '2rem', borderRadius: '12px', border: '1px solid #FEB2B2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#9B2C2C', fontSize: '1.1rem', fontWeight: '800' }}>Account dauerhaft löschen</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#742A2A', lineHeight: '1.5' }}>
              Wenn du deinen Account löschst, werden all deine gespeicherten Objekte, Berechnungen und persönlichen Einstellungen unwiderruflich aus der Datenbank entfernt.
            </p>

            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ padding: '10px 20px', background: '#9B2C2C', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', alignSelf: 'flex-start' }}
              >
                Account löschen...
              </button>
            ) : (
              <div style={{ background: 'white', padding: '1.2rem', borderRadius: '8px', border: '1px solid #E53E3E', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: '800', color: '#9B2C2C', fontSize: '0.9rem' }}>
                  Bist du absolut sicher? Diese Aktion kann nicht rückgängig gemacht werden!
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onDeleteAccount}
                    style={{ padding: '10px 18px', background: '#9B2C2C', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Ja, mein Konto endgültig löschen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{ padding: '10px 18px', background: '#EDF2F7', color: '#4A5568', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
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
