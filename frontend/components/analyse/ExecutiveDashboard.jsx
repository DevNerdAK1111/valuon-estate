'use client';
import ProjectionChart from '../charts/ProjectionChart';
import DonutChart from '../charts/DonutChart';
import { formatEuroInt } from '../../utils/formatters';

// HELPER: HILFSFUNKTION FÜR PRÄZISE IRR-BERECHNUNG (NEWTON-RAPHSON MODELL)
function calculateIRR(cfs, guess = 0.1) {
  const maxIter = 100;
  const precision = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cfs.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cfs[t] / denom;
      dnpv -= (t * cfs[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < precision) return rate;
    if (Math.abs(dnpv) < precision) break;
    const newRate = rate - npv / dnpv;
    if (isNaN(newRate) || !isFinite(newRate)) break;
    rate = newRate;
  }
  return rate;
}

export default function ExecutiveDashboard({
  formData,
  result,
  projectionHorizon,
  setProjectionHorizon,
  handleSaveToDatabase,
  saving,
  activeDashboardTab,
  setActiveDashboardTab,
  chartView,
  setChartView,
  slicedProjection,
  summe_nk
}) {
  const propertyTitle = formData?.obj_name || 'Neues Investment-Objekt';
  const locationText = [formData?.stadt, formData?.stadtteil].filter(Boolean).join(' • ') || 'Kein Standort angegeben';

  return (
    <div id="executive-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollMarginTop: '1.5rem' }}>
      
      {/* KOPFZEILE & BETRACHTUNGSHORIZONT */}
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
        <KeyMetrics 
          formData={formData}
          slicedProjection={slicedProjection}
        />
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
          <ProjectionChart chartView={chartView} setChartView={setChartView} slicedProjection={slicedProjection} />
          <DonutChart formData={formData} summe_nk={summe_nk} />
        </div>
      )}

    </div>
  );
}

// -----------------------------------------------------------------------------
// VEREINHEITLICHTE KPI KARTEN
// -----------------------------------------------------------------------------

function KeyMetrics({ formData, slicedProjection }) {
  const data = slicedProjection || [];
  const yearsCount = data.length || 1;
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const ekEuro = Number(formData?.ek_euro || 0);

  // 1. DURCHSCHNITTLICHER MONATLICHER CASHFLOW ÜBER DEN HORIZONT
  const totalNetCashflow = data.reduce((sum, row) => {
    return sum + Number(row['Cashflow Netto'] ?? row['cashflow_netto'] ?? 0);
  }, 0);
  const avgMonthlyCashflow = totalNetCashflow / (yearsCount * 12);
  const isCfPositive = avgMonthlyCashflow >= 0;

  // 2. DURCHSCHNITTLICHE BRUTTO-MIETRENDITE ÜBER DEN HORIZONT
  const totalRent = data.reduce((sum, row) => {
    return sum + Number(row['Kaltmiete p.a.'] ?? row['Mieteinnahmen'] ?? row['miete'] ?? (Number(formData?.kaltmiete_monat || 0) * 12));
  }, 0);
  const avgRentPerYear = totalRent / yearsCount;
  const avgBruttoRendite = kaufpreis > 0 ? (avgRentPerYear / kaufpreis) * 100 : 0;

  // 3. EXAKTE IRR BERECHNUNG (EK-RENDITE BEI EXIT NACH N JAHREN)
  const lastRow = data[data.length - 1] || {};
  const exitPropertyValue = Number(lastRow['Immobilienwert'] ?? (kaufpreis * Math.pow(1 + (formData?.val_inc || 1) / 100, yearsCount)));
  const exitRestschuld = Number(lastRow['Restschuld'] ?? lastRow['restschuld'] ?? 0);
  const exitCosts = exitPropertyValue * (Number(formData?.exit_cost || 0) / 100);
  
  const netExitProceeds = exitPropertyValue - exitCosts - exitRestschuld;

  const cashflowsForIRR = [-ekEuro];
  data.forEach((row, idx) => {
    const cf = Number(row['Cashflow Netto'] ?? row['cashflow_netto'] ?? 0);
    if (idx === data.length - 1) {
      cashflowsForIRR.push(cf + netExitProceeds);
    } else {
      cashflowsForIRR.push(cf);
    }
  });

  const irrRate = ekEuro > 0 ? calculateIRR(cashflowsForIRR) * 100 : 0;
  const validIrr = isNaN(irrRate) || !isFinite(irrRate) ? 0 : irrRate;

  // 4. GESAMTGEWINN ÜBER DEN HORIZONT
  const gesamtGewinn = totalNetCashflow + (netExitProceeds - ekEuro);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      
      {/* KARTE 1: CASHFLOW */}
      <div style={kpiCardStyle}>
        <div style={kpiTitleStyle}>Netto-Cashflow (Ø / Mo)</div>
        <div style={{ ...kpiValueStyle, color: isCfPositive ? '#276749' : '#9B2C2C' }}>
          {isCfPositive ? '+' : ''}{formatEuroInt(avgMonthlyCashflow)} € / Mo.
        </div>
        <div style={kpiSubtextStyle}>Durchschnitt pro Monat über {yearsCount} Jahre</div>
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
        <div style={kpiSubtextStyle}>Effektive EK-Verzinsung bei Exit nach {yearsCount} J.</div>
      </div>

      {/* KARTE 4: GESAMTGEWINN */}
      <div style={kpiCardStyle}>
        <div style={kpiTitleStyle}>Gesamtgewinn ({yearsCount} J.)</div>
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
