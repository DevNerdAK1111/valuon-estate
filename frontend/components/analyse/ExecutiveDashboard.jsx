'use client';
import { useState } from 'react';
import ProjectionChart from '../charts/ProjectionChart';
import DonutChart from '../charts/DonutChart';
import TableView from './TableView';
import { calculateInvestmentModel } from '../../utils/calculateInvestment';
import { formatEuroInt } from '../../utils/formatters';

const KPI_OPTIONS = [
  { id: 'cf', label: 'Netto-Cashflow (Ø / Mo)', getValue: (m) => `${m.kpis.isCfPositive ? '+' : ''}${formatEuroInt(m.kpis.avgMonthlyCashflow)} € / Mo.`, getSub: (m) => `Ø pro Monat n. St. (${m.kpis.horizonYears} J.)`, isPos: (m) => m.kpis.isCfPositive },
  { id: 'brutto', label: 'Brutto-Mietrendite (Ø p.a.)', getValue: (m) => `${m.kpis.avgBruttoRendite.toFixed(2)} %`, getSub: () => 'Ø Miete p.a. / Kaufpreis', color: '#13381A' },
  { id: 'irr', label: 'Eigenkapitalrendite (IRR)', getValue: (m) => `${m.kpis.validIrr.toFixed(2)} %`, getSub: (m) => `Effektive EK-Verzinsung bei Exit (${m.kpis.horizonYears} J.)`, color: '#A37841' },
  { id: 'gewinn', label: 'Gesamtgewinn (Horizon)', getValue: (m) => `${m.kpis.gesamtGewinn >= 0 ? '+' : ''}${formatEuroInt(m.kpis.gesamtGewinn)} €`, getSub: () => 'Kum. Cashflow + NAV Zuwachs', isPos: (m) => m.kpis.gesamtGewinn >= 0 },
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
  saving,
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
    <div id="executive-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      
      {/* KOPFZEILE */}
      <div style={{ background: 'white', padding: '1.2rem 1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#13381A', margin: 0 }}>{propertyTitle}</h2>
          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '2px' }}>
            {locationText} • {formatEuroInt(formData?.kaufpreis || 0)} € • {formData?.qm || 0} m²
          </div>
        </div>

        {result && (
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={saving}
            style={{ padding: '10px 18px', background: '#13381A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {saving ? 'Speichert...' : 'In Datenbank speichern'}
          </button>
        )}
      </div>

      {/* BETRACHTUNGSHORIZONT SCHALTER */}
      {result && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2D9CE' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A' }}>Betrachtungshorizont:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
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
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #E2D9CE',
                  background: projectionHorizon === h.value ? '#13381A' : '#FAF8F5',
                  color: projectionHorizon === h.value ? 'white' : '#13381A',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI KARTEN */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Wichtigste Kennzahlen
            </span>
            <button
              type="button"
              onClick={() => setIsCustomizingKpis(!isCustomizingKpis)}
              style={{ background: 'none', border: 'none', color: '#13381A', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isCustomizingKpis ? 'Auswahl schließen' : 'Karten anpassen'}
            </button>
          </div>

          {isCustomizingKpis && (
            <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {selectedKpiIds.map((currentId, slotIdx) => (
                <div key={slotIdx}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#13381A', marginBottom: '4px' }}>
                    Karte {slotIdx + 1}
                  </label>
                  <select
                    value={currentId}
                    onChange={(e) => handleKpiSelect(slotIdx, e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '0.78rem', fontWeight: '600', color: '#2D3748', background: 'white' }}
                  >
                    {KPI_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {selectedKpiIds.map((kpiId, idx) => {
              const config = KPI_OPTIONS.find(o => o.id === kpiId) || KPI_OPTIONS[0];
              const valueStr = config.getValue(model);
              const subStr = config.getSub(model);
              const cardColor = config.isPos ? (config.isPos(model) ? '#276749' : '#9B2C2C') : config.color;

              return (
                <div key={idx} style={kpiCardStyle}>
                  <div style={kpiTitleStyle}>{config.label}</div>
                  <div style={{ ...kpiValueStyle, color: cardColor }}>
                    {valueStr}
                  </div>
                  <div style={kpiSubtextStyle}>{subStr}</div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowExtendedMatrix(!showExtendedMatrix)}
            style={{
              alignSelf: 'center',
              background: 'none',
              border: 'none',
              color: '#13381A',
              fontWeight: '800',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '0.25rem'
            }}
          >
            {showExtendedMatrix ? 'Erweiterte Metriken ausblenden' : 'Alle Bank- & Rendite-Metriken einblenden'}
          </button>

          {showExtendedMatrix && (
            <ExtendedMetricsMatrix model={model} />
          )}
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2D9CE', gap: '1.5rem' }}>
        {[
          { id: 'Executive Dashboard', label: 'Executive Dashboard' },
          { id: 'Jahresprognose & Detailanalyse', label: 'Jahresprognose & Detailanalyse' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveDashboardTab(tab.id)}
            style={{
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: (activeDashboardTab === tab.id || (!activeDashboardTab && tab.id === 'Executive Dashboard')) ? '3px solid #13381A' : '3px solid transparent',
              color: (activeDashboardTab === tab.id || (!activeDashboardTab && tab.id === 'Executive Dashboard')) ? '#13381A' : '#718096',
              fontWeight: (activeDashboardTab === tab.id || (!activeDashboardTab && tab.id === 'Executive Dashboard')) ? '800' : '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {result && (activeDashboardTab === 'Executive Dashboard' || !activeDashboardTab) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          <ProjectionChart slicedProjection={model.slicedProjection} />
          <DonutChart formData={formData} summe_nk={summe_nk} />
        </div>
      )}

      {/* TAB 2: JAHRESPROGNOSE & DETAILANALYSE */}
      {result && activeDashboardTab === 'Jahresprognose & Detailanalyse' && (
        <TableView slicedProjection={model.slicedProjection} totals={model.totals} />
      )}

    </div>
  );
}

function ExtendedMetricsMatrix({ model }) {
  const { kpis, finanzierung, stammDaten } = model;

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2D9CE',
      borderRadius: '10px',
      padding: '1.25rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem'
    }}>
      <div>
        <div style={matrixHeaderStyle}>Rendite & Vervielfältiger</div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Kaufpreisfaktor:</span>
          <strong style={matrixValueStyle}>{kpis.kaufpreisfaktor.toFixed(1)}x</strong>
        </div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Netto-Kaufpreisfaktor:</span>
          <strong style={matrixValueStyle}>{kpis.nettoKaufpreisfaktor.toFixed(1)}x</strong>
        </div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Netto-Mietrendite (J1):</span>
          <strong style={matrixValueStyle}>{kpis.nettoMietrenditeInitial.toFixed(2)} %</strong>
        </div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Cash-on-Cash Return (J1):</span>
          <strong style={matrixValueStyle}>{kpis.cashOnCashReturn.toFixed(2)} %</strong>
        </div>
      </div>

      <div>
        <div style={matrixHeaderStyle}>Bank & Risikoprofil</div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Beleihungsauslauf (LTV):</span>
          <strong style={matrixValueStyle}>{finanzierung.ltv.toFixed(1)} %</strong>
        </div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Eigenkapital-Quote:</span>
          <strong style={matrixValueStyle}>{finanzierung.ekQuote.toFixed(1)} %</strong>
        </div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>DSCR (Deckung):</span>
          <strong style={matrixValueStyle}>{kpis.dscrInitial.toFixed(2)}x</strong>
        </div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Break-Even-Miete:</span>
          <strong style={matrixValueStyle}>{formatEuroInt(kpis.breakEvenMieteMo)} € / Mo ({kpis.breakEvenMieteSqmMo.toFixed(2)} €/m²)</strong>
        </div>
      </div>

      <div>
        <div style={matrixHeaderStyle}>Substanz & m²-Kennzahlen</div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Kaufpreis pro m²:</span>
          <strong style={matrixValueStyle}>{formatEuroInt(stammDaten.kaufpreisProQm)} € / m²</strong>
        </div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Gesamtkosten pro m²:</span>
          <strong style={matrixValueStyle}>{formatEuroInt(stammDaten.gesamtKostenProQm)} € / m²</strong>
        </div>
        <div style={matrixRowStyle}>
          <span style={matrixLabelStyle}>Eigenkapital-Einsatz:</span>
          <strong style={matrixValueStyle}>{formatEuroInt(finanzierung.ekEuro)} €</strong>
        </div>
      </div>
    </div>
  );
}

const kpiCardStyle = {
  background: 'white',
  border: '1px solid #E2D9CE',
  borderRadius: '10px',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '100px'
};

const kpiTitleStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  color: '#718096',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const kpiValueStyle = {
  fontSize: '1.4rem',
  fontWeight: '900',
  margin: '4px 0'
};

const kpiSubtextStyle = {
  fontSize: '0.75rem',
  color: '#718096',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const matrixHeaderStyle = {
  fontSize: '0.85rem',
  fontWeight: '800',
  color: '#13381A',
  borderBottom: '2px solid #E2D9CE',
  paddingBottom: '6px',
  marginBottom: '8px'
};

const matrixRowStyle = {
  display: 'flex',
  justify: 'space-between',
  alignItems: 'center',
  padding: '5px 0',
  borderBottom: '1px solid #F0EBE1'
};

const matrixLabelStyle = {
  fontSize: '0.78rem',
  color: '#718096',
  fontWeight: '600'
};

const matrixValueStyle = {
  fontSize: '0.82rem',
  color: '#13381A',
  fontWeight: '800',
  marginLeft: '12px',
  textAlign: 'right'
};
