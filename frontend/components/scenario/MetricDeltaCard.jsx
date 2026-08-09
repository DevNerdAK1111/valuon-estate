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

  // Farbgebung nach Executive Dashboard Standard
  const getValueColor = () => {
    if (customColor) return customColor;
    if (type === 'currency') {
      if (invertColor) return '#9B2C2C'; // Rate / Ausgaben
      return value >= 0 ? '#276749' : '#9B2C2C'; // Cashflow & Ertrag
    }
    return '#13381A';
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2D9CE',
      borderRadius: '10px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '105px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: '800',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {label}
      </div>
      
      <div style={{
        fontSize: '1.35rem',
        fontWeight: '900',
        margin: '4px 0',
        color: getValueColor()
      }}>
        {formatValue(value)}
      </div>

      {!isBaseline && delta !== null && Math.abs(delta) > 0.001 ? (
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '800',
          color: isPositive ? '#276749' : '#9B2C2C',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>{formatDelta(delta)}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
      ) : !isBaseline ? (
        <div style={{ fontSize: '0.72rem', color: '#A0AEC0', fontWeight: '600' }}>Identisch zur Basis</div>
      ) : (
        <div style={{ fontSize: '0.72rem', color: '#A0AEC0', fontWeight: '600' }}>Basis-Szenario</div>
      )}
    </div>
  );
}
