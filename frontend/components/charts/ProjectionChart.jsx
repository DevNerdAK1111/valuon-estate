'use client';
import { useState } from 'react';
import { formatEuroInt } from '../../utils/formatters';

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
  const [activeView, setActiveView] = useState('vermoegen'); // 'vermoegen' | 'cashflow' | 'amortisation'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const rawList = slicedProjection || [];
  let runningCumCashflow = 0;
  
  const ekBase = Number(ekEuroInput) || 0;

  const chartData = rawList.map((d, index) => {
    const jahr = Number(d.Jahr ?? d.jahr ?? (index + 1));
    const immoWert = Number(d.Immobilienwert ?? d.immobilienwert ?? 0);
    const restSchuld = Number(d.Restschuld ?? d.restschuld ?? 0);
    const netEq = immoWert - restSchuld;
    const mieteVal = Number(d['Mieteinnahmen IST'] ?? d.miete ?? 0);
    const zinsVal = Number(d.Zinsen ?? d.zinsen ?? 0);
    const tilgVal = Number(d.Tilgung ?? d.tilgung ?? 0);
    const kapVal = Number(d.Kapitaldienst ?? (zinsVal + tilgVal));
    const cfNetto = Number(d['Cashflow Netto'] ?? d.nettoCashflow ?? 0);

    runningCumCashflow += cfNetto;

    const totalRet = netEq + runningCumCashflow;
    const netGain = totalRet - ekBase;

    return {
      jahr,
      jahrLabel: `${jahr}`,
      immobilienwert: immoWert,
      restschuld: restSchuld,
      netEquity: netEq,
      miete: mieteVal,
      kapitaldienst: kapVal,
      nettoCashflow: cfNetto,
      cumCashflow: runningCumCashflow,
      totalReturn: totalRet,
      netGain
    };
  });

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

  const breakEvenIndex = chartData.findIndex(d => d.netGain >= 0);

  return (
    <div className="bg-white border border-valuon-border rounded-xl p-5 flex flex-col gap-4 shadow-sm">
      
      {/* HEADER & TAB UMSCHALTER */}
      <div className="flex justify-between items-center flex-wrap gap-3 min-h-[46px]">
        <div>
          <h3 className="m-0 text-base sm:text-lg font-black text-valuon-green leading-tight">
            {activeView === 'vermoegen' && 'Vermögensaufbau & Schuldenabbau'}
            {activeView === 'cashflow' && 'Cashflow & Mieteinnahmen p.a.'}
            {activeView === 'amortisation' && 'Amortisation & Break-Even-Verlauf'}
          </h3>
          <span className="text-xs text-slate-500 block mt-0.5 leading-tight">
            {activeView === 'vermoegen' && 'Schereneffekt zwischen steigendem Objektwert und sinkender Restschuld'}
            {activeView === 'cashflow' && 'Gegenüberstellung von Mieteinnahmen, Bankrate und Netto-Ertrag'}
            {activeView === 'amortisation' && 'Gesamtertrag (NAV + Kum. Cashflow) vs. Eigenkapitaleinsatz'}
          </span>
        </div>

        <div className="flex bg-valuon-cream p-1 rounded-lg border border-valuon-border gap-1 shrink-0">
          {[
            { id: 'vermoegen', label: 'Vermögen & Schulden' },
            { id: 'cashflow', label: 'Cashflow' },
            { id: 'amortisation', label: 'Break-Even' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              className={`py-1.5 px-3 rounded-md border-none font-bold text-xs cursor-pointer transition-colors whitespace-nowrap ${
                activeView === tab.id
                  ? 'bg-valuon-green text-white font-extrabold'
                  : 'bg-transparent text-slate-600 hover:text-valuon-green'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG DIAGRAMM CONTAINER */}
      <div className="w-full h-[340px] relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          
          {/* Y-ACHSE & GRID */}
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
                  className="transition-all duration-300 ease-in-out"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  fontSize="10"
                  fontWeight={isZero ? '800' : '500'}
                  fill={isZero ? '#2D3748' : '#718096'}
                  textAnchor="end"
                  className="transition-all duration-300 ease-in-out"
                >
                  {formatEuroInt(tickVal)} €
                </text>
              </g>
            );
          })}

          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#E2D9CE" strokeWidth="1" />

          {/* ANSICHT 1: VERMÖGEN & SCHULDEN */}
          <g className={`transition-opacity duration-200 ${activeView === 'vermoegen' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <path d={makeAreaPath('immobilienwert', 0)} fill="#13381A" fillOpacity="0.12" className="transition-all duration-300" />
            <path d={makePath('immobilienwert')} fill="none" stroke="#13381A" strokeWidth="2.5" className="transition-all duration-300" />

            <path d={makeAreaPath('netEquity', 0)} fill="#A37841" fillOpacity="0.18" className="transition-all duration-300" />
            <path d={makePath('netEquity')} fill="none" stroke="#A37841" strokeWidth="2" className="transition-all duration-300" />

            <path d={makeAreaPath('restschuld', 0)} fill="#9B2C2C" fillOpacity="0.12" className="transition-all duration-300" />
            <path d={makePath('restschuld')} fill="none" stroke="#9B2C2C" strokeWidth="2" className="transition-all duration-300" />
          </g>

          {/* ANSICHT 2: CASHFLOW */}
          <g className={`transition-opacity duration-200 ${activeView === 'cashflow' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {chartData.map((d, i) => {
              const barW = Math.max(6, (innerPlotWidth / chartData.length) * 0.35);
              const x = getX(i);
              const zeroY = getY(0);
              const mieteY = getY(d.miete);
              const kapY = getY(d.kapitaldienst);

              return (
                <g key={i}>
                  <rect x={x - barW - 1} y={Math.min(zeroY, mieteY)} width={barW} height={Math.max(2, Math.abs(zeroY - mieteY))} fill="#13381A" rx="2" className="transition-all duration-300" />
                  <rect x={x + 1} y={Math.min(zeroY, kapY)} width={barW} height={Math.max(2, Math.abs(zeroY - kapY))} fill="#A37841" rx="2" className="transition-all duration-300" />
                </g>
              );
            })}
            <path d={makePath('nettoCashflow')} fill="none" stroke="#276749" strokeWidth="3" className="transition-all duration-300" />
          </g>

          {/* ANSICHT 3: AMORTISATION */}
          <g className={`transition-opacity duration-200 ${activeView === 'amortisation' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
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
                  className="transition-all duration-300"
                />
                <text
                  x={width - padding.right - 8}
                  y={getY(ekBase) - 6}
                  fontSize="10"
                  fontWeight="800"
                  fill="#A37841"
                  textAnchor="end"
                  className="transition-all duration-300"
                >
                  EK-Einsatz ({formatEuroInt(ekBase)} €)
                </text>
              </g>
            )}

            <path d={makeAreaPath('totalReturn', ekBase > 0 ? ekBase : 0)} fill="#276749" fillOpacity="0.15" className="transition-all duration-300" />
            <path d={makePath('totalReturn')} fill="none" stroke="#13381A" strokeWidth="3" className="transition-all duration-300" />
            <path d={makePath('cumCashflow')} fill="none" stroke="#A37841" strokeWidth="2" strokeDasharray="4 4" className="transition-all duration-300" />

            {breakEvenIndex !== -1 && (() => {
              const pointX = getX(breakEvenIndex);
              const pointY = getY(chartData[breakEvenIndex].totalReturn);
              const badgeW = 110;
              const badgeX = Math.max(padding.left + 5, Math.min(width - padding.right - badgeW - 5, pointX - badgeW / 2));
              
              return (
                <g>
                  <circle cx={pointX} cy={pointY} r="6" fill="#276749" stroke="white" strokeWidth="2" className="transition-all duration-300" />
                  <line x1={pointX} y1={padding.top + 20} x2={pointX} y2={height - padding.bottom} stroke="#276749" strokeWidth="1.5" strokeDasharray="2 2" className="transition-all duration-300" />
                  <rect x={badgeX} y={padding.top - 2} width={badgeW} height="20" rx="5" fill="#13381A" className="transition-all duration-300" />
                  <text x={badgeX + badgeW / 2} y={padding.top + 12} fontSize="9.5" fontWeight="800" fill="white" textAnchor="middle" className="transition-all duration-300">
                    Break-Even Jahr {chartData[breakEvenIndex].jahr}
                  </text>
                </g>
              );
            })()}
          </g>

          {/* X-ACHSE & HOVER TARGETS */}
          {chartData.map((d, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
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
          <div className="absolute top-4 right-6 bg-white border border-valuon-border rounded-lg p-3 text-xs shadow-lg z-10">
            <div className="font-extrabold text-valuon-green pb-1 mb-1 border-b border-valuon-border">
              Jahr {chartData[hoveredIndex].jahr}
            </div>
            {activeView === 'vermoegen' && (
              <>
                <div className="text-valuon-green">Immobilienwert: <strong>{formatEuroInt(chartData[hoveredIndex].immobilienwert)} €</strong></div>
                <div className="text-valuon-gold">Netto-Eigenkapital: <strong>{formatEuroInt(chartData[hoveredIndex].netEquity)} €</strong></div>
                <div className="text-valuon-red">Restschuld: <strong>{formatEuroInt(chartData[hoveredIndex].restschuld)} €</strong></div>
              </>
            )}
            {activeView === 'cashflow' && (
              <>
                <div className="text-valuon-green">Kaltmiete p.a.: <strong>{formatEuroInt(chartData[hoveredIndex].miete)} €</strong></div>
                <div className="text-valuon-gold">Kapitaldienst p.a.: <strong>{formatEuroInt(chartData[hoveredIndex].kapitaldienst)} €</strong></div>
                <div className="text-emerald-800">Netto-Cashflow p.a.: <strong>{formatEuroInt(chartData[hoveredIndex].nettoCashflow)} €</strong></div>
              </>
            )}
            {activeView === 'amortisation' && (
              <>
                <div className="text-valuon-green">Gesamtertrag (NAV + CF): <strong>{formatEuroInt(chartData[hoveredIndex].totalReturn)} €</strong></div>
                <div className="text-valuon-gold">Kum. Netto-Cashflow: <strong>{formatEuroInt(chartData[hoveredIndex].cumCashflow)} €</strong></div>
                <div className={`font-bold mt-0.5 ${chartData[hoveredIndex].netGain >= 0 ? 'text-emerald-800' : 'text-valuon-red'}`}>
                  Reingewinn n. EK: {formatEuroInt(chartData[hoveredIndex].netGain)} €
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* LEGENDE BAR */}
      <div className="flex justify-center items-center gap-6 flex-wrap pt-2 border-t border-valuon-border text-xs font-bold text-slate-600 min-h-[32px] box-border">
        {activeView === 'vermoegen' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-valuon-green inline-block"></span>
              <span>Immobilienwert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-valuon-gold inline-block"></span>
              <span>Netto-Eigenkapital (NAV)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-valuon-red inline-block"></span>
              <span>Restschuld (Bank)</span>
            </div>
          </>
        )}

        {activeView === 'cashflow' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-valuon-green inline-block"></span>
              <span>Kaltmiete p.a.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-valuon-gold inline-block"></span>
              <span>Kapitaldienst p.a.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-emerald-800 rounded-full inline-block"></span>
              <span>Netto-Cashflow p.a.</span>
            </div>
          </>
        )}

        {activeView === 'amortisation' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-valuon-green rounded-full inline-block"></span>
              <span>Gesamtertrag (NAV + Kum. Cashflow)</span>
            </div>
            {ekBase > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0 border-t-2 border-dashed border-valuon-gold inline-block"></span>
                <span>EK-Referenzlinie ({formatEuroInt(ekBase)} €)</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0 border-t-2 border-dashed border-valuon-gold inline-block"></span>
              <span>Kum. Netto-Cashflow</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
