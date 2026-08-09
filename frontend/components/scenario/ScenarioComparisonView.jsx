'use client';
import React, { useState, useEffect, useMemo } from 'react';
import ScenarioColumn from './ScenarioColumn';
import { calculateInvestmentApi } from '../../lib/propertyApi';
import { calculateInvestmentModel } from '../../utils/calculateInvestment';
import { selectStyle } from '../../styles/formStyles';
import { formatEuroInt } from '../../utils/formatters';

export default function ScenarioComparisonView({ basePropertyData, dbProperties, setFormData }) {
  const initialData = useMemo(() => {
    return {
      obj_name: 'Musterobjekt',
      objektart: 'Eigentumswohnung',
      bundesland: 'Niedersachsen',
      kaufpreis: 250000,
      qm: 65,
      baujahr: 2000,
      ek_euro: 50000,
      hb_zins: 3.8,
      hb_tilg: 2.0,
      zinsbindung: 10,
      sondertilg: 0,
      loan_type: 'Annuitätendarlehen',
      kaltmiete_monat: 1100,
      hausgeld: 250,
      hausgeld_nicht_umlegbar: 60,
      inst_sqm: 12,
      mgt_monat: 30,
      vac_rate_pct: 2.0,
      sanierung: 0,
      grwt_p: 5.0,
      notar_p: 2.0,
      makler_p: 3.57,
      sonst_nk: 0,
      tax_rate_pct: 42.0,
      afa_model: 'Linear Standard',
      gebaeude_anteil_pct: 80.0,
      afa_lin: 2.0,
      miet_inc: 1.0,
      val_inc: 1.0,
      exit_cost: 0.0,
      kfw_amt: 0,
      kfw_zins: 2.1,
      kfw_tilg: 3.0,
      ...basePropertyData
    };
  }, [basePropertyData]);

  const [scenarioA, setScenarioA] = useState(initialData);
  const [scenarioB, setScenarioB] = useState(initialData);

  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setLoadingA(true);
      try {
        const res = await calculateInvestmentApi(scenarioA, scenarioA.capexList || []);
        if (isMounted) setResultA(res);
      } catch (err) {
        console.error('Fehler bei der Backend-Berechnung für Szenario A:', err);
      } finally {
        if (isMounted) setLoadingA(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [scenarioA]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setLoadingB(true);
      try {
        const res = await calculateInvestmentApi(scenarioB, scenarioB.capexList || []);
        if (isMounted) setResultB(res);
      } catch (err) {
        console.error('Fehler bei der Backend-Berechnung für Szenario B:', err);
      } finally {
        if (isMounted) setLoadingB(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [scenarioB]);

  const modelA = useMemo(() => {
    if (!resultA) return null;
    return calculateInvestmentModel(scenarioA, '10', resultA);
  }, [scenarioA, resultA]);

  const modelB = useMemo(() => {
    if (!resultB) return null;
    return calculateInvestmentModel(scenarioB, '10', resultB);
  }, [scenarioB, resultB]);

  const kpisA = useMemo(() => {
    if (!modelA) return null;
    const firstRow = modelA.slicedProjection?.[0] || {};
    return {
      cashflowNachSteuer: modelA.kpis?.avgMonthlyCashflow ?? firstRow.cashflowNachSteuerMo,
      cashflowVorSteuer: firstRow.cashflowVorSteuerMo || 0,
      nettoMietrendite: modelA.kpis?.nettoMietrenditeInitial || 0,
      ekRendite: modelA.kpis?.validIrr || 0,
      monatlicheRate: (firstRow.kapitaldienst || 0) / 12,
      gesamtGewinn: modelA.kpis?.gesamtGewinn || 0
    };
  }, [modelA]);

  const kpisB = useMemo(() => {
    if (!modelB) return null;
    const firstRow = modelB.slicedProjection?.[0] || {};
    return {
      cashflowNachSteuer: modelB.kpis?.avgMonthlyCashflow ?? firstRow.cashflowNachSteuerMo,
      cashflowVorSteuer: firstRow.cashflowVorSteuerMo || 0,
      nettoMietrendite: modelB.kpis?.nettoMietrenditeInitial || 0,
      ekRendite: modelB.kpis?.validIrr || 0,
      monatlicheRate: (firstRow.kapitaldienst || 0) / 12,
      gesamtGewinn: modelB.kpis?.gesamtGewinn || 0
    };
  }, [modelB]);

  const handleSelectDbProperty = (propertyId) => {
    if (!propertyId) return;
    const found = dbProperties?.find(p => String(p.id) === String(propertyId));
    if (found && found.form_data) {
      const merged = { ...initialData, ...found.form_data };
      setScenarioA(merged);
      setScenarioB(merged);
      if (setFormData) setFormData(merged);
    }
  };

  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'interest_plus':
        setScenarioB(prev => ({ ...prev, hb_zins: Math.round(((parseFloat(prev.hb_zins) || 0) + 1.5) * 10) / 10 }));
        break;
      case 'discount_price':
        setScenarioB(prev => ({ ...prev, kaufpreis: Math.round((parseFloat(prev.kaufpreis) || 0) * 0.9) }));
        break;
      case 'rent_plus':
        setScenarioB(prev => ({ ...prev, kaltmiete_monat: Math.round((parseFloat(prev.kaltmiete_monat) || 0) * 1.1) }));
        break;
      case 'vacancy_risk':
        setScenarioB(prev => ({ ...prev, vac_rate_pct: 8.33 }));
        break;
      case 'reset':
        setScenarioB({ ...scenarioA });
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* HEADER BAR */}
      <div className="bg-white border border-valuon-border p-5 rounded-xl flex flex-row items-center justify-between flex-wrap gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-valuon-green text-valuon-cream flex items-center justify-center font-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-valuon-green m-0 tracking-tight">
              Szenario-Vergleich
            </h2>
            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
              Simultane Backend-Analyse & Stresstest in Echtzeit
            </p>
          </div>
        </div>

        {/* DATABASE SELECTOR */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-extrabold text-valuon-green">
            Basis-Objekt laden:
          </label>
          <div className="w-56">
            <select
              onChange={(e) => handleSelectDbProperty(e.target.value)}
              style={selectStyle}
            >
              <option value="">{scenarioA?.obj_name || 'Aktuelles Objekt'}</option>
              {dbProperties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || p.form_data?.obj_name || `Objekt #${p.id}`} ({p.form_data?.kaufpreis ? formatEuroInt(p.form_data.kaufpreis) + ' €' : ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* QUICK PRESETS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-extrabold text-slate-500 mr-1">Presets für B:</span>
          
          <button 
            type="button"
            onClick={() => applyPreset('interest_plus')}
            className="py-1.5 px-3.5 bg-valuon-cream border border-valuon-border rounded-full text-xs font-bold text-valuon-green cursor-pointer hover:bg-white transition-colors"
          >
            Zins +1,5 %
          </button>
          
          <button 
            type="button"
            onClick={() => applyPreset('discount_price')}
            className="py-1.5 px-3.5 bg-valuon-cream border border-valuon-border rounded-full text-xs font-bold text-valuon-green cursor-pointer hover:bg-white transition-colors"
          >
            Kaufpreis -10 %
          </button>
          
          <button 
            type="button"
            onClick={() => applyPreset('rent_plus')}
            className="py-1.5 px-3.5 bg-valuon-cream border border-valuon-border rounded-full text-xs font-bold text-valuon-green cursor-pointer hover:bg-white transition-colors"
          >
            Miete +10 %
          </button>

          <button 
            type="button"
            onClick={() => applyPreset('vacancy_risk')}
            className="py-1.5 px-3.5 bg-valuon-cream border border-valuon-border rounded-full text-xs font-bold text-valuon-green cursor-pointer hover:bg-white transition-colors"
          >
            1 Mo. Leerstand
          </button>

          <button 
            type="button"
            onClick={() => applyPreset('reset')}
            className="py-1.5 px-3.5 bg-valuon-green border-none rounded-full text-xs font-extrabold text-white cursor-pointer hover:bg-valuon-green-light transition-colors"
          >
            Szenario A kopieren
          </button>
        </div>
      </div>

      {/* GRID: 2 SZENARIO SPALTEN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioColumn 
          title="Szenario A (Basis)"
          badgeBg="#EBF8FF"
          badgeColor="#2B6CB0"
          data={scenarioA}
          setData={setScenarioA}
          kpis={kpisA}
          baselineResults={kpisA}
          isBaseline={true}
          loading={loadingA}
        />

        <ScenarioColumn 
          title="Szenario B (Anpassung)"
          badgeBg="#F0FFF4"
          badgeColor="#2F855A"
          data={scenarioB}
          setData={setScenarioB}
          kpis={kpisB}
          baselineResults={kpisA}
          isBaseline={false}
          loading={loadingB}
        />
      </div>

      {/* DELTA HIGHLIGHTS */}
      {kpisA && kpisB && (
        <div className="bg-white border border-valuon-border rounded-xl p-5 shadow-sm">
          <h3 className="m-0 mb-4 text-sm font-black text-valuon-green">
            Gesamtauswirkung Backend-Prognose (Szenario B vs. Szenario A)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-valuon-cream border border-valuon-border rounded-xl p-4">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Cashflow-Differenz (Monat)</span>
              <div className={`text-xl font-black mt-1 ${
                (kpisB.cashflowNachSteuer - kpisA.cashflowNachSteuer) >= 0 ? 'text-emerald-800' : 'text-red-700'
              }`}>
                {(kpisB.cashflowNachSteuer - kpisA.cashflowNachSteuer) >= 0 ? '+' : ''}{formatEuroInt(kpisB.cashflowNachSteuer - kpisA.cashflowNachSteuer)} €
              </div>
              <span className="text-[0.72rem] text-slate-500 mt-0.5 block">Unterschied Netto-Cashflow n. St.</span>
            </div>

            <div className="bg-valuon-cream border border-valuon-border rounded-xl p-4">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Rendite-Abweichung (Netto)</span>
              <div className="text-xl font-black text-valuon-green mt-1">
                {(kpisB.nettoMietrendite - kpisA.nettoMietrendite) >= 0 ? '+' : ''}{(kpisB.nettoMietrendite - kpisA.nettoMietrendite).toFixed(2).replace('.', ',')} %
              </div>
              <span className="text-[0.72rem] text-slate-500 mt-0.5 block">Unterschied Netto-Mietrendite</span>
            </div>

            <div className="bg-valuon-cream border border-valuon-border rounded-xl p-4">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Gesamtgewinn-Delta (10 J.)</span>
              <div className={`text-xl font-black mt-1 ${
                (kpisB.gesamtGewinn - kpisA.gesamtGewinn) >= 0 ? 'text-emerald-800' : 'text-red-700'
              }`}>
                {(kpisB.gesamtGewinn - kpisA.gesamtGewinn) >= 0 ? '+' : ''}{formatEuroInt(kpisB.gesamtGewinn - kpisA.gesamtGewinn)} €
              </div>
              <span className="text-[0.72rem] text-slate-500 mt-0.5 block">Kumulierter Vermögensgewinn</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
