'use client';
import { formatEuroInt } from '@/utils/formatters';

function getNiceScale(maxVal) {
  if (!maxVal || maxVal <= 0) return { niceMax: 10000, ticks: [10000, 7500, 5000, 2500, 0] };

  const allowedSteps = [
    100, 200, 250, 500,
    1000, 1500, 2000, 2500, 3000, 4000, 5000,
    10000, 15000, 20000, 25000, 30000, 40000, 50000,
    100000, 150000, 200000, 250000, 300000, 500000, 1000000
  ];

  const minNiceMax = maxVal * 1.05;
  let chosenStep = 25000;

  for (let s of allowedSteps) {
    if (s * 4 >= minNiceMax) {
      chosenStep = s;
      break;
    }
  }

  const niceMax = chosenStep * 4;
  const ticks = [niceMax, chosenStep * 3, chosenStep * 2, chosenStep * 1, 0];
  return { niceMax, ticks };
}

export default function ProjectionChart({ projection, kaufpreis, view }) {
  if (!projection || projection.length === 0) {
    return <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Keine Projektionsdaten vorhanden.</div>;
  }

  const isNavView = view.includes('Vermögensstruktur');

  if (isNavView) {
    const rawMax = Math.max(...projection.map(r => r['Immobilienwert'] || kaufpreis || 100000));
    const { niceMax, ticks } = getNiceScale(rawMax);

    return (
      <div style={{ width: '100%', marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', height: '220px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.68rem', color: '#718096', textAlign: 'right', paddingRight: '8px', fontVariantNumeric: 'tabular-nums' }}>
            {ticks.map((val, idx) => (
              <span key={idx}>{formatEuroInt(val)} €</span>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
              
              {[0, 42, 85, 127, 170].map((y, idx) => (
                <line key={idx} x1="0" y1={y} x2="500" y2={y} stroke="#E2D9CE" strokeDasharray="3 3" />
              ))}

              {projection.map((r, i) => {
                const x = (i / projection.length) * 480 + 5;
                const nav = (r['Immobilienwert'] || 0) - (r['Restschuld'] || 0);
                const barHeight = (nav / niceMax) * 170;
                const y = 170 - barHeight;

                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={380 / projection.length}
                    height={Math.max(0, barHeight)}
                    fill="#A37841"
                    opacity="0.85"
                    rx="3"
                  />
                );
              })}

              <polyline
                fill="none"
                stroke="#13381A"
                strokeWidth="3.5"
                points={projection.map((r, i) => {
                  const x = (i / projection.length) * 480 + 20;
                  const y = 170 - ((r['Immobilienwert'] || 0) / niceMax) * 170;
                  return `${x},${y}`;
                }).join(' ')}
              />

              <polyline
                fill="none"
                stroke="#9B2C2C"
                strokeWidth="3.5"
                points={projection.map((r, i) => {
                  const x = (i / projection.length) * 480 + 20;
                  const y = 170 - ((r['Restschuld'] || 0) / niceMax) * 170;
                  return `${x},${y}`;
                }).join(' ')}
              />

              <line x1="0" y1="170" x2="500" y2="170" stroke="#13381A" strokeWidth="2" />

              {projection.map((r, i) => {
                const x = (i / projection.length) * 480 + 20;
                return (
                  <g key={i}>
                    <line x1={x} y1="170" x2={x} y2="175" stroke="#13381A" strokeWidth="1.5" />
                    <text x={x} y="195" textAnchor="middle" fontSize="11" fontWeight="700" fill="#13381A">
                      {r['Jahr'] || i + 1}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#718096', marginTop: '2px' }}>
          Projektionsjahre
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '4px', background: '#13381A', borderRadius: '2px' }}></span>
            <span>Objektwert</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '4px', background: '#9B2C2C', borderRadius: '2px' }}></span>
            <span>Restschuld</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#A37841', borderRadius: '3px' }}></span>
            <span>Netto-EK (NAV)</span>
          </div>
        </div>
      </div>
    );
  } else {
    const rawRentMax = Math.max(...projection.map(r => r['Mieteinnahmen IST'] || 10000));
    const { niceMax, ticks } = getNiceScale(rawRentMax);
    const absMaxCf = Math.max(1000, ...projection.map(r => Math.abs(r['Cashflow Netto'] || 0))) * 1.5;

    return (
      <div style={{ width: '100%', marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', height: '220px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.68rem', color: '#718096', textAlign: 'right', paddingRight: '8px', fontVariantNumeric: 'tabular-nums' }}>
            {ticks.map((val, idx) => (
              <span key={idx}>{formatEuroInt(val)} €</span>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
              
              {[0, 42, 85, 127].map((y, idx) => (
                <line key={idx} x1="0" y1={y} x2="500" y2={y} stroke="#E2D9CE" strokeDasharray="3 3" />
              ))}

              <line x1="0" y1="130" x2="500" y2="130" stroke="#718096" strokeWidth="1" strokeDasharray="2 2" />

              {projection.map((r, i) => {
                const x = (i / projection.length) * 480 + 8;
                const cf = r['Cashflow Netto'] || 0;
                const barHeight = (Math.abs(cf) / absMaxCf) * 45;
                const y = cf >= 0 ? 130 - barHeight : 130;

                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={360 / projection.length}
                    height={Math.max(4, barHeight)}
                    fill={cf >= 0 ? '#38A169' : '#9B2C2C'}
                    opacity="0.9"
                    rx="2"
                  />
                );
              })}

              <polyline
                fill="none"
                stroke="#A37841"
                strokeWidth="3.5"
                points={projection.map((r, i) => {
                  const x = (i / projection.length) * 480 + 20;
                  const y = 130 - ((r['Mieteinnahmen IST'] || 0) / niceMax) * 120;
                  return `${x},${y}`;
                }).join(' ')}
              />

              <line x1="0" y1="170" x2="500" y2="170" stroke="#13381A" strokeWidth="2" />

              {projection.map((r, i) => {
                const x = (i / projection.length) * 480 + 20;
                return (
                  <g key={i}>
                    <line x1={x} y1="170" x2={x} y2="175" stroke="#13381A" strokeWidth="1.5" />
                    <text x={x} y="195" textAnchor="middle" fontSize="11" fontWeight="700" fill="#13381A">
                      {r['Jahr'] || i + 1}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#718096', marginTop: '2px' }}>
          Projektionsjahre
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '4px', background: '#A37841', borderRadius: '2px' }}></span>
            <span>Kaltmiete (brutto)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#38A169', borderRadius: '3px' }}></span>
            <span>Cashflow Netto (+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#9B2C2C', borderRadius: '3px' }}></span>
            <span>Cashflow Netto (-)</span>
          </div>
        </div>
      </div>
    );
  }
}
