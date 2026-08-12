'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard, SubContainerCard } from '../../ui/CollapsibleCard';
import { formatEuroInt } from '../../../utils/formatters';

export default function SectionSteuern({
  formData,
  isOpen,
  onToggle,
  openSubSections,
  toggleSubSection,
  onFieldChange,
  capexList,
  handleCapexChange,
  removeCapexRow,
  addCapexRow
}) {
  const currentModel = formData?.afa_model || 'Linear Standard';

  const handleAfaModelChange = (model) => {
    onFieldChange('afa_model', model);
    if (model === 'Linear Standard') onFieldChange('afa_lin', 2.0);
    else if (model === 'Linear Neubau') onFieldChange('afa_lin', 3.0);
    else if (model === 'Degressiv') onFieldChange('afa_lin', 5.0);
    else if (model === 'Kombination: Degressiv + Sonder-AfA') onFieldChange('afa_lin', 5.0);
    else if (model === 'Denkmalgeschützt') onFieldChange('afa_lin', 9.0);
  };

  const isAfaRateFixed = currentModel !== 'Linear Standard';

  const kaufpreis = Number(formData?.kaufpreis || 0);
  const qm = Number(formData?.qm || 0);
  const gebaeudeAnteilP = Number(formData?.gebaeude_anteil_pct ?? 80) / 100;
  const gebaeudeWert = kaufpreis * gebaeudeAnteilP;
  const gebaeudeWertProQm = qm > 0 ? gebaeudeWert / qm : 0;
  const isSonderAfaExceeded = gebaeudeWertProQm > 5200;

  const denkmalSanierungEuro = Number(formData?.denkmal_sanierung_euro ?? formData?.sanierung ?? 0);
  const denkmalFertigstellungJahr = Number(formData?.denkmal_fertigstellung_jahr ?? 1);

  return (
    <MainCard title="4. Steuern, Makro & Exit" isOpen={isOpen} onToggle={onToggle}>
      
      {/* GRENZSTEUERSATZ */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-[0.8rem] font-bold text-slate-600">Grenzsteuersatz (%)</label>
          <span className="text-[0.9rem] font-extrabold text-valuon-green">
            {(Number(formData?.tax_rate_pct ?? 42)).toFixed(2).replace('.', ',')} %
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="0.5"
          value={formData?.tax_rate_pct ?? 42}
          onChange={(e) => onFieldChange('tax_rate_pct', parseFloat(e.target.value))}
          className="w-full accent-valuon-green cursor-pointer h-1.5"
        />
      </div>

      {/* AFA MODELL SELEKTION */}
      <div>
        <label className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">AfA-Modell</label>
        <div className="relative flex items-center w-full">
          <select
            value={currentModel}
            onChange={(e) => handleAfaModelChange(e.target.value)}
            className="w-full h-[42px] px-3 pr-7 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 cursor-pointer focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
          >
            <option value="Linear Standard">Linear Standard (2,0 % p.a.)</option>
            <option value="Linear Neubau">Linear Neubau (3,0 % p.a.)</option>
            <option value="Degressiv">Degressiv (§ 7 Abs. 5a - 5,0 %)</option>
            <option value="Kombination: Degressiv + Sonder-AfA">Kombination: Degressiv + Sonder-AfA (§ 7b)</option>
            <option value="Denkmalgeschützt">Denkmalgeschützt (§ 7h/7i - 9,0 %)</option>
          </select>
        </div>
      </div>

      {/* GEBÄUDEANTEIL & AFA % GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Gebäudeanteil (%)"
          value={formData?.gebaeude_anteil_pct ?? 80}
          onChange={(v) => onFieldChange('gebaeude_anteil_pct', v)}
          step={5}
          isPercent={true}
          tooltip="Standardmäßig entfallen ca. 80 % des Kaufpreises auf das Gebäude (steuerlich abschreibungsfähig) und 20 % auf den Grund- und Bodenanteil (nicht abschreibungsfähig)."
        />

        {isAfaRateFixed ? (
          <div>
            <label className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">
              {currentModel === 'Kombination: Degressiv + Sonder-AfA' ? 'Degressive AfA % (Fixiert)' : 'AfA % (Fixiert)'}
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={`${(Number(formData?.afa_lin || 5.0)).toFixed(1).replace('.', ',')} %`}
              className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-slate-100 text-slate-400 cursor-not-allowed box-border"
            />
          </div>
        ) : (
          <StepperInput
            label="AfA %"
            value={formData?.afa_lin ?? 2.0}
            onChange={(v) => onFieldChange('afa_lin', v)}
            step={0.5}
            isPercent={true}
          />
        )}
      </div>

      {currentModel === 'Kombination: Degressiv + Sonder-AfA' && (
        <div>
          <label className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Sonder-AfA % (Fixiert)</label>
          <input
            type="text"
            readOnly
            disabled
            value="5,0 % p.a. (Jahre 1–4)"
            className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-slate-100 text-slate-400 cursor-not-allowed box-border"
          />
        </div>
      )}

      {currentModel === 'Denkmalgeschützt' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StepperInput
            label="Bescheinigter Sanierungsaufwand (€)"
            value={formData?.denkmal_sanierung_euro ?? formData?.sanierung ?? 0}
            onChange={(v) => onFieldChange('denkmal_sanierung_euro', v)}
            step={5000}
            isCurrency={true}
            tooltip="Nur der durch die Denkmalschutzbehörde offiziell bescheinigte Sanierungsanteil darf nach § 7h/7i EStG erhöht abgeschrieben werden."
          />

          <div>
            <label className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Fertigstellung im Jahr</label>
            <input
              type="number"
              min="1"
              max="30"
              step="1"
              value={formData?.denkmal_fertigstellung_jahr ?? 1}
              onChange={(e) => onFieldChange('denkmal_fertigstellung_jahr', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
            />
          </div>
        </div>
      )}

      {currentModel === 'Kombination: Degressiv + Sonder-AfA' && (
        <div className={`rounded-lg p-3.5 text-[0.8rem] border ${
          isSonderAfaExceeded ? 'bg-red-50 border-red-200 text-valuon-red' : 'bg-valuon-cream border-valuon-border text-valuon-green'
        }`}>
          <div className="font-extrabold mb-1">
            Sonder-AfA (§ 7b EStG) Parameter-Check:
          </div>
          <div className="leading-relaxed">
            • <strong>Degressive AfA:</strong> 5,0 % p.a. vom Restbuchwert<br />
            • <strong>Sonder-AfA:</strong> +5,0 % p.a. für die ersten 4 Jahre (max. Bemessungsgrundlage 4.000 € / m²)<br />
            • <strong>Gebäudeanteil aktuell:</strong> {Math.round(gebaeudeWertProQm)} € / m²
          </div>

          {isSonderAfaExceeded ? (
            <div className="mt-2 font-extrabold border-t border-red-200 pt-1.5">
              [Achtung] Baukostenobergrenze überschritten (&gt; 5.200 € / m²). Die Sonder-AfA ist gesetzlich nicht anwendbar. Es wird automatisch nur die degressive AfA (5,0 %) berechnet.
            </div>
          ) : (
            <div className="mt-2 text-emerald-800 font-bold border-t border-valuon-border pt-1.5">
              Gebäudeanteil liegt unter der Baukostenobergrenze (5.200 € / m²). Die Sonder-AfA wird für die Jahre 1 bis 4 berücksichtigt.
            </div>
          )}
        </div>
      )}

      {currentModel === 'Denkmalgeschützt' && (
        <div className={`rounded-lg p-3.5 text-[0.8rem] border ${
          denkmalSanierungEuro === 0 ? 'bg-red-50 border-red-200 text-valuon-red' : 'bg-valuon-cream border-valuon-border text-valuon-green'
        }`}>
          <div className="font-extrabold mb-1">
            Denkmal-AfA (§ 7h / § 7i EStG) Parameter-Check:
          </div>
          <div className="leading-relaxed">
            • <strong>Bescheinigter Sanierungsaufwand:</strong> {formatEuroInt(denkmalSanierungEuro)} €<br />
            • <strong>AfA-Start (Fertigstellung):</strong> Ab Jahr {denkmalFertigstellungJahr}<br />
            • <strong>Erhöhte Abschreibung:</strong> 9,0 % p.a. (8 Jahre) / 7,0 % p.a. (4 Jahre)<br />
            • <strong>Altbestand ({formatEuroInt(gebaeudeWert)} €):</strong> Lineare Standard-AfA (2,0 % p.a.)
          </div>

          {denkmalSanierungEuro === 0 ? (
            <div className="mt-2 font-extrabold border-t border-red-200 pt-1.5">
              [Achtung] Es sind 0 € bescheinigter Sanierungsaufwand eingetragen. Die Denkmal-AfA gilt gesetzlich nur auf den bescheinigten Sanierungsanteil.
            </div>
          ) : (
            <div className="mt-2 text-emerald-800 font-bold border-t border-valuon-border pt-1.5">
              Die Denkmal-AfA wird ab Jahr {denkmalFertigstellungJahr} auf den bescheinigten Sanierungsaufwand von {formatEuroInt(denkmalSanierungEuro)} € angewendet.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Mietsteigerung p.a. (%)"
          value={formData?.miet_inc ?? 1.0}
          onChange={(v) => onFieldChange('miet_inc', v)}
          step={0.1}
          isPercent={true}
        />

        <StepperInput
          label="Wertsteigerung p.a. (%)"
          value={formData?.val_inc ?? 1.0}
          onChange={(v) => onFieldChange('val_inc', v)}
          step={0.1}
          isPercent={true}
        />
      </div>

      <hr className="border-none border-t border-valuon-border my-1" />

      <StepperInput
        label="Verkaufsnebenkosten / Exit (%)"
        value={formData?.exit_cost ?? 0.0}
        onChange={(v) => onFieldChange('exit_cost', v)}
        step={0.5}
        isPercent={true}
      />

      <SubContainerCard
        title="CapEx & Instandhaltungs-Fahrplan"
        isOpen={openSubSections.capex}
        onToggle={() => toggleSubSection('capex')}
      >
        <p className="m-0 mb-2 text-[0.75rem] text-slate-500 leading-relaxed">
          Plane größere einmalige Instandhaltungen (z. B. Dachsanierung, Heizungstausch) für bestimmte Jahre im Voraus ein.
        </p>

        {capexList && capexList.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_1fr_36px] gap-2 text-[0.75rem] font-bold text-slate-600">
              <span>Instandhaltungsjahr</span>
              <span>Betrag (€)</span>
              <span></span>
            </div>

            {capexList.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  value={row.year ?? row.jahr ?? 1}
                  onChange={(e) => handleCapexChange && handleCapexChange(idx, 'year', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="z. B. Jahr 3"
                  className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
                />
                <input
                  type="number"
                  value={row.amount ?? row.betrag ?? 0}
                  onChange={(e) => handleCapexChange && handleCapexChange(idx, 'amount', e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="Betrag €"
                  className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
                />
                <button
                  type="button"
                  onClick={() => removeCapexRow && removeCapexRow(idx)}
                  className="bg-red-50 border border-red-200 text-valuon-red rounded-lg h-[42px] font-extrabold cursor-pointer hover:bg-red-100 transition-colors"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[0.8rem] text-slate-500">Noch keine Sonder-CapEx angelegt.</div>
        )}

        {addCapexRow && (
          <button
            type="button"
            onClick={addCapexRow}
            className="p-2.5 bg-valuon-green text-white border-none rounded-lg text-[0.8rem] font-extrabold cursor-pointer mt-1 hover:bg-valuon-green-light transition-colors shadow-sm"
          >
            + CapEx Position hinzufügen
          </button>
        )}
      </SubContainerCard>
    </MainCard>
  );
}
