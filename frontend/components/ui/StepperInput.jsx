'use client';
import { useState } from 'react';
import { formatEuro, formatEuroInt, formatPct } from '../../utils/formatters';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568' };
const stepBtnStyle = { border: 'none', background: '#FAF8F5', color: '#13381A', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', border: '1px solid #E2D9CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' };
const tooltipStyle = { cursor: 'pointer', fontSize: '0.75rem', color: '#718096', border: '1px solid #CBD5E0', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

export default function StepperInput({ label, value, onChange, step = 1, isYear = false, isInteger = false, isCurrency = false, isPercent = false, disabled = false, tooltip = null, onFocus = null }) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState('');

  const getFormattedValue = (v) => {
    if (v === undefined || v === null || isNaN(v)) return '';
    if (isYear) return String(Math.round(v));
    if (isInteger) return formatEuroInt(v);
    if (isPercent) return formatPct(v) + ' %';
    if (isCurrency) return formatEuro(v) + ' €';
    return formatEuro(v);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    const rawStr = value !== undefined && value !== null && !isNaN(value) ? String(value) : '';
    setLocalValue(rawStr);
    
    // Automatisch allen Text markieren, damit Numpad-Eingaben sofort überschreiben
    if (e.target && typeof e.target.select === 'function') {
      setTimeout(() => e.target.select(), 10);
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const raw = localValue.replace(/[^0-9.-]/g, '').replace(',', '.');
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    const raw = val.replace(/[^0-9.-]/g, '').replace(',', '.');
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else if (val === '') {
      onChange(0);
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    const minVal = isYear ? 1800 : 0;
    const current = value || 0;
    const next = Math.max(minVal, Number((current - step).toFixed(2)));
    onChange(next);
    if (isFocused) setLocalValue(String(next));
  };

  const handleIncrement = () => {
    if (disabled) return;
    const current = value || 0;
    const next = Number((current + step).toFixed(2));
    onChange(next);
    if (isFocused) setLocalValue(String(next));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', height: '18px' }}>
        <label style={labelStyle}>{label}</label>
        {tooltip && <span title={tooltip} style={tooltipStyle}>?</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', background: disabled ? '#EDF2F7' : 'white', border: '1px solid #CBD5E0', borderRadius: '8px', padding: '0 8px', height: '42px', boxSizing: 'border-box' }}>
        <input
          type="text"
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={isFocused ? localValue : getFormattedValue(value)}
          onChange={handleChange}
          style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: '500', color: disabled ? '#A0AEC0' : '#2D3748', fontVariantNumeric: 'tabular-nums' }}
        />
        {!disabled && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button type="button" onClick={handleDecrement} style={stepBtnStyle}>–</button>
            <button type="button" onClick={handleIncrement} style={stepBtnStyle}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
