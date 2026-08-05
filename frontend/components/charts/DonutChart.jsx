'use client';
import { formatEuroInt, formatPct } from '@/utils/formatters';

export default function DonutChart({ totalInvestment, equity, kfw, hb }) {
  const safeTotal = totalInvestment || 1;
  const eqPct = (equity / safeTotal) * 100;
  const kfwPct = (kfw / safeTotal) * 100;
  const hbPct = Math.max(0, 100 - eqPct - kfwPct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg width="100%" height="100%" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E2D9CE" strokeWidth="4.5" />
          
          <circle
            cx="21" cy="21" r="15.915"
            fill="transparent" stroke="#13381A" strokeWidth="4.5"
            strokeDasharray={`${hbPct} ${100 - hbPct}`}
            strokeDashoffset="25"
          />

          <circle
            cx="21" cy="21" r="15.915"
            fill="transparent" stroke="#A37841" strokeWidth="4.5"
            strokeDasharray={`${eqPct} ${100 - eqPct}`}
            strokeDashoffset={`${25 - hbPct}`}
          />

          {kfwPct > 0 && (
            <circle
              cx="21" cy="21" r="15.915"
              fill="transparent" stroke="#2B6CB0" strokeWidth="4.5"
              strokeDasharray={`${kfwPct} ${100 - kfwPct}`}
              strokeDashoffset={`${25 - hbPct - eqPct}`}
            />
          )}

          <text x="21" y="19" textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#718096">GESAMT</text>
          <text x="21" y="24.5" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#13381A">{formatEuroInt(totalInvestment)} €</text>
        </svg>
      </div>

      <div style={{ marginTop: '1rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2D9CE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: '#13381A', borderRadius: '3px', display: 'inline-block' }}></span>
            <span>Hausbank Darlehen</span>
          </div>
          <span style={{ fontWeight: '800', color: '#13381A' }}>{formatEuroInt(hb)} € ({formatPct(hbPct)}%)</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2D9CE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: '#A37841', borderRadius: '3px', display: 'inline-block' }}></span>
            <span>Eigenkapital</span>
          </div>
          <span style={{ fontWeight: '800', color: '#A37841' }}>{formatEuroInt(equity)} € ({formatPct(eqPct)}%)</span>
        </div>

        {kfwPct > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2D9CE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#2B6CB0', borderRadius: '3px', display: 'inline-block' }}></span>
              <span>KfW-Darlehen</span>
            </div>
            <span style={{ fontWeight: '800', color: '#2B6CB0' }}>{formatEuroInt(kfw)} € ({formatPct(kfwPct)}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
