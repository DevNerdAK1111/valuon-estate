'use client';
import { useState } from 'react';
import StepperInput from '../ui/StepperInput';
import { IconUser, IconGear, IconLock, IconTrash } from '../ui/Icons';
import { formatEuroInt, formatPct } from '../../utils/formatters';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568', marginBottom: '4px' };
const inputTextStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' };
const infoBoxStyle = { background: '#EBF8FF', color: '#2B6CB0', border: '1px solid #BEE3F8', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', lineHeight: '1.4' };

export default function ProfileView({
  userEmail,
  userProfile,
  setUserProfile,
  onSaveProfile,
  onPasswordChange,
  onDeleteAccount,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('steuer'); // 'steuer' | 'standards' | 'sicherheit'
  
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
    setSaveStatus('Profil erfolgreich gespeichert!');
    setTimeout(() => setSaveStatus(null), 3000);
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
              {userProfile.vorname ? `${userProfile.vorname} ${userProfile.nachname}` : 'Nutzerprofil'}
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
          onClick={() => setActiveTab('standards')}
          style={{
            background: 'none', border: 'none', padding: '8px 12px', fontSize: '0.95rem', fontWeight: '800',
            color: activeTab === 'standards' ? '#13381A' : '#718096',
            borderBottom: activeTab === 'standards' ? '3px solid #13381A' : 'none',
            cursor: 'pointer'
          }}
        >
          Standard-Parameter für Analysen
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

      {/* TAB 1: STEUER- & GEHALTSPROFIL */}
      {activeTab === 'steuer' && (
        <form onSubmit={handleSave} style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={infoBoxStyle}>
            💡 <strong>Warum sind diese Angaben wichtig?</strong> Dein persönliches Einkommen und deine Steuerklasse bestimmen deinen Grenzsteuersatz. Dieser entscheidet darüber, wie viel Steuern du durch Abschreibungen (AfA) und Zinsen bei deinen Immobilien sparen kannst.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Vorname</label>
              <input type="text" value={userProfile.vorname || ''} onChange={(e) => handleProfileChange('vorname', e.target.value)} style={inputTextStyle} placeholder="Max" />
            </div>
            <div>
              <label style={labelStyle}>Nachname</label>
              <input type="text" value={userProfile.nachname || ''} onChange={(e) => handleProfileChange('nachname', e.target.value)} style={inputTextStyle} placeholder="Mustermann" />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={labelStyle}>Kirchensteuerpflichtig?</label>
              <select
                value={userProfile.kirchensteuer ? 'ja' : 'nein'}
                onChange={(e) => handleProfileChange('kirchensteuer', e.target.value === 'ja')}
                style={inputTextStyle}
              >
                <option value="nein">Nein (0%)</option>
                <option value="ja">Ja (8-9%)</option>
              </select>
            </div>

            <div>
              <StepperInput
                label="Individueller Grenzsteuersatz (%)"
                value={userProfile.grenzsteuersatz || 42.0}
                onChange={(v) => handleProfileChange('grenzsteuersatz', v)}
                step={0.5}
                isPercent={true}
              />
            </div>
          </div>

          {saveStatus && (
            <div style={{ padding: '10px', background: '#E6FFFA', color: '#234E52', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {saveStatus}
            </div>
          )}

          <button type="submit" style={{ marginTop: '0.5rem', padding: '12px 24px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', alignSelf: 'flex-start' }}>
            Steuerprofil speichern
          </button>
        </form>
      )}

      {/* TAB 2: STANDARD-PARAMETER FÜR ANALYSEN */}
      {activeTab === 'standards' && (
        <form onSubmit={handleSave} style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={infoBoxStyle}>
            ⚡ <strong>Zeitersparnis für deine Analysen:</strong> Die hier eingestellten Standardwerte werden automatisch vorausgefüllt, wenn du ein neues Objekt in die Investitions-Analyse lädst.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Standard Notar- & Grundbuchkosten (%)"
              value={userProfile.stdNotar || 2.0}
              onChange={(v) => handleProfileChange('stdNotar', v)}
              step={0.1}
              isPercent={true}
            />
            <StepperInput
              label="Standard Maklerprovision (%)"
              value={userProfile.stdMakler || 3.57}
              onChange={(v) => handleProfileChange('stdMakler', v)}
              step={0.01}
              isPercent={true}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Standard Hausbank Zinssatz (%)"
              value={userProfile.stdZins || 3.8}
              onChange={(v) => handleProfileChange('stdZins', v)}
              step={0.1}
              isPercent={true}
            />
            <StepperInput
              label="Standard Hausbank Tilgung (%)"
              value={userProfile.stdTilg || 2.0}
              onChange={(v) => handleProfileChange('stdTilg', v)}
              step={0.1}
              isPercent={true}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Standard Instandhaltungsrücklage (€/m²/Jahr)"
              value={userProfile.stdInst || 12.0}
              onChange={(v) => handleProfileChange('stdInst', v)}
              step={1}
            />
            <StepperInput
              label="Standard Leerstandsrisiko (%)"
              value={userProfile.stdLeerstand || 2.0}
              onChange={(v) => handleProfileChange('stdLeerstand', v)}
              step={0.5}
              isPercent={true}
            />
          </div>

          {saveStatus && (
            <div style={{ padding: '10px', background: '#E6FFFA', color: '#234E52', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {saveStatus}
            </div>
          )}

          <button type="submit" style={{ marginTop: '0.5rem', padding: '12px 24px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', alignSelf: 'flex-start' }}>
            Standard-Parameter speichern
          </button>
        </form>
      )}

      {/* TAB 3: SICHERHEIT & ACCOUNT */}
      {activeTab === 'sicherheit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* PASSWORT ÄNDERN */}
          <form onSubmit={handlePwdSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#13381A', fontSize: '1.1rem', fontWeight: '800' }}>Passwort ändern</h3>
            
            <div>
              <label style={labelStyle}>Aktuelles Passwort</label>
              <input type="password" required value={pwdForm.oldPwd} onChange={(e) => setPwdForm({ ...pwdForm, oldPwd: e.target.value })} style={inputTextStyle} placeholder="••••••••" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              <div style={{ padding: '10px', background: pwdStatus.type === 'error' ? '#FFF5F5' : '#E6FFFA', color: pwdStatus.type === 'error' ? '#9B2C2C' : '#234E52', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {pwdStatus.text}
              </div>
            )}

            <button type="submit" style={{ padding: '10px 20px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', alignSelf: 'flex-start' }}>
              Passwort Aktualisieren
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
