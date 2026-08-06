'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard, SubContainerCard } from '../../ui/CollapsibleCard';
import { formatEuroInt } from '../../../utils/formatters';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#4A5568', marginBottom: '6px' };
const inputStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', fontWeight: '500', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };
const disabledInputStyle = { ...inputStyle, background: '#EDF2F7', color: '#718096', cursor: 'not-allowed' };
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
  const currentModel = formData?.afa_model || 'Linear Standard';

  // HANDLER FÜR AUTOMATISCHE PROZENTSATZ-ANPASSUNG
  const handleAfaModelChange = (model) => {
    onFieldChange('afa_model', model);
    if (model === 'Linear Standard') onFieldChange('afa_lin', 2.0);
    else if (model === 'Linear Neubau') onFieldChange('afa_lin', 3.0);
    else if (model === 'Degressiv') onFieldChange('afa_lin', 5.0);
    else if (model === 'Kombination: Degressiv + Sonder-AfA') onFieldChange('afa_lin', 5.0);
    else if (model === 'Denkmalgeschützt') onFieldChange('afa_lin', 9.0);
  };

  const isAfaRateFixed = currentModel !== 'Linear Standard';

  // PRÜFUNGEN FÜR FORMULAR-WARNHINWEISE
  const kaufpreis = Number(formData?.kaufpreis || 0);
  const qm = Number(formData?.qm || 0);
  const gebaeudeAnteilP = Number(formData?.gebaeude_anteil_pct ?? 80) / 100;
  const gebaeudeWert = kaufpreis * gebaeudeAnteilP;
  const gebaeudeWertProQm = qm > 0 ? gebaeudeWert / qm : 0;
  const isSonderAfaExceeded = gebaeudeWertProQm > 5200;

  const sanierungKosten = Number(formData?.sanierung || 0);

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
            value={currentModel}
            onChange={(e) => handleAfaModelChange(e.target.value)}
            style={selectStyle}
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
      <div style={grid2Style}>
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
            <label style={labelStyle}>
              {currentModel === 'Kombination: Degressiv + Sonder-AfA' ? 'Degressive AfA % (Fixiert)' : 'AfA % (Fixiert)'}
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={`${(Number(formData?.afa_lin || 5.0)).toFixed(1).replace('.', ',')} %`}
              style={disabledInputStyle}
            />
          </div>
        ) : (
          <StepperInput
            label="AfA %"
            value={formData?.afa_lin || 2.0}
            onChange={(v) => onFieldChange('afa_lin', v)}
            step={0.5}
            isPercent={true}
          />
        )}
      </div>

      {/* EXTRA FELD FÜR SONDER-AFA % BEI DER KOMBINATION */}
      {currentModel === 'Kombination: Degressiv + Sonder-AfA' && (
        <div>
          <label style={labelStyle}>Sonder-AfA % (Fixiert)</label>
          <input
            type="text"
            readOnly
            disabled
            value="5,0 % p.a. (Jahre 1–4)"
            style={disabledInputStyle}
          />
        </div>
      )}

      {/* HINWEISKASTEN SONDER-AFA (§ 7b EStG) */}
      {currentModel === 'Kombination: Degressiv + Sonder-AfA' && (
        <div style={{
          background: isSonderAfaExceeded ? '#FFF5F5' : '#FAF8F5',
          border: isSonderAfaExceeded ? '1px solid #FEB2B2' : '1px solid #E2D9CE',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '0.8rem',
          color: isSonderAfaExceeded ? '#9B2C2C' : '#13381A'
        }}>
          <div style={{ fontWeight: '800', marginBottom: '4px' }}>
            Sonder-AfA (§ 7b EStG) Parameter-Check:
          </div>
          <div style={{ lineHeight: '1.4' }}>
            • <strong>Degressive AfA:</strong> 5,0 % p.a. vom Restbuchwert<br />
            • <strong>Sonder-AfA:</strong> +5,0 % p.a. für die ersten 4 Jahre (max. Bemessungsgrundlage 4.000 € / m²)<br />
            • <strong>Gebäudeanteil aktuell:</strong> {Math.round(gebaeudeWertProQm)} € / m²
          </div>

          {isSonderAfaExceeded ? (
            <div style={{ marginTop: '8px', fontWeight: '800', borderTop: '1px solid #FEB2B2', paddingTop: '6px' }}>
              [Achtung] Baukostenobergrenze überschritten (&gt; 5.200 € / m²). Die Sonder-AfA ist gesetzlich nicht anwendbar. Es wird automatisch nur die degressive AfA (5,0 %) berechnet.
            </div>
          ) : (
            <div style={{ marginTop: '8px', color: '#276749', fontWeight: '700', borderTop: '1px solid #E2D9CE', paddingTop: '6px' }}>
              Gebäudeanteil liegt unter der Baukostenobergrenze (5.200 € / m²). Die Sonder-AfA wird für die Jahre 1 bis 4 berücksichtigt.
            </div>
          )}
        </div>
      )}

      {/* HINWEISKASTEN DENKMAL-AFA (§ 7h / § 7i EStG) */}
      {currentModel === 'Denkmalgeschützt' && (
        <div style={{
          background: sanierungKosten === 0 ? '#FFF5F5' : '#FAF8F5',
          border: sanierungKosten === 0 ? '1px solid #FEB2B2' : '1px solid #E2D9CE',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '0.8rem',
          color: sanierungKosten === 0 ? '#9B2C2C' : '#13381A'
        }}>
          <div style={{ fontWeight: '800', marginBottom: '4px' }}>
            Denkmal-AfA (§ 7h / § 7i EStG) Parameter-Check:
          </div>
          <div style={{ lineHeight: '1.4' }}>
            • <strong>Sanierungsaufwand (Jahre 1–8):</strong> 9,0 % p.a.<br />
            • <strong>Sanierungsaufwand (Jahre 9–12):</strong> 7,0 % p.a.<br />
            • <strong>Altbestand-Gebäudeanteil:</strong> Lineare Standard-AfA (2,0 % p.a.)
          </div>

          {sanierungKosten === 0 ? (
            <div style={{ marginTop: '8px', fontWeight: '800', borderTop: '1px solid #FEB2B2', paddingTop: '6px' }}>
              [Achtung] Unter "Sanierung / Umbau (€)" sind aktuell 0 € eingetragen. Die erhöhte Denkmal-AfA gilt gesetzlich ausschließlich auf die bescheinigten Sanierungskosten, nicht auf den ursprünglichen Altbestand-Kaufpreis!
            </div>
          ) : (
            <div style={{ marginTop: '8px', color: '#276749', fontWeight: '700', borderTop: '1px solid #E2D9CE', paddingTop: '6px' }}>
              Die Denkmal-AfA wird auf die angegebenen Sanierungskosten von {formatEuroInt(sanierungKosten)} € angewendet.
            </div>
          )}
        </div>
      )}

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

      {/* CAPEX SUBSECTION */}
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
