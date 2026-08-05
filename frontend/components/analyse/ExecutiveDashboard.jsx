'use client';
import KeyMetrics from './KeyMetrics';
import ProjectionChart from './ProjectionChart';
import TableView from './TableView';
import { IconSave } from '../ui/Icons';
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
  const propertyTitle = formData.obj_name || 'Neues Investment-Objekt';
  const locationText = [formData.stadt, formData.stadtteil].filter(Boolean).join(' • ') || 'Kein Standort angegeben';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* KOPFZEILE MIT OBJ-NAME (EINZEILIG TRIMMED) UND DATENBANK-SPEICHERN BUTTON */}
      <div style={{
        background: 'white',
        padding: '1.2rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid #E2D9CE',
        display: 'flex',
        justify: 'space-between',
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
            {locationText} • {formatEuroInt(formData.kaufpreis)} € • {formData.qm} m²
          </div>
        </div>

        {/* SPEICHERN-BUTTON: FLEXIBLES LAYOUT FÜR KORREKTE SCHRIFTANZEIGE */}
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
            <IconSave />
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

      {/* TAB-NAVIGATION DES DASHBOARDS */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2D9CE', gap: '1.5rem' }}>
        {['Executive Dashboard', 'Liquiditätsverlauf (Tabelle)', 'Finanzierung & Tilgung', 'Steuern & AfA'].map((tab) => (
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

      {/* LEERZUSTAND VOR DER ERSTEN BERECHNUNG */}
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

      {/* DASHBOARD INHALTE WENN ERGEBNIS DA IST */}
      {result && (
        <>
          {/* HORIZONT-FILTER (10 JAHRE, 20 JAHRE, BIS TILGUNG) */}
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

          {/* KENNZAHLEN-BOXEN (KEY METRICS) */}
          <KeyMetrics 
            result={result}
            monthlyCashflow={monthlyCashflow}
            bruttoMietrendite={bruttoMietrendite}
            actualHorizonYears={actualHorizonYears}
            gesamtGewinnHorizon={gesamtGewinnHorizon}
            cumulatedCashflowHorizon={cumulatedCashflowHorizon}
            endNav={endNav}
          />

          {/* TAB 1: EXECUTIVE DASHBOARD (GRAFIKEN) */}
          {activeDashboardTab === 'Executive Dashboard' && (
            <ProjectionChart 
              chartView={chartView}
              setChartView={setChartView}
              slicedProjection={slicedProjection}
            />
          )}

          {/* TAB 2 & STEUERN: TABELLEN-ANSICHT */}
          {(activeDashboardTab === 'Liquiditätsverlauf (Tabelle)' || activeDashboardTab === 'Finanzierung & Tilgung' || activeDashboardTab === 'Steuern & AfA') && (
            <TableView 
              activeDashboardTab={activeDashboardTab}
              slicedProjection={slicedProjection}
              tableTheme={tableTheme}
              setTableTheme={setTableTheme}
              formData={formData}
              summe_nk={summe_nk}
            />
          )}
        </>
      )}

    </div>
  );
}
