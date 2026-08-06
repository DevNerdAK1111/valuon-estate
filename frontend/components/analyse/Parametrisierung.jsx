'use client';
import { useState } from 'react';
import SectionBasisdaten from './sections/SectionBasisdaten';
import SectionBewirtschaftung from './sections/SectionBewirtschaftung';
import SectionFinanzierung from './sections/SectionFinanzierung';
import SectionSteuern from './sections/SectionSteuern';
import { BUNDESLAENDER_DEFAULT } from '../../constants/realEstate';

export default function Parametrisierung({
  formData,
  updateField,
  pingBackend,
  handleQmChange,
  handleHausgeldChange,
  handleHausgeldNichtUmlegbarChange,
  grunderwerbsteuerSätze,
  capexList,
  handleCapexChange,
  removeCapexRow,
  addCapexRow,
  loading,
  handleReset,
  setFormData
}) {
  const [openSections, setOpenSections] = useState({
    basisdaten: true,
    bewirtschaftung: true,
    finanzierung: true,
    steuer: true
  });

  const [openSubSections, setOpenSubSections] = useState({
    hausgeld: false,
    folgefinanzierung: false,
    kfw: false,
    capex: false
  });

  const [isTargetCustomized, setIsTargetCustomized] = useState(false);
  const [isHausgeldCustomized, setIsHausgeldCustomized] = useState(false);

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleSubSection = (key) => setOpenSubSections(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleAllSections = () => {
    const allOpen = Object.values(openSections).every(Boolean);
    const newState = !allOpen;
    setOpenSections({ basisdaten: newState, bewirtschaftung: newState, finanzierung: newState, steuer: newState });
  };

  const allSectionsOpen = Object.values(openSections).every(Boolean);

  const onFieldChange = (field, value) => {
    if (updateField) updateField(field, value);
    else if (setFormData) setFormData(prev => ({ ...prev, [field]: value }));
    if (pingBackend) pingBackend();
  };

  const handleBundeslandChange = (bl) => {
    onFieldChange('bundesland', bl);
    const rates = grunderwerbsteuerSätze || BUNDESLAENDER_DEFAULT;
    if (rates[bl] !== undefined) onFieldChange('grwt_p', rates[bl]);
  };

  // Kaufnebenkosten Dynamische Berechnung
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const grwtP = Number(formData?.grwt_p ?? 5.0);
  const notarP = Number(formData?.notar_p ?? 2.0);
  const maklerP = Number(formData?.makler_p ?? 3.57);
  const sonstNk = Number(formData?.sonst_nk ?? 0);

  const calcGrwt = kaufpreis * (grwtP / 100);
  const calcNotar = kaufpreis * (notarP / 100);
  const calcMakler = kaufpreis * (maklerP / 100);
  const displayNkTotal = calcGrwt + calcNotar + calcMakler + sonstNk;

  const ekEuro = Number(formData?.ek_euro || 0);
  const isEkCoveringNk = Math.round(ekEuro) >= Math.round(displayNkTotal);

  const bundeslaenderMap = grunderwerbsteuerSätze || BUNDESLAENDER_DEFAULT;
  const bundeslaenderList = Object.keys(bundeslaenderMap);

  const handleLocalIstMonat = (val) => {
    const qm = Number(formData?.qm || 0);
    const sqmVal = qm > 0 ? val / qm : 0;
    onFieldChange('kaltmiete_monat', val);
    onFieldChange('ist_sqm', sqmVal);
    if (!isTargetCustomized) {
      onFieldChange('target_monat', val);
      onFieldChange('target_sqm', sqmVal);
    }
  };

  const handleLocalIstSqm = (val) => {
    const qm = Number(formData?.qm || 0);
    const monatVal = val * qm;
    onFieldChange('ist_sqm', val);
    onFieldChange('kaltmiete_monat', monatVal);
    if (!isTargetCustomized) {
      onFieldChange('target_monat', monatVal);
      onFieldChange('target_sqm', val);
    }
  };

  const handleLocalZielMonat = (val) => {
    setIsTargetCustomized(true);
    const qm = Number(formData?.qm || 0);
    const sqmVal = qm > 0 ? val / qm : 0;
    onFieldChange('target_monat', val);
    onFieldChange('target_sqm', sqmVal);
  };

  const handleLocalZielSqm = (val) => {
    setIsTargetCustomized(true);
    const qm = Number(formData?.qm || 0);
    const monatVal = val * qm;
    onFieldChange('target_sqm', val);
    onFieldChange('target_monat', monatVal);
  };

  const handleLocalHausgeldGesamt = (val) => {
    if (handleHausgeldChange) handleHausgeldChange(val);
    else onFieldChange('hausgeld', val);

    if (!isHausgeldCustomized) {
      const nichtUmlegbar = Math.round(val * 0.25 * 100) / 100;
      if (handleHausgeldNichtUmlegbarChange) handleHausgeldNichtUmlegbarChange(nichtUmlegbar);
      else onFieldChange('hausgeld_nicht_umlegbar', nichtUmlegbar);
    }
  };

  const handleLocalHausgeldNichtUmlegbar = (val) => {
    setIsHausgeldCustomized(true);
    if (handleHausgeldNichtUmlegbarChange) handleHausgeldNichtUmlegbarChange(val);
    else onFieldChange('hausgeld_nicht_umlegbar', val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* KOPFZEILE */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#13381A' }}>Objekt-Parameter</h3>
        <span style={{ fontSize: '0.8rem', color: '#718096', marginTop: '2px', display: 'block' }}>Eingabemaske für Kalkulation</span>
      </div>

      {/* BUTTONS */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button type="button" onClick={toggleAllSections} style={{ flex: 1, padding: '0.6rem 1rem', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#13381A', cursor: 'pointer', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          {allSectionsOpen ? 'Alle einklappen' : 'Alle ausklappen'}
        </button>
        {handleReset && (
          <button type="button" onClick={() => { setIsTargetCustomized(false); setIsHausgeldCustomized(false); handleReset(); }} style={{ padding: '0.6rem 1.25rem', background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#9B2C2C', cursor: 'pointer' }}>
            Reset
          </button>
        )}
      </div>

      {/* MODULARE SEKTIONEN */}
      <SectionBasisdaten
        formData={formData}
        isOpen={openSections.basisdaten}
        onToggle={() => toggleSection('basisdaten')}
        onFieldChange={onFieldChange}
        handleBundeslandChange={handleBundeslandChange}
        handleQmChange={handleQmChange}
        bundeslaenderList={bundeslaenderList}
      />

      <SectionBewirtschaftung
        formData={formData}
        isOpen={openSections.bewirtschaftung}
        onToggle={() => toggleSection('bewirtschaftung')}
        openSubSections={openSubSections}
        toggleSubSection={toggleSubSection}
        onFieldChange={onFieldChange}
        handleLocalIstMonat={handleLocalIstMonat}
        handleLocalIstSqm={handleLocalIstSqm}
        handleLocalZielMonat={handleLocalZielMonat}
        handleLocalZielSqm={handleLocalZielSqm}
        handleLocalHausgeldGesamt={handleLocalHausgeldGesamt}
        handleLocalHausgeldNichtUmlegbar={handleLocalHausgeldNichtUmlegbar}
        grwtP={grwtP}
        notarP={notarP}
        maklerP={maklerP}
        sonstNk={sonstNk}
        displayNkTotal={displayNkTotal}
        displayGrwtEuro={calcGrwt}
        displayNotarEuro={calcNotar}
        displayMaklerEuro={calcMakler}
      />

      <SectionFinanzierung
        formData={formData}
        isOpen={openSections.finanzierung}
        onToggle={() => toggleSection('finanzierung')}
        openSubSections={openSubSections}
        toggleSubSection={toggleSubSection}
        onFieldChange={onFieldChange}
        isEkCoveringNk={isEkCoveringNk}
        displayNkTotal={displayNkTotal}
      />

      <SectionSteuern
        formData={formData}
        isOpen={openSections.steuer}
        onToggle={() => toggleSection('steuer')}
        openSubSections={openSubSections}
        toggleSubSection={toggleSubSection}
        onFieldChange={onFieldChange}
        capexList={capexList}
        handleCapexChange={handleCapexChange}
        removeCapexRow={removeCapexRow}
        addCapexRow={addCapexRow}
      />

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={loading}
        onClick={() => {
          setTimeout(() => {
            const el = document.getElementById('executive-dashboard-view');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
        style={{ padding: '1rem', background: '#13381A', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(19,56,26,0.25)', marginTop: '0.5rem' }}
      >
        {loading ? 'Berechne Investment...' : 'Investition analysieren'}
      </button>

    </div>
  );
}
