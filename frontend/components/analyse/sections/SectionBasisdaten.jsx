'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard } from '../../ui/CollapsibleCard';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#4A5568', marginBottom: '6px' };
const inputStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', fontWeight: '500', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };
const selectContainerStyle = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' };
const selectStyle = { width: '100%', height: '42px', padding: '0 28px 0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', fontWeight: '500', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748', cursor: 'pointer' };
const grid2Style = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

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
            <option value="Eigentumswohnung">Eigentumswohnung</option>
            <option value="Einfamilienhaus">Einfamilienhaus</option>
            <option value="Zweifamilienhaus">Zweifamilienhaus</option>
            <option value="Reihenhaus / Doppelhaushälfte">Reihenhaus / Doppelhaushälfte</option>
            <option value="Mehrfamilienhaus">Mehrfamilienhaus</option>
            <option value="Wohn- und Geschäftshaus">Wohn- und Geschäftshaus</option>
            <option value="Mikroapartment / Studentisches Wohnen">Mikroapartment / Studentisches Wohnen</option>
            <option value="Pflege- / Seniorenimmobilie">Pflege- / Seniorenimmobilie</option>
            <option value="Gewerbeimmobilie / Sonstiges">Gewerbeimmobilie / Sonstiges</option>
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
