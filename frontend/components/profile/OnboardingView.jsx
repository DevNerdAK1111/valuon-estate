'use client';
import { useState } from 'react';
import StepperInput from '../ui/StepperInput';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568', marginBottom: '4px', height: '18px' };
const inputTextStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };

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

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #E2D9CE', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
          Willkommen bei Valuon Estate
        </div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '900', color: '#13381A' }}>
          Richte dein Investoren-Profil ein
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
          Konto: <strong>{userEmail}</strong>. Bitte vervollständige deine Daten für präzise Analysen.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* EINHEITLICHER FORMULAR-BLOCK */}
        <div>
          <label style={labelStyle}>Profilname / Anzeigename *</label>
          <input
            type="text"
            required
            value={userProfile.profilname || ''}
            onChange={(e) => handleChange('profilname', e.target.value)}
            style={inputTextStyle}
            placeholder="z.B. ImmoInvestor99 oder MaxM"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Vorname *</label>
            <input
              type="text"
              required
              value={userProfile.vorname || ''}
              onChange={(e) => handleChange('vorname', e.target.value)}
              style={inputTextStyle}
              placeholder="Max"
            />
          </div>
          <div>
            <label style={labelStyle}>Nachname *</label>
            <input
              type="text"
              required
              value={userProfile.nachname || ''}
              onChange={(e) => handleChange('nachname', e.target.value)}
              style={inputTextStyle}
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Geburtsdatum</label>
            <input type="date" value={userProfile.geburtsdatum || ''} onChange={(e) => handleChange('geburtsdatum', e.target.value)} style={inputTextStyle} />
          </div>
          <div>
            <label style={labelStyle}>Telefonnummer</label>
            <input type="tel" value={userProfile.telefon || ''} onChange={(e) => handleChange('telefon', e.target.value)} style={inputTextStyle} placeholder="+49 170 1234567" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Straße & Hausnummer</label>
            <input type="text" value={userProfile.strasse || ''} onChange={(e) => handleChange('strasse', e.target.value)} style={inputTextStyle} placeholder="Musterstraße 12" />
          </div>
          <div>
            <label style={labelStyle}>Postleitzahl (PLZ)</label>
            <input type="text" value={userProfile.plz || ''} onChange={(e) => handleChange('plz', e.target.value)} style={inputTextStyle} placeholder="10115" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Ort / Stadt</label>
            <input type="text" value={userProfile.ort || ''} onChange={(e) => handleChange('ort', e.target.value)} style={inputTextStyle} placeholder="Berlin" />
          </div>
          <div>
            <label style={labelStyle}>Land</label>
            <input type="text" value={userProfile.land || 'Deutschland'} onChange={(e) => handleChange('land', e.target.value)} style={inputTextStyle} placeholder="Deutschland" />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '0.5rem 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <StepperInput
            label="Bruttojahreseinkommen (€) *"
            value={userProfile.bruttoEinkommen || 65000}
            onChange={(v) => handleChange('bruttoEinkommen', v)}
            step={2500}
            isCurrency={true}
          />

          <div>
            <label style={labelStyle}>Steuerklasse *</label>
            <select
              value={userProfile.steuerklasse || '1'}
              onChange={(e) => handleChange('steuerklasse', e.target.value)}
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
              onChange={(e) => handleChange('familienstand', e.target.value)}
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
            onChange={(v) => handleChange('kinderAnzahl', v)}
            step={0.5}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Kirchensteuerpflichtig?</label>
            <select
              value={userProfile.kirchensteuer ? 'ja' : 'nein'}
              onChange={(e) => handleChange('kirchensteuer', e.target.value === 'ja')}
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
                onChange={(e) => handleChange('kirchensteuersatz', parseFloat(e.target.value))}
                style={inputTextStyle}
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
          <div style={{ padding: '12px', background: '#FFF5F5', color: '#9B2C2C', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #FEB2B2' }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          style={{
            marginTop: '1rem',
            padding: '16px',
            background: '#13381A',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.05rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(19,56,26,0.3)'
          }}
        >
          Profil speichern & Suite starten →
        </button>

      </form>
    </div>
  );
}
