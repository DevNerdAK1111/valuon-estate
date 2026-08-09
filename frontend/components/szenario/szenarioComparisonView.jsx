import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash'; // oder custom debounce helper
import SectionFinanzierung from './sections/SectionFinanzierung';
import SectionBewirtschaftung from './sections/SectionBewirtschaftung';
import SectionSteuern from './sections/SectionSteuern';
import MetricDeltaCard from './MetricDeltaCard';

export default function ScenarioComparisonView({ basePropertyData }) {
  // 1. Zwei voneinander unabhängige Form-States initialisieren
  const [scenarioA, setScenarioA] = useState({ ...basePropertyData });
  const [scenarioB, setScenarioB] = useState({ ...basePropertyData });

  // 2. States für die Berechnungsergebnisse aus dem Backend
  const [resultsA, setResultsA] = useState(null);
  const [resultsB, setResultsB] = useState(null);
  const [loading, setLoading] = useState({ a: false, b: false });

  // 3. Backend-API Aufruf
  const fetchCalculation = async (data, setResults, setSingleLoading) => {
    try {
      setSingleLoading(true);
      const response = await fetch('/api/calculate', { // Backend endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      setResults(resData);
    } catch (err) {
      console.error("Fehler bei Szenario-Berechnung:", err);
    } finally {
      setSingleLoading(false);
    }
  };

  // Debounced API-Aufrufe, um das Backend bei Slider-Bewegungen nicht zu überlasten
  const debouncedCalcA = useCallback(
    debounce((data) => fetchCalculation(data, setResultsA, (val) => setLoading(p => ({ ...p, a: val }))), 300),
    []
  );

  const debouncedCalcB = useCallback(
    debounce((data) => fetchCalculation(data, setResultsB, (val) => setLoading(p => ({ ...p, b: val }))), 300),
    []
  );

  // Trigger bei Parameteränderungen
  useEffect(() => { debouncedCalcA(scenarioA); }, [scenarioA]);
  useEffect(() => { debouncedCalcB(scenarioB); }, [scenarioB]);

  return (
    <div className="w-full space-y-6">
      {/* Top Bar: Objekt-Basisdaten Ankermaske */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-md">
        <div>
          <h2 className="text-lg font-bold">{basePropertyData.title || "Immobilien-Vergleich"}</h2>
          <p className="text-sm text-slate-400">Kaufpreis: {basePropertyData.purchase_price?.toLocaleString('de-DE')} € | Fläche: {basePropertyData.sqm} m²</p>
        </div>
        <button 
          onClick={() => setScenarioB({ ...scenarioA })}
          className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
        >
          Szenario A auf B kopieren
        </button>
      </div>

      {/* Spalten-Layout für Direktvergleich */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SPALTE A */}
        <ScenarioColumn 
          title="Szenario A (Basis)"
          badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
          data={scenarioA}
          setData={setScenarioA}
          results={resultsA}
          comparisonResults={resultsB}
          isBaseline={true}
          isLoading={loading.a}
        />

        {/* SPALTE B */}
        <ScenarioColumn 
          title="Szenario B (Stresstest / Alternative)"
          badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          data={scenarioB}
          setData={setScenarioB}
          results={resultsB}
          comparisonResults={resultsA}
          isBaseline={false}
          isLoading={loading.b}
        />

      </div>
    </div>
  );
}
