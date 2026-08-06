'use client';
import React from 'react';
import { formatEuroInt } from '../../utils/formatters';

export default function PdfReportTemplate({ formData, model, selectedKpis }) {
  const propertyTitle = formData?.obj_name || 'Neues Investment-Objekt';
  const locationText = [formData?.stadt, formData?.stadtteil, formData?.bundesland].filter(Boolean).join(' • ') || 'Keine Ortsangabe';
  
  const sliced10Years = model?.slicedProjection?.slice(0, 10) || [];
  const currentDate = new Date().toLocaleDateString('de-DE');

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
            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#13381A', margin: 0 }}>VALUON ESTATE</h1>
            <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Investitions- & Performance-Analyse
            </span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#718096', fontWeight: '600' }}>
            Erstellt am: {currentDate}<br />
            Status: <strong style={{ color: '#13381A' }}>Expose-Auswertung</strong>
          </div>
        </div>

        {/* OBJEKT SUMMARY BOX */}
        <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase' }}>Objektbezeichnung</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#13381A' }}>{propertyTitle}</div>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px' }}>{locationText}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase' }}>Kaufpreis</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#13381A' }}>{formatEuroInt(formData?.kaufpreis || 0)} €</div>
            <div style={{ fontSize: '0.7rem', color: '#718096' }}>{formatEuroInt(model?.stammDaten?.kaufpreisProQm || 0)} € / m²</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase' }}>Wohnfläche</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#13381A' }}>{formData?.qm || 0} m²</div>
            <div style={{ fontSize: '0.7rem', color: '#718096' }}>Baujahr {formData?.baujahr || '–'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase' }}>Miete (Soll/Monat)</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#13381A' }}>{formatEuroInt(formData?.kaltmiete_monat || 0)} €</div>
            <div style={{ fontSize: '0.7rem', color: '#718096' }}>{((formData?.kaltmiete_monat || 0) / (formData?.qm || 1)).toFixed(2)} € / m²</div>
          </div>
        </div>

        {/* DIE 4 HAUPT KPI KARTEN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {(selectedKpis || []).map((config, idx) => {
            const valueStr = config.getValue(model);
            const subStr = config.getSub(model);
            const cardColor = config.isPos ? (config.isPos(model) ? '#276749' : '#9B2C2C') : config.color;

            return (
              <div key={idx} style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{config.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: cardColor, margin: '6px 0' }}>{valueStr}</div>
                <div style={{ fontSize: '0.68rem', color: '#718096', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subStr}</div>
              </div>
            );
          })}
        </div>

        {/* FINANZIERUNGS- UND METRIKEN-MATRIX */}
        <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#13381A', borderBottom: '2px solid #E2D9CE', paddingBottom: '4px', marginBottom: '6px' }}>Finanzierungs-Struktur</div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Eigenkapital-Einsatz:</span><strong style={pdfValueStyle}>{formatEuroInt(model.finanzierung.ekEuro)} € ({model.finanzierung.ekQuote.toFixed(1)} %)</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Fremdkapital (Bank):</span><strong style={pdfValueStyle}>{formatEuroInt(model.finanzierung.hbLoan)} €</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Beleihungsauslauf (LTV):</span><strong style={pdfValueStyle}>{model.finanzierung.ltv.toFixed(1)} %</strong></div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#13381A', borderBottom: '2px solid #E2D9CE', paddingBottom: '4px', marginBottom: '6px' }}>Rendite & Vervielfältiger</div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Kaufpreisfaktor:</span><strong style={pdfValueStyle}>{model.kpis.kaufpreisfaktor.toFixed(1)}x</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Netto-Mietrendite (J1):</span><strong style={pdfValueStyle}>{model.kpis.nettoMietrenditeInitial.toFixed(2)} %</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Cash-on-Cash Return:</span><strong style={pdfValueStyle}>{model.kpis.cashOnCashReturn.toFixed(2)} %</strong></div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#13381A', borderBottom: '2px solid #E2D9CE', paddingBottom: '4px', marginBottom: '6px' }}>Bank- & Risiko-Profil</div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>DSCR (Deckung):</span><strong style={pdfValueStyle}>{model.kpis.dscrInitial.toFixed(2)}x</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Break-Even-Miete:</span><strong style={pdfValueStyle}>{formatEuroInt(model.kpis.breakEvenMieteMo)} € / Mo</strong></div>
            <div style={pdfRowStyle}><span style={pdfLabelStyle}>Gesamtkosten pro m²:</span><strong style={pdfValueStyle}>{formatEuroInt(model.stammDaten.gesamtKostenProQm)} € / m²</strong></div>
          </div>
        </div>

        {/* PROGNOSE-TABELLE (10-JAHRES UBERSICHT) */}
        <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#13381A', marginBottom: '8px' }}>
            10-Jahres Cashflow & Tilgungsverlauf (Kurzübersicht)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#FAF8F5', borderBottom: '1.5px solid #E2D9CE', color: '#13381A', fontWeight: '800' }}>
                <th style={{ padding: '4px 6px', textAlign: 'left' }}>Jahr</th>
                <th style={{ padding: '4px 6px' }}>Miete IST p.a.</th>
                <th style={{ padding: '4px 6px' }}>Zinsen p.a.</th>
                <th style={{ padding: '4px 6px' }}>Tilgung p.a.</th>
                <th style={{ padding: '4px 6px' }}>Steuer p.a.</th>
                <th style={{ padding: '4px 6px' }}>Cashflow Netto</th>
                <th style={{ padding: '4px 6px' }}>Restschuld</th>
                <th style={{ padding: '4px 6px' }}>Immo-Wert</th>
              </tr>
            </thead>
            <tbody>
              {sliced10Years.map((row) => (
                <tr key={row.Jahr} style={{ borderBottom: '1px solid #F0EBE1' }}>
                  <td style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700' }}>Jahr {row.Jahr}</td>
                  <td style={{ padding: '4px 6px' }}>{formatEuroInt(row['Mieteinnahmen IST'])} €</td>
                  <td style={{ padding: '4px 6px', color: '#9B2C2C' }}>-{formatEuroInt(row['Zinsen'])} €</td>
                  <td style={{ padding: '4px 6px' }}>{formatEuroInt(row['Tilgung'])} €</td>
                  <td style={{ padding: '4px 6px' }}>{formatEuroInt(row['Steuer'])} €</td>
                  <td style={{ padding: '4px 6px', fontWeight: '800', color: row['Cashflow Netto'] >= 0 ? '#276749' : '#9B2C2C' }}>
                    {row['Cashflow Netto'] >= 0 ? '+' : ''}{formatEuroInt(row['Cashflow Netto'])} €
                  </td>
                  <td style={{ padding: '4px 6px' }}>{formatEuroInt(row['Restschuld'])} €</td>
                  <td style={{ padding: '4px 6px', fontWeight: '700' }}>{formatEuroInt(row['Immobilienwert'])} €</td>
                </tr>
              ))}
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

const pdfRowStyle = {
  display: 'flex',
  justify: 'space-between',
  alignItems: 'center',
  padding: '3px 0',
  borderBottom: '1px solid #F0EBE1',
  fontSize: '0.68rem'
};

const pdfLabelStyle = {
  color: '#718096',
  fontWeight: '600'
};

const pdfValueStyle = {
  color: '#13381A',
  fontWeight: '800'
};
