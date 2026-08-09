'use client';
import { formatEuroInt } from '../../utils/formatters';

export default function DonutChart({ formData, model, summe_nk }) {
  const kaufpreis = Number(formData?.kaufpreis || 0);

  // 1. Nebenkosten bestimmen (aus Backend-Model, Prop oder direkt aus den Formular-Prozenten)
  const grwtP = Number(formData?.grwt_p ?? 5.0);
  const notarP = Number(formData?.notar_p ?? 2.0);
  const maklerP = Number(formData?.makler_p ?? 3.57);
  const sonstNk = Number(formData?.sonst_nk ?? 0);
  const calculatedNk = kaufpreis * ((grwtP + notarP + maklerP) / 100) + sonstNk;

  const nk = model?.kaufnebenkosten?.nkTotal ?? Number(summe_nk || calculatedNk);
  const gesamtkosten = model?.kaufnebenkosten?.gesamtKosten ?? (kaufpreis + nk);

  // 2. Eigenkapital, KfW und Hauptdarlehen aus der echten Finanzierungsstruktur
  const ek = model?.finanzierung?.ekEuro ?? Number(formData?.ek_euro || 0);
  const kfwAmt = model?.finanzierung?.kfwDarlehen ?? Number(formData?.kfw_amt || 0);
  const hauptdarlehen = model?.finanzierung?.hauptDarlehen ?? Math.max(0, gesamtkosten - ek - kfwAmt);

  const slices = [
    { label: 'Eigenkapital', value: ek, color: '#A37841' },
    { label: 'Hauptdarlehen (Bank)', value: hauptdarlehen, color: '#13381A' },
    ...(kfwAmt > 0 ? [{ label: 'KfW-Darlehen', value: kfwAmt, color: '#3182CE' }] : [])
  ];

  const totalValue = slices.reduce((acc, s) => acc + s.value, 0) || 1;

  let cumulativePercent = 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white p-6 rounded-xl border border-valuon-border flex flex-col justify-between h-full box-border shadow-sm">
      <h3 className="m-0 text-base font-black text-valuon-green">
        Finanzierungsstruktur & Mittelherkunft
      </h3>

      <div className="flex flex-col items-center gap-4 justify-center my-auto py-4">
        <div className="relative w-[190px] h-[190px] flex items-center justify-center">
          <svg width="190" height="190" viewBox="0 0 190 190" className="-rotate-90 overflow-visible">
            {slices.map((slice, idx) => {
              const percent = slice.value / totalValue;
              if (percent <= 0) return null;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercent * circumference;
              cumulativePercent += percent;

              return (
                <circle
                  key={idx}
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="24"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-500 ease-in-out"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[0.7rem] text-slate-500 font-bold">Gesamtkosten</span>
            <span className="text-base font-black text-valuon-green">{formatEuroInt(gesamtkosten)} €</span>
          </div>
        </div>

        {/* LEGENDE */}
        <div className="w-full grid grid-cols-[14px_1fr_auto] gap-2 items-center text-xs">
          {slices.map((slice, idx) => {
            const pct = totalValue > 0 ? (slice.value / totalValue) * 100 : 0;
            return (
              <div key={idx} className="contents">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: slice.color }} />
                <span className="text-slate-600 font-semibold">{slice.label}</span>
                <span className="font-extrabold text-valuon-green text-right whitespace-nowrap">
                  {formatEuroInt(slice.value)} € <span className="text-slate-500 font-normal text-[0.75rem]">({pct.toFixed(1)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div />
    </div>
  );
}
