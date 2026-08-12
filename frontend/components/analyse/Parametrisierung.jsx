'use client';
import { useState, useEffect } from 'react';
import SectionBasisdaten from './sections/SectionBasisdaten';
import SectionBewirtschaftung from './sections/SectionBewirtschaftung';
import SectionFinanzierung from './sections/SectionFinanzierung';
import SectionSteuern from './sections/SectionSteuern';
import { BUNDESLAENDER_DEFAULT } from '../../constants/realEstate';
import { useProperty } from '../../context/PropertyContext';

export default function Parametrisierung({ loading }) {
  const {
    formData,
    updateField,
    handleQmChange,
    handleHausgeldChange,
    handleHausgeldNichtUmlegbarChange,
    handleReset,
    capexList,
    handleCapexChange,
    removeCapexRow,
    addCapexRow
  } = useProperty();

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
    updateField(field, value);
  };

  // 1. KI-SYNC-AUTOMATIK: 
  // Füllt die pro-qm- und Ziel-Mieten automatisch aus, wenn die KI Daten einfügt, 
  // ohne dass der User das Feld anklicken muss.
  useEffect(() => {
    const qm = Number(formData?.qm) || 0;
    const km = Number(formData?.kaltmiete_monat) || 0;
    const currentSqm = Number(formData?.ist_sqm) || 0;
    const targetKm = Number(formData?.target_monat) || 0;

    if (km > 0 && qm > 0 && currentSqm === 0) {
      const calculatedSqm = km / qm;
      updateField('ist_sqm', calculatedSqm);
      if (!isTargetCustomized && targetKm === 0) {
        updateField('target_monat', km);
        updateField('target_sqm', calculatedSqm);
      }
    }
  }, [formData?.kaltmiete_monat, formData?.qm, formData?.ist_sqm, formData?.target_monat, isTargetCustomized, updateField]);

  const handleBundeslandChange = (bl) => {
    onFieldChange('bundesland', bl);
    const rates = BUNDESLAENDER_DEFAULT;
    if (rates[bl] !== undefined) onFieldChange('grwt_p', rates[bl]);
  };

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

  const bundeslaenderMap = BUNDESLAENDER_DEFAULT;
  const bundeslaenderList = Object.keys(bundeslaenderMap);

  // 2. ROBUSTE EINGABE-HANDLER: 
  // Erlauben das vollständige Leeren (Backspace) ohne Zwang zur Null
  const handleLocalIstMonat = (val) => {
    const cleanVal = val === '' ? '' : Number(val);
    const qm = Number(formData?.qm || 0);
    const numVal = Number(cleanVal) || 0;
    const sqmVal = qm > 0 ? numVal / qm : 0;

    onFieldChange('kaltmiete_monat', cleanVal);
    onFieldChange('ist_sqm', cleanVal === '' ? '' : sqmVal);

    if (!isTargetCustomized) {
      onFieldChange('target_monat', cleanVal);
      onFieldChange('target_sqm', cleanVal === '' ? '' : sqmVal);
    }
  };

  const handleLocalIstSqm = (val) => {
    const cleanVal = val === '' ? '' : Number(val);
    const qm = Number(formData?.qm || 0);
    const numVal = Number(cleanVal) || 0;
    const monatVal = numVal * qm;

    onFieldChange('ist_sqm', cleanVal);
    onFieldChange('kaltmiete_monat', cleanVal === '' ? '' : monatVal);

    if (!isTargetCustomized) {
      onFieldChange('target_sqm', cleanVal);
      onFieldChange('target_monat', cleanVal === '' ? '' : monatVal);
    }
  };

  const handleLocalZielMonat = (val) => {
    setIsTargetCustomized(true);
    const cleanVal = val === '' ? '' : Number(val);
    const qm = Number(formData?.qm || 0);
    const numVal = Number(cleanVal) || 0;
    const sqmVal = qm > 0 ? numVal / qm : 0;

    onFieldChange('target_monat', cleanVal);
    onFieldChange('target_sqm', cleanVal === '' ? '' : sqmVal);
  };

  const handleLocalZielSqm = (val) => {
    setIsTargetCustomized(true);
    const cleanVal = val === '' ? '' : Number(val);
    const qm = Number(formData?.qm || 0);
    const numVal = Number(cleanVal) || 0;
    const monatVal = numVal * qm;

    onFieldChange('target_sqm', cleanVal);
    onFieldChange('target_monat', cleanVal === '' ? '' : monatVal);
  };

  const handleLocalHausgeldGesamt = (val) => {
    const cleanVal = val === '' ? '' : Number(val);
    handleHausgeldChange(cleanVal);

    if (!isHausgeldCustomized && cleanVal !== '') {
      const nichtUmlegbar = Math.round(cleanVal * 0.25 * 100) / 100;
      handleHausgeldNichtUmlegbarChange(nichtUmlegbar);
    } else if (cleanVal === '') {
      handleHausgeldNichtUmlegbarChange('');
    }
  };

  const handleLocalHausgeldNichtUmlegbar = (val) => {
    setIsHausgeldCustomized(true);
    const cleanVal = val === '' ? '' : Number(val);
    handleHausgeldNichtUmlegbarChange(cleanVal);
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* KOPFZEILE */}
      <div className="bg-white p-5 rounded-xl border border-valuon-border shadow-sm">
        <h3 className="m-0 text-lg font-extrabold text-valuon-green">Objekt-Parameter</h3>
        <span className="text-xs text-slate-500 mt-0.5 block">Eingabemaske für Kalkulation</span>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3 items-center">
        <button
          type="button"
          onClick={toggleAllSections}
          className="flex-1 py-2.5 px-4 bg-white border border-valuon-border rounded-lg text-xs font-bold text-valuon-green cursor-pointer text-center shadow-sm hover:bg-valuon-cream transition-colors"
        >
          {allSectionsOpen ? 'Alle einklappen' : 'Alle ausklappen'}
        </button>
        {handleReset && (
          <button
            type="button"
            onClick={() => { setIsTargetCustomized(false); setIsHausgeldCustomized(false); handleReset(); }}
            className="py-2.5 px-5 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-valuon-red cursor-pointer hover:bg-red-100 transition-colors shadow-sm"
          >
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
        className="p-4 bg-valuon-green text-white border-none rounded-xl text-base font-black cursor-pointer shadow-lg shadow-valuon-green/25 mt-2 hover:bg-valuon-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Berechne Investment...' : 'Investition analysieren'}
      </button>

    </div>
  );
}
