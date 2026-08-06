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

export default function ProjectionChart({ slicedProjection, ekEuroInput = 0 }) {
  const [activeView, setActiveView] = useState('vermoegen');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // NORMALISIERUNG DER BACKEND-PROJEKTIONSDATEN
  const rawList = slicedProjection || [];
  let runningCumCashflow = 0;
  
  const chartData = rawList.map((d, index) => {
    const jahr = Number(d.Jahr ?? d.jahr ?? (index + 1));
    const immoWert = Number(d.Immobilienwert ?? d.immobilienwert ?? 0);
    const restSchuld = Number(d.Restschuld ?? d.restschuld ?? 0);
    const netEq = Number(d.netEquity ?? (immoWert - restSchuld));
    const mieteVal = Number(d['Mieteinnahmen IST'] ?? d.miete ?? d.Miete ?? 0);
    const zinsVal = Number(d.Zinsen ?? d.zinsen ?? 0);
    const tilgVal = Number(d.Tilgung ?? d.tilgung ?? 0);
    const kapVal = Number(d.Kapitaldienst ?? d.kapitaldienst ?? (zinsVal + tilgVal));
    const cfNetto = Number(d['Cashflow Netto'] ?? d.nettoCashflow ?? d.Cashflow ?? 0);

    runningCumCashflow += cfNetto;
    const cumCF = Number(d.cumCashflow ?? runningCumCashflow);
    const totalRet = Number(d.totalReturn ?? (cumCF + netEq));

    return {
      jahr,
      jahrLabel: `J${jahr}`,
      immobilienwert: immoWert,
      restschuld: restSchuld,
      netEquity: netEq,
      miete: mieteVal,
      kapitaldienst: kapVal,
      nettoCashflow: cfNetto,
      cumCashflow: cumCF,
      totalReturn: totalRet
    };
  });

  // INITIALE EIGENKAPITAL-BASIS (FALLS VORHANDEN ODER AUS ERSTEM NET-EQUITY WERT)
  const ekBase = Number(ekEuroInput) > 0 
    ? Number(ekEuroInput) 
    : (chartData[0] ? chartData[0].netEquity : 0);

  // GEOMETRIE MIT INSET FÜR SAUBERE RÄNDER & ACHSENABSTÄNDE
  const width = 740;
  const height = 320;
  const padding = { top: 25, right: 65, bottom: 45, left: 85 };
  const insetX = 25;

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
    // AMORTISATION & BREAK-EVEN
    const allVals = chartData.flatMap(d => [d.totalReturn, d.cumCashflow, ekBase]);
    return { min: Math.min(...allVals, 0), max: Math.max(...allVals, 1000) };
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

  const makeAreaPath = (key, baseValue = 0) => {
    if (chartData.length === 0) return '';
    const linePath = makePath(key);
    const baseY = getY(baseValue);
    return `${linePath} L ${getX(chartData.length - 1)} ${baseY} L ${getX(0)} ${baseY} Z`;
  };

  // BREAK EVEN JAHR BESTIMMEN (WO TOTAL RETURN >= EK-EINSATZ)
  const breakEvenIndex = chartData.findIndex(d => d.totalReturn >= ekBase);

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
            {activeView === 'amortisation' && 'Gesamtertrag (NAV + Kum. Cashflow) vs. Eigenkapitaleinsatz'}
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
              <path d={makeAreaPath('immobilienwert', 0)} fill="#13381A" fillOpacity="0.12" />
              <path d={makePath('immobilienwert')} fill="none" stroke="#13381A" strokeWidth="2.5" />

              <path d={makeAreaPath('netEquity', 0)} fill="#A37841" fillOpacity="0.18" />
              <path d={makePath('netEquity')} fill="none" stroke="#A37841" strokeWidth="2" />

              <path d={makeAreaPath('restschuld', 0)} fill="#9B2C2C" fillOpacity="0.12" />
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
              {/* EIGENKAPITAL-BASISREFERENZLINIE */}
              {ekBase > 0 && (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(ekBase)}
                    x2={width - padding.right}
                    y2={getY(ekBase)}
                    stroke="#A37841"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  <text
                    x={width - padding.right - 8}
                    y={getY(ekBase) - 6}
                    fontSize="10"
                    fontWeight="800"
                    fill="#A37841"
                    textAnchor="end"
                  >
                    EK-Einsatz ({formatEuroInt(ekBase)} €)
                  </text>
                </g>
              )}

              {/* FLÄCHENFÜLLUNG GESAMTERTRAG */}
              <path d={makeAreaPath('totalReturn', ekBase > 0 ? ekBase : 0)} fill="#276749" fillOpacity="0.15" />

              {/* GESAMTERTRAGS-LINIE (NAV + KUM. CASHFLOW) */}
              <path d={makePath('totalReturn')} fill="none" stroke="#13381A" strokeWidth="3" />

              {/* KUMULIERTER CASHFLOW LINIE */}
              <path d={makePath('cumCashflow')} fill="none" stroke="#A37841" strokeWidth="2" strokeDasharray="4 4" />

              {/* HIGHLIGHT BREAK EVEN PUNKT */}
              {breakEvenIndex !== -1 && (
                <g>
                  <circle
                    cx={getX(breakEvenIndex)}
                    cy={getY(chartData[breakEvenIndex].totalReturn)}
                    r="6"
                    fill="#276749"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <line
                    x1={getX(breakEvenIndex)}
                    y1={padding.top}
                    x2={getX(breakEvenIndex)}
                    y2={height - padding.bottom}
                    stroke="#276749"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={getX(breakEvenIndex) - 45}
                    y={padding.top - 2}
                    width="90"
                    height="18"
                    rx="4"
                    fill="#276749"
                  />
                  <text
                    x={getX(breakEvenIndex)}
                    y={padding.top + 11}
                    fontSize="9"
                    fontWeight="800"
                    fill="white"
                    textAnchor="middle"
                  >
                    Break-Even J{chartData[breakEvenIndex].jahr}
                  </text>
                </g>
              )}
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
                <div style={{ color: '#13381A' }}>Gesamtertrag (NAV + CF): <strong>{formatEuroInt(chartData[hoveredIndex].totalReturn)} €</strong></div>
                <div style={{ color: '#A37841' }}>Kum. Netto-Cashflow: <strong>{formatEuroInt(chartData[hoveredIndex].cumCashflow)} €</strong></div>
                <div style={{ color: chartData[hoveredIndex].totalReturn >= ekBase ? '#276749' : '#9B2C2C', fontWeight: '800', marginTop: '2px' }}>
                  Reingewinn n. EK: {formatEuroInt(chartData[hoveredIndex].totalReturn - ekBase)} €
                </div>
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
              <span>Gesamtertrag (NAV + Kum. Cashflow)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '3px', strokeDasharray: '3 3', borderTop: '2px dashed #A37841' }}></span>
              <span>EK-Referenzlinie ({formatEuroInt(ekBase)} €)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '3px', strokeDasharray: '2 2', borderTop: '2px dashed #A37841' }}></span>
              <span>Kum. Netto-Cashflow</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
