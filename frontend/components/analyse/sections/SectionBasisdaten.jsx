'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard } from '../../ui/CollapsibleCard';
import { labelStyle, inputStyle, selectContainerStyle, selectStyle, grid2Style } from '../../../styles/formStyles';
import { OBJEKTARTEN } from '../../../constants/realEstate';

export default function SectionBasisdaten({
  formData,
  isOpen,
  onToggle,
  onFieldChange,
  handleBundeslandChange,
  handleQmChange,
  bundeslaenderList
}) {
  return (
    <MainCard title="1. Basisdaten & Kaufpreis" isOpen={isOpen} onToggle={onToggle}>
      <div>
        <label style={labelStyle}>Objektbezeichnung</label>
        <input
          type="text"
          value={formData?.obj_name || ''}
          onChange={(e) => onFieldChange('obj_name', e.target.value)}
          placeholder="z.B. ETW Musterstraße"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Objektart</label>
        <div style={selectContainerStyle}>
          <select
            value={formData?.objektart || 'Eigentumswohnung'}
            onChange={(e) => onFieldChange('objektart', e.target.value)}
            style={selectStyle}
          >
            {OBJEKTARTEN.map((art) => (
              <option key={art} value={art}>{art}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Bundesland</label>
        <div style={selectContainerStyle}>
          <select
            value={formData?.bundesland || 'Niedersachsen'}
            onChange={(e) => handleBundeslandChange(e.target.value)}
            style={selectStyle}
          >
            {bundeslaenderList.map((bl) => (
              <option key={bl} value={bl}>{bl}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={grid2Style}>
        <div>
          <label style={labelStyle}>Stadt</label>
          <input
            type="text"
            value={formData?.stadt || ''}
            onChange={(e) => onFieldChange('stadt', e.target.value)}
            placeholder="z.B. Weyhe"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Stadtteil</label>
          <input
            type="text"
            value={formData?.stadtteil || ''}
            onChange={(e) => onFieldChange('stadtteil', e.target.value)}
            placeholder="z.B. Leeste"
            style={inputStyle}
          />
        </div>
      </div>

      <StepperInput
        label="Kaufpreis (€)"
        value={formData?.kaufpreis || 0}
        onChange={(v) => onFieldChange('kaufpreis', v)}
        step={5000}
        isCurrency={true}
      />

      <div style={grid2Style}>
        <StepperInput
          label="Wohnfläche (m²)"
          value={formData?.qm || 0}
          onChange={(v) => handleQmChange ? handleQmChange(v) : onFieldChange('qm', v)}
          step={5}
          isSqm={true}
        />
        <div>
          <label style={labelStyle}>Baujahr</label>
          <input
            type="number"
            step="1"
            value={formData?.baujahr || 2000}
            onChange={(e) => onFieldChange('baujahr', parseInt(e.target.value, 10) || 2000)}
            style={inputStyle}
          />
        </div>
      </div>
    </MainCard>
  );
}
