function MetricDeltaCard({ label, value, unit, compareValue, isBaseline, invertColor = false }) {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('de-DE', { maximumFractionDigits: 2 }) 
    : value;

  let delta = null;
  let deltaPercent = null;
  let isPositive = true;

  if (compareValue !== undefined && compareValue !== null && !isBaseline) {
    const diff = value - compareValue;
    delta = diff;
    isPositive = invertColor ? diff < 0 : diff >= 0;
  }

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <div className="mt-1 flex items-baseline justify-between">
        <span className="text-lg font-bold text-white">
          {formattedValue} <span className="text-xs font-normal text-slate-400">{unit}</span>
        </span>
      </div>

      {/* Delta Anzeige nur in Szenario B */}
      {!isBaseline && delta !== null && (
        <div className={`mt-1 text-xs font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          <span>{delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} {unit}</span>
          <span>{isPositive ? '▲' : '▼'}</span>
        </div>
      )}
    </div>
  );
}
