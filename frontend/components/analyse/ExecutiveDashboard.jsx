'use client';
import MetricCard from '../ui/MetricCard';
import DonutChart from '../charts/DonutChart';
import ProjectionChart from '../charts/ProjectionChart';
import { formatEuro, formatEuroInt, formatPct } from '../../utils/formatters';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568' };
const inputTextStyle = { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' };

export default function ExecutiveDashboard({
  formData,
  result,
  projectionHorizon,
  setProjectionHorizon,
  handleSaveToDatabase,
  saving,
  saveSuccess,
  calcError,
  monthlyCashflow,
  bruttoMietrendite,
  actualHorizonYears,
  gesamtGewinnHorizon,
  activeDashboardTab,
  setActiveDashboardTab,
  chartView,
  setChartView,
  slicedProjection,
  summe_nk,
  tableTheme,
  setTableTheme,
  cumulatedCashflowHorizon,
  endNav
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER & HORIZON SELECTOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2D9CE', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#13381A', margin: '0 0 4px 0', letterSpacing: '-0.8px' }}>
            {formData.obj_name || 'Muster Wohnung'}
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '500' }}>
            Kaufpreis: {formatEuroInt(formData.kaufpreis)} € | EK: {formatEuroInt(formData.ek_euro)} € ({formatPct(formData.kaufpreis > 0 ? (formData.ek_euro / formData.kaufpreis) * 100 : 0)} %)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <label style={{ ...labelStyle, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Projektionshorizont:</label>
            <select
              value={projectionHorizon}
              onChange={(e) => setProjectionHorizon(e.target.value)}
              style={{ ...inputTextStyle, background: '#FAF8F5', fontWeight: 'bold', padding: '6px 12px' }}
            >
              <option value="10">10 Jahre (Standard)</option>
              <option value="15">15 Jahre</option>
              <option value="20">20 Jahre</option>
              <option value="25">25 Jahre</option>
              <option value="30">30 Jahre</option>
              <option value="payoff">Bis Darlehen vollständig getilgt ist</option>
            </select>
          </div>

          {result && result.summary && (
            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={saving}
              style={{
                padding: '10px 18px',
                background: '#13381A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(19,56,26,0.2)',
                height: '36px',
                alignSelf: 'flex-end'
              }}
            >
              {saving ? 'Speichere...' : 'In Datenbank speichern'}
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div style={{ padding: '12px', background: '#E6FFFA', color: '#234E52', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #B2F5EA' }}>
          {saveSuccess}
        </div>
      )}

      {calcError && (
        <div style={{ padding: '14px 18px', background: '#FFF5F5', color: '#9B2C2C', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #FEB2B2' }}>
          <strong>Fehler bei der Berechnung:</strong> {calcError}
        </div>
      )}

      {/* METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <MetricCard title="CASHFLOW NETTO" value={`${formatEuro(monthlyCashflow)} €/M`} isNegative={monthlyCashflow < 0} />
        <MetricCard title="BRUTTOMIETRENDITE" value={`${formatPct(bruttoMietrendite)} %`} />
        <MetricCard title={`GESAMTGEWINN (${actualHorizonYears} J.)`} value={`${formatEuroInt(result ? gesamtGewinnHorizon : 0)} €`} />
        <MetricCard title="EK-RENDITE P.A. (IRR)" value={`${formatPct((result?.summary?.irr || 0) * 100)} %`} highlight={true} />
      </div>

      {/* TAB SWITCHER */}
      <div style={{ borderBottom: '2px solid #E2D9CE', display: 'flex', gap: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveDashboardTab('Executive Dashboard')}
          style={{
            background: 'none',
            border: 'none',
            paddingBottom: '10px',
            fontSize: '0.95rem',
            fontWeight: '800',
            color: activeDashboardTab === 'Executive Dashboard' ? '#13381A' : '#718096',
            borderBottom: activeDashboardTab === 'Executive Dashboard' ? '3px solid #13381A' : 'none',
            cursor: 'pointer'
          }}
        >
          Executive Dashboard
        </button>
        <button
          type="button"
          onClick={() => setActiveDashboardTab('Liquiditätsverlauf & Tilgung')}
          style={{
            background: 'none',
            border: 'none',
            paddingBottom: '10px',
            fontSize: '0.95rem',
            fontWeight: '800',
            color: activeDashboardTab === 'Liquiditätsverlauf & Tilgung' ? '#13381A' : '#718096',
            borderBottom: activeDashboardTab === 'Liquiditätsverlauf & Tilgung' ? '3px solid #13381A' : 'none',
            cursor: 'pointer'
          }}
        >
          Liquiditätsverlauf & Tilgung
        </button>
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeDashboardTab === 'Executive Dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#13381A' }}>
              Projektion & Wertentwicklung
            </h3>
            
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginBottom: '4px' }}>Grafik-Ansicht wählen:</label>
              <select 
                value={chartView} 
                onChange={(e) => setChartView(e.target.value)} 
                style={{ ...inputTextStyle, background: '#FAF8F5', fontWeight: '600' }}
              >
                <option value="1. Vermögensstruktur & NAV (Netto-Eigenkapital)">1. Vermögensstruktur & NAV (Netto-Eigenkapital)</option>
                <option value="2. Cashflow & Mieteinnahmen">2. Cashflow & Mieteinnahmen</option>
              </select>
            </div>

            <ProjectionChart projection={slicedProjection} kaufpreis={formData.kaufpreis} view={chartView} />
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#13381A' }}>
              Kapitalstruktur (Initial)
            </h3>

            <DonutChart 
              totalInvestment={result?.summary?.total_investment || (formData.kaufpreis + summe_nk)}
              equity={formData.ek_euro}
              kfw={formData.kfw_amt}
              hb={Math.max(0, (formData.kaufpreis + summe_nk) - formData.ek_euro - formData.kfw_amt)}
            />
          </div>
        </div>
      )}

      {/* TAB 2: LIQUIDITÄT & TILGUNG */}
      {activeDashboardTab === 'Liquiditätsverlauf & Tilgung' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800', color: '#13381A' }}>
            Liquiditätsverlauf, steuerliche Abschreibung & Kapitalentwicklung
          </h3>
          <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.85rem', color: '#718096' }}>
            Wähle einen Themenbereich, um alle Kennzahlen übersichtlich zu betrachten.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.2rem', borderBottom: '1px solid #E2D9CE', paddingBottom: '8px' }}>
            {['Mieten & Cashflow', 'Kapitaldienst & Steuern', 'Vermögen & Bilanz'].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setTableTheme(theme)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  color: tableTheme === theme ? '#A37841' : '#718096',
                  cursor: 'pointer',
                  borderBottom: tableTheme === theme ? '2px solid #A37841' : 'none',
                  paddingBottom: '4px'
                }}
              >
                {theme}
              </button>
            ))}
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr style={{ background: '#FAF8F5', borderBottom: '2px solid #E2D9CE', color: '#4A5568' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Jahr</th>
                  {tableTheme === 'Mieten & Cashflow' && (
                    <>
                      <th style={{ padding: '10px' }}>Mietrendite (brutto)</th>
                      <th style={{ padding: '10px' }}>Kaltmiete (brutto)</th>
                      <th style={{ padding: '10px' }}>Reinertrag (NOI)</th>
                      <th style={{ padding: '10px' }}>Cashflow (vor St.)</th>
                      <th style={{ padding: '10px' }}>Cashflow (nach St.)</th>
                    </>
                  )}
                  {tableTheme === 'Kapitaldienst & Steuern' && (
                    <>
                      <th style={{ padding: '10px' }}>Zinsen</th>
                      <th style={{ padding: '10px' }}>Tilgung (dynamisch)</th>
                      <th style={{ padding: '10px' }}>Kapitaldienst</th>
                      <th style={{ padding: '10px' }}>AfA</th>
                      <th style={{ padding: '10px' }}>Steuer / Erstattung</th>
                    </>
                  )}
                  {tableTheme === 'Vermögen & Bilanz' && (
                    <>
                      <th style={{ padding: '10px' }}>Immobilienwert</th>
                      <th style={{ padding: '10px' }}>Restschuld</th>
                      <th style={{ padding: '10px' }}>Netto-EK (NAV)</th>
                      <th style={{ padding: '10px' }}>LTV (%)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {slicedProjection.map((row, idx) => {
                  const yr = row['Jahr'] || idx + 1;
                  const mietrendite = formData.kaufpreis > 0 ? ((row['Mieteinnahmen IST'] || 0) / formData.kaufpreis) * 100 : 0;
                  const noi = (row['Effektive Miete'] || row['Mieteinnahmen IST'] || 0) - (row['Bewirtschaftungskosten'] || 0);
                  const cfVorSteuer = (row['Cashflow Netto'] || 0) + (row['Steuer'] || 0);
                  const nav = (row['Immobilienwert'] || 0) - (row['Restschuld'] || 0);
                  const ltv = row['Immobilienwert'] > 0 ? ((row['Restschuld'] || 0) / row['Immobilienwert']) * 100 : 0;
                  const taxVal = row['Steuer'] || 0;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2D9CE' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 'bold' }}>{yr}</td>
                      {tableTheme === 'Mieten & Cashflow' && (
                        <>
                          <td style={{ padding: '8px 10px' }}>{formatPct(mietrendite)} %</td>
                          <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['Mieteinnahmen IST'])} €</td>
                          <td style={{ padding: '8px 10px' }}>{formatEuroInt(noi)} €</td>
                          <td style={{ padding: '8px 10px', color: cfVorSteuer < 0 ? '#9B2C2C' : 'inherit' }}>{formatEuroInt(cfVorSteuer)} €</td>
                          <td style={{ padding: '8px 10px', fontWeight: 'bold', color: row['Cashflow Netto'] < 0 ? '#9B2C2C' : '#13381A' }}>
                            {formatEuroInt(row['Cashflow Netto'])} €
                          </td>
                        </>
                      )}
                      {tableTheme === 'Kapitaldienst & Steuern' && (
                        <>
                          <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['Zinsen'])} €</td>
                          <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#13381A' }}>{formatEuroInt(row['Tilgung'])} €</td>
                          <td style={{ padding: '8px 10px' }}>{formatEuroInt((row['Zinsen'] || 0) + (row['Tilgung'] || 0))} €</td>
                          <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['AfA'])} €</td>
                          <td style={{ padding: '8px 10px', fontWeight: 'bold', color: taxVal < 0 ? '#38A169' : (taxVal > 0 ? '#9B2C2C' : 'inherit') }}>
                            {taxVal < 0 
                              ? `-${formatEuroInt(Math.abs(taxVal))} € (Erstattung)` 
                              : (taxVal > 0 ? `+${formatEuroInt(taxVal)} €` : '0 €')}
                          </td>
                        </>
                      )}
                      {tableTheme === 'Vermögen & Bilanz' && (
                        <>
                          <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['Immobilienwert'])} €</td>
                          <td style={{ padding: '8px 10px' }}>{formatEuroInt(row['Restschuld'])} €</td>
                          <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#A37841' }}>{formatEuroInt(nav)} €</td>
                          <td style={{ padding: '8px 10px' }}>{formatPct(ltv)} %</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
