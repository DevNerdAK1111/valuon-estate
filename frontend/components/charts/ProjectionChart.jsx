'use client';
import { useState } from 'react';
import { formatEuroInt } from '../../utils/formatters';

// HELPER: SAUBERE, RUNDE Y-ACHSEN-SCHRITTE
function getNiceTicks(minVal, maxVal, maxTicks = 5) {
  let min = Math.min(minVal, 0);
  let max = Math.max(maxVal, 0);
  if (min === max) max = min + 10000;
  
  const range = max - min;
  const rawStep = range / maxTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const magMsd = rawStep / mag;
  
  let step = mag;
  if (magMsd <= 1.2) step = mag * 1;
  else if (magMsd <= 2.5) step = mag * 2;
  else if (magMsd <= 6) step = mag * 5;
  else step = mag * 10;

  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticks = [];
  for (let val = niceMin; val <= niceMax + step * 0.1; val += step) {
    ticks.push(Math.round(val));
  }
  return { ticks, min: niceMin, max: niceMax };
}

export default function ProjectionChart({ slicedProjection, formData }) {
  const [activeView, setActiveView] = useState('vermoegen');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const rawData = slicedProjection || [];
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const ekEuro = Number(formData?.ek_euro || 0);

  // KAUFNEBENKOSTEN & DARLEHEN BERECHNEN
  const grwtP = Number(formData?.grwt_p ?? 5.0);
  const notarP = Number(formData?.notar_p ?? 2.0);
  const maklerP = Number(formData?.makler_p ?? 3.57);
  const sonstNk = Number(formData?.sonst_nk ?? 0);
  const nkTotal = (kaufpreis * (grwtP + notarP + maklerP) / 100) + sonstNk;
  const darlehnsbetrag = Math.max(0, kaufpreis + nkTotal - ekEuro);

  const hbZinsP = Number(formData?.hb_zins ?? 3.8) / 100;
  const hbTilgP = Number(formData?.hb_tilg ?? 2.0) / 100;
  const expectedKapitaldienstPa = darlehnsbetrag * (hbZinsP + hbTilgP);

  let cumCashflow = -ekEuro;

  // ROBUSTE DATENAUFBEREITUNG
  const chartData = rawData.map((row, idx) => {
    const jahr = Number(row.Jahr ?? row.jahr ?? (idx + 1));
    
    // 1. IMMOBILIENWERT
    const valIncP = Number(formData?.val_inc ?? 1.0) / 100;
    const calcImmo = kaufpreis * Math.pow(1 + valIncP, jahr);
    const immobilienwert = Number(
      row.Immobilienwert ?? row.immobilienwert ?? row.objektwert ?? row.wert ?? calcImmo
    );

    // 2. RESTSCHULD & NETTO-EIGENKAPITAL
    const restschuld = Number(row.Restschuld ?? row.restschuld ?? row.restschuld_end ?? 0);
    const netEquity = Math.max(0, immobilienwert - restschuld);

    // 3. MIETE P.A.
    const mietIncP = Number(formData?.miet_inc ?? 1.0) / 100;
    const baseMietePa = Number(formData?.kaltmiete_monat || 0) * 12;
    const calcMietePa = baseMietePa * Math.pow(1 + mietIncP, Math.max(0, jahr - 1));

    let rawMiete = row['Kaltmiete p.a.'] ?? row.kaltmiete_pa ?? row.miete_pa ?? row.Mieteinnahmen ?? row.miete ?? row.kaltmiete ?? row.einnahmen;
    let miete = rawMiete !== undefined && rawMiete !== null ? Number(rawMiete) : calcMietePa;

    if (miete > 0 && miete < baseMietePa * 0.3) {
      miete = miete * 12;
    }
    if (!miete || isNaN(miete) || miete === 0) {
      miete = calcMietePa;
    }

    // 4. KAPITALDIENST P.A. (ZINS + TILGUNG KORREKTUR)
    let rawZins = row.Zins ?? row.zins ?? row.zins_pa ?? row.zins_euro;
    let rawTilg = row.Tilgung ?? row.tilgung ?? row.tilg_pa ?? row.tilgung_euro;
    let rawKap = row.Kapitaldienst ?? row.kapitaldienst ?? row.annuitaet ?? row.rate_pa ?? row.kapitaldienst_pa;

    let zins = Number(rawZins || 0);
    let tilgung = Number(rawTilg || 0);
    let kapitaldienst = Number(rawKap || 0);

    if (zins > 0 && zins < darlehnsbetrag * 0.01) zins *= 12;
    if (tilgung > 0 && tilgung < darlehnsbetrag * 0.005) tilgung *= 12;

    if (kapitaldienst === 0) {
      kapitaldienst = zins + tilgung;
    } else if (kapitaldienst > 0 && kapitaldienst < expectedKapitaldienstPa * 0.2) {
      kapitaldienst *= 12;
    }

    // Fallback/Plausibilitätsprüfung: Falls der Wert zu niedrig ist (z.B. nur Zinsen enthalten waren)
    if (kapitaldienst < expectedKapitaldienstPa * 0.6 && expectedKapitaldienstPa > 0) {
      kapitaldienst = expectedKapitaldienstPa;
    }

    // 5. NETTO-CASHFLOW P.A.
    let rawNettoCf = row['Cashflow Netto'] ?? row.cashflow_netto ?? row.netto_cashflow ?? row.cashflow;
    let nettoCashflow = Number(rawNettoCf || 0);

    if (rawNettoCf === undefined || rawNettoCf === null || isNaN(nettoCashflow)) {
      const nonUmlegbarMo = Number(formData?.hausgeld_nicht_umlegbar || 0);
      const instSqmPa = Number(formData?.inst_sqm || 12);
      const qm = Number(formData?.qm || 0);
      const mgtMo = Number(formData?.mgt_monat || 30);
      const opexPa = (nonUmlegbarMo + mgtMo) * 12 + (instSqmPa * qm);
      nettoCashflow = miete - opexPa - kapitaldienst;
    }

    cumCashflow += nettoCashflow;
    const totalReturn = cumCashflow + netEquity;

    return {
      jahrLabel: `${jahr}`,
      jahr,
      immobilienwert,
      restschuld,
      netEquity,
      nettoCashflow,
      miete,
      kapitaldienst,
      cumCashflow,
      totalReturn
    };
  });

  // GEOMETRIE MIT INSET FÜR SAUBERE RÄNDER & ACHSENABSTÄNDE
  const width = 740;
  const height = 320;
  const padding = { top: 25, right: 65, bottom: 45, left: 85 };
  const insetX = 25; // Inset verhindert Überschneidungen an den Rändern

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const innerPlotWidth = graphWidth - (2 * insetX);

  const getRawMinMax = () => {
    if (chartData.length === 0) return { min: 0, max: 100000 };
    if (activeView === 'vermoegen') {
      const maxVals = chartData.map(d => Math.max(d.immobilienwert, d.restschuld, d.netEquity));
      return { min: 0, max: Math.max(...maxVals) };
    }
    if (activeView === 'cashflow') {
      const allVals = chartData.flatMap(d => [d.miete, d.kapitaldienst, d.nettoCashflow]);
      return { min: Math.min(...allVals, 0), max: Math.max(...allVals, 1000) };
    }
    const allVals = chartData.flatMap(d => [d.totalReturn, d.cumCashflow]);
    return { min: Math.min(...allVals, -ekEuro), max: Math.max(...allVals, 1000) };
  };

  const rawRange = getRawMinMax();
  const { ticks: yTicks, min: yMin, max: yMax } = getNiceTicks(rawRange.min, rawRange.max, 5);

  const getX = (index) => {
    if (chartData.length <= 1) return padding.left + insetX + innerPlotWidth / 2;
    return padding.left + insetX + (index / (chartData.length - 1)) * innerPlotWidth;
  };

  const getY = (val) => {
    const range = yMax - yMin || 1;
    return padding.top + graphHeight - ((val - yMin) / range) * graphHeight;
  };

  const makePath = (key) => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key])}`, '');
  };

  const makeAreaPath = (key) => {
    if (chartData.length === 0) return '';
    const linePath = makePath(key);
    const zeroY = getY(0);
    return `${linePath} L ${getX(chartData.length - 1)} ${zeroY} L ${getX(0)} ${zeroY} Z`;
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2D9CE',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      
      {/* HEADER & TAB-UMSCHALTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#13381A' }}>
            {activeView === 'vermoegen' && 'Vermögensaufbau & Schuldenabbau'}
            {activeView === 'cashflow' && 'Cashflow & Mieteinnahmen p.a.'}
            {activeView === 'amortisation' && 'Amortisation & Break-Even-Verlauf'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#718096' }}>
            {activeView === 'vermoegen' && 'Schereneffekt zwischen steigendem Objektwert und sinkender Restschuld'}
            {activeView === 'cashflow' && 'Gegenüberstellung von Mieteinnahmen, Bankrate und Netto-Ertrag'}
            {activeView === 'amortisation' && 'Kumulierter Ertrag inkl. Eigenkapitalrückfluss'}
          </span>
        </div>

        <div style={{ display: 'flex', background: '#FAF8F5', padding: '4px', borderRadius: '8px', border: '1px solid #E2D9CE', gap: '4px' }}>
          {[
            { id: 'vermoegen', label: 'Vermögen & Schulden' },
            { id: 'cashflow', label: 'Cashflow' },
            { id: 'amortisation', label: 'Break-Even' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeView === tab.id ? '#13381A' : 'transparent',
                color: activeView === tab.id ? 'white' : '#4A5568',
                fontWeight: activeView === tab.id ? '800' : '600',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG DIAGRAMM */}
      <div style={{ width: '100%', height: '340px', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
          
          {/* Y-ACHSE & HORIZONTALE GRID-LINIEN */}
          {yTicks.map((tickVal, i) => {
            const y = getY(tickVal);
            const isZero = tickVal === 0;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isZero ? '#2D3748' : '#E2D9CE'}
                  strokeWidth={isZero ? 1.5 : 1}
                  strokeDasharray={isZero ? 'none' : '3 3'}
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  fontSize="10"
                  fontWeight={isZero ? '800' : '500'}
                  fill={isZero ? '#2D3748' : '#718096'}
                  textAnchor="end"
                >
                  {formatEuroInt(tickVal)} €
                </text>
              </g>
            );
          })}

          {/* VERTIKALE ACHSENLINIE Y */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#E2D9CE"
            strokeWidth="1"
          />

          {/* ANSICHT 1: VERMÖGEN & SCHULDEN */}
          {activeView === 'vermoegen' && (
            <>
              <path d={makeAreaPath('immobilienwert')} fill="#13381A" fillOpacity="0.12" />
              <path d={makePath('immobilienwert')} fill="none" stroke="#13381A" strokeWidth="2.5" />

              <path d={makeAreaPath('netEquity')} fill="#A37841" fillOpacity="0.18" />
              <path d={makePath('netEquity')} fill="none" stroke="#A37841" strokeWidth="2" />

              <path d={makeAreaPath('restschuld')} fill="#9B2C2C" fillOpacity="0.12" />
              <path d={makePath('restschuld')} fill="none" stroke="#9B2C2C" strokeWidth="2" />
            </>
          )}

          {/* ANSICHT 2: CASHFLOW */}
          {activeView === 'cashflow' && (
            <>
              {chartData.map((d, i) => {
                const barW = Math.max(6, (innerPlotWidth / chartData.length) * 0.35);
                const x = getX(i);
                const zeroY = getY(0);
                const mieteY = getY(d.miete);
                const kapY = getY(d.kapitaldienst);

                return (
                  <g key={i}>
                    <rect x={x - barW - 1} y={Math.min(zeroY, mieteY)} width={barW} height={Math.max(2, Math.abs(zeroY - mieteY))} fill="#13381A" rx="2" />
                    <rect x={x + 1} y={Math.min(zeroY, kapY)} width={barW} height={Math.max(2, Math.abs(zeroY - kapY))} fill="#A37841" rx="2" />
                  </g>
                );
              })}
              <path d={makePath('nettoCashflow')} fill="none" stroke="#276749" strokeWidth="3" />
            </>
          )}

          {/* ANSICHT 3: AMORTISATION & BREAK-EVEN */}
          {activeView === 'amortisation' && (
            <>
              <path d={makePath('totalReturn')} fill="none" stroke="#13381A" strokeWidth="3" />
              <path d={makePath('cumCashflow')} fill="none" stroke="#A37841" strokeWidth="2" strokeDasharray="5 5" />
            </>
          )}

          {/* X-ACHSEN BESCHRIFTUNG & HOVER-FLÄCHEN */}
          {chartData.map((d, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: 'pointer' }}>
              <text x={getX(i)} y={height - 15} fontSize="11" fontWeight="600" fill="#4A5568" textAnchor="middle">
                {d.jahrLabel}
              </text>
              <rect x={getX(i) - 15} y={padding.top} width={30} height={graphHeight} fill="transparent" />
            </g>
          ))}

          {/* SAUBERE POSITIONS-TRENNUNG FÜR HINWEIS "(JAHR)" */}
          <text x={width - padding.right + 10} y={height - 15} fontSize="10" fontWeight="700" fill="#718096" textAnchor="start">
            (Jahr)
          </text>
        </svg>

        {/* TOOLTIP BEI HOVER */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '25px',
            background: 'white',
            border: '1px solid #E2D9CE',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.8rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 10
          }}>
            <div style={{ fontWeight: '800', color: '#13381A', marginBottom: '4px', borderBottom: '1px solid #E2D9CE', paddingBottom: '3px' }}>
              Jahr {chartData[hoveredIndex].jahr}
            </div>
            {activeView === 'vermoegen' && (
              <>
                <div style={{ color: '#13381A' }}>Immobilienwert: <strong>{formatEuroInt(chartData[hoveredIndex].immobilienwert)} €</strong></div>
                <div style={{ color: '#A37841' }}>Netto-Eigenkapital: <strong>{formatEuroInt(chartData[hoveredIndex].netEquity)} €</strong></div>
                <div style={{ color: '#9B2C2C' }}>Restschuld: <strong>{formatEuroInt(chartData[hoveredIndex].restschuld)} €</strong></div>
              </>
            )}
            {activeView === 'cashflow' && (
              <>
                <div style={{ color: '#13381A' }}>Kaltmiete p.a.: <strong>{formatEuroInt(chartData[hoveredIndex].miete)} €</strong></div>
                <div style={{ color: '#A37841' }}>Kapitaldienst p.a.: <strong>{formatEuroInt(chartData[hoveredIndex].kapitaldienst)} €</strong></div>
                <div style={{ color: '#276749' }}>Netto-Cashflow p.a.: <strong>{formatEuroInt(chartData[hoveredIndex].nettoCashflow)} €</strong></div>
              </>
            )}
            {activeView === 'amortisation' && (
              <>
                <div style={{ color: '#13381A' }}>Gesamtgewinn: <strong>{formatEuroInt(chartData[hoveredIndex].totalReturn)} €</strong></div>
                <div style={{ color: '#A37841' }}>Kum. Cashflow: <strong>{formatEuroInt(chartData[hoveredIndex].cumCashflow)} €</strong></div>
              </>
            )}
          </div>
        )}
      </div>

      {/* DYNAMISCHE LEGENDE UNTER DEM DIAGRAMM */}
      <div style={{
        display: 'flex',
        justify: 'center',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        paddingTop: '0.5rem',
        borderTop: '1px solid #E2D9CE',
        fontSize: '0.8rem',
        fontWeight: '700',
        color: '#4A5568'
      }}>
        {activeView === 'vermoegen' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#13381A' }}></span>
              <span>Immobilienwert</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#A37841' }}></span>
              <span>Netto-Eigenkapital (NAV)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#9B2C2C' }}></span>
              <span>Restschuld (Bank)</span>
            </div>
          </>
        )}

        {activeView === 'cashflow' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#13381A' }}></span>
              <span>Kaltmiete p.a.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#A37841' }}></span>
              <span>Kapitaldienst p.a.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '3px', background: '#276749', borderRadius: '2px' }}></span>
              <span>Netto-Cashflow p.a.</span>
            </div>
          </>
        )}

        {activeView === 'amortisation' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '3px', background: '#13381A', borderRadius: '2px' }}></span>
              <span>Gesamtgewinn (Cashflow + NAV)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '3px', background: '#A37841', borderRadius: '2px', strokeDasharray: '3 3' }}></span>
              <span>Kumulierter Netto-Cashflow</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
