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
    <div className={`bg-white border border-valuon-border rounded-xl p-5 flex flex-col shadow-sm transition-opacity duration-200 ${loading ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col gap-4">
        
        {/* Head Bar */}
        <div className="flex justify-between items-center pb-3 border-b border-valuon-border">
          <span 
            className="px-4 py-1.5 rounded-full text-xs font-extrabold"
            style={{ background: badgeBg, color: badgeColor }}
          >
            {title} {loading ? '(Berechne...)' : ''}
          </span>
          <span className="text-[0.85rem] font-extrabold text-valuon-green truncate max-w-[50%]">
            {data?.obj_name || 'Muster-Objekt'}
          </span>
        </div>

        <SectionBasisdaten
          formData={data}
          isOpen={openSections.basisdaten}
          onToggle={() => toggleSection('basisdaten')}
          onFieldChange={onFieldChange}
          handleBundeslandChange={handleBundeslandChange}
          handleQmChange={handleQmChange}
          bundeslaenderList={bundeslaenderList}
          idPrefix={isBaseline ? "scenA_" : "scenB_"}
        />

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
          idPrefix={isBaseline ? "scenA_" : "scenB_"}
        />

        <SectionFinanzierung
          formData={data}
          isOpen={openSections.finanzierung}
          onToggle={() => toggleSection('finanzierung')}
          openSubSections={openSubSections}
          toggleSubSection={toggleSubSection}
          onFieldChange={onFieldChange}
          isEkCoveringNk={isEkCoveringNk}
          displayNkTotal={displayNkTotal}
          idPrefix={isBaseline ? "scenA_" : "scenB_"}
        />

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
          idPrefix={isBaseline ? "scenA_" : "scenB_"}
        />

      </div>

      {/* Ergebnis-Metriken */}
      <div className="mt-5 pt-4 border-t border-valuon-border">
        <h4 className="m-0 mb-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
          Ergebnis-Analyse (Backend)
        </h4>
        <div className="grid grid-cols-2 gap-3">
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
