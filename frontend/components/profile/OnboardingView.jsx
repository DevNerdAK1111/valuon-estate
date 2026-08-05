'use client';
import { useState } from 'react';
import StepperInput from '../ui/StepperInput';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568', marginBottom: '4px', height: '18px' };
const inputTextStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };
const infoBoxStyle = { background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.4' };

export default function OnboardingView({ userEmail, userProfile, setUserProfile, onCompleteOnboarding }) {
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (field, value) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userProfile.profilname || !userProfile.vorname || !userProfile.nachname) {
      setErrorMsg('Bitte fülle alle erforderlichen Pflichtfelder (*) aus.');
      return;
    }
    setErrorMsg(null);
    onCompleteOnboarding(userProfile);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #E2D9CE', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ color: '#A37841', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
          Willkommen bei Valuon Estate
        </div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '900', color: '#13381A' }}>
          Richte dein Investoren-Profil ein
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
          Angemeldet als: <strong>{userEmail}</strong>. Bitte wähle deinen Profilnamen und steuerliche Grunddaten.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* PFLICHTFELDER */}
        <div style={{ background: '#FAF8F5', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#13381A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Erforderliche Pflichtangaben (*)
          </div>

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

          <StepperInput
            label="Individueller Grenzsteuersatz (%) *"
            value={userProfile.grenzsteuersatz || 42.0}
            onChange={(v) => handleChange('grenzsteuersatz', v)}
            step={0.5}
            isPercent={true}
          />
        </div>

        {/* FREIWILLIGE ANGABEN */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Freiwillige Angaben (Optional)
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
        </div>

        {errorMsg && (
          <div style={{ padding: '12px', background: '#FFF5F5', color: '#9B2C2C', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #FEB2B2' }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          style={{
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
