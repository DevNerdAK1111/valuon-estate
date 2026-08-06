'use client';
import { useState } from 'react';
import { formatEuroInt } from '../../utils/formatters';

export default function TableView({ slicedProjection, totals }) {
  const [viewMode, setViewMode] = useState('kompakt');

  const data = slicedProjection || [];
  const sumData = totals || {
    miete: 0,
    opex: 0,
    noi: 0,
    zins: 0,
    tilgung: 0,
    kapitaldienst: 0,
    afaEuro: 0,
    zuVersteuerndesEinkommen: 0,
    steuerErgebnis: 0,
    cashflowNachSteuerPa: 0
  };

  const lastRow = data[data.length - 1] || {};

  return (
    <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER & ANSICHTS-UMSCHALTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#13381A' }}>
            Jahresbezogene Finanzfluss-Prognose
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>
            Detaillierte Entwicklung aller Einnahmen, Ausgaben, Tilgungs- und Steuerflüsse pro Jahr
          </span>
        </div>

        <div style={{ display: 'flex', background: '#FAF8F5', padding: '4px', borderRadius: '8px', border: '1px solid #E2D9CE', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setViewMode('kompakt')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'kompakt' ? '#13381A' : 'transparent',
              color: viewMode === 'kompakt' ? 'white' : '#4A5568',
              fontWeight: viewMode === 'kompakt' ? '800' : '600',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Kompakt-Ansicht
          </button>
          <button
            type="button"
            onClick={() => setViewMode('vollstaendig')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'vollstaendig' ? '#13381A' : 'transparent',
              color: viewMode === 'vollstaendig' ? 'white' : '#4A5568',
              fontWeight: viewMode === 'vollstaendig' ? '800' : '600',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Vollständige Details
          </button>
        </div>
      </div>

      {/* ISOLIERTER SCROLL-CONTAINER */}
      <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #E2D9CE', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
          <thead>
            
            <tr style={{ background: '#FAF8F5', color: '#13381A', borderBottom: '1px solid #E2D9CE', fontWeight: '800' }}>
              <th style={{ ...thStyle, textAlign: 'center', position: 'sticky', left: 0, background: '#FAF8F5', zIndex: 2 }}>Jahr</th>
              <th colSpan="3" style={{ ...thStyle, textAlign: 'center', borderLeft: '1px solid #E2D9CE' }}>Operativ & Miete</th>
              <th colSpan="3" style={{ ...thStyle, textAlign: 'center', borderLeft: '1px solid #E2D9CE' }}>Bank & Kapitaldienst</th>
              {viewMode === 'vollstaendig' && (
                <th colSpan="3" style={{ ...thStyle, textAlign: 'center', borderLeft: '1px solid #E2D9CE' }}>Steuer & AfA</th>
              )}
              <th colSpan={viewMode === 'vollstaendig' ? "5" : "3"} style={{ ...thStyle, textAlign: 'center', borderLeft: '1px solid #E2D9CE' }}>Ergebnis & Vermögen</th>
            </tr>

            <tr style={{ background: '#13381A', color: 'white', fontWeight: '700' }}>
              <th style={{ ...thSubStyle, position: 'sticky', left: 0, background: '#13381A', zIndex: 2, textAlign: 'center' }}>Jahr</th>
              
              <th style={thSubStyle}>Kaltmiete p.a.</th>
              <th style={thSubStyle}>Bewirtschaftung</th>
              <th style={thSubStyle}>Nettomiete (NOI)</th>

              <th style={{ ...thSubStyle, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>Zins p.a.</th>
              <th style={thSubStyle}>Tilgung p.a.</th>
              <th style={thSubStyle}>Kapitaldienst</th>

              {viewMode === 'vollstaendig' && (
                <>
                  <th style={{ ...thSubStyle, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>AfA € p.a.</th>
                  <th style={thSubStyle}>zu verst. Eink.</th>
                  <th style={thSubStyle}>Steuer-Ergebnis</th>
                </>
              )}

              {viewMode === 'vollstaendig' && (
                <th style={{ ...thSubStyle, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>CF v. St. / Mo.</th>
              )}
              <th style={{ ...thSubStyle, borderLeft: viewMode === 'vollstaendig' ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>CF n. St. / Mo.</th>
              <th style={thSubStyle}>CF n. St. p.a.</th>
              <th style={thSubStyle}>Restschuld</th>
              {viewMode === 'vollstaendig' && <th style={thSubStyle}>Netto-EK (NAV)</th>}
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => {
              const isEven = idx % 2 === 0;
              const bg = isEven ? 'white' : '#FAF8F5';
              const cfMo = row.cashflowNachSteuerMo;
              const cfPa = row.cashflowNachSteuer;
              const isCfPos = cfMo >= 0;

              return (
                <tr key={row.jahr} style={{ background: bg, borderBottom: '1px solid #E2D9CE' }}>
                  <td style={{ ...tdStyle, fontWeight: '800', textAlign: 'center', position: 'sticky', left: 0, background: bg, zIndex: 1, borderRight: '1px solid #E2D9CE' }}>
                    {row.jahr}
                  </td>

                  <td style={tdStyle}>{formatEuroInt(row.miete)} €</td>
                  <td style={{ ...tdStyle, color: '#9B2C2C' }}>-{formatEuroInt(row.opex)} €</td>
                  <td style={{ ...tdStyle, fontWeight: '700' }}>{formatEuroInt(row.noi)} €</td>

                  <td style={{ ...tdStyle, borderLeft: '1px solid #E2D9CE', color: '#9B2C2C' }}>-{formatEuroInt(row.zins)} €</td>
                  <td style={{ ...tdStyle, color: '#A37841' }}>-{formatEuroInt(row.tilgung)} €</td>
                  <td style={{ ...tdStyle, fontWeight: '700' }}>-{formatEuroInt(row.kapitaldienst)} €</td>

                  {viewMode === 'vollstaendig' && (
                    <>
                      <td style={{ ...tdStyle, borderLeft: '1px solid #E2D9CE', color: '#718096' }}>{formatEuroInt(row.afaEuro)} €</td>
                      <td style={tdStyle}>{formatEuroInt(row.zuVersteuerndesEinkommen)} €</td>
                      <td style={{ ...tdStyle, fontWeight: '700', color: row.steuerErgebnis > 0 ? '#9B2C2C' : '#276749' }}>
                        {row.steuerErgebnis > 0 ? `-${formatEuroInt(row.steuerErgebnis)} €` : `+${formatEuroInt(Math.abs(row.steuerErgebnis))} €`}
                      </td>
                    </>
                  )}

                  {viewMode === 'vollstaendig' && (
                    <td style={{ ...tdStyle, borderLeft: '1px solid #E2D9CE', color: row.cashflowVorSteuerMo >= 0 ? '#276749' : '#9B2C2C' }}>
                      {row.cashflowVorSteuerMo >= 0 ? '+' : ''}{formatEuroInt(row.cashflowVorSteuerMo)} €
                    </td>
                  )}
                  <td style={{ ...tdStyle, borderLeft: viewMode === 'vollstaendig' ? 'none' : '1px solid #E2D9CE', fontWeight: '900', color: isCfPos ? '#276749' : '#9B2C2C', background: isCfPos ? 'rgba(39, 103, 73, 0.05)' : 'rgba(155, 44, 44, 0.05)' }}>
                    {isCfPos ? '+' : ''}{formatEuroInt(cfMo)} €
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '900', color: cfPa >= 0 ? '#276749' : '#9B2C2C' }}>
                    {cfPa >= 0 ? '+' : ''}{formatEuroInt(cfPa)} €
                  </td>
                  <td style={{ ...tdStyle, color: '#9B2C2C' }}>{formatEuroInt(row.restschuld)} €</td>
                  {viewMode === 'vollstaendig' && (
                    <td style={{ ...tdStyle, fontWeight: '800', color: '#13381A' }}>{formatEuroInt(row.netEquity)} €</td>
                  )}
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr style={{ background: '#FAF8F5', color: '#13381A', fontWeight: '900', borderTop: '2px solid #13381A' }}>
              <td style={{ ...tdStyle, textAlign: 'center', position: 'sticky', left: 0, background: '#FAF8F5', zIndex: 1, borderRight: '1px solid #CBD5E0' }}>
                Gesamt
              </td>

              <td style={tdStyle}>{formatEuroInt(sumData.miete)} €</td>
              <td style={{ ...tdStyle, color: '#9B2C2C' }}>-{formatEuroInt(sumData.opex)} €</td>
              <td style={tdStyle}>{formatEuroInt(sumData.noi)} €</td>

              <td style={{ ...tdStyle, borderLeft: '1px solid #CBD5E0', color: '#9B2C2C' }}>-{formatEuroInt(sumData.zins)} €</td>
              <td style={{ ...tdStyle, color: '#A37841' }}>-{formatEuroInt(sumData.tilgung)} €</td>
              <td style={tdStyle}>-{formatEuroInt(sumData.kapitaldienst)} €</td>

              {viewMode === 'vollstaendig' && (
                <>
                  <td style={{ ...tdStyle, borderLeft: '1px solid #CBD5E0' }}>{formatEuroInt(sumData.afaEuro)} €</td>
                  <td style={tdStyle}>{formatEuroInt(sumData.zuVersteuerndesEinkommen)} €</td>
                  <td style={{ ...tdStyle, color: sumData.steuerErgebnis > 0 ? '#9B2C2C' : '#276749' }}>
                    {sumData.steuerErgebnis > 0 ? `-${formatEuroInt(sumData.steuerErgebnis)} €` : `+${formatEuroInt(Math.abs(sumData.steuerErgebnis))} €`}
                  </td>
                </>
              )}

              {viewMode === 'vollstaendig' && (
                <td style={{ ...tdStyle, borderLeft: '1px solid #CBD5E0', color: '#718096' }}>-</td>
              )}
              <td style={{ ...tdStyle, borderLeft: viewMode === 'vollstaendig' ? 'none' : '1px solid #CBD5E0', color: '#718096' }}>-</td>
              <td style={{ ...tdStyle, fontWeight: '900', color: sumData.cashflowNachSteuerPa >= 0 ? '#276749' : '#9B2C2C' }}>
                {sumData.cashflowNachSteuerPa >= 0 ? '+' : ''}{formatEuroInt(sumData.cashflowNachSteuerPa)} €
              </td>
              <td style={{ ...tdStyle, color: '#9B2C2C' }}>{formatEuroInt(lastRow.restschuld || 0)} €</td>
              {viewMode === 'vollstaendig' && (
                <td style={{ ...tdStyle, color: '#13381A' }}>{formatEuroInt(lastRow.netEquity || 0)} €</td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '6px 10px',
  fontSize: '0.72rem',
  letterSpacing: '0.5px',
  textTransform: 'uppercase'
};

const thSubStyle = {
  padding: '7px 8px',
  fontSize: '0.73rem',
  fontWeight: '700'
};

const tdStyle = {
  padding: '6px 8px',
  color: '#2D3748'
};
