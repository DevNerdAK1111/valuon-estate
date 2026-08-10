'use client';
import { IconLock } from '@/components/ui/Icons';

export default function DevNoticeModal({ devNotice, onClose }) {
  if (!devNotice) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-valuon-green/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white border-2 border-valuon-green rounded-2xl p-8 max-w-[480px] w-[90%] shadow-2xl">
        <div className="flex items-center gap-2.5 text-valuon-gold font-extrabold text-[0.85rem] uppercase tracking-wide mb-2">
          <IconLock /> Funktion in Entwicklung
        </div>
        
        <h3 className="m-0 mb-3 text-[1.4rem] text-valuon-green font-extrabold">
          {devNotice}
        </h3>
        
        <p className="text-[0.9rem] text-slate-600 leading-relaxed mb-6">
          Dieses Modul wird derzeit entwickelt und steht in Kürze zur Verfügung. Nutze in der Zwischenzeit unser voll funktionsfähiges Investitions-Analyse Tool für deine detaillierten Objektberechnungen.
        </p>
        
        <button
          onClick={onClose}
          className="w-full p-3 bg-valuon-green text-white border-none rounded-lg font-extrabold text-[0.95rem] cursor-pointer hover:bg-valuon-green-light transition-colors shadow-sm"
        >
          Verstanden & Schließen
        </button>
      </div>
    </div>
  );
}
