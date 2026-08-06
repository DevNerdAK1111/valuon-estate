'use client';
import ProjectionChart from '../charts/ProjectionChart';
import DonutChart from '../charts/DonutChart';
import { calculateInvestmentModel } from '../../utils/calculateInvestment';
import { formatEuroInt } from '../../utils/formatters';

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
  const propertyTitle = formData?.obj_name || 'Neues Investment-Objekt';
  const locationText = [formData?.stadt, formData?.stadtteil].filter(Boolean).join(' • ') || 'Kein Standort angegeben';

  // ZENTRALE INVESTITIONS-BERECHNUNG (SINGLE SOURCE OF TRUTH)
  const model = calculateInvestmentModel(formData, projectionHorizon, result);

  return (
    <div id="executive-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollMarginTop: '1.5rem' }}>
      
      {/* KOPFZEILE & SPEICHER-BUTTON */}
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

      {/* KPI KARTEN (KONSUMIERT NURE NOCH IMMUTABLE MODEL-KPIS) */}
      {result && (
        <KeyMetrics kpis={model.kpis} />
      )}

      {/* TAB NAVIGATION */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2D9CE', gap: '1.5rem' }}>
        {['Executive Dashboard', 'Cashflow & Liquidität', 'Finanzierung & Steuern'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveDashboardTab(tab)}
            style={{
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeDashboardTab === tab ? '3px solid #13381A' : '3px solid transparent',
              color: activeDashboardTab === tab ? '#13381A' : '#718096',
              fontWeight: activeDashboardTab === tab ? '800' : '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DASHBOARD INHALTE */}
      {result && activeDashboardTab === 'Executive Dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          <ProjectionChart slicedProjection={model.slicedProjection} />
          <DonutChart formData={formData} summe_nk={summe_nk} />
        </div>
      )}

    </div>
  );
}

// -----------------------------------------------------------------------------
// REINE PRÄSENTATIONS-KOMPONENTE FÜR KPI KARTEN
// -----------------------------------------------------------------------------

function KeyMetrics({ kpis }) {
  const { avgMonthlyCashflow, isCfPositive, avgBruttoRendite, validIrr, gesamtGewinn, horizonYears } = kpis;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      
      {/* KARTE 1: CASHFLOW */}
      <div style={kpiCardStyle}>
        <div style={kpiTitleStyle}>Netto-Cashflow (Ø / Mo)</div>
        <div style={{ ...kpiValueStyle, color: isCfPositive ? '#276749' : '#9B2C2C' }}>
          {isCfPositive ? '+' : ''}{formatEuroInt(avgMonthlyCashflow)} € / Mo.
        </div>
        <div style={kpiSubtextStyle}>Durchschnitt pro Monat über {horizonYears} Jahre</div>
      </div>

      {/* KARTE 2: MIETRENDITE */}
      <div style={kpiCardStyle}>
        <div style={kpiTitleStyle}>Brutto-Mietrendite (Ø p.a.)</div>
        <div style={{ ...kpiValueStyle, color: '#13381A' }}>
          {avgBruttoRendite.toFixed(2)} %
        </div>
        <div style={kpiSubtextStyle}>Durchschnittliche Miete p.a. / Kaufpreis</div>
      </div>

      {/* KARTE 3: EK-RENDITE (IRR) */}
      <div style={kpiCardStyle}>
        <div style={kpiTitleStyle}>Eigenkapitalrendite (IRR)</div>
        <div style={{ ...kpiValueStyle, color: '#A37841' }}>
          {validIrr.toFixed(2)} %
        </div>
        <div style={kpiSubtextStyle}>Effektive EK-Verzinsung bei Exit nach {horizonYears} J.</div>
      </div>

      {/* KARTE 4: GESAMTGEWINN */}
      <div style={kpiCardStyle}>
        <div style={kpiTitleStyle}>Gesamtgewinn ({horizonYears} J.)</div>
        <div style={{ ...kpiValueStyle, color: gesamtGewinn >= 0 ? '#276749' : '#9B2C2C' }}>
          {gesamtGewinn >= 0 ? '+' : ''}{formatEuroInt(gesamtGewinn)} €
        </div>
        <div style={kpiSubtextStyle}>Kumulierter Cashflow + Netto-EK-Zuwachs</div>
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
