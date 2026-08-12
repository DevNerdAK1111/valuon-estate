'use client';
import { useState } from 'react';
import ProjectionChart from '../charts/ProjectionChart';
import DonutChart from '../charts/DonutChart';
import TableView from './TableView';
import { calculateInvestmentModel } from '../../utils/calculateInvestment';
import { formatEuroInt } from '../../utils/formatters';

const KPI_OPTIONS = [
  { id: 'cf', label: 'Netto-Cashflow', getValue: (m) => `${m.kpis.isCfPositive ? '+' : ''}${formatEuroInt(m.kpis.avgMonthlyCashflow)} €`, getSub: (m) => `Ø pro Monat n. St. (${m.kpis.horizonYears} J.)`, isPos: (m) => m.kpis.isCfPositive },
  { id: 'brutto', label: 'Brutto-Mietrendite (Ø p.a.)', getValue: (m) => `${m.kpis.avgBruttoRendite.toFixed(2)} %`, getSub: () => 'Ø Miete p.a. / Kaufpreis', color: '#13381A' },
  { id: 'irr', label: 'Progn. EK-Rendite (IRR)', getValue: (m) => `${m.kpis.validIrr.toFixed(2)} %`, getSub: (m) => `Erwartete EK-Verzinsung bei Exit (${m.kpis.horizonYears} J.)`, color: '#A37841' },
  { id: 'gewinn', label: 'Progn. Gesamtgewinn', getValue: (m) => `${m.kpis.gesamtGewinn >= 0 ? '+' : ''}${formatEuroInt(m.kpis.gesamtGewinn)} €`, getSub: (m) => `Erwarteter Kum. Cashflow + NAV (${m.kpis.horizonYears} J.)`, isPos: (m) => m.kpis.gesamtGewinn >= 0 },
  { id: 'faktor', label: 'Kaufpreisfaktor', getValue: (m) => `${m.kpis.kaufpreisfaktor.toFixed(1)}x`, getSub: () => 'Kaufpreis / Jahreskaltmiete', color: '#13381A' },
  { id: 'nettoFaktor', label: 'Netto-Kaufpreisfaktor', getValue: (m) => `${m.kpis.nettoKaufpreisfaktor.toFixed(1)}x`, getSub: () => 'Gesamtkosten / Nettomiete (NOI)', color: '#13381A' },
  { id: 'nettoRendite', label: 'Netto-Mietrendite (Jahr 1)', getValue: (m) => `${m.kpis.nettoMietrenditeInitial.toFixed(2)} %`, getSub: () => 'Nettomiete / Gesamtkosten', color: '#13381A' },
  { id: 'coc', label: 'Cash-on-Cash Return (J1)', getValue: (m) => `${m.kpis.cashOnCashReturn.toFixed(2)} %`, getSub: () => 'Operativer Ertrag / Eigenkapital', color: '#A37841' },
  { id: 'beMiete', label: 'Break-Even-Miete (Mo)', getValue: (m) => `${formatEuroInt(m.kpis.breakEvenMieteMo)} €`, getSub: (m) => `${m.kpis.breakEvenMieteSqmMo.toFixed(2)} € / m² kritische Miete`, color: '#4A5568' },
  { id: 'dscr', label: 'DSCR (Deckungsbeitrag)', getValue: (m) => `${m.kpis.dscrInitial.toFixed(2)}x`, getSub: () => 'Nettomiete / Kapitaldienst Bank', color: '#13381A' },
  { id: 'ltv', label: 'Beleihungsauslauf (LTV)', getValue: (m) => `${m.finanzierung.ltv.toFixed(1)} %`, getSub: () => 'Fremdkapital / Kaufpreis', color: '#9B2C2C' }
];

export default function ExecutiveDashboard({
  formData,
  result,
  projectionHorizon,
  setProjectionHorizon,
  handleSaveToDatabase,
  isSaving,
  activeDashboardTab,
  setActiveDashboardTab,
  summe_nk
}) {
  const [showExtendedMatrix, setShowExtendedMatrix] = useState(false);
  const [isCustomizingKpis, setIsCustomizingKpis] = useState(false);
  const [selectedKpiIds, setSelectedKpiIds] = useState(['cf', 'brutto', 'irr', 'gewinn']);

  const propertyTitle = formData?.obj_name || 'Neues Investment-Objekt';
  const locationText = [formData?.stadt, formData?.stadtteil].filter(Boolean).join(' • ') || 'Kein Standort angegeben';

  const model = calculateInvestmentModel(formData, projectionHorizon, result);

  const handleKpiSelect = (slotIndex, newId) => {
    const updated = [...selectedKpiIds];
    updated[slotIndex] = newId;
    setSelectedKpiIds(updated);
  };

  return (
    <div id="executive-dashboard-view" className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden box-border">
      
      {/* KOPFZEILE */}
      <div className="bg-white p-5 rounded-xl border border-valuon-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-valuon-green m-0">{propertyTitle}</h2>
          <div className="text-xs text-slate-500 mt-0.5">
            {locationText} • {formatEuroInt(formData?.kaufpreis || 0)} € • {formData?.qm || 0} m²
          </div>
        </div>

        {result && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSaveToDatabase && handleSaveToDatabase('pipeline')}
              disabled={isSaving}
              className="py-2.5 px-4 bg-valuon-green text-white border-none rounded-lg font-extrabold text-xs cursor-pointer hover:bg-valuon-green-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? 'Speichert...' : '+ In Pipeline speichern'}
            </button>

            <button
              type="button"
              onClick={() => handleSaveToDatabase && handleSaveToDatabase('bestand')}
              disabled={isSaving}
              className="py-2.5 px-3.5 bg-valuon-cream text-valuon-green border border-valuon-green rounded-lg font-extrabold text-xs cursor-pointer hover:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? 'Speichert...' : 'In Bestand speichern'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded-lg border border-valuon-border gap-3 shadow-sm">
          <span className="text-xs font-extrabold text-valuon-green shrink-0">Betrachtungshorizont:</span>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: '10 Jahre', value: '10' },
              { label: '15 Jahre', value: '15' },
              { label: '20 Jahre', value: '20' },
              { label: '30 Jahre', value: '30' },
              { label: 'Bis Schuldenfrei', value: 'payoff' }
            ].map((h) => (
              <button
                key={h.value}
                type="button"
                onClick={() => setProjectionHorizon(h.value)}
                className={`py-1.5 px-3.5 rounded-md border text-xs font-bold cursor-pointer transition-colors ${
                  projectionHorizon === h.value 
                    ? 'bg-valuon-green text-white border-valuon-green' 
                    : 'bg-valuon-cream text-valuon-green border-valuon-border hover:bg-white'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Wichtigste Kennzahlen
            </span>
            <button
              type="button"
              onClick={() => setIsCustomizingKpis(!isCustomizingKpis)}
              className="bg-transparent border-none text-valuon-green font-bold text-xs cursor-pointer underline hover:text-valuon-green-light"
            >
              {isCustomizingKpis ? 'Auswahl schließen' : 'Karten anpassen'}
            </button>
          </div>

          {isCustomizingKpis && (
            <div className="bg-valuon-cream border border-valuon-border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-sm">
              {selectedKpiIds.map((currentId, slotIdx) => (
                <div key={slotIdx}>
                  <label className="block text-[0.72rem] font-extrabold text-valuon-green mb-1">
                    Karte {slotIdx + 1}
                  </label>
                  <select
                    value={currentId}
                    onChange={(e) => handleKpiSelect(slotIdx, e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-valuon-green"
                  >
                    {KPI_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedKpiIds.map((kpiId, idx) => {
              const config = KPI_OPTIONS.find(o => o.id === kpiId) || KPI_OPTIONS[0];
              const valueStr = config.getValue(model);
              const subStr = config.getSub(model);
              const cardColor = config.isPos ? (config.isPos(model) ? '#276749' : '#9B2C2C') : config.color;

              return (
                <div key={idx} className="bg-white border border-valuon-border rounded-xl p-4 flex flex-col justify-between min-h-[100px] shadow-sm">
                  <div className="text-[0.72rem] font-extrabold text-slate-500 uppercase tracking-wider truncate">{config.label}</div>
                  <div className="text-2xl font-black my-1" style={{ color: cardColor }}>
                    {valueStr}
                  </div>
                  <div className="text-[0.75rem] text-slate-500 truncate">{subStr}</div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowExtendedMatrix(!showExtendedMatrix)}
            className="self-center bg-transparent border-none text-valuon-green font-extrabold text-xs cursor-pointer underline mt-2 hover:text-valuon-green-light"
          >
            {showExtendedMatrix ? 'Erweiterte Metriken ausblenden' : 'Alle Bank- & Rendite-Metriken einblenden'}
          </button>

          {showExtendedMatrix && (
            <ExtendedMetricsMatrix model={model} />
          )}
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="flex border-b-2 border-valuon-border gap-6 overflow-x-auto whitespace-nowrap">
        {[
          { id: 'Executive Dashboard', label: 'Executive Dashboard' },
          { id: 'Jahresprognose & Detailanalyse', label: 'Jahresprognose & Detailanalyse' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveDashboardTab(tab.id)}
            className={`py-2.5 bg-transparent border-b-3 font-extrabold text-sm cursor-pointer -mb-[2px] transition-colors ${
              (activeDashboardTab === tab.id || (!activeDashboardTab && tab.id === 'Executive Dashboard'))
                ? 'border-valuon-green text-valuon-green font-black'
                : 'border-transparent text-slate-500 hover:text-valuon-green'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {result && (activeDashboardTab === 'Executive Dashboard' || !activeDashboardTab) && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
         <ProjectionChart ekEuroInput={formData?.ek_euro} slicedProjection={model.slicedProjection} />
          <DonutChart formData={formData} model={model} summe_nk={summe_nk} />
        </div>
      )}

      {result && activeDashboardTab === 'Jahresprognose & Detailanalyse' && (
        <TableView slicedProjection={model.slicedProjection} totals={model.totals} />
      )}

      {result && (
        <div className="mt-2 p-3.5 bg-valuon-cream border border-valuon-border rounded-lg text-[0.75rem] text-slate-500 leading-relaxed shadow-sm">
          <strong>Hinweis zu den Modellrechnungen:</strong> Alle berechneten Kennzahlen (z. B. Cashflows, IRR, Renditen und Gesamtgewinne) sind zukunftsgerichtete Prognosen auf Basis deiner Parameter und mathematischer Standard-Investitionsmodelle. Sie dienen als Orientierungshilfe und stellen keine Garantie, Finanz- oder Steuerberatung dar.
        </div>
      )}

    </div>
  );
}

function ExtendedMetricsMatrix({ model }) {
  const { kpis, finanzierung, stammDaten } = model;

  return (
    <div className="bg-white border border-valuon-border rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
      <div>
        <div className="text-sm font-extrabold text-valuon-green border-b-2 border-valuon-border pb-1.5 mb-2">Rendite & Vervielfältiger</div>
        <div className="flex justify-between items-center py-1.5 border-b border-amber-100/50">
          <span className="text-xs text-slate-500 font-semibold">Kaufpreisfaktor:</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{kpis.kaufpreisfaktor.toFixed(1)}x</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-amber-100/50">
          <span className="text-xs text-slate-500 font-semibold">Netto-Kaufpreisfaktor:</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{kpis.nettoKaufpreisfaktor.toFixed(1)}x</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-amber-100/50">
          <span className="text-xs text-slate-500 font-semibold">Netto-Mietrendite (J1):</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{kpis.nettoMietrenditeInitial.toFixed(2)} %</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-transparent">
          <span className="text-xs text-slate-500 font-semibold">Cash-on-Cash Return (J1):</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{kpis.cashOnCashReturn.toFixed(2)} %</strong>
        </div>
      </div>

      <div>
        <div className="text-sm font-extrabold text-valuon-green border-b-2 border-valuon-border pb-1.5 mb-2">Bank & Risikoprofil</div>
        <div className="flex justify-between items-center py-1.5 border-b border-amber-100/50">
          <span className="text-xs text-slate-500 font-semibold">Beleihungsauslauf (LTV):</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{finanzierung.ltv.toFixed(1)} %</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-amber-100/50">
          <span className="text-xs text-slate-500 font-semibold">Eigenkapital-Quote:</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{finanzierung.ekQuote.toFixed(1)} %</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-amber-100/50">
          <span className="text-xs text-slate-500 font-semibold">DSCR (Deckung):</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{kpis.dscrInitial.toFixed(2)}x</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-transparent">
          <span className="text-xs text-slate-500 font-semibold">Break-Even-Miete:</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{formatEuroInt(kpis.breakEvenMieteMo)} € / Mo ({kpis.breakEvenMieteSqmMo.toFixed(2)} €/m²)</strong>
        </div>
      </div>

      <div>
        <div className="text-sm font-extrabold text-valuon-green border-b-2 border-valuon-border pb-1.5 mb-2">Substanz & m²-Kennzahlen</div>
        <div className="flex justify-between items-center py-1.5 border-b border-amber-100/50">
          <span className="text-xs text-slate-500 font-semibold">Kaufpreis pro m²:</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{formatEuroInt(stammDaten.kaufpreisProQm)} € / m²</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-amber-100/50">
          <span className="text-xs text-slate-500 font-semibold">Gesamtkosten pro m²:</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{formatEuroInt(stammDaten.gesamtKostenProQm)} € / m²</strong>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-transparent">
          <span className="text-xs text-slate-500 font-semibold">Eigenkapital-Einsatz:</span>
          <strong className="text-xs text-valuon-green font-extrabold ml-3 text-right">{formatEuroInt(finanzierung.ekEuro)} €</strong>
        </div>
      </div>
    </div>
  );
}
