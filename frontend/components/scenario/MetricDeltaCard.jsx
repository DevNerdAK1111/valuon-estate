'use client';
import React from 'react';
import { formatEuroInt } from '../../utils/formatters';

export default function MetricDeltaCard({ 
  label, 
  value, 
  type = 'currency', // 'currency' | 'percent' | 'number'
  unit = '', 
  compareValue, 
  isBaseline = false, 
  invertColor = false,
  customColor = null
}) {
  const formatValue = (v) => {
    if (v === null || v === undefined || isNaN(v)) return '—';
    const num = Number(v);
    if (type === 'currency') {
      return `${formatEuroInt(num)} €`;
    }
    if (type === 'percent') {
      return `${num.toFixed(2).replace('.', ',')} %`;
    }
    return num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
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
    if (type === 'currency') {
      return `${sign}${formatEuroInt(d)} €`;
    }
    if (type === 'percent') {
      return `${sign}${d.toFixed(2).replace('.', ',')} %`;
    }
    return `${sign}${d.toFixed(2).replace('.', ',')} ${unit}`.trim();
  };

  const getValueColorClass = () => {
    if (customColor) return '';
    if (type === 'currency') {
      if (invertColor) return 'text-valuon-red';
      return value >= 0 ? 'text-emerald-800' : 'text-valuon-red';
    }
    return 'text-valuon-green';
  };

  return (
    <div className="bg-white border border-valuon-border rounded-xl p-4 flex flex-col justify-between min-h-[105px] shadow-sm">
      <div className="text-[0.72rem] font-extrabold text-slate-500 uppercase tracking-wider truncate">
        {label}
      </div>
      
      <div 
        className={`text-lg sm:text-xl font-black my-1 ${getValueColorClass()}`}
        style={customColor ? { color: customColor } : {}}
      >
        {formatValue(value)}
      </div>

      {!isBaseline && delta !== null && Math.abs(delta) > 0.001 ? (
        <div className={`text-xs font-extrabold flex items-center gap-1 ${
          isPositive ? 'text-emerald-800' : 'text-valuon-red'
        }`}>
          <span>{formatDelta(delta)}</span>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`transition-transform duration-200 ${isPositive ? 'rotate-0' : 'rotate-180'}`}
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
      ) : !isBaseline ? (
        <div className="text-[0.72rem] text-slate-400 font-semibold">Identisch zur Basis</div>
      ) : (
        <div className="text-[0.72rem] text-slate-400 font-semibold">Basis-Szenario</div>
      )}
    </div>
  );
}
