'use client';
import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { formatEuroInt } from '../../utils/formatters';

export default function ProjectionChart({ slicedProjection, formData }) {
  // ANSICHTS-ZUSTAND: 'vermoegen' | 'cashflow' | 'amortisation'
  const [activeView, setActiveView] = useState('vermoegen');

  const rawData = slicedProjection || [];
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const ekEuro = Number(formData?.ek_euro || 0);

  // DATENAUFBEREITUNG FÜR DIE DIAGRAMME
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

  // TOOLTIP-FORMATIERER
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          border: '1px solid #E2D9CE',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          fontSize: '0.8rem'
        }}>
          <div style={{ fontWeight: '800', color: '#13381A', marginBottom: '6px', borderBottom: '1px solid #E2D9CE', paddingBottom: '4px' }}>
            Jahr {label ? label.replace('J', '') : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {payload.map((entry, index) => (
              <div key={index} style={{ color: entry.color, fontWeight: '600', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span>{entry.name}:</span>
                <span style={{ fontWeight: '800' }}>{formatEuroInt(entry.value)} €</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
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
      
      {/* HEADER MIT TITEL UND UMSCHALTER-BUTTONS */}
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

        {/* ANSICHTS-SCHALTER */}
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
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DIAGRAMM-CONTAINER */}
      <div style={{ width: '100%', height: '380px', marginTop: '0.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          
          {/* ANSICHT 1: VERMÖGENS- UND SCHULDENVERLAUF (AREA CHART) */}
          {activeView === 'vermoegen' && (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorImmo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#13381A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#13381A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSchuld" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B2C2C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#9B2C2C" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A37841" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A37841" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2D9CE" />
              <XAxis dataKey="jahrLabel" stroke="#718096" fontSize={12} tickLine={false} />
              <YAxis stroke="#718096" fontSize={11} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k €`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.8rem' }} />
              
              {chartData.some(d => d.jahr === 10) && (
                <ReferenceLine x="J10" stroke="#13381A" strokeDasharray="3 3" label={{ value: 'Zinsbindung 10 J.', fill: '#13381A', fontSize: 10, position: 'top' }} />
              )}

              <Area type="monotone" dataKey="immobilienwert" name="Immobilienwert" stroke="#13381A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorImmo)" />
              <Area type="monotone" dataKey="netEquity" name="Netto-Eigenkapital (NAV)" stroke="#A37841" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
              <Area type="monotone" dataKey="restschuld" name="Restschuld (Bank)" stroke="#9B2C2C" strokeWidth={2} fillOpacity={1} fill="url(#colorSchuld)" />
            </AreaChart>
          )}

          {/* ANSICHT 2: CASHFLOW & MIETEINNAHMEN (COMPOSED CHART) */}
          {activeView === 'cashflow' && (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2D9CE" />
              <XAxis dataKey="jahrLabel" stroke="#718096" fontSize={12} tickLine={false} />
              <YAxis stroke="#718096" fontSize={11} tickLine={false} tickFormatter={(v) => `${formatEuroInt(v)} €`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.8rem' }} />

              {chartData.some(d => d.jahr === 10) && (
                <ReferenceLine x="J10" stroke="#13381A" strokeDasharray="3 3" label={{ value: 'Zinsbindung 10 J.', fill: '#13381A', fontSize: 10, position: 'top' }} />
              )}

              <Bar dataKey="miete" name="Kaltmiete p.a." fill="#13381A" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="kapitaldienst" name="Kapitaldienst (Bank p.a.)" fill="#A37841" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Line type="monotone" dataKey="nettoCashflow" name="Netto-Cashflow p.a." stroke="#276749" strokeWidth={3} dot={{ r: 4, fill: '#276749' }} />
            </ComposedChart>
          )}

          {/* ANSICHT 3: AMORTISATION & BREAK-EVEN (LINE CHART) */}
          {activeView === 'amortisation' && (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2D9CE" />
              <XAxis dataKey="jahrLabel" stroke="#718096" fontSize={12} tickLine={false} />
              <YAxis stroke="#718096" fontSize={11} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k €`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.8rem' }} />

              {/* BREAK-EVEN NULL-LINIE */}
              <ReferenceLine y={0} stroke="#718096" strokeWidth={1.5} label={{ value: 'Break-Even', fill: '#718096', fontSize: 11, position: 'insideTopLeft' }} />

              {chartData.some(d => d.jahr === 10) && (
                <ReferenceLine x="J10" stroke="#13381A" strokeDasharray="3 3" label={{ value: 'Zinsbindung 10 J.', fill: '#13381A', fontSize: 10, position: 'top' }} />
              )}

              <Line type="monotone" dataKey="totalReturn" name="Gesamtgewinn (Cashflow + NAV)" stroke="#13381A" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="cumCashflow" name="Kumulierter Netto-Cashflow" stroke="#A37841" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          )}

        </ResponsiveContainer>
      </div>

    </div>
  );
}
