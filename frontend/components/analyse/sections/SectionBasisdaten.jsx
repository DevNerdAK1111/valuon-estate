'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard } from '../../ui/CollapsibleCard';
import { OBJEKTARTEN } from '../../../constants/realEstate';

export default function SectionBasisdaten({
  formData,
  isOpen,
  onToggle,
  onFieldChange,
  handleBundeslandChange,
  handleQmChange,
  bundeslaenderList,
  idPrefix = ""
}) {
  return (
    <MainCard title="1. Basisdaten & Kaufpreis" isOpen={isOpen} onToggle={onToggle}>
      <div>
        <label htmlFor={`${idPrefix}obj_name`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Objektbezeichnung</label>
        <input
          id={`${idPrefix}obj_name`}
          type="text"
          value={formData?.obj_name || ''}
          onChange={(e) => onFieldChange('obj_name', e.target.value)}
          placeholder="z.B. ETW Musterstraße"
          className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9name] font-medium outline-none bg-white text-slate-700 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}objektart`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Objektart</label>
        <div className="relative flex items-center w-full">
          <select
            id={`${idPrefix}objektart`}
            value={formData?.objektart || 'Eigentumswohnung'}
            onChange={(e) => onFieldChange('objektart', e.target.value)}
            className="w-full h-[42px] px-3 pr-7 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 cursor-pointer focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
          >
            {OBJEKTARTEN.map((art) => (
              <option key={art} value={art}>{art}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}bundesland`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Bundesland</label>
        <div className="relative flex items-center w-full">
          <select
            id={`${idPrefix}bundesland`}
            value={formData?.bundesland || 'Niedersachsen'}
            onChange={(e) => handleBundeslandChange(e.target.value)}
            className="w-full h-[42px] px-3 pr-7 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 cursor-pointer focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
          >
            {bundeslaenderList.map((bl) => (
              <option key={bl} value={bl}>{bl}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}stadt`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Stadt</label>
          <input
            id={`${idPrefix}stadt`}
            type="text"
            value={formData?.stadt || ''}
            onChange={(e) => onFieldChange('stadt', e.target.value)}
            placeholder="z.B. Weyhe"
            className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}stadtteil`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Stadtteil</label>
          <input
            id={`${idPrefix}stadtteil`}
            type="text"
            value={formData?.stadtteil || ''}
            onChange={(e) => onFieldChange('stadtteil', e.target.value)}
            placeholder="z.B. Leeste"
            className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
          />
        </div>
      </div>

      <StepperInput
        label="Kaufpreis (€)"
        value={formData?.kaufpreis ?? 0}
        onChange={(v) => onFieldChange('kaufpreis', v)}
        step={5000}
        isCurrency={true}
        idPrefix={idPrefix}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StepperInput
          label="Wohnfläche (m²)"
          value={formData?.qm ?? 0}
          onChange={(v) => handleQmChange ? handleQmChange(v) : onFieldChange('qm', v)}
          step={5}
          isSqm={true}
          idPrefix={idPrefix}
        />
        <div>
          <label htmlFor={`${idPrefix}baujahr`} className="block text-[0.8rem] font-bold text-slate-600 mb-1.5">Baujahr</label>
          <input
            id={`${idPrefix}baujahr`}
            type="number"
            step="1"
            value={formData?.baujahr ?? 2000}
            onChange={(e) => onFieldChange('baujahr', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className="w-full h-[42px] px-3 rounded-lg border border-slate-300 text-[0.9rem] font-medium outline-none bg-white text-slate-700 focus:border-valuon-green focus:ring-1 focus:ring-valuon-green box-border"
          />
        </div>
      </div>
    </MainCard>
  );
}
