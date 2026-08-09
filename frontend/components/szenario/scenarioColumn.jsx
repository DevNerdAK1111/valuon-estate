function ScenarioColumn({ title, badgeColor, data, setData, results, comparisonResults, isBaseline, isLoading }) {
  
  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-6 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Spalten-Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {title}
          </span>
          {isLoading && <span className="text-xs text-slate-400 animate-pulse">Berechne...</span>}
        </div>

        {/* Parameter Eingaben (Akkordeons / Inputs) */}
        <div className="space-y-4">
          <SectionFinanzierung data={data} onChange={updateField} />
          <SectionBewirtschaftung data={data} onChange={updateField} />
          <SectionSteuern data={data} onChange={updateField} />
        </div>
      </div>

      {/* KPI Ergebnisbereich */}
      {results && (
        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl">
          <MetricDeltaCard 
            label="Cashflow n. St."
            value={results.cashflow_after_tax}
            unit="€/Monat"
            compareValue={comparisonResults?.cashflow_after_tax}
            isBaseline={isBaseline}
            invertColor={false} // Höher ist besser
          />
          <MetricDeltaCard 
            label="Eigenkapitalrendite"
            value={results.return_on_equity}
            unit="%"
            compareValue={comparisonResults?.return_on_equity}
            isBaseline={isBaseline}
            invertColor={false}
          />
          <MetricDeltaCard 
            label="Netto-Mietrendite"
            value={results.net_yield}
            unit="%"
            compareValue={comparisonResults?.net_yield}
            isBaseline={isBaseline}
            invertColor={false}
          />
          <MetricDeltaCard 
            label="Vermögen (10 J.)"
            value={results.wealth_build_10y}
            unit="€"
            compareValue={comparisonResults?.wealth_build_10y}
            isBaseline={isBaseline}
            invertColor={false}
          />
        </div>
      )}
    </div>
  );
}
