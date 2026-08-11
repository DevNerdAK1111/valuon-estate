'use client';
import { useState } from 'react';
import { IconLightning, IconArrowRight } from '../ui/Icons';
import { useAiParser } from '../../hooks/useAiQuery';
import { useProperty } from '../../context/PropertyContext';

export default function AiParserView({ setNavChoice }) {
  const [inputType, setInputType] = useState('text'); // 'text' | 'url'
  const [rawText, setRawText] = useState('');
  const [url, setUrl] = useState('');
  
  const aiMutation = useAiParser();
  const { setFormData } = useProperty();

  const handleParse = async (e) => {
    e.preventDefault();
    if (inputType === 'text' && !rawText.trim()) return;
    if (inputType === 'url' && !url.trim()) return;

    aiMutation.mutate(
      { text: inputType === 'text' ? rawText : '', url: inputType === 'url' ? url : '' },
      {
        onSuccess: (response) => {
          if (response?.data) {
            // Daten in den globalen Formular-State mergen
            setFormData(prev => ({
              ...prev,
              ...response.data,
              // Sichere Typkonvertierungen, falls die KI etwas Unerwartetes liefert
              kaufpreis: Number(response.data.kaufpreis || 0),
              qm: Number(response.data.qm || 0),
              baujahr: Number(response.data.baujahr || 2000),
              kaltmiete_monat: Number(response.data.kaltmiete_monat || 0),
              hausgeld: Number(response.data.hausgeld || 0),
              sanierung: Number(response.data.sanierung || 0)
            }));
            
            // Nutzer direkt zur Analyse weiterleiten
            setNavChoice('Analyse');
          }
        }
      }
    );
  };

  return (
    <div className="max-w-[800px] mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-valuon-border shadow-sm flex flex-col gap-6">
      
      <div className="flex items-center gap-4 border-b border-valuon-border pb-5">
        <div className="w-12 h-12 rounded-xl bg-valuon-green text-valuon-gold flex items-center justify-center font-black">
          <IconLightning />
        </div>
        <div>
          <h2 className="m-0 text-2xl font-black text-valuon-green tracking-tight">KI Exposé-Parser</h2>
          <span className="text-sm font-medium text-slate-500 mt-0.5 block">
            Automatische Datenextraktion via Gemini AI
          </span>
        </div>
      </div>

      <div className="flex gap-4 border-b-2 border-valuon-border overflow-x-auto whitespace-nowrap">
        <button
          type="button"
          onClick={() => setInputType('text')}
          className={`py-2 px-4 bg-transparent border-none text-[0.95rem] font-extrabold cursor-pointer -mb-[2px] transition-colors ${
            inputType === 'text' 
              ? 'border-b-3 border-valuon-green text-valuon-green' 
              : 'border-b-3 border-transparent text-slate-500 hover:text-valuon-green'
          }`}
        >
          Rohtext (Empfohlen)
        </button>
        <button
          type="button"
          onClick={() => setInputType('url')}
          className={`py-2 px-4 bg-transparent border-none text-[0.95rem] font-extrabold cursor-pointer -mb-[2px] transition-colors ${
            inputType === 'url' 
              ? 'border-b-3 border-valuon-green text-valuon-green' 
              : 'border-b-3 border-transparent text-slate-500 hover:text-valuon-green'
          }`}
        >
          URL Import (Beta)
        </button>
      </div>

      {inputType === 'url' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm leading-relaxed font-medium">
          <strong className="block mb-1 text-amber-900">Hinweis zu ImmoScout24 & Co:</strong>
          Große Immobilienportale blockieren automatisierte Zugriffe (URLs) sehr streng. Wenn der Import fehlschlägt, nutze bitte die Option <strong>Rohtext</strong>, indem du den Text der Webseite einfach mit der Maus markierst (Strg+A), kopierst (Strg+C) und hier einfügst.
        </div>
      )}

      <form onSubmit={handleParse} className="flex flex-col gap-4">
        {inputType === 'text' ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-600">Exposé-Text einfügen (Strg+V)</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Füge hier den gesamten Text der Immobilienanzeige ein..."
              className="w-full h-[250px] p-4 rounded-xl border border-slate-300 text-sm font-medium outline-none bg-slate-50 focus:bg-white focus:border-valuon-green focus:ring-1 focus:ring-valuon-green resize-none transition-colors"
              required
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-600">Immobilien-URL eingeben</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.immobilienscout24.de/expose/..."
              className="w-full h-[50px] px-4 rounded-xl border border-slate-300 text-sm font-medium outline-none bg-white focus:border-valuon-green focus:ring-1 focus:ring-valuon-green transition-colors"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={aiMutation.isPending}
          className="mt-2 py-4 px-6 bg-valuon-green text-white border-none rounded-xl text-[1.05rem] font-extrabold cursor-pointer shadow-md hover:bg-valuon-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {aiMutation.isPending ? 'KI analysiert Daten...' : 'Daten extrahieren & Analyse starten'}
          {!aiMutation.isPending && <IconArrowRight />}
        </button>
      </form>
    </div>
  );
}
