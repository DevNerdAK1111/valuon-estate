'use client';
import { useState } from 'react';
import { formatEuroInt } from '../../utils/formatters';

export default function TableView({ slicedProjection, totals }) {
  const [viewMode, setViewMode] = useState('kompakt');

  const data = slicedProjection || [];
  const sumData = totals || {
    miete: 0, opex: 0, noi: 0, zins: 0, tilgung: 0, kapitaldienst: 0,
    afaEuro: 0, zuVersteuerndesEinkommen: 0, steuerErgebnis: 0, cashflowNachSteuerPa: 0
  };

  const lastRow = data[data.length - 1] || {};

  return (
    <div className="bg-white border border-valuon-border rounded-xl p-5 shadow-sm w-full box-border">
      
      {/* HEADER & ANSICHTS-UMSCHALTER */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="m-0 text-[1.05rem] font-extrabold text-valuon-green">
            Jahresbezogene Finanzfluss-Prognose
          </h3>
          <span className="text-xs text-slate-500">
            Detaillierte Entwicklung aller Einnahmen, Ausgaben, Tilgungs- und Steuerflüsse pro Jahr
          </span>
        </div>

        <div className="flex bg-valuon-cream p-1 rounded-lg border border-valuon-border gap-1">
          <button
            type="button"
            onClick={() => setViewMode('kompakt')}
            className={`py-1.5 px-3 rounded-md border-none text-[0.75rem] cursor-pointer transition-colors ${
              viewMode === 'kompakt' ? 'bg-valuon-green text-white font-extrabold' : 'bg-transparent text-slate-600 font-bold hover:text-valuon-green'
            }`}
          >
            Kompakt-Ansicht
          </button>
          <button
            type="button"
            onClick={() => setViewMode('vollstaendig')}
            className={`py-1.5 px-3 rounded-md border-none text-[0.75rem] cursor-pointer transition-colors ${
              viewMode === 'vollstaendig' ? 'bg-valuon-green text-white font-extrabold' : 'bg-transparent text-slate-600 font-bold hover:text-valuon-green'
            }`}
          >
            Vollständige Details
          </button>
        </div>
      </div>

      {/* ISOLIERTER SCROLL-CONTAINER FÜR MOBILE */}
      <div className="w-full overflow-x-auto border border-valuon-border rounded-lg shadow-inner">
        <table className="w-full border-collapse text-[0.78rem] text-right whitespace-nowrap">
          <thead>
            <tr className="bg-valuon-cream text-valuon-green border-b border-valuon-border font-extrabold">
              <th className="py-1.5 px-2.5 text-[0.72rem] tracking-wide uppercase text-center sticky left-0 bg-valuon-cream z-20 border-r border-valuon-border">Jahr</th>
              <th colSpan="3" className="py-1.5 px-2.5 text-[0.72rem] tracking-wide uppercase text-center border-l border-valuon-border">Operativ & Miete</th>
              <th colSpan="3" className="py-1.5 px-2.5 text-[0.72rem] tracking-wide uppercase text-center border-l border-valuon-border">Bank & Kapitaldienst</th>
              {viewMode === 'vollstaendig' && (
                <th colSpan="3" className="py-1.5 px-2.5 text-[0.72rem] tracking-wide uppercase text-center border-l border-valuon-border">Steuer & AfA</th>
              )}
              <th colSpan={viewMode === 'vollstaendig' ? "5" : "3"} className="py-1.5 px-2.5 text-[0.72rem] tracking-wide uppercase text-center border-l border-valuon-border">Ergebnis & Vermögen</th>
            </tr>

            <tr className="bg-valuon-green text-white font-bold">
              <th className="py-2 px-2 text-[0.73rem] sticky left-0 bg-valuon-green z-20 text-center border-r border-white/20">Jahr</th>
              
              <th className="py-2 px-2 text-[0.73rem]">Kaltmiete p.a.</th>
              <th className="py-2 px-2 text-[0.73rem]">Bewirtschaftung</th>
              <th className="py-2 px-2 text-[0.73rem]">Nettomiete (NOI)</th>

              <th className="py-2 px-2 text-[0.73rem] border-l border-white/20">Zins p.a.</th>
              <th className="py-2 px-2 text-[0.73rem]">Tilgung p.a.</th>
              <th className="py-2 px-2 text-[0.73rem]">Kapitaldienst</th>

              {viewMode === 'vollstaendig' && (
                <>
                  <th className="py-2 px-2 text-[0.73rem] border-l border-white/20">AfA € p.a.</th>
                  <th className="py-2 px-2 text-[0.73rem]">zu verst. Eink.</th>
                  <th className="py-2 px-2 text-[0.73rem]">Steuer-Ergebnis</th>
                </>
              )}

              {viewMode === 'vollstaendig' && (
                <th className="py-2 px-2 text-[0.73rem] border-l border-white/20">CF v. St. / Mo.</th>
              )}
              <th className={`py-2 px-2 text-[0.73rem] ${viewMode !== 'vollstaendig' ? 'border-l border-white/20' : ''}`}>CF n. St. / Mo.</th>
              <th className="py-2 px-2 text-[0.73rem]">CF n. St. p.a.</th>
              <th className="py-2 px-2 text-[0.73rem]">Restschuld</th>
              {viewMode === 'vollstaendig' && <th className="py-2 px-2 text-[0.73rem]">Netto-EK (NAV)</th>}
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => {
              const isEven = idx % 2 === 0;
              const bgClass = isEven ? 'bg-white' : 'bg-slate-50';
              const cfMo = row.cashflowNachSteuerMo;
              const cfPa = row.cashflowNachSteuer;
              const isCfPos = cfMo >= 0;

              return (
                <tr key={row.jahr} className={`${bgClass} border-b border-valuon-border hover:bg-slate-100 transition-colors`}>
                  <td className={`py-1.5 px-2 font-extrabold text-center sticky left-0 z-10 border-r border-valuon-border ${bgClass}`}>
                    {row.jahr}
                  </td>

                  <td className="py-1.5 px-2 text-slate-700">{formatEuroInt(row.miete)} €</td>
                  <td className="py-1.5 px-2 text-valuon-red">-{formatEuroInt(row.opex)} €</td>
                  <td className="py-1.5 px-2 font-bold text-slate-800">{formatEuroInt(row.noi)} €</td>

                  <td className="py-1.5 px-2 border-l border-valuon-border text-valuon-red">-{formatEuroInt(row.zins)} €</td>
                  <td className="py-1.5 px-2 text-valuon-gold">-{formatEuroInt(row.tilgung)} €</td>
                  <td className="py-1.5 px-2 font-bold text-slate-800">-{formatEuroInt(row.kapitaldienst)} €</td>

                  {viewMode === 'vollstaendig' && (
                    <>
                      <td className="py-1.5 px-2 border-l border-valuon-border text-slate-500">{formatEuroInt(row.afaEuro)} €</td>
                      <td className="py-1.5 px-2 text-slate-700">{formatEuroInt(row.zuVersteuerndesEinkommen)} €</td>
                      <td className={`py-1.5 px-2 font-bold ${row.steuerErgebnis > 0 ? 'text-valuon-red' : 'text-emerald-800'}`}>
                        {row.steuerErgebnis > 0 ? `-${formatEuroInt(row.steuerErgebnis)} €` : `+${formatEuroInt(Math.abs(row.steuerErgebnis))} €`}
                      </td>
                    </>
                  )}

                  {viewMode === 'vollstaendig' && (
                    <td className={`py-1.5 px-2 border-l border-valuon-border ${row.cashflowVorSteuerMo >= 0 ? 'text-emerald-800' : 'text-valuon-red'}`}>
                      {row.cashflowVorSteuerMo >= 0 ? '+' : ''}{formatEuroInt(row.cashflowVorSteuerMo)} €
                    </td>
                  )}
                  <td className={`py-1.5 px-2 font-black ${isCfPos ? 'text-emerald-800 bg-emerald-50/50' : 'text-valuon-red bg-red-50/50'} ${viewMode !== 'vollstaendig' ? 'border-l border-valuon-border' : ''}`}>
                    {isCfPos ? '+' : ''}{formatEuroInt(cfMo)} €
                  </td>
                  <td className={`py-1.5 px-2 font-black ${cfPa >= 0 ? 'text-emerald-800' : 'text-valuon-red'}`}>
                    {cfPa >= 0 ? '+' : ''}{formatEuroInt(cfPa)} €
                  </td>
                  <td className="py-1.5 px-2 text-valuon-red">{formatEuroInt(row.restschuld)} €</td>
                  {viewMode === 'vollstaendig' && (
                    <td className="py-1.5 px-2 font-extrabold text-valuon-green">{formatEuroInt(row.netEquity)} €</td>
                  )}
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="bg-valuon-cream text-valuon-green font-black border-t-2 border-valuon-green">
              <td className="py-2 px-2 text-center sticky left-0 bg-valuon-cream z-10 border-r border-slate-300">
                Gesamt
              </td>

              <td className="py-2 px-2">{formatEuroInt(sumData.miete)} €</td>
              <td className="py-2 px-2 text-valuon-red">-{formatEuroInt(sumData.opex)} €</td>
              <td className="py-2 px-2">{formatEuroInt(sumData.noi)} €</td>

              <td className="py-2 px-2 border-l border-slate-300 text-valuon-red">-{formatEuroInt(sumData.zins)} €</td>
              <td className="py-2 px-2 text-valuon-gold">-{formatEuroInt(sumData.tilgung)} €</td>
              <td className="py-2 px-2">-{formatEuroInt(sumData.kapitaldienst)} €</td>

              {viewMode === 'vollstaendig' && (
                <>
                  <td className="py-2 px-2 border-l border-slate-300">{formatEuroInt(sumData.afaEuro)} €</td>
                  <td className="py-2 px-2">{formatEuroInt(sumData.zuVersteuerndesEinkommen)} €</td>
                  <td className={`py-2 px-2 ${sumData.steuerErgebnis > 0 ? 'text-valuon-red' : 'text-emerald-800'}`}>
                    {sumData.steuerErgebnis > 0 ? `-${formatEuroInt(sumData.steuerErgebnis)} €` : `+${formatEuroInt(Math.abs(sumData.steuerErgebnis))} €`}
                  </td>
                </>
              )}

              {viewMode === 'vollstaendig' && (
                <td className="py-2 px-2 border-l border-slate-300 text-slate-500">-</td>
              )}
              <td className={`py-2 px-2 text-slate-500 ${viewMode !== 'vollstaendig' ? 'border-l border-slate-300' : ''}`}>-</td>
              <td className={`py-2 px-2 font-black ${sumData.cashflowNachSteuerPa >= 0 ? 'text-emerald-800' : 'text-valuon-red'}`}>
                {sumData.cashflowNachSteuerPa >= 0 ? '+' : ''}{formatEuroInt(sumData.cashflowNachSteuerPa)} €
              </td>
              <td className="py-2 px-2 text-valuon-red">{formatEuroInt(lastRow.restschuld || 0)} €</td>
              {viewMode === 'vollstaendig' && (
                <td className="py-2 px-2 text-valuon-green">{formatEuroInt(lastRow.netEquity || 0)} €</td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
