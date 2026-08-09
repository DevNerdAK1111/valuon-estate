import React, { useState, useMemo } from 'react';
import ScenarioColumn from './ScenarioColumn';
import { calculateInvestment } from '../../utils/calculateInvestment';
import { formatCurrency } from '../../utils/formatters';
import { DEFAULT_FORM_DATA } from '../../constants/realEstate';

export default function ScenarioComparisonView({ basePropertyData }) {
  const initialData = useMemo(() => {
    return { ...DEFAULT_FORM_DATA, ...basePropertyData };
  }, [basePropertyData]);

  const [scenarioA, setScenarioA] = useState(initialData);
  const [scenarioB, setScenarioB] = useState(initialData);

  const resultsA = useMemo(() => calculateInvestment(scenarioA), [scenarioA]);
  const resultsB = useMemo(() => calculateInvestment(scenarioB), [scenarioB]);

  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'interest_plus':
        setScenarioB(prev => ({ ...prev, zinsProzent: (parseFloat(prev.zinsProzent) || 0) + 1.5 }));
        break;
      case 'discount_price':
        setScenarioB(prev => ({ ...prev, kaufpreis: Math.round((parseFloat(prev.kaufpreis) || 0) * 0.9) }));
        break;
      case 'rent_plus':
        setScenarioB(prev => ({ ...prev, kaltmieteProMonat: Math.round((parseFloat(prev.kaltmieteProMonat) || 0) * 1.1) }));
        break;
      case 'vacancy_risk':
        setScenarioB(prev => ({ ...prev, mietausfallprozent: 8.33 }));
        break;
      case 'reset':
        setScenarioB({ ...scenarioA });
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>⚡ Szenario-Vergleich</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-normal">
              Live-Analyse
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {scenarioA.objektName ? `Aktuelles Objekt: ${scenarioA.objektName}` : 'Vergleiche die Auswirkung verschiedener Parameter-Änderungen in Echtzeit.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Presets für Szenario B:</span>
          <button 
            onClick={() => applyPreset('interest_plus')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition"
          >
            📈 Zins +1,5 %
          </button>
          <button 
            onClick={() => applyPreset('discount_price')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition"
          >
            🏷️ Kaufpreis -10 %
          </button>
          <button 
            onClick={() => applyPreset('rent_plus')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition"
          >
            💶 Miete +10 %
          </button>
          <button 
            onClick={() => applyPreset('vacancy_risk')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition"
          >
            ⚠️ 1 Mo. Leerstand
          </button>
          <button 
            onClick={() => applyPreset('reset')}
            className="px-2.5 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg transition"
          >
            🔄 Szenario A kopieren
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioColumn 
          title="Szenario A (Basis)"
          badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
          data={scenarioA}
          setData={setScenarioA}
          baselineResults={resultsA}
          isBaseline={true}
        />

        <ScenarioColumn 
          title="Szenario B (Anpassung / Test)"
          badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          data={scenarioB}
          setData={setScenarioB}
          baselineResults={resultsA}
          isBaseline={false}
        />
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>📊 Direct Delta Gegenüberstellung</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Cashflow-Differenz (Monat)</span>
            <div className="mt-1 text-xl font-bold text-white">
              {formatCurrency((resultsB?.kpi?.cashflowNachSteuerMonat || 0) - (resultsA?.kpi?.cashflowNachSteuerMonat || 0))}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Szenario B vs. Szenario A</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Rendite-Differenz (Netto)</span>
            <div className="mt-1 text-xl font-bold text-white">
              {(((resultsB?.kpi?.nettomietrendite || 0) - (resultsA?.kpi?.nettomietrendite || 0))).toFixed(2)} %
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Abweichung Netto-Mietrendite</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400">Vermögensaufbau-Delta (10 Jahre)</span>
            <div className="mt-1 text-xl font-bold text-white">
              {formatCurrency((resultsB?.kpi?.vermoegensaufbau10Jahre || 0) - (resultsA?.kpi?.vermoegensaufbau10Jahre || 0))}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Kumulierter Unterschied</span>
          </div>
        </div>
      </div>
    </div>
  );
}
