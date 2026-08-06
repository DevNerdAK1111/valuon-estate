'use client';
import { useState } from 'react';
import { formatEuroInt } from '../../utils/formatters';

export default function ProjectionChart({ slicedProjection, formData }) {
  const [activeView, setActiveView] = useState('vermoegen');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const rawData = slicedProjection || [];
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const ekEuro = Number(formData?.ek_euro || 0);

  let cumCashflow = -ekEuro;
  const chartData = rawData.map((row, idx) => {
    const jahr = Number(row.Jahr ?? row.jahr ?? (idx + 1));
    const immobilienwert = Number(row.Immobilienwert ?? row.immobilienwert ?? (kaufpreis * Math.pow(1.01, jahr)));
    const restschuld = Number(row.Restschuld ?? row.restschuld ?? 0);
    const netEquity = Math.max(0, immobilienwert - restschuld);
    
    const nettoCashflow = Number(row['Cashflow Netto'] ?? row.cashflow_netto ?? 0);
    const miete = Number(row['Kaltmiete p.a.'] ?? row.Mieteinnahmen ?? row.miete ?? 0);
    const zins = Number(row.Zins ?? row.zins ?? 0);
    const tilgung = Number(row.Tilgung ?? row.tilgung ?? 0);
    const kapitaldienst = zins + tilgung;

    cumCashflow += nettoCashflow;
    const totalReturn = cumCashflow + netEquity;

    return {
      jahrLabel: `J${jahr}`,
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

  const width = 700;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getMinMax = () => {
    if (chartData.length === 0) return { min: 0, max: 100 };
    if (activeView === 'vermoegen') {
      const maxVals = chartData.map(d => Math.max(d.immobilienwert, d.restschuld, d.netEquity));
      return { min: 0, max: Math.max(...maxVals) * 1.1 };
    }
    if (activeView === 'cashflow') {
      const allVals = chartData.flatMap(d => [d.miete, d.kapitaldienst, d.nettoCashflow]);
      const maxVal = Math.max(...allVals, 100);
      const minVal = Math.min(...allVals, 0);
      return { min: minVal < 0 ? minVal * 1.1 : 0, max: maxVal * 1.1 };
    }
    const allVals = chartData.flatMap(d => [d.totalReturn, d.cumCashflow]);
    const maxVal = Math.max(...allVals, 100);
    const minVal = Math.min(...allVals, -ekEuro);
    return { min: minVal * 1.1, max: maxVal * 1.1 };
  };

  const { min: yMin, max: yMax } = getMinMax();

  const getX = (index) => {
    if (chartData.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (chartData.length - 1)) * graphWidth;
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
    const zeroY = getY(Math.max(0, yMin));
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
            { id: 'cashflow', label: 'Cashflow p.a.' },
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
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: '380px', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = yMin + ratio * (yMax - yMin);
            const y = getY(val);
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E2D9CE" strokeDasharray="3 3" />
                <text x={padding.left - 8} y={y + 4} fontSize="10" fill="#718096" textAnchor="end">
                  {formatEuroInt(val)} €
                </text>
              </g>
            );
          })}

          {activeView === 'vermoegen' && (
            <>
              <path d={makeAreaPath('immobilienwert')} fill="#13381A" fillOpacity="0.15" />
              <path d={makePath('immobilienwert')} fill="none" stroke="#13381A" strokeWidth="2.5" />

              <path d={makeAreaPath('netEquity')} fill="#A37841" fillOpacity="0.2" />
              <path d={makePath('netEquity')} fill="none" stroke="#A37841" strokeWidth="2" />

              <path d={makeAreaPath('restschuld')} fill="#9B2C2C" fillOpacity="0.15" />
              <path d={makePath('restschuld')} fill="none" stroke="#9B2C2C" strokeWidth="2" />
            </>
          )}

          {activeView === 'cashflow' && (
            <>
              {chartData.map((d, i) => {
                const barW = Math.max(6, (graphWidth / chartData.length) * 0.35);
                const x = getX(i);
                const zeroY = getY(0);
                const mieteY = getY(d.miete);
                const kapY = getY(d.kapitaldienst);

                return (
                  <g key={i}>
                    <rect x={x - barW - 1} y={mieteY} width={barW} height={Math.abs(zeroY - mieteY)} fill="#13381A" rx="2" />
                    <rect x={x + 1} y={kapY} width={barW} height={Math.abs(zeroY - kapY)} fill="#A37841" rx="2" />
                  </g>
                );
              })}
              <path d={makePath('nettoCashflow')} fill="none" stroke="#276749" strokeWidth="3" />
            </>
          )}

          {activeView === 'amortisation' && (
            <>
              <line x1={padding.left} y1={getY(0)} x2={width - padding.right} y2={getY(0)} stroke="#718096" strokeWidth="1.5" />
              <path d={makePath('totalReturn')} fill="none" stroke="#13381A" strokeWidth="3" />
              <path d={makePath('cumCashflow')} fill="none" stroke="#A37841" strokeWidth="2" strokeDasharray="5 5" />
            </>
          )}

          {chartData.map((d, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: 'pointer' }}>
              <text x={getX(i)} y={height - 12} fontSize="11" fill="#718096" textAnchor="middle">
                {d.jahrLabel}
              </text>
              <rect x={getX(i) - 15} y={padding.top} width={30} height={graphHeight} fill="transparent" />
            </g>
          ))}
        </svg>

        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'white',
            border: '1px solid #E2D9CE',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.8rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontWeight: '800', color: '#13381A', marginBottom: '4px' }}>Jahr {chartData[hoveredIndex].jahr}</div>
            {activeView === 'vermoegen' && (
              <>
                <div style={{ color: '#13381A' }}>Immobilienwert: <strong>{formatEuroInt(chartData[hoveredIndex].immobilienwert)} €</strong></div>
                <div style={{ color: '#A37841' }}>Netto-Eigenkapital: <strong>{formatEuroInt(chartData[hoveredIndex].netEquity)} €</strong></div>
                <div style={{ color: '#9B2C2C' }}>Restschuld: <strong>{formatEuroInt(chartData[hoveredIndex].restschuld)} €</strong></div>
              </>
            )}
            {activeView === 'cashflow' && (
              <>
                <div style={{ color: '#13381A' }}>Kaltmiete: <strong>{formatEuroInt(chartData[hoveredIndex].miete)} €</strong></div>
                <div style={{ color: '#A37841' }}>Kapitaldienst: <strong>{formatEuroInt(chartData[hoveredIndex].kapitaldienst)} €</strong></div>
                <div style={{ color: '#276749' }}>Netto-Cashflow: <strong>{formatEuroInt(chartData[hoveredIndex].nettoCashflow)} €</strong></div>
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
    </div>
  );
}
