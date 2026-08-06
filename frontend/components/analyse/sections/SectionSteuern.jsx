'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard, SubContainerCard } from '../../ui/CollapsibleCard';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#4A5568', marginBottom: '6px' };
const inputStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', fontWeight: '500', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };
const selectContainerStyle = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' };
const selectStyle = { width: '100%', height: '42px', padding: '0 28px 0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', fontWeight: '500', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748', cursor: 'pointer' };
const grid2Style = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

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
  return (
    <MainCard title="4. Steuern, Makro & Exit" isOpen={isOpen} onToggle={onToggle}>
      
      {/* GRENZSTEUERSATZ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={labelStyle}>Grenzsteuersatz (%)</label>
          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#13381A' }}>
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
          style={{
            width: '100%',
            accentColor: '#13381A',
            cursor: 'pointer',
            height: '6px'
          }}
        />
      </div>

      {/* AFA MODELL SELEKTION */}
      <div>
        <label style={labelStyle}>AfA-Modell</label>
        <div style={selectContainerStyle}>
          <select
            value={formData?.afa_model || 'Linear Standard'}
            onChange={(e) => onFieldChange('afa_model', e.target.value)}
            style={selectStyle}
          >
            <option value="Linear Standard">Linear Standard (2,0 % p.a.)</option>
            <option value="Linear Neubau">Linear Neubau (3,0 % p.a.)</option>
            <option value="Degressiv">Degressiv (§ 7 Abs. 5a - 5,0 %)</option>
            <option value="Kombination: Degressiv + Sonder-AfA">Kombination: Degressiv + Sonder-AfA</option>
            <option value="Denkmalgeschützt">Denkmalgeschützt (§ 7h/7i)</option>
          </select>
        </div>
      </div>

      {/* GEBÄUDEANTEIL & AFA % GRID */}
      <div style={grid2Style}>
        <StepperInput
          label="Gebäudeanteil (%)"
          value={formData?.gebaeude_anteil_pct ?? 80}
          onChange={(v) => onFieldChange('gebaeude_anteil_pct', v)}
          step={5}
          isPercent={true}
          tooltip="Standardmäßig entfallen ca. 80 % des Kaufpreises auf das Gebäude (steuerlich abschreibungsfähig) und 20 % auf den Grund- und Bodenanteil (nicht abschreibungsfähig). Der genaue Wert hängt vom Bodenrichtwert der Lage ab."
        />

        <StepperInput
          label="AfA %"
          value={formData?.afa_lin || 2.0}
          onChange={(v) => onFieldChange('afa_lin', v)}
          step={0.5}
          isPercent={true}
        />
      </div>

      {/* DYNAMIKEN */}
      <div style={grid2Style}>
        <StepperInput
          label="Mietsteigerung p.a. (%)"
          value={formData?.miet_inc || 1.0}
          onChange={(v) => onFieldChange('miet_inc', v)}
          step={0.1}
          isPercent={true}
        />

        <StepperInput
          label="Wertsteigerung p.a. (%)"
          value={formData?.val_inc || 1.0}
          onChange={(v) => onFieldChange('val_inc', v)}
          step={0.1}
          isPercent={true}
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '0.25rem 0' }} />

      <StepperInput
        label="Verkaufsnebenkosten / Exit (%)"
        value={formData?.exit_cost || 0.0}
        onChange={(v) => onFieldChange('exit_cost', v)}
        step={0.5}
        isPercent={true}
      />

      {/* CAPEX SUBSSECTION */}
      <SubContainerCard
        title="CapEx & Instandhaltungs-Fahrplan"
        isOpen={openSubSections.capex}
        onToggle={() => toggleSubSection('capex')}
      >
        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#718096', lineHeight: '1.4' }}>
          Plane größere einmalige Instandhaltungen (z. B. Dachsanierung, Heizungstausch) für bestimmte Jahre im Voraus ein.
        </p>

        {capexList && capexList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#4A5568' }}>
              <span>Instandhaltungsjahr</span>
              <span>Betrag (€)</span>
              <span></span>
            </div>

            {capexList.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  value={row.year || row.jahr || 1}
                  onChange={(e) => handleCapexChange && handleCapexChange(idx, 'year', parseInt(e.target.value, 10))}
                  placeholder="z. B. Jahr 3"
                  style={inputStyle}
                />
                <input
                  type="number"
                  value={row.amount || row.betrag || 0}
                  onChange={(e) => handleCapexChange && handleCapexChange(idx, 'amount', parseFloat(e.target.value))}
                  placeholder="Betrag €"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => removeCapexRow && removeCapexRow(idx)}
                  style={{
                    background: '#FFF5F5',
                    border: '1px solid #FEB2B2',
                    color: '#9B2C2C',
                    borderRadius: '8px',
                    height: '42px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: '#718096' }}>Noch keine Sonder-CapEx angelegt.</div>
        )}

        {addCapexRow && (
          <button
            type="button"
            onClick={addCapexRow}
            style={{
              padding: '10px',
              background: '#13381A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            + CapEx Position hinzufügen
          </button>
        )}
      </SubContainerCard>
    </MainCard>
  );
}
