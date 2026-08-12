import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatEuroInt } from '../../utils/formatters';

const styles = StyleSheet.create({
  page: {
    padding: 28,
    backgroundColor: '#FAF8F5',
    color: '#13381A',
    fontSize: 8,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#13381A',
    paddingBottom: 8,
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#13381A',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 7,
    color: '#718096',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginTop: 2
  },
  headerMeta: {
    textAlign: 'right',
    fontSize: 7,
    color: '#718096',
    lineHeight: 1.3
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2D9CE',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryCol: {
    flexDirection: 'column'
  },
  summaryLabel: {
    fontSize: 6,
    color: '#718096',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  summaryVal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#13381A'
  },
  summarySub: {
    fontSize: 7,
    color: '#718096'
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2D9CE',
    borderRadius: 6,
    padding: 8,
    justifyContent: 'space-between',
    minHeight: 50
  },
  kpiLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#718096',
    textTransform: 'uppercase'
  },
  kpiVal: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginVertical: 2
  },
  kpiSub: {
    fontSize: 6,
    color: '#718096'
  },
  matrixGrid: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2D9CE',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  matrixCol: {
    flex: 1
  },
  matrixHeader: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#13381A',
    borderBottomWidth: 1,
    borderBottomColor: '#E2D9CE',
    paddingBottom: 3,
    marginBottom: 4
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0EBE1'
  },
  matrixLabel: {
    fontSize: 6.5,
    color: '#718096'
  },
  matrixValue: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#13381A'
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2D9CE',
    borderRadius: 6,
    padding: 8
  },
  tableTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#13381A',
    marginBottom: 6
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E2D9CE',
    paddingVertical: 4
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0EBE1',
    paddingVertical: 3
  },
  th: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#13381A',
    textAlign: 'right'
  },
  td: {
    fontSize: 6,
    color: '#2D3748',
    textAlign: 'right'
  },
  col0: { width: '10%', textAlign: 'left' },
  col1: { width: '13%' },
  col2: { width: '13%' },
  col3: { width: '12%' },
  col4: { width: '12%' },
  col5: { width: '13%' },
  col6: { width: '13%' },
  col7: { width: '14%' },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 28,
    right: 28,
    borderTopWidth: 0.5,
    borderTopColor: '#E2D9CE',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 6,
    color: '#718096'
  }
});

const DEFAULT_KPIS = [
  { label: 'Netto-Cashflow', getValue: (m) => `${m?.kpis?.isCfPositive ? '+' : ''}${formatEuroInt(m?.kpis?.avgMonthlyCashflow || 0)} €`, getSub: (m) => `Ø pro Monat n. St. (${m?.kpis?.horizonYears || 10} J.)`, color: '#276749' },
  { label: 'Brutto-Mietrendite (Ø p.a.)', getValue: (m) => `${(m?.kpis?.avgBruttoRendite || 0).toFixed(2)} %`, getSub: () => 'Ø Miete p.a. / Kaufpreis', color: '#13381A' },
  { label: 'Progn. EK-Rendite (IRR)', getValue: (m) => `${(m?.kpis?.validIrr || 0).toFixed(2)} %`, getSub: (m) => `Erwartete EK-Verzinsung bei Exit (${m?.kpis?.horizonYears || 10} J.)`, color: '#A37841' },
  { label: 'Progn. Gesamtgewinn', getValue: (m) => `${(m?.kpis?.gesamtGewinn || 0) >= 0 ? '+' : ''}${formatEuroInt(m?.kpis?.gesamtGewinn || 0)} €`, getSub: (m) => `Erwarteter Kum. Cashflow + NAV (${m?.kpis?.horizonYears || 10} J.)`, color: '#276749' }
];

export default function PdfReportTemplate({ formData, model, selectedKpis }) {
  const propertyTitle = formData?.obj_name || 'Neues Investment-Objekt';
  const locationText = [formData?.stadt, formData?.stadtteil, formData?.bundesland].filter(Boolean).join(' • ') || 'Keine Ortsangabe';
  
  const sliced10Years = model?.slicedProjection?.slice(0, 10) || [];
  const currentDate = new Date().toLocaleDateString('de-DE');

  const displayKpis = (selectedKpis && selectedKpis.length >= 4) ? selectedKpis : DEFAULT_KPIS;
  const kaltmieteMo = formData?.kaltmiete_monat || formData?.kaltmiete || 0;
  const qm = formData?.qm || 1;
  const mieteProQm = (kaltmieteMo / qm).toFixed(2);

  return (
    <Document title={`Expose_${propertyTitle}`}>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>VALUON ESTATE</Text>
            <Text style={styles.subtitle}>Investitions- & Performance-Analyse</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text>Erstellt am: {currentDate}</Text>
            <Text>Status: Exposé-Auswertung</Text>
          </View>
        </View>

        {/* OBJEKT SUMMARY BOX */}
        <View style={styles.summaryBox}>
          <View style={[styles.summaryCol, { flex: 2.2 }]}>
            <Text style={styles.summaryLabel}>Objektbezeichnung</Text>
            <Text style={styles.summaryVal}>{propertyTitle}</Text>
            <Text style={styles.summarySub}>{locationText}</Text>
          </View>
          <View style={[styles.summaryCol, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>Kaufpreis</Text>
            <Text style={styles.summaryVal}>{formatEuroInt(formData?.kaufpreis || 0)} €</Text>
            <Text style={styles.summarySub}>{formatEuroInt(model?.stammDaten?.kaufpreisProQm || 0)} € / m²</Text>
          </View>
          <View style={[styles.summaryCol, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>Wohnfläche</Text>
            <Text style={styles.summaryVal}>{formData?.qm || 0} m²</Text>
            <Text style={styles.summarySub}>Baujahr {formData?.baujahr || '–'}</Text>
          </View>
          <View style={[styles.summaryCol, { flex: 1.1 }]}>
            <Text style={styles.summaryLabel}>Miete (Soll/Monat)</Text>
            <Text style={styles.summaryVal}>{formatEuroInt(kaltmieteMo)} €</Text>
            <Text style={styles.summarySub}>{mieteProQm} € / m²</Text>
          </View>
        </View>

        {/* HAUPT KPIS */}
        <View style={styles.kpiGrid}>
          {displayKpis.map((config, idx) => {
            const valueStr = config.getValue ? config.getValue(model) : '–';
            const subStr = config.getSub ? config.getSub(model) : '';
            const cardColor = config.isPos ? (config.isPos(model) ? '#276749' : '#9B2C2C') : (config.color || '#13381A');

            return (
              <View key={idx} style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{config.label}</Text>
                <Text style={[styles.kpiVal, { color: cardColor }]}>{valueStr}</Text>
                <Text style={styles.kpiSub}>{subStr}</Text>
              </View>
            );
          })}
        </View>

        {/* FINANZIERUNGS- & METRIKEN-MATRIX */}
        <View style={styles.matrixGrid}>
          <View style={styles.matrixCol}>
            <Text style={styles.matrixHeader}>Finanzierungs-Struktur</Text>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Eigenkapital-Einsatz:</Text>
              <Text style={styles.matrixValue}>{formatEuroInt(model?.finanzierung?.ekEuro || 0)} € ({(model?.finanzierung?.ekQuote || 0).toFixed(1)} %)</Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Fremdkapital (Bank):</Text>
              <Text style={styles.matrixValue}>{formatEuroInt(model?.finanzierung?.hbLoan || 0)} €</Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Beleihungsauslauf (LTV):</Text>
              <Text style={styles.matrixValue}>{(model?.finanzierung?.ltv || 0).toFixed(1)} %</Text>
            </View>
          </View>

          <View style={styles.matrixCol}>
            <Text style={styles.matrixHeader}>Rendite & Vervielfältiger</Text>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Kaufpreisfaktor:</Text>
              <Text style={styles.matrixValue}>{(model?.kpis?.kaufpreisfaktor || 0).toFixed(1)}x</Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Netto-Mietrendite (J1):</Text>
              <Text style={styles.matrixValue}>{(model?.kpis?.nettoMietrenditeInitial || 0).toFixed(2)} %</Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Cash-on-Cash Return:</Text>
              <Text style={styles.matrixValue}>{(model?.kpis?.cashOnCashReturn || 0).toFixed(2)} %</Text>
            </View>
          </View>

          <View style={styles.matrixCol}>
            <Text style={styles.matrixHeader}>Bank- & Risiko-Profil</Text>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>DSCR (Deckung):</Text>
              <Text style={styles.matrixValue}>{(model?.kpis?.dscrInitial || 0).toFixed(2)}x</Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Break-Even-Miete:</Text>
              <Text style={styles.matrixValue}>{formatEuroInt(model?.kpis?.breakEvenMieteMo || 0)} € / Mo</Text>
            </View>
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Gesamtkosten pro m²:</Text>
              <Text style={styles.matrixValue}>{formatEuroInt(model?.stammDaten?.gesamtKostenProQm || 0)} € / m²</Text>
            </View>
          </View>
        </View>

        {/* 10-JAHRES PROGNOSE TABELLE */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>10-Jahres Cashflow & Tilgungsverlauf (Kurzübersicht)</Text>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.col0]}>Jahr</Text>
            <Text style={[styles.th, styles.col1]}>Miete IST p.a.</Text>
            <Text style={[styles.th, styles.col2]}>Zinsen p.a.</Text>
            <Text style={[styles.th, styles.col3]}>Tilgung p.a.</Text>
            <Text style={[styles.th, styles.col4]}>Steuer p.a.</Text>
            <Text style={[styles.th, styles.col5]}>Cashflow Netto</Text>
            <Text style={[styles.th, styles.col6]}>Restschuld</Text>
            <Text style={[styles.th, styles.col7]}>Immo-Wert</Text>
          </View>

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
              <View key={jahr} style={styles.tableRow}>
                <Text style={[styles.td, styles.col0, { fontFamily: 'Helvetica-Bold' }]}>Jahr {jahr}</Text>
                <Text style={[styles.td, styles.col1]}>{formatEuroInt(miete)} €</Text>
                <Text style={[styles.td, styles.col2, { color: '#9B2C2C' }]}>-{formatEuroInt(Math.abs(zinsen))} €</Text>
                <Text style={[styles.td, styles.col3]}>{formatEuroInt(tilgung)} €</Text>
                <Text style={[styles.td, styles.col4]}>{formatEuroInt(steuer)} €</Text>
                <Text style={[styles.td, styles.col5, { fontFamily: 'Helvetica-Bold', color: cfNetto >= 0 ? '#276749' : '#9B2C2C' }]}>
                  {cfNetto >= 0 ? '+' : ''}{formatEuroInt(cfNetto)} €
                </Text>
                <Text style={[styles.td, styles.col6]}>{formatEuroInt(restschuld)} €</Text>
                <Text style={[styles.td, styles.col7, { fontFamily: 'Helvetica-Bold' }]}>{formatEuroInt(immoWert)} €</Text>
              </View>
            );
          })}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Hinweis: Dies ist eine zukunftsgerichtete Modellrechnung von Valuon Estate. Keine Garantie, Finanz- oder Steuerberatung.</Text>
          <Text>Seite 1 / 1</Text>
        </View>

      </Page>
    </Document>
  );
}
