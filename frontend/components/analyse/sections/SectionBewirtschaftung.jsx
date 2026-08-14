'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard, SubContainerCard } from '../../ui/CollapsibleCard';
import { formatEuroInt } from '../../../utils/formatters';

export default function SectionBewirtschaftung({
  formData,
  isOpen,
  onToggle,
  openSubSections,
  toggleSubSection,
  onFieldChange,
  handleLocalIstMonat,
  handleLocalIstSqm,
  handleLocalZielMonat,
  handleLocalZielSqm,
  handleLocalHausgeldGesamt,
  handleLocalHausgeldNichtUmlegbar,
  grwtP,
  notarP,
  maklerP,
  sonstNk,
  displayNkTotal,
  displayGrwtEuro,
  displayNotarEuro,
  displayMaklerEuro,
  idPrefix = ""
}) {
  return (
    <MainCard title="2. Bewirtschaftung & Nebenkosten" isOpen={isOpen} onToggle={onToggle}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Ist-Kaltmiete (€ / Mo)"
          value={formData?.kaltmiete_monat ?? 0}
          onChange={handleLocalIstMonat}
          step={25}
          isCurrency={true}
          idPrefix={idPrefix}
        />
        <StepperInput
          label="Ist-Miete (€ / m²)"
          value={formData?.ist_sqm ?? 0}
          onChange={handleLocalIstSqm}
          step={0.5}
          idPrefix={idPrefix}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Ziel-Kaltmiete (€ / Mo)"
          value={formData?.target_monat ?? 0}
          onChange={handleLocalZielMonat}
          step={25}
          isCurrency={true}
          idPrefix={idPrefix}
        />
        <StepperInput
          label="Ziel-Miete (€ / m²)"
          value={formData?.target_sqm ?? 0}
          onChange={handleLocalZielSqm}
          step={0.5}
          idPrefix={idPrefix}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}adj_year`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Anpassung ab Jahr</label>
        <input
          id={`${idPrefix}adj_year`}
          type="number"
          step="1"
          min="1"
          value={formData?.adj_year ?? 1}
          onChange={(e) => onFieldChange('adj_year', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
        />
      </div>

      <StepperInput
        label="Hausgeld gesamt (€ / Mo)"
        value={formData?.hausgeld ?? 0}
        onChange={handleLocalHausgeldGesamt}
        step={10}
        isCurrency={true}
        idPrefix={idPrefix}
      />

      <SubContainerCard
        title="Nicht umlegbarer Anteil & Details"
        isOpen={openSubSections.hausgeld}
        onToggle={() => toggleSubSection('hausgeld')}
      >
        <StepperInput
          label="Nicht umlegbar (€ / Mo)"
          value={formData?.hausgeld_nicht_umlegbar ?? 0}
          onChange={handleLocalHausgeldNichtUmlegbar}
          step={5}
          isCurrency={true}
          idPrefix={idPrefix}
        />

        <div className="bg-white border border-valuon-border rounded-lg p-3 text-[0.85rem] text-valuon-green">
          <div className="font-extrabold text-[0.8rem] text-valuon-green mb-1">
            Faustformel (25 / 75 % Logik):
          </div>
          <div className="text-[0.75rem] text-slate-600 leading-relaxed">
            Im Durchschnitt sind ca. 75 % des Hausgeldes umlagefähige Betriebskosten. Die verbleibenden 25 % (Instandhaltungsrücklage & Hausverwaltung) trägt der Eigentümer.
          </div>
        </div>
      </SubContainerCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Instandhaltung (€ / m²)"
          value={formData?.inst_sqm ?? 12}
          onChange={(v) => onFieldChange('inst_sqm', v)}
          step={1}
          tooltip="Jährliche Angabe p.a. – orientiert sich standardmäßig am Baujahr und der Objektart."
          idPrefix={idPrefix}
        />

        <StepperInput
          label="Verwaltung (€ / Mo)"
          value={formData?.mgt_monat ?? 30}
          onChange={(v) => onFieldChange('mgt_monat', v)}
          step={5}
          isCurrency={true}
          tooltip="Monatliche Angabe – orientiert sich standardmäßig am Baujahr und der Objektart."
          idPrefix={idPrefix}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Mietausfallwagnis (%)"
          value={formData?.vac_rate_pct ?? 2.0}
          onChange={(v) => onFieldChange('vac_rate_pct', v)}
          step={0.5}
          isPercent={true}
          idPrefix={idPrefix}
        />
        <StepperInput
          label="Sanierung / Umbau (€)"
          value={formData?.sanierung ?? 0}
          onChange={(v) => onFieldChange('sanierung', v)}
          step={1000}
          isCurrency={true}
          idPrefix={idPrefix}
        />
      </div>

      <hr className="border-none border-t border-valuon-border my-1" />

      <div className="text-[0.85rem] font-extrabold text-valuon-green">
        Kaufnebenkosten Parameter
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Grunderwerbsteuer (%)"
          value={formData?.grwt_p ?? 5.0}
          onChange={(v) => onFieldChange('grwt_p', v)}
          step={0.25}
          isPercent={true}
          idPrefix={idPrefix}
        />
        <StepperInput
          label="Notar & Grundbuch (%)"
          value={formData?.notar_p ?? 2.0}
          onChange={(v) => onFieldChange('notar_p', v)}
          step={0.1}
          isPercent={true}
          idPrefix={idPrefix}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Maklercourtage (%)"
          value={formData?.makler_p ?? 3.57}
          onChange={(v) => onFieldChange('makler_p', v)}
          step={0.01}
          isPercent={true}
          idPrefix={idPrefix}
        />
        <StepperInput
          label="Sonstige Nebenkosten (€)"
          value={formData?.sonst_nk ?? 0}
          onChange={(v) => onFieldChange('sonst_nk', v)}
          step={250}
          isCurrency={true}
          idPrefix={idPrefix}
        />
      </div>

      <div className="bg-valuon-cream border border-valuon-border rounded-lg p-3.5 text-valuon-green">
        <div className="font-extrabold text-[0.95rem] mb-2 border-b border-valuon-border pb-1">
          Kaufnebenkosten Gesamt: {formatEuroInt(displayNkTotal)} €
        </div>
        <div className="flex flex-col gap-1 text-[0.8rem] text-slate-600">
          <div>• <strong className="text-valuon-green">Grunderwerbsteuer ({grwtP}%):</strong> {formatEuroInt(displayGrwtEuro)} €</div>
          <div>• <strong className="text-valuon-green">Notar & Grundbuch ({notarP}%):</strong> {formatEuroInt(displayNotarEuro)} €</div>
          <div>• <strong className="text-valuon-green">Maklercourtage ({maklerP}%):</strong> {formatEuroInt(displayMaklerEuro)} €</div>
          {sonstNk > 0 && <div>• <strong className="text-valuon-green">Sonstige Nebenkosten:</strong> {formatEuroInt(sonstNk)} €</div>}
        </div>
      </div>
    </MainCard>
  );
}
