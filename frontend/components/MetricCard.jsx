'use client';

export default function MetricCard({ title, value, highlight = false, isNegative = false }) {
  return (
    <div style={{ 
      background: highlight ? '#FAF8F5' : 'white', 
      padding: '1.2rem', 
      borderRadius: '10px', 
      border: '1px solid #E2D9CE',
      borderLeft: isNegative ? '4px solid #9B2C2C' : (highlight ? '4px solid #A37841' : '1px solid #E2D9CE'),
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#555759', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '900', color: isNegative ? '#9B2C2C' : (highlight ? '#A37841' : '#13381A'), letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}
