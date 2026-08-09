'use client';
import { useState } from 'react';
import { IconFolder, IconRefresh, IconTrash } from '../ui/Icons';
import { formatEuroInt, formatPct } from '../../utils/formatters';
import { updatePropertyStatusApi, calculateInvestmentApi } from '../../lib/propertyApi';
import { calculateInvestmentModel } from '../../utils/calculateInvestment';

const DEFAULT_PDF_KPIS = [
  { id: 'cf', label: 'Netto-Cashflow (Ø / Mo)', getValue: (m) => `${m.kpis.isCfPositive ? '+' : ''}${formatEuroInt(m.kpis.avgMonthlyCashflow)} € / Mo.`, getSub: (m) => `Ø pro Monat n. St. (${m.kpis.horizonYears} J.)`, isPos: (m) => m.kpis.isCfPositive },
  { id: 'brutto', label: 'Brutto-Mietrendite (Ø p.a.)', getValue: (m) => `${m.kpis.avgBruttoRendite.toFixed(2)} %`, getSub: () => 'Ø Miete p.a. / Kaufpreis', color: '#13381A' },
  { id: 'irr', label: 'Progn. EK-Rendite (IRR)', getValue: (m) => `${m.kpis.validIrr.toFixed(2)} %`, getSub: (m) => `Erwartete EK-Verzinsung bei Exit (${m.kpis.horizonYears} J.)`, color: '#A37841' },
  { id: 'gewinn', label: 'Progn. Gesamtgewinn', getValue: (m) => `${m.kpis.gesamtGewinn >= 0 ? '+' : ''}${formatEuroInt(m.kpis.gesamtGewinn)} €`, getSub: (m) => `Erwarteter Kum. Cashflow + NAV (${m.kpis.horizonYears} J.)`, isPos: (m) => m.kpis.gesamtGewinn >= 0 }
];

export default function DatabaseView({
  loadingDb,
  dbProperties = [],
  fetchDatabaseProperties,
  loadPropertyFromDb,
  deletePropertyFromDb
}) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'bestand'
  const [updatingId, setUpdatingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  const pipelineItems = dbProperties.filter(
    (item) => !item.status || item.status === 'pipeline'
  );
  const bestandItems = dbProperties.filter(
    (item) => item.status === 'bestand'
  );

  const displayedProperties = activeTab === 'pipeline' ? pipelineItems : bestandItems;

  const handleStatusChange = async (property, newStatus) => {
    const propId = property.id || property._id;
    if (!propId) {
      alert('Fehler: Keine gültige Objekt-ID gefunden.');
      return;
    }

    setUpdatingId(propId);
    try {
      await updatePropertyStatusApi(propId, newStatus);
      await fetchDatabaseProperties();
    } catch (err) {
      alert(`Fehler beim Aktualisieren des Status: ${err.message || 'Unbekannter Fehler'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportPdf = async (item) => {
    const itemId = item.id || item._id;
    setExportingId(itemId);

    try {
      const formData = item.form_data || {
        obj_name: item.name || item.obj_name,
        kaufpreis: item.kaufpreis,
        qm: item.qm,
        stadt: item.stadt,
        bundesland: item.bundesland
      };
      const capexList = item.capex_list || [];

      // 1. Frische Berechnung über das Backend anfordern
      const calcResult = await calculateInvestmentApi(formData, capexList);
      const model = calculateInvestmentModel(formData, '10', calcResult);

      // 2. Dynamischer Client-Import von @react-pdf/renderer und dem PDF-Template
      const { pdf } = await import('@react-pdf/renderer');
      const PdfReportTemplate = (await import('../pdf/PdfReportTemplate')).default;

      // 3. Vektor-PDF als Blob generieren
      const blob = await pdf(
        <PdfReportTemplate
          formData={formData}
          model={model}
          selectedKpis={DEFAULT_PDF_KPIS}
        />
      ).toBlob();

      // 4. Download auslösen
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = (formData.obj_name || 'Immobilien_Analyse').replace(/\s+/g, '_');
      link.download = `${fileName}_Valuon.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`PDF Export fehlgeschlagen: ${err.message || 'Unbekannter Fehler'}`);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#13381A' }}>Objekt Datenbank & Portfolio</h2>
          <span style={{ fontSize: '0.82rem', color: '#718096' }}>
            Verwalte deine Such-Pipeline und deinen gekauften Immobilienbestand
          </span>
        </div>
        <button onClick={fetchDatabaseProperties} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <IconRefresh /> Aktualisieren
        </button>
      </div>

      {/* TAB SWITCHER */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2D9CE', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('pipeline')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pipeline' ? '3px solid #13381A' : '3px solid transparent',
            color: activeTab === 'pipeline' ? '#13381A' : '#718096',
            fontWeight: activeTab === 'pipeline' ? '800' : '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          Pipeline ({pipelineItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bestand')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bestand' ? '3px solid #13381A' : '3px solid transparent',
            color: activeTab === 'bestand' ? '#13381A' : '#718096',
            fontWeight: activeTab === 'bestand' ? '800' : '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          Bestand ({bestandItems.length})
        </button>
      </div>

      {loadingDb ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Lade Objekte aus Supabase...</div>
      ) : displayedProperties.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#888', border: '2px dashed #E2D9CE', borderRadius: '8px' }}>
          Noch keine Objekte in {activeTab === 'pipeline' ? 'der Pipeline' : 'deinem Bestand'} gespeichert.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#FAF8F5', borderBottom: '2px solid #E2D9CE' }}>
                <th style={{ padding: '12px' }}>Objektname</th>
                <th style={{ padding: '12px' }}>Typ</th>
                <th style={{ padding: '12px' }}>Ort</th>
                <th style={{ padding: '12px' }}>Kaufpreis</th>
                <th style={{ padding: '12px' }}>Wohnfläche</th>
                <th style={{ padding: '12px' }}>IRR Rendite</th>
                <th style={{ padding: '12px' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {displayedProperties.map((item, idx) => {
                const itemId = item.id || item._id;
                const isExportingThis = exportingId === itemId;

                return (
                  <tr key={itemId || idx} style={{ borderBottom: '1px solid #E2D9CE' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#13381A' }}>{item.name || item.obj_name || item.form_data?.obj_name}</td>
                    <td style={{ padding: '12px' }}>{item.objektart || item.form_data?.objektart}</td>
                    <td style={{ padding: '12px' }}>{item.stadt || item.form_data?.stadt}</td>
                    <td style={{ padding: '12px' }}>{formatEuroInt(item.kaufpreis || item.form_data?.kaufpreis)} €</td>
                    <td style={{ padding: '12px' }}>{item.qm || item.form_data?.qm} m²</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#A37841' }}>
                      {item.irr ? formatPct(item.irr * 100) + ' %' : '–'}
                    </td>
                    <td style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => loadPropertyFromDb(item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <IconFolder /> In Analyse laden
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportPdf(item)}
                        disabled={isExportingThis}
                        style={{
                          padding: '6px 10px',
                          background: '#A37841',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isExportingThis ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          opacity: isExportingThis ? 0.6 : 1
                        }}
                      >
                        {isExportingThis ? 'PDF lädt...' : 'PDF Export'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item, activeTab === 'pipeline' ? 'bestand' : 'pipeline')}
                        disabled={updatingId === itemId}
                        style={{
                          padding: '6px 10px',
                          background: '#FAF8F5',
                          color: '#13381A',
                          border: '1px solid #13381A',
                          borderRadius: '4px',
                          cursor: updatingId === itemId ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          opacity: updatingId === itemId ? 0.6 : 1
                        }}
                      >
                        {updatingId === itemId ? 'Speichert...' : (activeTab === 'pipeline' ? 'In Bestand' : 'In Pipeline')}
                      </button>

                      <button onClick={() => deletePropertyFromDb(itemId)} style={{ padding: '6px 10px', background: '#FFF5F5', color: '#9B2C2C', border: '1px solid #FEB2B2', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
