import React from 'react';

export default function MetricDeltaCard({ 
  label, 
  value, 
  unit = '', 
  type = 'currency', 
  compareValue, 
  isBaseline = false, 
  invertColor = false 
}) {
  const formatValue = (v) => {
    if (v === null || v === undefined || isNaN(v)) return '—';
    const num = Number(v);
    if (type === 'currency') {
      return num.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    }
    if (type === 'percent') {
      return `${num.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} %`;
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
      return `${sign}${d.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}`;
    }
    if (type === 'percent') {
      return `${sign}${d.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} %`;
    }
    return `${sign}${d.toFixed(2)} ${unit}`.trim();
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #E2D9CE',
      borderRadius: '12px',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#718096' }}>{label}</span>
      
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#13381A' }}>
          {formatValue(value)} {type === 'number' && unit ? <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#718096' }}>{unit}</span> : null}
        </span>
      </div>

      {!isBaseline && delta !== null && Math.abs(delta) > 0.001 ? (
        <div style={{
          marginTop: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: isPositive ? '#2F855A' : '#C53030',
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
        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#A0AEC0' }}>Identisch zur Basis</div>
      ) : (
        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#A0AEC0' }}>Basis-Szenario</div>
      )}
    </div>
  );
}
