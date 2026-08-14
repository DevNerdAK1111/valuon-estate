'use client';
import { useState } from 'react';
import { formatEuro, formatEuroInt, formatPct } from '../../utils/formatters';

export default function StepperInput({ 
  label, 
  value, 
  onChange, 
  step = 1, 
  isYear = false, 
  isInteger = false, 
  isCurrency = false, 
  isPercent = false, 
  disabled = false, 
  tooltip = null, 
  onFocus = null,
  idPrefix = "" 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState('');

  // Dynamische HTML-ID generieren für Fokus-Stabilität im Szenario-Vergleich
  const inputId = idPrefix ? `${idPrefix}${label.replace(/[^a-zA-Z0-9]/g, '_')}` : undefined;

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
      <div className="flex justify-between items-center mb-1 h-[18px]">
        <label htmlFor={inputId} className="block text-[0.8rem] font-semibold text-slate-600">
          {label}
        </label>
        {tooltip && (
          <span 
            title={tooltip} 
            className="cursor-pointer text-[0.75rem] text-slate-500 border border-slate-300 rounded-full w-4 h-4 inline-flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            ?
          </span>
        )}
      </div>
      <div className={`flex items-center border rounded-lg px-2 h-[42px] box-border transition-colors ${
        disabled 
          ? 'bg-slate-100 border-slate-300' 
          : 'bg-white border-slate-300 focus-within:border-valuon-green focus-within:ring-1 focus-within:ring-valuon-green'
      }`}>
        <input
          id={inputId}
          type="text"
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={isFocused ? localValue : getFormattedValue(value)}
          onChange={handleChange}
          className={`w-full border-none outline-none bg-transparent text-[0.9rem] font-medium tabular-nums ${
            disabled ? 'text-slate-400' : 'text-slate-700'
          }`}
        />
        {!disabled && (
          <div className="flex gap-1 items-center shrink-0">
            <button 
              type="button" 
              onClick={handleDecrement} 
              className="bg-valuon-cream text-valuon-green w-6 h-6 rounded cursor-pointer font-bold border border-valuon-border flex items-center justify-center text-[0.85rem] hover:bg-white transition-colors"
            >
              –
            </button>
            <button 
              type="button" 
              onClick={handleIncrement} 
              className="bg-valuon-cream text-valuon-green w-6 h-6 rounded cursor-pointer font-bold border border-valuon-border flex items-center justify-center text-[0.85rem] hover:bg-white transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
