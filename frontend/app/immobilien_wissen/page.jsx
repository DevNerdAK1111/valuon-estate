'use client';

import React, { useState } from 'react';

export default function ImmobilienWissenPage() {
  const [activeTab, setActiveTab] = useState('kaufprozess');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Header / Hero Section */}
      <header className="bg-white border-b border-slate-200 py-10 px-6 sm:px-10 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            Wissensdatenbank & Ratgeber
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Immobilien-Wissen & Kennzahlen
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Fundiertes Know-how für den deutschen Immobilienmarkt: Vom strukturierten Kaufprozess über typische Fallstricke bis hin zu allen relevanten KPIs.
          </p>

          {/* Navigation Tabs */}
          <div className="flex gap-3 mt-6 border-b border-slate-200 pb-0">
            <button
              onClick={() => setActiveTab('kaufprozess')}
              className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'kaufprozess'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Schritt-für-Schritt Kaufprozess
            </button>
            <button
              onClick={() => setActiveTab('kpis')}
              className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'kpis'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              2. KPIs & Kennzahlen
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 sm:px-10">
        
        {/* Sektion 1: Kaufprozess */}
        {activeTab === 'kaufprozess' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">1</span>
                <h2 className="text-xl font-bold text-slate-900">Vorbereitung & Finanzierung</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                Der Grundstein für jede erfolgreiche Immobilieninvestition wird vor der Objektsuche gelegt. In Deutschland wird die Finanzierung maßgeblich durch Eigenkapital und Bonität bestimmt.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50/60 border border-blue-100 p-5 rounded-xl">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">💡 Profi-Tipp</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Kalkulieren Sie die Kaufnebenkosten (Grunderwerbsteuer, Notar, Grundbuch, ggf. Makler – je nach Bundesland zwischen 10 % und 12,5 %) niemals über den Kredit. Banken sehen es bevorzugt, wenn Nebenkosten aus echtem Eigenkapital bedient werden.
                  </p>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl">
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">⚠️ Typischer Fallstrick</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong>Die Zinsbindungs-Falle:</strong> Wählen Sie die Zinsbindung nicht zu kurz bei volatilen Zinsmärkten. Achten Sie auf das Recht auf jährliche Sondertilgung (min. 2–5 %).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">2</span>
                <h2 className="text-xl font-bold text-slate-900">Suche, Besichtigung & Prüfung</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Bei Bestandsimmobilien ist der Blick in rechtliche Dokumente und die Bausubstanz entscheidend:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 text-sm">
                <li><strong>Teilungserklärung prüfen:</strong> Regelt das Sondereigentum im Verhältnis zum Gemeinschaftseigentum.</li>
                <li><strong>WEG-Protokolle lesen:</strong> Auswertung der letzten 3 Jahre schützt vor überraschenden Sonderumlagen für Großsanierungen.</li>
                <li><strong>Energieausweis:</strong> Pflicht bei Besichtigung zur Beurteilung energetischer Standards nach GEG.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Sektion 2: KPIs & Kennzahlen */}
        {activeTab === 'kpis' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* KPI 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                <h3 className="text-xl font-bold text-slate-900">Bruttomietrendite</h3>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-md">Schnell-Check</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Gibt einen ersten groben Anhaltspunkt über das Verhältnis von Kaufpreis zu Jahreskaltmiete.</p>
              
              <div className="bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-xl mb-4 overflow-x-auto">
                Formel: ( Jahreskaltmiete ÷ Kaufpreis ) × 100
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Bedeutung:</strong> Je höher der Wert, desto schneller rentiert sich der reine Kaufpreis. Kaufnebenkosten und Bewirtschaftungskosten bleiben hierbei jedoch unberücksichtigt.
              </p>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                <h3 className="text-xl font-bold text-slate-900">Nettomietrendite</h3>
                <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md">Realistisch</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Die aussagekräftigere Kennzahl für Investoren unter Einbezug von Kaufneben- und Bewirtschaftungskosten.</p>
              
              <div className="bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-xl mb-4 overflow-x-auto">
                Formel: ( Nettomieteinnahmen p.a. (abzgl. nicht umlagefähiger Kosten) ÷ Gesamtkosten ) × 100
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Bedeutung:</strong> Zeigt die tatsächliche Rendite des Gesamtkapitals unter Berücksichtigung von Instandhaltungsrücklagen und Verwaltungskosten.
              </p>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                <h3 className="text-xl font-bold text-slate-900">Eigenkapitalrendite (Return on Equity)</h3>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-md">Hebeleffekt (Leverage)</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Misst die Verzinsung des tatsächlich selbst investierten Kapitals unter Berücksichtigung von Fremdfinanzierung.</p>
              
              <div className="bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-xl mb-4 overflow-x-auto">
                Formel: ( Überschuss nach Zinsen & Tilgung p.a. ÷ eingesetztes Eigenkapital ) × 100
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Bedeutung:</strong> Durch den intelligenten Einsatz von Bankdarlehen kann die Eigenkapitalrendite drastisch über der Nettomietrendite liegen – erhöht jedoch auch das Risiko bei Mietausfällen.
              </p>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
