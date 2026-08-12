'use client';
import { useState, useRef } from 'react';
import { IconLightning, IconArrowRight, IconFolder, IconLock } from '../ui/Icons';
import { useAiParser } from '../../hooks/useAiQuery';
import { useProperty } from '../../context/PropertyContext';
import toast from 'react-hot-toast';

export default function AiParserView({ setNavChoice }) {
  const [inputType, setInputType] = useState('text');
  const [rawText, setRawText] = useState('');
  const [url, setUrl] = useState('');
  const [showBotWarning, setShowBotWarning] = useState(false);
  
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const aiMutation = useAiParser();
  const { setFormData } = useProperty();

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setShowBotWarning(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Bitte lade eine gültige PDF-Datei hoch.');
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) { 
      toast.error('Die PDF-Datei ist zu groß (Maximal 20 MB).');
      return;
    }

    setPdfFile(file);
    setShowBotWarning(false);
  };

  const handleParse = async (e) => {
    e.preventDefault();
    setShowBotWarning(false);

    if (inputType === 'text' && !rawText.trim()) return;
    if (inputType === 'url' && !url.trim()) return;
    if (inputType === 'pdf' && !pdfFile) {
      toast.error('Bitte lade zuerst ein PDF hoch.');
      return;
    }

    aiMutation.mutate(
      { 
        text: inputType === 'text' ? rawText : '', 
        url: inputType === 'url' ? url : '',
        file: inputType === 'pdf' ? pdfFile : null 
      },
      {
        onSuccess: (response) => {
          if (response?.data) {
            setFormData(prev => ({
              ...prev,
              ...response.data,
              kaufpreis: Number(response.data.kaufpreis || 0),
              qm: Number(response.data.qm || 0),
              baujahr: Number(response.data.baujahr || 2000),
              kaltmiete_monat: Number(response.data.kaltmiete_monat || 0),
              hausgeld: Number(response.data.hausgeld || 0),
              sanierung: Number(response.data.sanierung || 0)
            }));
            
            setNavChoice('Analyse');
          }
        },
        onError: () => {
          if (inputType === 'url') {
            setShowBotWarning(true);
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
            Extrakte Objektdaten automatisch via Text, Link oder PDF.
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-b-2 border-valuon-border">
        <button
          type="button"
          onClick={() => handleInputTypeChange('text')}
          className={`py-2 px-4 bg-transparent border-none text-[0.95rem] font-extrabold cursor-pointer -mb-[2px] transition-colors ${
            inputType === 'text' 
              ? 'border-b-3 border-valuon-green text-valuon-green' 
              : 'border-b-3 border-transparent text-slate-500 hover:text-valuon-green'
          }`}
        >
          Rohtext
        </button>
        <button
          type="button"
          onClick={() => handleInputTypeChange('pdf')}
          className={`py-2 px-4 bg-transparent border-none text-[0.95rem] font-extrabold cursor-pointer -mb-[2px] transition-colors ${
            inputType === 'pdf' 
              ? 'border-b-3 border-valuon-green text-valuon-green' 
              : 'border-b-3 border-transparent text-slate-500 hover:text-valuon-green'
          }`}
        >
          PDF Upload
        </button>
        <button
          type="button"
          onClick={() => handleInputTypeChange('url')}
          className={`py-2 px-4 bg-transparent border-none text-[0.95rem] font-extrabold cursor-pointer -mb-[2px] transition-colors ${
            inputType === 'url' 
              ? 'border-b-3 border-valuon-green text-valuon-green' 
              : 'border-b-3 border-transparent text-slate-500 hover:text-valuon-green'
          }`}
        >
          Link Import
        </button>
      </div>

      <form onSubmit={handleParse} className="flex flex-col gap-4">
        {inputType === 'text' && (
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
        )}

        {inputType === 'pdf' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-600">Exposé als PDF hochladen</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                pdfFile ? 'border-valuon-green bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-valuon-green'
              }`}
            >
              <IconFolder className={pdfFile ? 'text-valuon-green text-3xl' : 'text-slate-400 text-3xl'} />
              <span className={`text-sm font-bold ${pdfFile ? 'text-valuon-green' : 'text-slate-500'}`}>
                {pdfFile ? pdfFile.name : 'Klicke hier, um eine PDF-Datei auszuwählen (Max. 20 MB)'}
              </span>
              <input 
                type="file" 
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {inputType === 'url' && (
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
            
            {!showBotWarning ? (
              <div className="bg-slate-50 border border-slate-200 text-slate-600 p-3 rounded-lg text-xs leading-relaxed font-medium mt-1">
                <strong>Info:</strong> Wir nutzen erweiterte Anti-Bot-Umgangstechniken, aber Portale wie ImmoScout24 blockieren dennoch gelegentlich. Wenn es hakt, nutze einfach die Rohtext- oder PDF-Funktion.
              </div>
            ) : (
              <div className="mt-2 p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-3 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-[1.05rem]">
                  <IconLock /> 
                  <span>Portal hat den Abruf blockiert</span>
                </div>
                <p className="m-0 text-sm text-emerald-900/80 leading-relaxed font-medium">
                  Keine Sorge, wir können nichts dafür! Portale wie ImmoScout24 nutzen strikte Anti-Bot-Systeme, die uns hier gerade aussperren.
                </p>
                <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm mt-1">
                  <span className="font-extrabold text-valuon-green text-sm mb-2 block">Dein 10-Sekunden Workaround:</span>
                  <ol className="m-0 pl-5 text-sm text-slate-700 leading-relaxed flex flex-col gap-1.5 font-medium list-decimal">
                    <li>Öffne die Immobilienanzeige ganz normal in deinem Browser.</li>
                    <li>Drücke <strong className="text-valuon-green">Strg + P</strong> (Windows) oder <strong className="text-valuon-green">Cmd + P</strong> (Mac).</li>
                    <li>Wähle als Drucker <strong className="text-valuon-green">"Als PDF speichern"</strong>.</li>
                    <li>Lade das PDF hier über den Reiter <strong className="text-valuon-green">"PDF Upload"</strong> hoch!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={aiMutation.isPending || (inputType === 'pdf' && !pdfFile)}
          className="mt-2 py-4 px-6 bg-valuon-green text-white border-none rounded-xl text-[1.05rem] font-extrabold cursor-pointer shadow-md hover:bg-valuon-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {aiMutation.isPending ? 'KI analysiert Dokument...' : 'Daten extrahieren & Analyse starten'}
          {!aiMutation.isPending && <IconArrowRight />}
        </button>
      </form>
    </div>
  );
}
