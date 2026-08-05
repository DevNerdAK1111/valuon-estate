'use client';
import StepperInput from '../ui/StepperInput';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568', marginBottom: '4px', height: '18px' };
const inputTextStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };
const sectionTitleStyle = { fontSize: '1rem', fontWeight: '800', color: '#13381A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' };

export default function Parametrisierung({
  formData,
  updateField,
  pingBackend,
  handleQmChange,
  handleIstMonatChange,
  handleIstSqmChange,
  handleHausgeldChange,
  handleHausgeldNichtUmlegbarChange,
  handleTargetMonatChange,
  handleTargetSqmChange,
  grunderwerbsteuerSätze,
  summe_nk,
  grwt_euro,
  notar_euro,
  makler_euro,
  capexList,
  handleCapexChange,
  removeCapexRow,
  addCapexRow,
  loading
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. OBJEKTDATEN */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={sectionTitleStyle}>▼ 1. Objektdaten & Ertrag</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Objektbezeichnung</label>
            <input
              type="text"
              value={formData.obj_name}
              onChange={(e) => updateField('obj_name', e.target.value)}
              style={inputTextStyle}
              placeholder="z.B. Muster Wohnung"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Objektart</label>
              <select
                value={formData.objektart}
                onChange={(e) => updateField('objektart', e.target.value)}
                style={inputTextStyle}
              >
                <option value="Eigentumswohnung">Eigentumswohnung</option>
                <option value="Mehrfamilienhaus">Mehrfamilienhaus</option>
                <option value="Einfamilienhaus">Einfamilienhaus</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Bundesland</label>
              <select
                value={formData.bundesland}
                onChange={(e) => updateField('bundesland', e.target.value)}
                style={inputTextStyle}
              >
                {Object.keys(grunderwerbsteuerSätze).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Stadt / Ort</label>
              <input
                type="text"
                value={formData.stadt}
                onChange={(e) => updateField('stadt', e.target.value)}
                style={inputTextStyle}
              />
            </div>
            <StepperInput
              label="Baujahr"
              value={formData.baujahr}
              onChange={(v) => updateField('baujahr', v)}
              isYear={true}
              step={1}
            />
          </div>

          <StepperInput
            label="Kaufpreis (€)"
            value={formData.kaufpreis}
            onChange={(v) => updateField('kaufpreis', v)}
            step={5000}
            isCurrency={true}
          />

          <StepperInput
            label="Wohnfläche (m²)"
            value={formData.qm}
            onChange={(v) => handleQmChange(v)}
            step={5}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Kaltmiete mt. (€)"
              value={formData.kaltmiete_monat}
              onChange={(v) => handleIstMonatChange(v)}
              step={25}
              isCurrency={true}
            />
            <StepperInput
              label="Miete / m² (€)"
              value={formData.ist_sqm}
              onChange={(v) => handleIstSqmChange(v)}
              step={0.5}
            />
          </div>

          {/* KAUFNEBENKOSTEN SUMMARY */}
          <div style={{ background: '#FAF8F5', padding: '12px', borderRadius: '8px', border: '1px solid #E2D9CE', marginTop: '4px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#13381A', marginBottom: '6px' }}>
              Kaufnebenkosten Summe: {summe_nk.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </div>
            <div style={{ fontSize: '0.75rem', color: '#718096', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div>• Grunderwerbsteuer ({formData.grwt_p}%): {grwt_euro.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</div>
              <div>• Notar & Grundbuch ({formData.notar_p}%): {notar_euro.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</div>
              <div>• Maklerprovision ({formData.makler_p}%): {makler_euro.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. FINANZIERUNG */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={sectionTitleStyle}>▼ 2. Finanzierung & Darlehen</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <StepperInput
            label="Eigenkapitaleinsatz (€)"
            value={formData.ek_euro}
            onChange={(v) => updateField('ek_euro', v)}
            step={2500}
            isCurrency={true}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Sollzins p.a. (%)"
              value={formData.hb_zins}
              onChange={(v) => updateField('hb_zins', v)}
              step={0.1}
              isPercent={true}
            />
            <StepperInput
              label="Anfängliche Tilgung (%)"
              value={formData.hb_tilg}
              onChange={(v) => updateField('hb_tilg', v)}
              step={0.25}
              isPercent={true}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Zinsbindung (Jahre)"
              value={formData.zinsbindung}
              onChange={(v) => updateField('zinsbindung', v)}
              step={1}
            />
            <StepperInput
              label="Anschlusszins (%)"
              value={formData.folge_zins}
              onChange={(v) => updateField('folge_zins', v)}
              step={0.1}
              isPercent={true}
            />
          </div>
        </div>
      </div>

      {/* 3. BEWIRTSCHAFTUNG & CAPEX */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={sectionTitleStyle}>▼ 3. Instandhaltung & Mietausfall</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Hausgeld monatlich (€)"
              value={formData.hausgeld}
              onChange={(v) => handleHausgeldChange(v)}
              step={10}
              isCurrency={true}
            />
            <StepperInput
              label="Davon nicht umlegbar (€)"
              value={formData.hausgeld_nicht_umlegbar}
              onChange={(v) => handleHausgeldNichtUmlegbarChange(v)}
              step={5}
              isCurrency={true}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Instandhaltung (€/m²/Jahr)"
              value={formData.inst_sqm}
              onChange={(v) => updateField('inst_sqm', v)}
              step={1}
            />
            <StepperInput
              label="Mietausfallwagnis (%)"
              value={formData.vac_rate_pct}
              onChange={(v) => updateField('vac_rate_pct', v)}
              step={0.5}
              isPercent={true}
            />
          </div>

          {/* CAPEX GEPLANTE SANIERUNGEN */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A', marginBottom: '8px' }}>
              Geplante Groß-Sanierungen (CapEx)
            </div>
            {capexList.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 30px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <StepperInput
                  label={idx === 0 ? "In Jahr" : ""}
                  value={item.year}
                  onChange={(v) => handleCapexChange(idx, 'year', v)}
                  step={1}
                />
                <StepperInput
                  label={idx === 0 ? "Betrag (€)" : ""}
                  value={item.amount}
                  onChange={(v) => handleCapexChange(idx, 'amount', v)}
                  step={1000}
                  isCurrency={true}
                />
                <button
                  type="button"
                  onClick={() => removeCapexRow(idx)}
                  style={{ marginTop: idx === 0 ? '22px' : '0', background: 'none', border: 'none', color: '#9B2C2C', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCapexRow}
              style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#13381A', cursor: 'pointer' }}
            >
              + Weitere Sanierung hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* 4. STEUERN, MAKRO & EXIT */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={sectionTitleStyle}>▼ 4. Steuern, Makro & Exit</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={labelStyle}>Grenzsteuersatz (%)</label>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A' }}>
                {formData.tax_rate_pct.toFixed(2)} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={formData.tax_rate_pct}
              onChange={(e) => updateField('tax_rate_pct', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#13381A', cursor: 'pointer' }}
            />
          </div>

          <div>
            <label style={labelStyle}>AfA-Modell</label>
            <select
              value={formData.afa_model}
              onChange={(e) => updateField('afa_model', e.target.value)}
              style={inputTextStyle}
            >
              <option value="Linear Standard">Linear Standard (2,0% p.a.)</option>
              <option value="Linear Neubau">Linear Neubau (3,0% p.a.)</option>
              <option value="Degressiv">Degressiv (5,0% p.a.)</option>
              <option value="Kombination: Degressiv + Sonder-AfA">Kombination: Degressiv + Sonder-AfA</option>
              <option value="Denkmalgeschützt">Denkmalgeschützt (Sanierung)</option>
            </select>
          </div>

          <StepperInput
            label="AfA %"
            value={formData.afa_lin}
            onChange={(v) => updateField('afa_lin', v)}
            step={0.5}
            isPercent={true}
          />

          {/* SONDER-AFA FELD (WIRD NUR BEI EMTSPRECHENDER KOMBINATION ANGEZEIGT) */}
          {formData.afa_model === 'Kombination: Degressiv + Sonder-AfA' && (
            <div style={{ marginTop: '2px' }}>
              <StepperInput
                label="Sonder-AfA % (§ 7b EStG)"
                value={5.0}
                onChange={() => {}}
                disabled={true}
                isPercent={true}
                tooltip="Gesetzlich fester Satz von 5% p.a. für 4 Jahre bei förderfähigem Neubau"
              />
            </div>
          )}

          <StepperInput
            label="Mietsteigerung p.a. (%)"
            value={formData.miet_inc}
            onChange={(v) => updateField('miet_inc', v)}
            step={0.25}
            isPercent={true}
          />

          <StepperInput
            label="Wertsteigerung p.a. (%)"
            value={formData.val_inc}
            onChange={(v) => updateField('val_inc', v)}
            step={0.25}
            isPercent={true}
          />

          <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '4px 0' }} />

          <StepperInput
            label="Verkaufsnebenkosten / Exit (%)"
            value={formData.exit_cost}
            onChange={(v) => updateField('exit_cost', v)}
            step={0.5}
            isPercent={true}
          />

        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          background: '#13381A',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: '900',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 14px rgba(19,56,26,0.25)'
        }}
      >
        {loading ? 'Berechne Investment...' : 'Investition analysieren'}
      </button>

    </div>
  );
}
