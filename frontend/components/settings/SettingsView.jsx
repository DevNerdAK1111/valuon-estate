'use client';
import React, { useState } from 'react';

export default function SettingsView({ userProfile }) {
  const [defaultTaxRate, setDefaultTaxRate] = useState(42);
  const [defaultBundesland, setDefaultBundesland] = useState('Niedersachsen');
  const [defaultInstandhaltung, setDefaultInstandhaltung] = useState(12);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white border border-valuon-border p-5 rounded-xl shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-valuon-green m-0 tracking-tight">
            Systemeinstellungen
          </h2>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Verwalte deine globalen Standardwerte für neue Immobilienanalysen
          </p>
        </div>
        
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg">
            ✓ Einstellungen gespeichert
          </div>
        )}
      </div>

      {/* SETTINGS FORM */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* SECTION: BERECHNUNGS-STANDARDS */}
        <div className="bg-white border border-valuon-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-black text-valuon-green uppercase tracking-wider mb-4 m-0 border-b border-valuon-border pb-2">
            Standard-Vorgaben für Objekt-Kalkulationen
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Bevorzugtes Bundesland (Kaufnebenkosten)
              </label>
              <select
                value={defaultBundesland}
                onChange={(e) => setDefaultBundesland(e.target.value)}
                className="w-full bg-valuon-cream border border-valuon-border rounded-lg p-2.5 text-xs text-valuon-green font-bold focus:outline-none focus:border-valuon-green"
              >
                <option value="Niedersachsen">Niedersachsen (5,0 % GrESt)</option>
                <option value="Bremen">Bremen (5,0 % GrESt)</option>
                <option value="Hamburg">Hamburg (5,5 % GrESt)</option>
                <option value="Nordrhein-Westfalen">Nordrhein-Westfalen (6,5 % GrESt)</option>
                <option value="Bayern">Bayern (3,5 % GrESt)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Persönlicher Steuersatz (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(e.target.value)}
                className="w-full bg-valuon-cream border border-valuon-border rounded-lg p-2.5 text-xs text-valuon-green font-bold focus:outline-none focus:border-valuon-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Standard-Instandhaltung (€ / m² / Jahr)
              </label>
              <input
                type="number"
                value={defaultInstandhaltung}
                onChange={(e) => setDefaultInstandhaltung(e.target.value)}
                className="w-full bg-valuon-cream border border-valuon-border rounded-lg p-2.5 text-xs text-valuon-green font-bold focus:outline-none focus:border-valuon-green"
              />
            </div>
          </div>
        </div>

        {/* SECTION: BACKEND STATUS */}
        <div className="bg-white border border-valuon-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-black text-valuon-green uppercase tracking-wider mb-4 m-0 border-b border-valuon-border pb-2">
            System & API-Status
          </h3>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-valuon-cream/60 rounded-lg border border-valuon-border">
              <span className="font-bold text-slate-700">FastAPI Backend (Kalkulations-Engine)</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Verbunden
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-valuon-cream/60 rounded-lg border border-valuon-border">
              <span className="font-bold text-slate-700">Supabase Datenbank</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Aktiv
              </span>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-2.5 px-6 bg-valuon-green hover:bg-valuon-green-light text-white font-black text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Einstellungen speichern
          </button>
        </div>

      </form>
    </div>
  );
}
