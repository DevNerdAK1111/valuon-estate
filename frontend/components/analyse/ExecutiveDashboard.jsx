'use client';
import ProjectionChart from '../charts/ProjectionChart';
import DonutChart from '../charts/DonutChart';
import MetricCard from '../ui/MetricCard';
import { formatEuroInt } from '../../utils/formatters';

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
  const propertyTitle = formData?.obj_name || 'Neues Investment-Objekt';
  const locationText = [formData?.stadt, formData?.stadtteil].filter(Boolean).join(' • ') || 'Kein Standort angegeben';

  return (
    <div id="executive-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollMarginTop: '1.5rem' }}>
      
      {/* 1. KOPFZEILE */}
      <div style={{
        background: 'white',
        padding: '1.2rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid #E2D9CE',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: '900',
            color: '#13381A',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {propertyTitle}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {locationText} • {formatEuroInt(formData?.kaufpreis || 0)} € • {formData?.qm || 0} m²
          </div>
        </div>

        {result && (
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#13381A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <line x1="7" y1="3" x2="7" y2="8"></line>
            </svg>
            <span>{saving ? 'Speichert...' : 'In Datenbank speichern'}</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: '700',
          background: saveSuccess.includes('Fehler') ? '#FFF5F5' : '#F0FFF4',
          border: saveSuccess.includes('Fehler') ? '1px solid #FEB2B2' : '1px solid #C6F6D5',
          color: saveSuccess.includes('Fehler') ? '#9B2C2C' : '#22543D'
        }}>
          {saveSuccess}
        </div>
      )}

      {calcError && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: '#FFF5F5',
          border: '1px solid #FEB2B2',
          color: '#9B2C2C',
          fontSize: '0.9rem',
          fontWeight: '700'
        }}>
          Fehler bei der Analyse: {calcError}
        </div>
      )}

      {/* 2. BETRACHTUNGSHORIZONT */}
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

      {/* 3. MENÜ-TABS */}
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

      {/* LEERZUSTAND */}
      {!result && !calcError && (
        <div style={{
          background: 'white',
          padding: '3rem 2rem',
          borderRadius: '12px',
          border: '1px solid #E2D9CE',
          textAlign: 'center',
          color: '#718096'
        }}>
          <h3 style={{ color: '#13381A', margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '800' }}>
            Keine Berechnungsdaten vorhanden
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Passe deine Objektparameter in der linken Maske an und klicke auf <strong>„Investition analysieren“</strong>, um Auswertungen und Prognosen zu erzeugen.
          </p>
        </div>
      )}

      {/* ERGEBNISSE & DASHBOARD INHALTE */}
      {result && (
        <>
          <KeyMetrics 
            result={result}
            monthlyCashflow={monthlyCashflow}
            bruttoMietrendite={bruttoMietrendite}
            actualHorizonYears={actualHorizonYears}
            gesamtGewinnHorizon={gesamtGewinnHorizon}
            cumulatedCashflowHorizon={cumulatedCashflowHorizon}
            endNav={endNav}
          />

          {activeDashboardTab === 'Executive Dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
              <ProjectionChart 
                chartView={chartView}
                setChartView={setChartView}
                slicedProjection={slicedProjection}
              />
              <DonutChart 
                formData={formData}
                summe_nk={summe_nk}
              />
            </div>
          )}

          {(activeDashboardTab === 'Cashflow & Liquidität' || activeDashboardTab === 'Finanzierung & Steuern') && (
            <TableView 
              activeDashboardTab={activeDashboardTab}
              slicedProjection={slicedProjection}
              formData={formData}
            />
          )}
        </>
      )}

    </div>
  );
}

function KeyMetrics({ result, monthlyCashflow, bruttoMietrendite, actualHorizonYears, gesamtGewinnHorizon, cumulatedCashflowHorizon, endNav }) {
  const irrPct = result?.summary?.irr ? (result.summary.irr * 100).toFixed(2) : '0.00';
  const isCfPositive = (monthlyCashflow || 0) >= 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      
      <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Netto Cashflow (monatlich)
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: isCfPositive ? '#276749' : '#9B2C2C', marginTop: '4px' }}>
          {isCfPositive ? '+' : ''}{formatEuroInt(monthlyCashflow || 0)} € / Mo.
        </div>
        <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '4px' }}>
          Nach Kapitaldienst, Bewirtschaftung & Steuern
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Brutto-Mietrendite
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#13381A', marginTop: '4px' }}>
          {(bruttoMietrendite || 0).toFixed(2)} %
        </div>
        <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '4px' }}>
          Miete p.a. / Kaufpreis
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Eigenkapitalrendite (IRR)
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#A37841', marginTop: '4px' }}>
          {irrPct} %
        </div>
        <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '4px' }}>
          Effektive Verzinsung deines EK
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Gesamtgewinn ({actualHorizonYears || 0} J.)
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: (gesamtGewinnHorizon || 0) >= 0 ? '#276749' : '#9B2C2C', marginTop: '4px' }}>
          {(gesamtGewinnHorizon || 0) >= 0 ? '+' : ''}{formatEuroInt(gesamtGewinnHorizon || 0)} €
        </div>
        <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '4px' }}>
          Cashflow ({formatEuroInt(cumulatedCashflowHorizon || 0)} €) + NAV-Aufbau
        </div>
      </div>

    </div>
  );
}

function TableView({ activeDashboardTab, slicedProjection, formData }) {
  const data = slicedProjection || [];
  if (data.length === 0) return null;

  const totals = data.reduce((acc, curr) => {
    const m = Number(curr['Kaltmiete p.a.'] ?? curr['Mieteinnahmen'] ?? curr['Kaltmiete'] ?? curr['Mieteinnahmen p.a.'] ?? curr['miete'] ?? 0);
    const z = Number(curr['Zinszahlung'] ?? curr['Zinsen'] ?? curr['zinsen'] ?? 0);
    const t = Number(curr['Tilgungszahlung'] ?? curr['Tilgung'] ?? curr['tilgung'] ?? 0);
    const st = Number(curr['Sondertilgung'] ?? curr['sondertilgung'] ?? 0);
    const b = Number(curr['Bewirtschaftung'] ?? curr['Kosten'] ?? curr['Bewirtschaftungskosten'] ?? curr['bewirtschaftung'] ?? 0);
    const tax = Number(curr['Steuerliche Auswirkung'] ?? curr['Steuern'] ?? curr['steuern'] ?? 0);
    const cf = Number(curr['Cashflow Netto'] ?? curr['cashflow_netto'] ?? 0);
    const afa = Number(curr['AfA'] ?? curr['AfA-Betrag'] ?? curr['afa'] ?? 0);

    acc.miete += m;
    acc.zins += z;
    acc.tilg += t;
    acc.sondertilg += st;
    acc.kapitaldienst += (z + t);
    acc.bewirtschaftung += b;
    acc.steuer += tax;
    acc.cfNetto += cf;
    acc.afa += afa;
    return acc;
  }, { miete: 0, zins: 0, tilg: 0, sondertilg: 0, kapitaldienst: 0, bewirtschaftung: 0, steuer: 0, cfNetto: 0, afa: 0 });

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2D9CE', padding: '1.5rem', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'right' }}>
        <thead>
          <tr style={{ background: '#FAF8F5', borderBottom: '2px solid #E2D9CE', color: '#13381A' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Jahr</th>
            {activeDashboardTab === 'Cashflow & Liquidität' && (
              <>
                <th style={{ padding: '10px' }}>Kaltmiete p.a.</th>
                <th style={{ padding: '10px' }}>Kapitaldienst (Zins+Tilg)</th>
                <th style={{ padding: '10px' }}>Sondertilgung</th>
                <th style={{ padding: '10px' }}>Bewirtschaftung</th>
                <th style={{ padding: '10px' }}>Steuer-Effekt</th>
                <th style={{ padding: '10px' }}>Cashflow Netto p.a.</th>
                <th style={{ padding: '10px' }}>Cashflow / Monat</th>
              </>
            )}
            {activeDashboardTab === 'Finanzierung & Steuern' && (
              <>
                <th style={{ padding: '10px' }}>Restschuld</th>
                <th style={{ padding: '10px' }}>Zinszahlung</th>
                <th style={{ padding: '10px' }}>Reguläre Tilgung</th>
                <th style={{ padding: '10px' }}>Sondertilgung</th>
                <th style={{ padding: '10px' }}>Gesamte Tilgung</th>
                <th style={{ padding: '10px' }}>AfA-Betrag</th>
                <th style={{ padding: '10px' }}>Zu versteuernder Ertrag</th>
                <th style={{ padding: '10px' }}>Steuer-Auswirkung</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const year = row['Jahr'] || idx + 1;
            const miete = Number(row['Kaltmiete p.a.'] ?? row['Mieteinnahmen'] ?? row['Kaltmiete'] ?? row['Mieteinnahmen p.a.'] ?? row['miete'] ?? (Number(formData?.kaltmiete_monat || 0) * 12));
            const zins = Number(row['Zinszahlung'] ?? row['Zinsen'] ?? row['zinsen'] ?? 0);
            const tilg = Number(row['Tilgungszahlung'] ?? row['Tilgung'] ?? row['tilgung'] ?? 0);
            const sondertilg = Number(row['Sondertilgung'] ?? row['sondertilgung'] ?? 0);
            const kapitaldienst = zins + tilg;
            const bewirtschaftung = Number(row['Bewirtschaftung'] ?? row['Kosten'] ?? row['Bewirtschaftungskosten'] ?? row['bewirtschaftung'] ?? 0);
            const cfNetto = Number(row['Cashflow Netto'] ?? row['cashflow_netto'] ?? 0);
            const cfMonat = cfNetto / 12;
            const steuer = Number(row['Steuerliche Auswirkung'] ?? row['Steuern'] ?? row['steuern'] ?? 0);
            const restschuld = Number(row['Restschuld'] ?? row['restschuld'] ?? 0);
            const afa = Number(row['AfA'] ?? row['AfA-Betrag'] ?? row['afa'] ?? 0);
            const zstErtrag = Number(row['Zu versteuernder Ertrag'] ?? row['zu_versteuernder_ertrag'] ?? (miete - zins - afa));

            const isSteuerRefund = steuer > 0;
            const isSteuerPayment = steuer < 0;

            return (
              <tr key={idx} style={{ borderBottom: '1px solid #E2D9CE', background: idx % 2 === 0 ? 'white' : '#FAF8F5' }}>
                <td style={{ padding: '10px', textAlign: 'left', fontWeight: '800', color: '#13381A' }}>Jahr {year}</td>
                
                {activeDashboardTab === 'Cashflow & Liquidität' && (
                  <>
                    <td style={{ padding: '10px' }}>{formatEuroInt(miete)} €</td>
                    <td style={{ padding: '10px' }}>-{formatEuroInt(kapitaldienst)} €</td>
                    <td style={{ padding: '10px', color: sondertilg > 0 ? '#9B2C2C' : '#718096' }}>-{formatEuroInt(sondertilg)} €</td>
                    <td style={{ padding: '10px' }}>-{formatEuroInt(bewirtschaftung)} €</td>
                    <td style={{
                      padding: '10px',
                      fontWeight: '700',
                      color: isSteuerRefund ? '#276749' : isSteuerPayment ? '#9B2C2C' : '#4A5568'
                    }}>
                      {isSteuerPayment ? '-' : ''}{formatEuroInt(Math.abs(steuer))} €
                    </td>
                    <td style={{ padding: '10px', fontWeight: '800', color: cfNetto >= 0 ? '#276749' : '#9B2C2C' }}>
                      {cfNetto >= 0 ? '+' : ''}{formatEuroInt(cfNetto)} €
                    </td>
                    <td style={{ padding: '10px', fontWeight: '800', color: cfMonat >= 0 ? '#276749' : '#9B2C2C' }}>
                      {cfMonat >= 0 ? '+' : ''}{formatEuroInt(cfMonat)} €
                    </td>
                  </>
                )}

                {activeDashboardTab === 'Finanzierung & Steuern' && (
                  <>
                    <td style={{ padding: '10px', fontWeight: '700' }}>{formatEuroInt(restschuld)} €</td>
                    <td style={{ padding: '10px', color: '#9B2C2C' }}>-{formatEuroInt(zins)} €</td>
                    <td style={{ padding: '10px', color: '#276749' }}>+{formatEuroInt(tilg)} €</td>
                    <td style={{ padding: '10px', color: sondertilg > 0 ? '#276749' : '#718096' }}>+{formatEuroInt(sondertilg)} €</td>
                    <td style={{ padding: '10px', fontWeight: '800', color: '#276749' }}>+{formatEuroInt(tilg + sondertilg)} €</td>
                    <td style={{ padding: '10px' }}>-{formatEuroInt(afa)} €</td>
                    <td style={{ padding: '10px', fontWeight: '700' }}>{formatEuroInt(zstErtrag)} €</td>
                    <td style={{
                      padding: '10px',
                      fontWeight: '800',
                      color: isSteuerRefund ? '#276749' : isSteuerPayment ? '#9B2C2C' : '#4A5568'
                    }}>
                      {isSteuerPayment ? '-' : ''}{formatEuroInt(Math.abs(steuer))} €
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr style={{ background: '#13381A', color: 'white', fontWeight: '800', borderTop: '2px solid #13381A' }}>
            <td style={{ padding: '12px', textAlign: 'left' }}>Summe ({data.length} J.)</td>
            {activeDashboardTab === 'Cashflow & Liquidität' && (
              <>
                <td style={{ padding: '12px' }}>{formatEuroInt(totals.miete)} €</td>
                <td style={{ padding: '12px' }}>-{formatEuroInt(totals.kapitaldienst)} €</td>
                <td style={{ padding: '12px' }}>-{formatEuroInt(totals.sondertilg)} €</td>
                <td style={{ padding: '12px' }}>-{formatEuroInt(totals.bewirtschaftung)} €</td>
                <td style={{ padding: '12px' }}>
                  {totals.steuer < 0 ? '-' : ''}{formatEuroInt(Math.abs(totals.steuer))} €
                </td>
                <td style={{ padding: '12px' }}>
                  {totals.cfNetto >= 0 ? '+' : ''}{formatEuroInt(totals.cfNetto)} €
                </td>
                <td style={{ padding: '12px' }}>-</td>
              </>
            )}
            {activeDashboardTab === 'Finanzierung & Steuern' && (
              <>
                <td style={{ padding: '12px' }}>-</td>
                <td style={{ padding: '12px' }}>-{formatEuroInt(totals.zins)} €</td>
                <td style={{ padding: '12px' }}>+{formatEuroInt(totals.tilg)} €</td>
                <td style={{ padding: '12px' }}>+{formatEuroInt(totals.sondertilg)} €</td>
                <td style={{ padding: '12px' }}>+{formatEuroInt(totals.tilg + totals.sondertilg)} €</td>
                <td style={{ padding: '12px' }}>-{formatEuroInt(totals.afa)} €</td>
                <td style={{ padding: '12px' }}>-</td>
                <td style={{ padding: '12px' }}>
                  {totals.steuer < 0 ? '-' : ''}{formatEuroInt(Math.abs(totals.steuer))} €
                </td>
              </>
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
