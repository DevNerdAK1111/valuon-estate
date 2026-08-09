'use client';
import { useState } from 'react';
import { IconFolder, IconPlus, IconTrendingUp, IconBuilding, IconLock, IconLightning } from '../ui/Icons';
import DevNoticeModal from '../ui/DevNoticeModal';
import { formatEuroInt } from '../../utils/formatters';

export default function StartseiteView({ setNavChoice, dbProperties = [], loadPropertyFromDb }) {
  const [devNotice, setDevNotice] = useState(null);

  const pipelineCount = dbProperties.filter(p => !p.status || p.status === 'pipeline').length;
  const bestandCount = dbProperties.filter(p => p.status === 'bestand').length;
  
  const totalVolumePipeline = dbProperties
    .filter(p => !p.status || p.status === 'pipeline')
    .reduce((sum, p) => sum + Number(p.kaufpreis || p.form_data?.kaufpreis || 0), 0);

  const totalVolumeBestand = dbProperties
    .filter(p => p.status === 'bestand')
    .reduce((sum, p) => sum + Number(p.kaufpreis || p.form_data?.kaufpreis || 0), 0);

  const recentProperties = dbProperties.slice(0, 5);

  const modules = [
    {
      id: 'analyse',
      title: 'Immobilien-Analyse',
      description: 'Detaillierte Cashflow-Prognosen, AfA-Modelle & Rendite-Kalkulation.',
      badge: 'Aktiv',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      action: () => setNavChoice('Analyse'),
      icon: <IconPlus />,
      isDev: false
    },
    {
      id: 'database',
      title: 'Objekt Datenbank',
      description: 'Verwalte deine Such-Pipeline und dein reales Immobilien-Portfolio.',
      badge: 'Aktiv',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      action: () => setNavChoice('Objekt Datenbank'),
      icon: <IconFolder />,
      isDev: false
    },
    {
      id: 'scenario',
      title: 'Szenario-Vergleich',
      description: 'Stresstests & Zwei-Spalten-Vergleich von Zinsen, Kaufpreisen und Mieten.',
      badge: 'Aktiv',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      action: () => setNavChoice('Szenario-Vergleich'),
      icon: <IconTrendingUp />,
      isDev: false
    },
    {
      id: 'ai-parser',
      title: 'KI Exposé-Parser',
      description: 'Automatische Datenextraktion aus ImmoScout24-PDFs & Links via Gemini KI.',
      badge: 'In Entwicklung',
      badgeColor: 'bg-amber-100 text-amber-900',
      action: () => setDevNotice('KI Exposé-Parser'),
      icon: <IconLightning />,
      isDev: true
    },
    {
      id: 'portfolio-analytics',
      title: 'Portfolio Benchmarking',
      description: 'Konsolidierte Gesamtrendite, LTV-Verteilung & Cashflow-Aggregation.',
      badge: 'In Entwicklung',
      badgeColor: 'bg-amber-100 text-amber-900',
      action: () => setDevNotice('Portfolio Benchmarking'),
      icon: <IconBuilding />,
      isDev: true
    },
    {
      id: 'location-check',
      title: 'Standort & Mikrolage',
      description: 'Mietspiegel-Daten, Demografie-Entwicklung und Lagedaten-Analyse.',
      badge: 'In Entwicklung',
      badgeColor: 'bg-amber-100 text-amber-900',
      action: () => setDevNotice('Standort & Mikrolage-Check'),
      icon: <IconLock />,
      isDev: true
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* DEV NOTICE MODAL */}
      <DevNoticeModal devNotice={devNotice} onClose={() => setDevNotice(null)} />

      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-valuon-green to-emerald-900 text-white p-8 sm:p-10 rounded-2xl border border-valuon-border shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[2px] text-valuon-gold bg-white/10 px-3 py-1 rounded-full inline-block mb-3">
            Willkommen bei Valuon Estate
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white m-0 tracking-tight leading-tight">
            Institutional Grade Immobilien-Analyse
          </h1>
          <p className="text-sm sm:text-base text-slate-200 mt-3 mb-0 leading-relaxed font-medium">
            Präzise Cashflow-Prognosen, IRR-Berechnungen, AfA-Optimierung und Portfolio-Steuerung auf Banken-Niveau.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setNavChoice('Analyse')}
            className="py-3.5 px-6 bg-valuon-gold text-white font-extrabold text-sm rounded-xl border-none cursor-pointer shadow-md hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <IconPlus /> Neue Analyse starten
          </button>
        </div>
      </div>

      {/* MODULE GRID (AKTIVE & DEVELOPMENT KARTEN) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-black text-valuon-green m-0">Analyse-Module & Suite Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              onClick={mod.action}
              className={`bg-white border border-valuon-border rounded-xl p-5 flex flex-col justify-between shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md hover:border-valuon-green ${
                mod.isDev ? 'opacity-90' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-black uppercase ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-valuon-cream text-valuon-green flex items-center justify-center">
                    {mod.icon}
                  </div>
                </div>
                <h3 className="text-base font-black text-valuon-green m-0 mb-1">{mod.title}</h3>
                <p className="text-xs text-slate-500 font-medium m-0 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-valuon-border/60 flex justify-end">
                <span className="text-xs font-bold text-valuon-green flex items-center gap-1 group">
                  {mod.isDev ? 'Vorschau öffnen' : 'Modul starten'} →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATISTIK KARTEN GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-valuon-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pipeline Objekte</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <IconBuilding />
            </div>
          </div>
          <div className="text-3xl font-black text-valuon-green my-1">{pipelineCount}</div>
          <div className="text-xs text-slate-500 font-semibold">
            Volumen: {formatEuroInt(totalVolumePipeline)} €
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-valuon-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Bestand Objekte</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-valuon-gold flex items-center justify-center font-bold text-sm">
              <IconTrendingUp />
            </div>
          </div>
          <div className="text-3xl font-black text-valuon-green my-1">{bestandCount}</div>
          <div className="text-xs text-slate-500 font-semibold">
            Volumen: {formatEuroInt(totalVolumeBestand)} €
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-valuon-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Gesamt Portfolio</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
              {dbProperties.length}
            </div>
          </div>
          <div className="text-3xl font-black text-valuon-green my-1">{dbProperties.length}</div>
          <div className="text-xs text-slate-500 font-semibold">
            Analysierte Einheiten
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-valuon-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">System Status</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          </div>
          <div className="text-xl font-black text-valuon-green my-1">Aktiv</div>
          <div className="text-xs text-emerald-700 font-bold">
            FastAPI & Supabase Bereit
          </div>
        </div>
      </div>

      {/* LETZTE OBJEKTE TABELLE */}
      <div className="bg-white p-6 rounded-xl border border-valuon-border shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-valuon-green m-0">Zuletzt bearbeitete Objekte</h3>
            <span className="text-xs text-slate-500">Schnellzugriff auf deine aktuellsten Analysen</span>
          </div>
          <button
            type="button"
            onClick={() => setNavChoice('Objekt Datenbank')}
            className="bg-transparent border-none text-valuon-green font-extrabold text-xs cursor-pointer underline hover:text-valuon-green-light"
          >
            Alle anzeigen →
          </button>
        </div>

        {recentProperties.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border-2 border-dashed border-valuon-border rounded-lg text-sm">
            Noch keine Objekte vorhanden. Starte jetzt deine erste Analyse!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-valuon-cream border-b-2 border-valuon-border text-valuon-green">
                  <th className="p-3 font-extrabold">Objektname</th>
                  <th className="p-3 font-extrabold">Ort</th>
                  <th className="p-3 font-extrabold">Kaufpreis</th>
                  <th className="p-3 font-extrabold">Wohnfläche</th>
                  <th className="p-3 font-extrabold">Status</th>
                  <th className="p-3 font-extrabold text-right">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map((item, idx) => {
                  const name = item.name || item.obj_name || item.form_data?.obj_name || 'Unbenanntes Objekt';
                  const stadt = item.stadt || item.form_data?.stadt || '–';
                  const kaufpreis = item.kaufpreis || item.form_data?.kaufpreis || 0;
                  const qm = item.qm || item.form_data?.qm || 0;
                  const status = item.status === 'bestand' ? 'Bestand' : 'Pipeline';

                  return (
                    <tr key={item.id || item._id || idx} className="border-b border-valuon-border hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-valuon-green">{name}</td>
                      <td className="p-3 text-slate-600">{stadt}</td>
                      <td className="p-3 font-semibold">{formatEuroInt(kaufpreis)} €</td>
                      <td className="p-3 text-slate-600">{qm} m²</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-black uppercase ${
                          item.status === 'bestand'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => loadPropertyFromDb(item)}
                          className="py-1.5 px-3 bg-valuon-green text-white rounded-md border-none font-bold text-xs cursor-pointer hover:bg-valuon-green-light transition-colors"
                        >
                          Analyse laden
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

    </div>
  );
}
