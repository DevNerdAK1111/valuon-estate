'use client';
import React, { useState } from 'react';
import MetricDeltaCard from './MetricDeltaCard';
import SectionBasisdaten from '../analyse/sections/SectionBasisdaten';
import SectionBewirtschaftung from '../analyse/sections/SectionBewirtschaftung';
import SectionFinanzierung from '../analyse/sections/SectionFinanzierung';
import SectionSteuern from '../analyse/sections/SectionSteuern';
import { BUNDESLAENDER_DEFAULT } from '../../constants/realEstate';

export default function ScenarioColumn({ 
  title, 
  badgeBg,
  badgeColor, 
  data, 
  setData, 
  kpis,
  baselineResults, 
  isBaseline = false,
  loading = false
}) {
  const [openSections, setOpenSections] = useState({
    basisdaten: true,
    bewirtschaftung: true,
    finanzierung: true,
    steuer: false
  });

  const [openSubSections, setOpenSubSections] = useState({
    hausgeld: false,
    folgefinanzierung: false,
    kfw: false,
    capex: false
  });

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleSubSection = (key) => setOpenSubSections(prev => ({ ...prev, [key]: !prev[key] }));

  const onFieldChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Berechnung dynamischer Parameter für die Sektionen
  const kaufpreis = Number(data?.kaufpreis || 0);
  const grwtP = Number(data?.grwt_p ?? 5.0);
  const notarP = Number(data?.notar_p ?? 2.0);
  const maklerP = Number(data?.makler_p ?? 3.57);
  const sonstNk = Number(data?.sonst_nk ?? 0);

  const displayGrwtEuro = kaufpreis * (grwtP / 100);
  const displayNotarEuro = kaufpreis * (notarP / 100);
  const displayMaklerEuro = kaufpreis * (maklerP / 100);
  const displayNkTotal = displayGrwtEuro + displayNotarEuro + displayMaklerEuro + sonstNk;
  const isEkCoveringNk = Math.round(data?.ek_euro || 0) >= Math.round(displayNkTotal);

  const bundeslaenderList = Object.keys(BUNDESLAENDER_DEFAULT);

  // Helper-Handler für Synchrone Miete- & Hausgeld-Berechnungen
  const handleBundeslandChange = (bl) => {
    onFieldChange('bundesland', bl);
    if (BUNDESLAENDER_DEFAULT[bl] !== undefined) {
      onFieldChange('grwt_p', BUNDESLAENDER_DEFAULT[bl]);
    }
  };

  const handleQmChange = (qm) => onFieldChange('qm', qm);

  const handleLocalIstMonat = (val) => {
    const qm = Number(data?.qm || 0);
    const sqmVal = qm > 0 ? val / qm : 0;
    setData(prev => ({ ...prev, kaltmiete_monat: val, ist_sqm: sqmVal, target_monat: val, target_sqm: sqmVal }));
  };

  const handleLocalIstSqm = (val) => {
    const qm = Number(data?.qm || 0);
    const monatVal = val * qm;
    setData(prev => ({ ...prev, ist_sqm: val, kaltmiete_monat: monatVal, target_monat: monatVal, target_sqm: val }));
  };

  const handleLocalZielMonat = (val) => {
    const qm = Number(data?.qm || 0);
    setData(prev => ({ ...prev, target_monat: val, target_sqm: qm > 0 ? val / qm : 0 }));
  };

  const handleLocalZielSqm = (val) => {
    const qm = Number(data?.qm || 0);
    setData(prev => ({ ...prev, target_sqm: val, target_monat: val * qm }));
  };

  const handleLocalHausgeldGesamt = (val) => {
    const nichtUmlegbar = Math.round(val * 0.25 * 100) / 100;
    setData(prev => ({ ...prev, hausgeld: val, hausgeld_nicht_umlegbar: nichtUmlegbar }));
  };

  const handleLocalHausgeldNichtUmlegbar = (val) => onFieldChange('hausgeld_nicht_umlegbar', val);

  // CapEx-Handler
  const handleCapexChange = (index, field, value) => {
    setData(prev => {
      const updated = [...(prev.capex_list || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, capex_list: updated };
    });
  };

  const addCapexRow = () => {
    setData(prev => ({
      ...prev,
      capex_list: [...(prev.capex_list || []), { year: (prev.capex_list || []).length + 1, amount: 0 }]
    }));
  };

  const removeCapexRow = (index) => {
    setData(prev => ({
      ...prev,
      capex_list: (prev.capex_list || []).filter((_, idx) => idx !== index)
    }));
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2D9CE',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      opacity: loading ? 0.75 : 1,
      transition: 'opacity 0.15s ease'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Head Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E2D9CE' }}>
          <span style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '800',
            background: badgeBg,
            color: badgeColor
          }}>
            {title} {loading ? '(Berechne...)' : ''}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A' }}>
            {data?.obj_name || 'Muster-Objekt'}
          </span>
        </div>

        {/* 1. Basisdaten */}
        <SectionBasisdaten
          formData={data}
          isOpen={openSections.basisdaten}
          onToggle={() => toggleSection('basisdaten')}
          onFieldChange={onFieldChange}
          handleBundeslandChange={handleBundeslandChange}
          handleQmChange={handleQmChange}
          bundeslaenderList={bundeslaenderList}
        />

        {/* 2. Bewirtschaftung & Nebenkosten */}
        <SectionBewirtschaftung
          formData={data}
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
          displayGrwtEuro={displayGrwtEuro}
          displayNotarEuro={displayNotarEuro}
          displayMaklerEuro={displayMaklerEuro}
        />

        {/* 3. Finanzierung & Eigenkapital */}
        <SectionFinanzierung
          formData={data}
          isOpen={openSections.finanzierung}
          onToggle={() => toggleSection('finanzierung')}
          openSubSections={openSubSections}
          toggleSubSection={toggleSubSection}
          onFieldChange={onFieldChange}
          isEkCoveringNk={isEkCoveringNk}
          displayNkTotal={displayNkTotal}
        />

        {/* 4. Steuern, Makro & Exit */}
        <SectionSteuern
          formData={data}
          isOpen={openSections.steuer}
          onToggle={() => toggleSection('steuer')}
          openSubSections={openSubSections}
          toggleSubSection={toggleSubSection}
          onFieldChange={onFieldChange}
          capexList={data?.capex_list || []}
          handleCapexChange={handleCapexChange}
          removeCapexRow={removeCapexRow}
          addCapexRow={addCapexRow}
        />

      </div>

      {/* Ergebnis-Metriken */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2D9CE' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Ergebnis-Analyse (Backend)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <MetricDeltaCard 
            label="Cashflow n. St."
            value={kpis?.cashflowNachSteuer}
            type="currency"
            compareValue={baselineResults?.cashflowNachSteuer}
            isBaseline={isBaseline}
          />
          <MetricDeltaCard 
            label="Cashflow v. St."
            value={kpis?.cashflowVorSteuer}
            type="currency"
            compareValue={baselineResults?.cashflowVorSteuer}
            isBaseline={isBaseline}
          />
          <MetricDeltaCard 
            label="Netto-Mietrendite"
            value={kpis?.nettoMietrendite}
            type="percent"
            compareValue={baselineResults?.nettoMietrendite}
            isBaseline={isBaseline}
            customColor="#13381A"
          />
          <MetricDeltaCard 
            label="EK-Rendite (IRR)"
            value={kpis?.ekRendite}
            type="percent"
            compareValue={baselineResults?.ekRendite}
            isBaseline={isBaseline}
            customColor="#A37841"
          />
          <MetricDeltaCard 
            label="Monatliche Rate"
            value={kpis?.monatlicheRate}
            type="currency"
            compareValue={baselineResults?.monatlicheRate}
            isBaseline={isBaseline}
            invertColor={true}
          />
          <MetricDeltaCard 
            label="Gesamtgewinn (10 J.)"
            value={kpis?.gesamtGewinn}
            type="currency"
            compareValue={baselineResults?.gesamtGewinn}
            isBaseline={isBaseline}
          />
        </div>
      </div>
    </div>
  );
}
