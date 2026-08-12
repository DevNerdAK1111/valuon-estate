'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { IconFolder, IconRefresh, IconTrash } from '../ui/Icons';
import { formatEuroInt, formatPct } from '../../utils/formatters';
import { calculateInvestmentApi } from '../../lib/propertyApi';
import { calculateInvestmentModel } from '../../utils/calculateInvestment';
import { useUpdatePropertyStatus } from '../../hooks/usePropertiesQuery';

const DEFAULT_PDF_KPIS = [
  { id: 'cf', label: 'Netto-Cashflow', getValue: (m) => `${m.kpis.isCfPositive ? '+' : ''}${formatEuroInt(m.kpis.avgMonthlyCashflow)} €`, getSub: (m) => `Ø pro Monat n. St. (${m.kpis.horizonYears} J.)`, isPos: (m) => m.kpis.isCfPositive },
  { id: 'brutto', label: 'Brutto-Mietrendite (Ø p.a.)', getValue: (m) => `${m.kpis.avgBruttoRendite.toFixed(2)} %`, getSub: () => 'Ø Miete p.a. / Kaufpreis', color: '#13381A' },
  { id: 'irr', label: 'Progn. EK-Rendite (IRR)', getValue: (m) => `${m.kpis.validIrr.toFixed(2)} %`, getSub: (m) => `Erwartete EK-Verzinsung bei Exit (${m.kpis.horizonYears} J.)`, color: '#A37841' },
  { id: 'gewinn', label: 'Progn. Gesamtgewinn', getValue: (m) => `${m.kpis.gesamtGewinn >= 0 ? '+' : ''}${formatEuroInt(m.kpis.gesamtGewinn)} €`, getSub: (m) => `Erwarteter Kum. Cashflow + NAV (${m.kpis.horizonYears} J.)`, isPos: (m) => m.kpis.gesamtGewinn >= 0 }
];

export default function DatabaseView({
  userEmail,
  loadingDb,
  dbProperties = [],
  fetchDatabaseProperties,
  loadPropertyFromDb,
  deletePropertyFromDb
}) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'bestand'
  const [exportingId, setExportingId] = useState(null);

  const updateStatusMutation = useUpdatePropertyStatus(userEmail);

  const pipelineItems = dbProperties.filter(
    (item) => !item.status || item.status === 'pipeline'
  );
  const bestandItems = dbProperties.filter(
    (item) => item.status === 'bestand'
  );

  const displayedProperties = activeTab === 'pipeline' ? pipelineItems : bestandItems;

  const handleStatusChange = (property, newStatus) => {
    const propId = property.id || property._id;
    if (!propId) {
      toast.error('Fehler: Keine gültige Objekt-ID gefunden.');
      return;
    }
    updateStatusMutation.mutate({ propertyId: propId, newStatus });
  };

  const handleExportPdf = async (item) => {
    const itemId = item.id || item._id;
    setExportingId(itemId);
    const toastId = toast.loading('Generiere PDF-Exposé...');

    try {
      const formData = item.form_data || {
        obj_name: item.name || item.obj_name,
        kaufpreis: item.kaufpreis,
        qm: item.qm,
        stadt: item.stadt,
        bundesland: item.bundesland
      };
      const capexList = item.capex_list || [];

      const calcResult = await calculateInvestmentApi(formData, capexList);
      const model = calculateInvestmentModel(formData, '10', calcResult);

      const { pdf } = await import('@react-pdf/renderer');
      const PdfReportTemplate = (await import('../pdf/PdfReportTemplate')).default;

      const blob = await pdf(
        <PdfReportTemplate formData={formData} model={model} selectedKpis={DEFAULT_PDF_KPIS} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = (formData.obj_name || 'Immobilien_Analyse').replace(/\s+/g, '_');
      link.download = `${fileName}_Valuon.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF erfolgreich exportiert!', { id: toastId });
    } catch (err) {
      toast.error(`PDF Export fehlgeschlagen: ${err.message || 'Unbekannter Fehler'}`, { id: toastId });
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-valuon-border shadow-sm">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="m-0 text-2xl font-black text-valuon-green">Objekt Datenbank & Portfolio</h2>
          <span className="text-sm font-medium text-slate-500 mt-1 block">
            Verwalte deine Such-Pipeline und deinen gekauften Immobilienbestand
          </span>
        </div>
        <button 
          onClick={fetchDatabaseProperties} 
          className="flex items-center gap-2 py-2 px-4 bg-valuon-cream border border-valuon-border rounded-lg cursor-pointer font-bold text-valuon-green hover:bg-white transition-colors"
        >
          <IconRefresh /> Aktualisieren
        </button>
      </div>

      {/* TAB SWITCHER */}
      <div className="flex gap-4 border-b-2 border-valuon-border mb-6 overflow-x-auto whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('pipeline')}
          className={`py-2.5 px-4 bg-transparent border-none text-[0.95rem] cursor-pointer -mb-[2px] transition-colors ${
            activeTab === 'pipeline' 
              ? 'border-b-3 border-valuon-green text-valuon-green font-black' 
              : 'border-b-3 border-transparent text-slate-500 font-bold hover:text-valuon-green'
          }`}
        >
          Pipeline ({pipelineItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bestand')}
          className={`py-2.5 px-4 bg-transparent border-none text-[0.95rem] cursor-pointer -mb-[2px] transition-colors ${
            activeTab === 'bestand' 
              ? 'border-b-3 border-valuon-green text-valuon-green font-black' 
              : 'border-b-3 border-transparent text-slate-500 font-bold hover:text-valuon-green'
          }`}
        >
          Bestand ({bestandItems.length})
        </button>
      </div>

      {loadingDb ? (
        <div className="p-8 text-center text-slate-500 font-semibold">Lade Objekte aus der Datenbank...</div>
      ) : displayedProperties.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border-2 border-dashed border-valuon-border rounded-lg font-medium">
          Noch keine Objekte in {activeTab === 'pipeline' ? 'der Pipeline' : 'deinem Bestand'} gespeichert.
        </div>
      ) : (
        <div className="w-full overflow-x-auto border border-valuon-border rounded-lg shadow-inner">
          <table className="w-full border-collapse text-left text-[0.9rem] whitespace-nowrap">
            <thead>
              <tr className="bg-valuon-cream border-b border-valuon-border text-valuon-green">
                <th className="p-3 font-extrabold sticky left-0 bg-valuon-cream z-10 border-r border-valuon-border">Objektname</th>
                <th className="p-3 font-extrabold">Typ</th>
                <th className="p-3 font-extrabold">Ort</th>
                <th className="p-3 font-extrabold">Kaufpreis</th>
                <th className="p-3 font-extrabold">Wohnfläche</th>
                <th className="p-3 font-extrabold">IRR Rendite</th>
                <th className="p-3 font-extrabold text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {displayedProperties.map((item, idx) => {
                const itemId = item.id || item._id;
                const isExportingThis = exportingId === itemId;
                const isUpdatingThis = updateStatusMutation.isPending && updateStatusMutation.variables?.propertyId === itemId;
                const isEven = idx % 2 === 0;
                const bgClass = isEven ? 'bg-white' : 'bg-slate-50';

                // Fallback Fix für alte 400% IRR Datenbank-Einträge: 
                // Wenn die Zahl größer als 1 (100%) ist, wurde sie früher falsch gespeichert. Dann nehmen wir sie unmultipliziert.
                const displayIrr = item.irr !== null && item.irr !== undefined
                  ? (Math.abs(item.irr) > 1 ? item.irr : item.irr * 100)
                  : null;

                return (
                  <tr key={itemId || idx} className={`${bgClass} border-b border-valuon-border hover:bg-slate-100 transition-colors`}>
                    <td className={`p-3 font-bold text-valuon-green sticky left-0 z-10 border-r border-valuon-border ${bgClass}`}>
                      {item.name || item.obj_name || item.form_data?.obj_name}
                    </td>
                    <td className="p-3 text-slate-600">{item.objektart || item.form_data?.objektart}</td>
                    <td className="p-3 text-slate-600">{item.stadt || item.form_data?.stadt}</td>
                    <td className="p-3 font-semibold text-slate-800">{formatEuroInt(item.kaufpreis || item.form_data?.kaufpreis)} €</td>
                    <td className="p-3 text-slate-600">{item.qm || item.form_data?.qm} m²</td>
                    <td className="p-3 font-black text-valuon-gold">
                      {displayIrr !== null ? formatPct(displayIrr) + ' %' : '–'}
                    </td>
                    <td className="p-3 flex gap-2 items-center justify-end">
                      <button 
                        onClick={() => loadPropertyFromDb(item)} 
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-valuon-green text-white border-none rounded-md cursor-pointer text-xs font-bold hover:bg-valuon-green-light transition-colors"
                      >
                        <IconFolder /> Analyse
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportPdf(item)}
                        disabled={isExportingThis}
                        className={`py-1.5 px-3 bg-valuon-gold text-white border-none rounded-md text-xs font-bold transition-colors ${
                          isExportingThis ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-amber-700'
                        }`}
                      >
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item, activeTab === 'pipeline' ? 'bestand' : 'pipeline')}
                        disabled={isUpdatingThis}
                        className={`py-1.5 px-3 bg-valuon-cream text-valuon-green border border-valuon-green rounded-md text-xs font-bold transition-colors ${
                          isUpdatingThis ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white'
                        }`}
                      >
                        {isUpdatingThis ? 'Lädt...' : (activeTab === 'pipeline' ? 'In Bestand' : 'In Pipeline')}
                      </button>

                      <button 
                        onClick={() => deletePropertyFromDb(itemId)} 
                        className="p-1.5 bg-red-50 text-valuon-red border border-red-200 rounded-md cursor-pointer hover:bg-red-100 transition-colors"
                        title="Löschen"
                      >
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
