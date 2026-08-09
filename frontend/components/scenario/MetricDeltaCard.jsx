import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function MetricDeltaCard({ 
  label, 
  value, 
  unit = '', 
  type = 'number', // 'currency' | 'percent' | 'number'
  compareValue, 
  isBaseline = false, 
  invertColor = false 
}) {
  const formatVal = (v) => {
    if (v === null || v === undefined || isNaN(v)) return '—';
    if (type === 'currency') return formatCurrency(v);
    if (type === 'percent') return formatPercent(v);
    return typeof v === 'number' ? v.toLocaleString('de-DE', { maximumFractionDigits: 2 }) : v;
  };

  let delta = null;
  let isPositive = true;

  if (compareValue !== undefined && compareValue !== null && !isBaseline && typeof value === 'number' && typeof compareValue === 'number') {
    delta = value - compareValue;
    isPositive = invertColor ? delta < 0 : delta >= 0;
  }

  const formatDelta = (d) => {
    if (d === null || isNaN(d)) return '';
    const sign = d > 0 ? '+' : '';
    if (type === 'currency') return `${sign}${formatCurrency(d)}`;
    if (type === 'percent') return `${sign}${formatPercent(d)}`;
    return `${sign}${d.toFixed(2)} ${unit}`.trim();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      
      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="text-base sm:text-lg font-bold text-white tracking-tight">
          {formatVal(value)} {type === 'number' && unit ? <span className="text-xs font-normal text-slate-400">{unit}</span> : null}
        </span>
      </div>

      {!isBaseline && delta !== null && Math.abs(delta) > 0.0001 ? (
        <div className={`mt-1.5 text-xs font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          <span>{formatDelta(delta)}</span>
          <span>{isPositive ? '▲' : '▼'}</span>
        </div>
      ) : !isBaseline ? (
        <div className="mt-1.5 text-xs text-slate-500">Identisch zur Basis</div>
      ) : (
        <div className="mt-1.5 text-xs text-slate-500">Basis-Szenario (Referenz)</div>
      )}
    </div>
  );
}
