'use client';
import React from 'react';
import { formatEuroInt } from '../../utils/formatters';

// Fallback KPI Konfigurationen, falls selectedKpis unvollständig ist
const DEFAULT_KPIS = [
  { label: 'Netto-Cashflow (Ø / Mo)', getValue: (m) => `${m?.kpis?.isCfPositive ? '+' : ''}${formatEuroInt(m?.kpis?.avgMonthlyCashflow || 0)} € / Mo.`, getSub: (m) => `Ø pro Monat n. St. (${m?.kpis?.horizonYears || 10} J.)`, isPos: (m) => m?.kpis?.isCfPositive },
  { label: 'Brutto-Mietrendite (Ø p.a.)', getValue: (m) => `${(m?.kpis?.avgBruttoRendite || 0).toFixed(2)} %`, getSub: () => 'Ø Miete p.a. / Kaufpreis', color: '#13381A' },
  { label: 'Progn. EK-Rendite (IRR)', getValue: (m) => `${(m?.kpis?.validIrr || 0).toFixed(2)} %`, getSub: (m) => `Erwartete EK-Verzinsung bei Exit (${m?.kpis?.horizonYears || 10} J.)`, color: '#A37841' },
  { label: 'Progn. Gesamtgewinn', getValue: (m) => `${(m?.kpis?.gesamtGewinn || 0) >= 0 ? '+' : ''}${formatEuroInt(m?.kpis?.gesamtGewinn || 0)} €`, getSub: (m) => `Erwarteter Kum. Cashflow + NAV (${m?.kpis?.horizonYears || 10} J.)`, isPos: (m) => (m?.kpis?.gesamtGewinn || 0) >= 0 }
];

export default function PdfReportTemplate({ formData, model, selectedKpis }) {
  const propertyTitle = formData?.obj_name || 'Neues Investment-Objekt';
  const locationText = [formData?.stadt, formData?.stadtteil, formData?.bundesland].filter(Boolean).join(' • ') || 'Keine Ortsangabe';
  
  const sliced10Years = model?.slicedProjection?.slice(0, 10) || [];
  const currentDate = new Date().toLocaleDateString('de-DE');

  // Falls keine oder weniger als 4 KPIs übergeben werden, nutzen wir die Standardauswahl
  const displayKpis = (selectedKpis && selectedKpis.length >= 4) ? selectedKpis : DEFAULT_KPIS;

  const kaltmieteMo = formData?.kaltmiete_monat || formData?.kaltmiete || 0;
  const qm = formData?.qm || 1;
  const mieteProQm = (kaltmieteMo / qm).toFixed(2);

  return (
    <div
      id="pdf-report-template"
      style={{
        width: '794px',
        height: '1123px',
        padding: '32px',
        boxSizing: 'border-box',
        background: '#FAF8F5',
        color: '#13381A',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px'
      }}
    >
      <div>
        {/* KOPFZEILE / HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #13381A', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#13381A', margin: 0, letterSpacing: '-0.5px' }}>VALUON ESTATE</h1>
            <span style={{ fontSize: '0.72rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Investitions- & Performance-Analyse
            </span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#718096', fontWeight: '600', lineHeight: '1.4' }}>
            Erstellt am: {currentDate}<br />
            Status: <strong style={{ color: '#13381A' }}>Exposé-Auswertung</strong>
          </div>
        </div>

        {/* OBJEKT SUMMARY BOX */}
        <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '14px 18px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1.1fr', gap: '12px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#718096', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Objektbezeichnung</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#13381A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{propertyTitle}</div>
            <div style={{ fontSize: '0.73rem', color: '#718096', marginTop: '2px' }}>{locationText}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#718096', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kaufpreis</div>
            <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#13381A' }}>{formatEuroInt(formData?.kaufpreis || 0)} €</div>
            <div style={{ fontSize: '0.7rem', color: '#718096' }}>{formatEuroInt(model?.stammDaten?.kaufpreisProQm || 0)} € / m²</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#718096', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wohnfläche</div>
            <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#13381A' }}>{formData?.qm || 0} m²</div>
            <div style={{ fontSize: '0.7rem', color: '#718096' }}>Baujahr {formData?.baujahr || '–'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#718096', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Miete (Soll/Monat)</div>
            <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#13381A' }}>{formatEuroInt(kaltmieteMo)} €</div>
            <div style={{ fontSize: '0.7rem', color: '#718096' }}>{mieteProQm} € / m²</div>
          </div>
        </div>

        {/* DIE 4 HAUPT KPI KARTEN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
          {displayKpis.map((config, idx) => {
            const valueStr = config.getValue ? config.getValue(model) : '–';
            const subStr = config.getSub ? config.getSub(model) : '';
            const cardColor = config.isPos ? (config.isPos(model) ? '#276749' : '#9B2C2C') : (config.color || '#13381A');

            return (
              <div key={idx} style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '82px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: '1.2' }}>{config.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: cardColor, margin: '4px 0', lineHeight: '1.1' }}>{valueStr}</div>
                <div style={{ fontSize: '0.65rem', color: '#718096', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subStr}</div>
              </div>
            );
          })}
        </div>

        {/* FINANZIERUNGS- UND METRIKEN-MATRIX */}
        <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '14px' }}>
          <div>
            <div style={matrixHeaderStyle}>Finanzierungs-Struktur</div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Eigenkapital-Einsatz:</span><strong style={pdfValueStyle}>{formatEuroInt(model?.finanzierung?.ekEuro || 0)} € ({(model?.finanzierung?.ekQuote || 0).toFixed(1)} %)</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Fremdkapital (Bank):</span><strong style={pdfValueStyle}>{formatEuroInt(model?.finanzierung?.hbLoan || 0)} €</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Beleihungsauslauf (LTV):</span><strong style={pdfValueStyle}>{(model?.finanzierung?.ltv || 0).toFixed(1)} %</strong></div>
          </div>

          <div>
            <div style={matrixHeaderStyle}>Rendite & Vervielfältiger</div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Kaufpreisfaktor:</span><strong style={pdfValueStyle}>{(model?.kpis?.kaufpreisfaktor || 0).toFixed(1)}x</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Netto-Mietrendite (J1):</span><strong style={pdfValueStyle}>{(model?.kpis?.nettoMietrenditeInitial || 0).toFixed(2)} %</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Cash-on-Cash Return:</span><strong style={pdfValueStyle}>{(model?.kpis?.cashOnCashReturn || 0).toFixed(2)} %</strong></div>
          </div>

          <div>
            <div style={matrixHeaderStyle}>Bank- & Risiko-Profil</div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>DSCR (Deckung):</span><strong style={pdfValueStyle}>{(model?.kpis?.dscrInitial || 0).toFixed(2)}x</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Break-Even-Miete:</span><strong style={pdfValueStyle}>{formatEuroInt(model?.kpis?.breakEvenMieteMo || 0)} € / Mo</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Gesamtkosten pro m²:</span><strong style={pdfValueStyle}>{formatEuroInt(model?.stammDaten?.gesamtKostenProQm || 0)} € / m²</strong></div>
          </div>
        </div>

        {/* PROGNOSE-TABELLE (10-JAHRES KURZÜBERSICHT) */}
        <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#13381A', marginBottom: '8px' }}>
            10-Jahres Cashflow & Tilgungsverlauf (Kurzübersicht)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.66rem', textAlign: 'right', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#FAF8F5', borderBottom: '1.5px solid #E2D9CE', color: '#13381A', fontWeight: '800' }}>
                <th style={{ padding: '5px 4px', textAlign: 'left', width: '10%' }}>Jahr</th>
                <th style={{ padding: '5px 4px', width: '13%' }}>Miete IST p.a.</th>
                <th style={{ padding: '5px 4px', width: '13%' }}>Zinsen p.a.</th>
                <th style={{ padding: '5px 4px', width: '12%' }}>Tilgung p.a.</th>
                <th style={{ padding: '5px 4px', width: '12%' }}>Steuer p.a.</th>
                <th style={{ padding: '5px 4px', width: '13%' }}>Cashflow Netto</th>
                <th style={{ padding: '5px 4px', width: '13%' }}>Restschuld</th>
                <th style={{ padding: '5px 4px', width: '14%' }}>Immo-Wert</th>
              </tr>
            </thead>
            <tbody>
              {sliced10Years.map((row, idx) => {
                const jahr = row.Jahr ?? row.jahr ?? (idx + 1);
                const miete = row['Mieteinnahmen IST'] ?? row.miete ?? 0;
                const zinsen = row['Zinsen'] ?? row.zinsen ?? 0;
                const tilgung = row['Tilgung'] ?? row.tilgung ?? 0;
                const steuer = row['Steuer'] ?? row.steuer ?? 0;
                const cfNetto = row['Cashflow Netto'] ?? row.nettoCashflow ?? 0;
                const restschuld = row['Restschuld'] ?? row.restschuld ?? 0;
                const immoWert = row['Immobilienwert'] ?? row.immobilienwert ?? 0;

                return (
                  <tr key={jahr} style={{ borderBottom: '1px solid #F0EBE1' }}>
                    <td style={{ padding: '4px 4px', textAlign: 'left', fontWeight: '700' }}>Jahr {jahr}</td>
                    <td style={{ padding: '4px 4px' }}>{formatEuroInt(miete)} €</td>
                    <td style={{ padding: '4px 4px', color: '#9B2C2C' }}>-{formatEuroInt(Math.abs(zinsen))} €</td>
                    <td style={{ padding: '4px 4px' }}>{formatEuroInt(tilgung)} €</td>
                    <td style={{ padding: '4px 4px' }}>{formatEuroInt(steuer)} €</td>
                    <td style={{ padding: '4px 4px', fontWeight: '800', color: cfNetto >= 0 ? '#276749' : '#9B2C2C' }}>
                      {cfNetto >= 0 ? '+' : ''}{formatEuroInt(cfNetto)} €
                    </td>
                    <td style={{ padding: '4px 4px' }}>{formatEuroInt(restschuld)} €</td>
                    <td style={{ padding: '4px 4px', fontWeight: '700' }}>{formatEuroInt(immoWert)} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #E2D9CE', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', color: '#718096' }}>
        <div>
          <strong>Hinweis:</strong> Dies ist eine zukunftsgerichtete Modellrechnung von Valuon Estate. Keine Garantie, Finanz- oder Steuerberatung.
        </div>
        <div>Seite 1 / 1</div>
      </div>
    </div>
  );
}

const matrixHeaderStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  color: '#13381A',
  borderBottom: '2px solid #E2D9CE',
  paddingBottom: '4px',
  marginBottom: '6px'
};

const pdfRowStyle = {
  display: 'flex',
  justify: 'space-between',
  alignItems: 'center',
  padding: '3px 0',
  borderBottom: '1px solid #F0EBE1',
  fontSize: '0.68rem',
  gap: '12px'
};

const pdfLabelStyle = {
  color: '#718096',
  fontWeight: '600',
  marginRight: '8px',
  whiteSpace: 'nowrap'
};

const pdfValueStyle = {
  color: '#13381A',
  fontWeight: '800',
  textAlign: 'right',
  whiteSpace: 'nowrap'
};
