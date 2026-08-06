'use client';

import React, { useState } from 'react';

export default function ImmobilienWissenPage() {
  const [activeTab, setActiveTab] = useState('kaufprozess');
  const [glossarySearch, setGlossarySearch] = useState('');

  // Daten für das A-Z Glossar (kann beliebig erweitert werden)
  const glossaryItems = [
    { term: 'Annuitätendarlehen', category: 'Finanzierung', text: 'Ein Kredit, bei dem die monatliche Rate (bestehend aus Zins und Tilgung) über die Zinsbindungsphase konstant bleibt. Durch sinkende Restschuld sinkt der Zinsanteil, während der Tilgungsanteil steigt.' },
    { term: 'Auflassungsvormerkung', category: 'Recht & Notar', text: 'Sichert den Käufer im Grundbuch gegen einen doppelten Verkauf oder eine nachträgliche Insolvenz des Verkäufers ab, bis der endgültige Eigentümerwechsel im Grundbuch vollzogen ist.' },
    { term: 'Eigenbedarfskündigung', category: 'Mietrecht', text: 'Gesetzliche Möglichkeit für den Eigentümer, einen Mietvertrag zu kündigen, wenn er die Immobilie für sich selbst oder Familienangehörige benötigt (§ 573c BGB).' },
    { term: 'Energieausweis', category: 'Gebäude & Technik', text: 'Dokument, das den energetischen Zustand eines Gebäudes bewertet (unterschieden in Bedarfsausweis und Verbrauchsausweis). Pflicht bei jeder Besichtigung und Vermietung/Verkauf.' },
    { term: 'Gebäudeenergiegesetz (GEG)', category: 'Gesetzgebung', text: 'Regelt in Deutschland die energetischen Anforderungen an Gebäude, insbesondere Heizungsanlagen (oft als "Heizungsgesetz" bekannt) und Dämmstandards.' },
    { term: 'Grundbuch', category: 'Recht & Notar', text: 'Ein beim zuständigen Amtsgericht geführtes öffentliches Register, in dem die Eigentumsverhältnisse, Lasten und Beschränkungen eines Grundstücks verzeichnet sind.' },
    { term: 'Grunderwerbsteuer', category: 'Steuern', text: 'Eine vom Bundesland erhobene Steuer beim Kauf von Grundstücken und Immobilien (variiert je nach Bundesland zwischen 3,5 % und 6,5 % des Kaufpreises).' },
    { term: 'Lastenfreistellung', category: 'Abwicklung', text: 'Erklärung der Bank des Verkäufers, dass die auf dem Grundstück liegenden Altkredite gelöscht werden, sobald der Kaufpreis gezahlt ist.' },
    { term: 'Teilungserklärung', category: 'WEG', text: 'Teilt ein Gebäude rechtlich in Sondereigentum (die eigene Wohnung) und Gemeinschaftseigentum (z. B. Dach, Fassade, Treppenhaus) auf. Wichtig für Eigentümergemeinschaften.' },
    { term: 'Wohnflächenverordnung (WoFlV)', category: 'Berechnung', text: 'Regelt verbindlich, wie die Wohnfläche von Wohnraum in Deutschland berechnet wird (z. B. Anrechnung von Balkonen, Dachschrägen mit unter 2m Höhe).' }
  ];

  const filteredGlossary = glossaryItems.filter(item => 
    item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    item.text.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    item.category.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Header / Hero Section */}
      <header className="bg-white border-b border-slate-200 py-10 px-6 sm:px-10 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            Wissensdatenbank & Ratgeber
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Immobilien-Wissen, Fallstricke & KPIs
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Fundiertes Know-how für den deutschen Immobilienmarkt: Vom Kaufprozess über typische Fehlerquellen bis hin zum A-Z Nachschlagewerk.
          </p>

          {/* Navigation Tabs */}
          <div className="flex gap-2 sm:gap-4 mt-6 border-b border-slate-200 overflow-x-auto pb-0 no-scrollbar">
            {[
              { id: 'kaufprozess', label: '1. Kaufprozess' },
              { id: 'fallstricke', label: '2. Fallstricke & Fehler' },
              { id: 'kpis', label: '3. KPIs & Kennzahlen' },
              { id: 'glossar', label: '4. A-Z Glossar' },
              { id: 'quellen', label: '5. Quellen & Gesetze' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 sm:px-10">
        
        {/* Sektion 1: Kaufprozess */}
        {activeTab === 'kaufprozess' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">1</span>
                <h2 className="text-xl font-bold text-slate-900">Vorbereitung & Finanzierung</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                Der Grundstein für jede erfolgreiche Immobilieninvestition wird vor der Objektsuche gelegt. In Deutschland wird die Finanzierung maßgeblich durch Eigenkapital und Bonität bestimmt.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50/60 border border-blue-100 p-5 rounded-xl">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">💡 Profi-Tipp</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Kalkulieren Sie die Kaufnebenkosten (Grunderwerbsteuer, Notar, Grundbuch, ggf. Makler – je nach Bundesland zwischen 10 % und 12,5 %) niemals über den Kredit. Banken sehen es bevorzugt, wenn Nebenkosten aus echtem Eigenkapital bedient werden.
                  </p>
                </div>
                <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl">
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">⚠️ Typischer Fallstrick</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong>Die Zinsbindungs-Falle:</strong> Wählen Sie die Zinsbindung nicht zu kurz bei volatilen Zinsmärkten. Achten Sie auf das Recht auf jährliche Sondertilgung (min. 2–5 %).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">2</span>
                <h2 className="text-xl font-bold text-slate-900">Suche, Besichtigung & Prüfung</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Bei Bestandsimmobilien ist der Blick in rechtliche Dokumente und die Bausubstanz entscheidend:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 text-sm">
                <li><strong>Teilungserklärung prüfen:</strong> Regelt das Sondereigentum im Verhältnis zum Gemeinschaftseigentum.</li>
                <li><strong>WEG-Protokolle lesen:</strong> Auswertung der letzten 3 Jahre schützt vor überraschenden Sonderumlagen für Großsanierungen.</li>
                <li><strong>Energieausweis:</strong> Pflicht bei Besichtigung zur Beurteilung energetischer Standards nach GEG.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Sektion 2: Fallstricke */}
        {activeTab === 'fallstricke' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Die 6 teuersten Fallstricke beim Immobilienkauf</h2>
              <p className="text-slate-600">Vermeiden Sie typische Anfängerfehler, die im Nachhinein Tausende Euro kosten können.</p>
            </div>

            {[
              { title: '1. Unterschätzte Kaufnebenkosten', desc: 'Werden Grunderwerbsteuer, Notar- und Grundbuchkosten sowie Maklergebühren (gesamt ca. 10–12,5 %) nicht sauber einkalkuliert, droht finanzielle Schieflage vor Vertragsabschluss.' },
              { title: '2. Fehlender Blick in die WEG-Protokolle', desc: 'Ohne das Studium der Protokolle der letzten Eigentümerversammlungen kauft man die Katze im Sack – unbemerkte anstehende Großsanierungen (Dach, Heizung) schlagen sonst direkt als Sonderumlage zu Buche.' },
              { title: '3. Kauf ohne Baubegleitung / Sachverständigen', desc: 'Optisch schön renovierte Altbauten verbergen oft Feuchtigkeit, Schimmel oder marode Elektrik. Ein Gutachter vor dem Kauf spart bares Geld.' },
              { title: '4. Falsche Annahmen bei der Instandhaltungsrücklage', desc: 'Bei vermieteten Objekten oder Eigentumswohnungen wird oft zu wenig Rücklage gebildet. Das schmälert die tatsächliche Rendite massiv, wenn Reparaturen anfallen.' },
              { title: '5. Die Energieeffizienz-Falle (GEG)', desc: 'Das Gebäudeenergiegesetz schreibt bei Eigentümerwechsel oft direkt Sanierungsmaßnahmen vor (z. B. Dämmung oberste Geschossdecke, Austausch alter Standard-Heizkessel).' },
              { title: '6. Rechtliche Fallstricke bei vermieteten Objekten', desc: 'Gesetzlicher Kündigungsschutz und lange Kündigungsfristen erschweren die Eigennutzung oder Kernsanierung massiv, wenn Mieter nicht ausziehen wollen.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-amber-200/80 bg-gradient-to-r from-amber-50/20 to-white shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-amber-600">⚠️</span> {item.title}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sektion 3: KPIs */}
        {activeTab === 'kpis' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Immobilien-KPIs & Kennzahlen</h2>
              <p className="text-slate-600">Objektive Bewertung von Wirtschaftlichkeit und Risiko anhand etablierter finanzmathematischer Kennzahlen.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                <h3 className="text-xl font-bold text-slate-900">Bruttomietrendite</h3>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-md">Schnell-Check</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Gibt einen ersten groben Anhaltspunkt über das Verhältnis von Kaufpreis zu Jahreskaltmiete.</p>
              <div className="bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-xl mb-4 overflow-x-auto">
                Formel: ( Jahreskaltmiete ÷ Kaufpreis ) × 100
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Bedeutung:</strong> Je höher der Wert, desto schneller rentiert sich der reine Kaufpreis. Kaufnebenkosten und Bewirtschaftungskosten bleiben hierbei jedoch unberücksichtigt.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                <h3 className="text-xl font-bold text-slate-900">Nettomietrendite</h3>
                <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md">Realistisch</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Die aussagekräftigere Kennzahl für Investoren unter Einbezug von Kaufneben- und Bewirtschaftungskosten.</p>
              <div className="bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-xl mb-4 overflow-x-auto">
                Formel: ( Nettomieteinnahmen p.a. (abzgl. nicht umlagefähiger Kosten) ÷ Gesamtkosten ) × 100
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Bedeutung:</strong> Zeigt die tatsächliche Rendite des Gesamtkapitals unter Berücksichtigung von Instandhaltungsrücklagen und Verwaltungskosten.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                <h3 className="text-xl font-bold text-slate-900">Eigenkapitalrendite (Return on Equity)</h3>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-md">Hebeleffekt (Leverage)</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Misst die Verzinsung des tatsächlich selbst investierten Kapitals unter Berücksichtigung von Fremdfinanzierung.</p>
              <div className="bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-xl mb-4 overflow-x-auto">
                Formel: ( Überschuss nach Zinsen & Tilgung p.a. ÷ eingesetztes Eigenkapital ) × 100
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Bedeutung:</strong> Durch den intelligenten Einsatz von Bankdarlehen kann die Eigenkapitalrendite drastisch über der Nettomietrendite liegen – erhöht jedoch auch das Risiko bei Mietausfällen.
              </p>
            </div>
          </div>
        )}

        {/* Sektion 4: Glossar */}
        {activeTab === 'glossar' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">A-Z Immobilien-Glossar</h2>
              <p className="text-slate-600 mb-6">Fachbegriffe aus Recht, Finanzierung und Bauwesen verständlich erklärt.</p>
              
              {/* Live Search Input */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Begriff oder Stichwort suchen..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
              </div>

              {/* Glossary Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredGlossary.map((item, idx) => (
                  <div key={idx} className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 text-base">{item.term}</h3>
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase">{item.category}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
                {filteredGlossary.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                    Keine passenden Einträge gefunden.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sektion 5: Offizielle Quellen & Gesetze */}
        {activeTab === 'quellen' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Offizielle Quellen, Gesetze & Institutionen</h2>
              <p className="text-slate-600 mb-6">Maximale Seriosität durch Verweise auf rechtliche Grundlagen und offizielle Stellen in Deutschland.</p>

              <div className="space-y-4">
                {[
                  { title: 'Bürgerliches Gesetzbuch (BGB)', desc: 'Rechtliche Grundlagen für Kaufverträge (§ 433 ff.), Mietrecht (§ 535 ff.) und Werkvertragsrecht.', linkText: 'Gesetze im Internet (BMJV)', url: 'https://www.gesetze-im-internet.de/bgb/' },
                  { title: 'Gebäudeenergiegesetz (GEG)', desc: 'Vorgaben zur energetischen Beschaffenheit von Gebäuden und zum Heizungstausch.', linkText: 'GEG Übersicht', url: 'https://www.gesetze-im-internet.de/geg/' },
                  { title: 'KfW-Bank (Kreditanstalt für Wiederaufbau)', desc: 'Offizielle Förderprogramme, zinsgünstige Kredite und Zuschüsse für energieeffizientes Bauen und Sanieren.', linkText: 'KfW Förderportal', url: 'https://www.kfw.de' },
                  { title: 'BORIS-D (Bodenrichtwerte Deutschland)', desc: 'Zentrale Plattform der Gutachterausschüsse zur Einsicht offizieller Bodenrichtwerte.', linkText: 'BORIS-D Portal', url: 'https://www.borisportal.de' },
                  { title: 'Bundesnotarkammer', desc: 'Informationen rund um den Notarprozess, Grundbucheintragungen und Kaufabwicklung.', linkText: 'Notar.de', url: 'https://www.notar.de' }
                ].map((source, idx) => (
                  <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{source.title}</h3>
                      <p className="text-xs text-slate-600">{source.desc}</p>
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {source.linkText} ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
