'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard, SubContainerCard } from '../../ui/CollapsibleCard';
import { formatEuroInt } from '../../../utils/formatters';

export default function SectionFinanzierung({
  formData,
  isOpen,
  onToggle,
  openSubSections,
  toggleSubSection,
  onFieldChange,
  isEkCoveringNk,
  displayNkTotal,
  idPrefix = ""
}) {
  return (
    <MainCard title="3. Finanzierung & Eigenkapital" isOpen={isOpen} onToggle={onToggle}>
      <StepperInput
        label="Eigenkapital-Einsatz (€)"
        value={formData?.ek_euro ?? 0}
        onChange={(v) => onFieldChange('ek_euro', v)}
        step={2500}
        isCurrency={true}
        idPrefix={idPrefix}
      />

      <div className={`p-3 rounded-lg text-[0.8rem] font-bold flex items-start gap-2 border ${
        isEkCoveringNk 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : 'bg-red-50 border-red-200 text-valuon-red'
      }`}>
        <span className="text-[1rem] leading-none">{isEkCoveringNk ? '✓' : '⚠'}</span>
        <div>
          <div>
            {isEkCoveringNk
              ? `Eigenkapital deckt die Kaufnebenkosten (${formatEuroInt(displayNkTotal)} €) vollständig ab.`
              : `Eigenkapital deckt die Kaufnebenkosten (${formatEuroInt(displayNkTotal)} €) nicht vollständig ab.`}
          </div>
          <div className="font-normal text-[0.75rem] mt-1 opacity-90">
            {isEkCoveringNk
              ? 'Gute Voraussetzung für eine klassische 100%-Finanzierung des Kaufpreises durch die Bank.'
              : 'Hinweis: Müsste die Bank Kaufnebenkosten mitfinanzieren (> 100 % Beleihung), verlangen Kreditinstitute in der Regel Risikoaufschläge beim Sollzins sowie strengere Bonitätsanforderungen.'}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}loan_type`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Darlehensart</label>
        <div className="relative flex items-center w-full">
          <select
            id={`${idPrefix}loan_type`}
            value={formData?.loan_type || 'Annuitätendarlehen'}
            onChange={(e) => onFieldChange('loan_type', e.target.value)}
            className="w-full h-[42px] px-3 pr-7 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 cursor-pointer focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
          >
            <option value="Annuitätendarlehen">Annuitätendarlehen (Konstante Monatsrate)</option>
            <option value="Endfälliges Darlehen">Endfälliges Darlehen (Nur Zinszahlung)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Sollzins Hausbank (%)"
          value={formData?.hb_zins ?? 3.8}
          onChange={(v) => onFieldChange('hb_zins', v)}
          step={0.1}
          isPercent={true}
          idPrefix={idPrefix}
        />
        <StepperInput
          label="Anfängliche Tilgung (%)"
          value={formData?.hb_tilg ?? 2.0}
          onChange={(v) => onFieldChange('hb_tilg', v)}
          step={0.1}
          isPercent={true}
          idPrefix={idPrefix}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Tilgungsfreie Jahre"
          value={formData?.grace_years ?? 0}
          onChange={(v) => onFieldChange('grace_years', v)}
          step={1}
          idPrefix={idPrefix}
        />
        <StepperInput
          label="Zinsbindung (Jahre)"
          value={formData?.zinsbindung ?? 10}
          onChange={(v) => onFieldChange('zinsbindung', v)}
          step={1}
          idPrefix={idPrefix}
        />
      </div>

      <StepperInput
        label="Sondertilgung (€ / J.)"
        value={formData?.sondertilg ?? 0}
        onChange={(v) => onFieldChange('sondertilg', v)}
        step={500}
        isCurrency={true}
        idPrefix={idPrefix}
      />

      <SubContainerCard
        title="Anschlussfinanzierung (nach Zinsbindung)"
        isOpen={openSubSections.folgefinanzierung}
        onToggle={() => toggleSubSection('folgefinanzierung')}
      >
        <StepperInput
          label="Folgezins (%)"
          value={formData?.folge_zins ?? 3.8}
          onChange={(v) => onFieldChange('folge_zins', v)}
          step={0.1}
          isPercent={true}
          idPrefix={idPrefix}
        />
        <div>
          <label htmlFor={`${idPrefix}folge_mode`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Anschluss-Modus</label>
          <div className="relative flex items-center w-full">
            <select
              id={`${idPrefix}folge_mode`}
              value={formData?.folge_mode || 'Rate konstant halten (Annuität)'}
              onChange={(e) => onFieldChange('folge_mode', e.target.value)}
              className="w-full h-[42px] px-3 pr-7 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 cursor-pointer focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
            >
              <option value="Rate konstant halten (Annuität)">Rate konstant halten (Annuität)</option>
              <option value="Neuer Tilgungssatz festlegen">Neuen Tilgungssatz festlegen</option>
            </select>
          </div>
        </div>

        {formData?.folge_mode !== 'Rate konstant halten (Annuität)' && (
          <StepperInput
            label="Folge-Tilgung (%)"
            value={formData?.folge_tilg ?? 2.0}
            onChange={(v) => onFieldChange('folge_tilg', v)}
            step={0.1}
            isPercent={true}
            idPrefix={idPrefix}
          />
        )}
      </SubContainerCard>

      <SubContainerCard
        title="KfW-Darlehen & Zuschüsse"
        isOpen={openSubSections.kfw}
        onToggle={() => toggleSubSection('kfw')}
      >
        <StepperInput
          label="KfW-Darlehensbetrag (€)"
          value={formData?.kfw_amt ?? 0}
          onChange={(v) => onFieldChange('kfw_amt', v)}
          step={5000}
          isCurrency={true}
          idPrefix={idPrefix}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StepperInput
            label="KfW Zins (%)"
            value={formData?.kfw_zins ?? 2.1}
            onChange={(v) => onFieldChange('kfw_zins', v)}
            step={0.1}
            isPercent={true}
            idPrefix={idPrefix}
          />
          <StepperInput
            label="KfW Tilgung (%)"
            value={formData?.kfw_tilg ?? 3.0}
            onChange={(v) => onFieldChange('kfw_tilg', v)}
            step={0.1}
            isPercent={true}
            idPrefix={idPrefix}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StepperInput
            label="KfW Tilgungsfreie Jahre"
            value={formData?.kfw_grace_years ?? 0}
            onChange={(v) => onFieldChange('kfw_grace_years', v)}
            step={1}
            idPrefix={idPrefix}
          />
          <StepperInput
            label="KfW Tilgungszuschuss (€)"
            value={formData?.kfw_grant ?? 0}
            onChange={(v) => onFieldChange('kfw_grant', v)}
            step={1000}
            isCurrency={true}
            idPrefix={idPrefix}
          />
        </div>
      </SubContainerCard>
    </MainCard>
  );
}
