import React, { useMemo } from 'react';
import MetricDeltaCard from './MetricDeltaCard';
import { calculateInvestment } from '../../utils/calculateInvestment';

export default function ScenarioColumn({ 
  title, 
  badgeColor, 
  data, 
  setData, 
  baselineResults, 
  isBaseline = false 
}) {
  const results = useMemo(() => {
    if (!data) return null;
    return calculateInvestment(data);
  }, [data]);

  const updateField = (field, value) => {
    const numVal = parseFloat(value);
    setData(prev => ({
      ...prev,
      [field]: isNaN(numVal) ? value : numVal
    }));
  };

  const kpis = results?.kpi;
  const baseKpis = baselineResults?.kpi;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6 flex flex-col justify-between">
      <div className="space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {title}
          </span>
          <span className="text-xs text-slate-400">
            Kaufpreis: {data?.kaufpreis ? Number(data.kaufpreis).toLocaleString('de-DE') : 0} €
          </span>
        </div>

        <div className="space-y-4">
          {/* Kategorie 1: Finanzierung */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">1. Finanzierung</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Eigenkapital (€)</label>
                <input 
                  type="number"
                  value={data?.eigenkapital ?? ''}
                  onChange={(e) => updateField('eigenkapital', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Sollzins (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={data?.zinsProzent ?? ''}
                  onChange={(e) => updateField('zinsProzent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tilgung (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={data?.tilgungProzent ?? ''}
                  onChange={(e) => updateField('tilgungProzent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Zinsbindung (Jahre)</label>
                <input 
                  type="number"
                  value={data?.zinsbindungJahre ?? ''}
                  onChange={(e) => updateField('zinsbindungJahre', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Kategorie 2: Einnahmen & Bewirtschaftung */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">2. Einnahmen & Bewirtschaftung</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Kaltmiete (€/Monat)</label>
                <input 
                  type="number"
                  value={data?.kaltmieteProMonat ?? ''}
                  onChange={(e) => updateField('kaltmieteProMonat', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Instandh. (€/m²/Jahr)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={data?.instandhaltungProQmJahr ?? ''}
                  onChange={(e) => updateField('instandhaltungProQmJahr', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Verwaltung (€/Monat)</label>
                <input 
                  type="number"
                  value={data?.verwaltungProMonat ?? ''}
                  onChange={(e) => updateField('verwaltungProMonat', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Mietausfall (%)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={data?.mietausfallprozent ?? ''}
                  onChange={(e) => updateField('mietausfallprozent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Kategorie 3: Entwicklung */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">3. Entwicklung & Steuern</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Mietstg. (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={data?.mietsteigerungProzent ?? ''}
                  onChange={(e) => updateField('mietsteigerungProzent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Wertstg. (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={data?.wertsteigerungProzent ?? ''}
                  onChange={(e) => updateField('wertsteigerungProzent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Steuersatz (%)</label>
                <input 
                  type="number"
                  value={data?.steuersatzProzent ?? ''}
                  onChange={(e) => updateField('steuersatzProzent', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {kpis && (
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ergebnis-Metriken</h4>
          <div className="grid grid-cols-2 gap-3">
            <MetricDeltaCard 
              label="Cashflow n. St."
              value={kpis.cashflowNachSteuerMonat}
              type="currency"
              compareValue={baseKpis?.cashflowNachSteuerMonat}
              isBaseline={isBaseline}
            />
            <MetricDeltaCard 
              label="Cashflow v. St."
              value={kpis.cashflowMonat}
              type="currency"
              compareValue={baseKpis?.cashflowMonat}
              isBaseline={isBaseline}
            />
            <MetricDeltaCard 
              label="Netto-Mietrendite"
              value={kpis.nettomietrendite}
              type="percent"
              compareValue={baseKpis?.nettomietrendite}
              isBaseline={isBaseline}
            />
            <MetricDeltaCard 
              label="EK-Rendite"
              value={kpis.eigenkapitalrendite}
              type="percent"
              compareValue={baseKpis?.eigenkapitalrendite}
              isBaseline={isBaseline}
            />
            <MetricDeltaCard 
              label="Monatliche Rate"
              value={kpis.monatlicheRate}
              type="currency"
              compareValue={baseKpis?.monatlicheRate}
              isBaseline={isBaseline}
              invertColor={true}
            />
            <MetricDeltaCard 
              label="Vermögen (10 J.)"
              value={kpis.vermoegensaufbau10Jahre}
              type="currency"
              compareValue={baseKpis?.vermoegensaufbau10Jahre}
              isBaseline={isBaseline}
            />
          </div>
        </div>
      )}
    </div>
  );
}
