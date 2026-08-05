'use client';
import { formatEuroInt } from '../../utils/formatters';

export default function DonutChart({ formData, summe_nk }) {
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const nk = Number(summe_nk || 0);
  const gesamtkosten = kaufpreis + nk;

  const ek = Number(formData?.ek_euro || 0);
  const kfwAmt = Number(formData?.kfw_amt || 0);
  const hauptdarlehen = Math.max(0, gesamtkosten - ek - kfwAmt);

  const slices = [
    { label: 'Eigenkapital', value: ek, color: '#A37841' },
    { label: 'Hauptdarlehen (Bank)', value: hauptdarlehen, color: '#13381A' },
    ...(kfwAmt > 0 ? [{ label: 'KfW-Darlehen', value: kfwAmt, color: '#3182CE' }] : [])
  ];

  const totalValue = slices.reduce((acc, s) => acc + s.value, 0) || 1;

  let cumulativePercent = 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#13381A', fontWeight: '800' }}>
        Finanzierungsstruktur & Mittelherkunft
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', justifyContent: 'center', my: 'auto' }}>
        <div style={{ position: 'relative', width: '190px', height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {slices.map((slice, idx) => {
              const percent = slice.value / totalValue;
              if (percent <= 0) return null;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercent * circumference;
              cumulativePercent += percent;

              return (
                <circle
                  key={idx}
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="24"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              );
            })}
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '0.7rem', color: '#718096', fontWeight: '700' }}>Gesamtkosten</span>
            <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#13381A' }}>{formatEuroInt(gesamtkosten)} €</span>
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slices.map((slice, idx) => {
            const pct = totalValue > 0 ? (slice.value / totalValue) * 100 : 0;
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: slice.color, flexShrink: 0 }} />
                  <span style={{ color: '#4A5568', fontWeight: '600' }}>{slice.label}</span>
                </div>
                <div style={{ fontWeight: '800', color: '#13381A', whiteSpace: 'nowrap' }}>
                  {formatEuroInt(slice.value)} € <span style={{ color: '#718096', fontWeight: 'normal', fontSize: '0.75rem' }}>({pct.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div /> {/* Spacer für exakte Gleichhöhe */}
    </div>
  );
}
