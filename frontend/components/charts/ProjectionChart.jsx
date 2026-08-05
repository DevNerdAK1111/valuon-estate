'use client';
import { useState } from 'react';
import { formatEuroInt } from '../../utils/formatters';

export default function ProjectionChart({ chartView, setChartView, slicedProjection }) {
  const data = slicedProjection || [];

  if (!data || data.length === 0) {
    return (
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE', textAlign: 'center', color: '#718096' }}>
        Keine Daten für das Chart vorhanden.
      </div>
    );
  }

  // MAX-WERTE FÜR BALKEN-SKALIERUNG BERECHNEN
  const maxVal = Math.max(...data.map(d => Math.max(
    Math.abs(d['Immobilienwert'] || 0),
    Math.abs(d['Restschuld'] || 0),
    Math.abs(d['Cashflow Netto'] || 0),
    Math.abs(d['Mieteinnahmen p.a.'] || 0)
  )), 1);

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* CHART-HEADER & SELECTOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#13381A', fontWeight: '800' }}>
          Visuelle Prognose & Entwicklung
        </h3>
        <select
          value={chartView}
          onChange={(e) => setChartView(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.85rem', color: '#13381A', background: '#FAF8F5', fontWeight: '700' }}
        >
          <option value="1. Vermögensstruktur & NAV (Netto-Eigenkapital)">1. Vermögensaufbau & Schuldenabbau</option>
          <option value="2. Cashflow & Liquiditätsverlauf">2. Cashflow-Entwicklung p.a.</option>
        </select>
      </div>

      {/* CHARTS CONTAINER */}
      <div style={{ minHeight: '260px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '2rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {data.map((item, idx) => {
          const year = item['Jahr'] || idx + 1;
          const immoWert = item['Immobilienwert'] || 0;
          const restschuld = item['Restschuld'] || 0;
          const cfNetto = item['Cashflow Netto'] || 0;

          const heightWert = Math.min((immoWert / maxVal) * 200, 200);
          const heightSchuld = Math.min((restschuld / maxVal) * 200, 200);
          const heightCf = Math.min((Math.abs(cfNetto) / maxVal) * 200, 200);

          return (
            <div key={idx} style={{ flex: 1, minWidth: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              
              {chartView.includes('Vermögensstruktur') ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '200px' }}>
                  {/* BALKEN IMMOBILIENWERT */}
                  <div
                    title={`Jahr ${year}: Wert ${formatEuroInt(immoWert)} €`}
                    style={{ width: '12px', height: `${heightWert}px`, background: '#13381A', borderRadius: '3px 3px 0 0' }}
                  />
                  {/* BALKEN RESTSCHULD */}
                  <div
                    title={`Jahr ${year}: Restschuld ${formatEuroInt(restschuld)} €`}
                    style={{ width: '12px', height: `${heightSchuld}px`, background: '#A37841', borderRadius: '3px 3px 0 0' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px' }}>
                  {/* BALKEN CASHFLOW */}
                  <div
                    title={`Jahr ${year}: Cashflow ${formatEuroInt(cfNetto)} €`}
                    style={{
                      width: '18px',
                      height: `${Math.max(heightCf, 4)}px`,
                      background: cfNetto >= 0 ? '#38A169' : '#E53E3E',
                      borderRadius: '3px 3px 0 0'
                    }}
                  />
                </div>
              )}

              <span style={{ fontSize: '0.7rem', color: '#718096', fontWeight: '700' }}>J{year}</span>
            </div>
          );
        })}
      </div>

      {/* LEGENDE */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.8rem', color: '#4A5568', marginTop: '8px' }}>
        {chartView.includes('Vermögensstruktur') ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: '#13381A', borderRadius: '2px' }} /> Immobilienwert
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: '#A37841', borderRadius: '2px' }} /> Restschuld
            </span>
          </>
        ) : (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: '#38A169', borderRadius: '2px' }} /> Positiver Cashflow
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: '#E53E3E', borderRadius: '2px' }} /> Negativer Cashflow
            </span>
          </>
        )}
      </div>

    </div>
  );
}
