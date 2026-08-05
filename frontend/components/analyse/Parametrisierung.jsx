'use client';
import StepperInput from '../ui/StepperInput';
import { Expander, SubExpander } from '../ui/Expander';
import { IconTrash } from '../ui/Icons';
import { formatEuroInt, formatPct } from '../../utils/formatters';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568' };
const inputTextStyle = { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' };
const badgeStyle = { marginTop: '4px', background: '#FAF8F5', padding: '6px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#13381A', textAlign: 'center', border: '1px solid #E2D9CE', fontVariantNumeric: 'tabular-nums' };
const infoBoxStyle = { marginTop: '6px', marginBottom: '8px', background: '#EBF8FF', color: '#2B6CB0', border: '1px solid #BEE3F8', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', lineHeight: '1.35' };
const hrStyle = { border: 'none', borderTop: '1px solid #E2D9CE', margin: '6px 0' };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#13381A' }}>Parametrisierung</div>

      {/* 1. OBJEKTDATEN */}
      <Expander title="1. Objektdaten (Exposé)" defaultOpen={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Objektbezeichnung</label>
            <input type="text" value={formData.obj_name} onFocus={pingBackend} onChange={(e) => updateField('obj_name', e.target.value)} style={inputTextStyle} />
          </div>

          <div>
            <label style={labelStyle}>Objektart / Typ</label>
            <select value={formData.objektart} onChange={(e) => updateField('objektart', e.target.value)} style={inputTextStyle}>
              <option value="Eigentumswohnung">Eigentumswohnung</option>
              <option value="Mehrfamilienhaus">Mehrfamilienhaus</option>
              <option value="Einfamilienhaus">Einfamilienhaus</option>
              <option value="Doppelhaushälfte">Doppelhaushälfte</option>
              <option value="Reihenhaus">Reihenhaus</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Bundesland</label>
            <select value={formData.bundesland} onChange={(e) => updateField('bundesland', e.target.value)} style={inputTextStyle}>
              {Object.keys(grunderwerbsteuerSätze).map((land) => (
                <option key={land} value={land}>{land}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>Stadt</label>
              <input type="text" value={formData.stadt} onChange={(e) => updateField('stadt', e.target.value)} style={inputTextStyle} />
            </div>
            <div>
              <label style={labelStyle}>Stadtteil</label>
              <input type="text" value={formData.stadtteil} onChange={(e) => updateField('stadtteil', e.target.value)} style={inputTextStyle} />
            </div>
          </div>

          <StepperInput label="Kaufpreis (€) *" value={formData.kaufpreis} onChange={(v) => updateField('kaufpreis', v)} step={5000} isCurrency={true} onFocus={pingBackend} />
          <StepperInput label="Wohnfläche (m²) *" value={formData.qm} onChange={handleQmChange} step={1} onFocus={pingBackend} />
          <StepperInput label="Baujahr" value={formData.baujahr} onChange={(v) => updateField('baujahr', v)} step={1} isYear={true} />

          <hr style={hrStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <StepperInput label="Gesamtkaltmiete (€/Monat)" value={formData.kaltmiete_monat} onChange={handleIstMonatChange} step={50} isCurrency={true} />
            <StepperInput label="Kaltmiete (€/m²)" value={formData.ist_sqm} onChange={handleIstSqmChange} step={0.5} />
          </div>

          <hr style={hrStyle} />

          <StepperInput label="Hausgeld gesamt (€/Monat)" value={formData.hausgeld} onChange={handleHausgeldChange} step={10} isCurrency={true} />

          <SubExpander title="Hausgeld-Aufteilung">
            <div style={infoBoxStyle}>Standard 75 / 25 % Verteilung: 75% umlegbar, 25% nicht umlegbar.</div>
            <StepperInput label="Nicht umlegbares Hausgeld (€/Monat)" value={formData.hausgeld_nicht_umlegbar} onChange={handleHausgeldNichtUmlegbarChange} step={5} isCurrency={true} />
          </SubExpander>

          <StepperInput label="Sanierungsaufwand (€)" value={formData.sanierung} onChange={(v) => updateField('sanierung', v)} step={1000} isCurrency={true} />
        </div>
      </Expander>

      {/* 2. FINANZIERUNG & NEBENKOSTEN */}
      <Expander title="2. Finanzierung & Nebenkosten">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <StepperInput label="1. Grunderwerbsteuer (%)" value={formData.grwt_p} onChange={(v) => updateField('grwt_p', v)} step={0.1} isPercent={true} />
              <div style={badgeStyle}>{formatEuroInt(grwt_euro)} €</div>
            </div>
            <div>
              <StepperInput label="2. Notar & Grundbuch (%)" value={formData.notar_p} onChange={(v) => updateField('notar_p', v)} step={0.1} isPercent={true} />
              <div style={badgeStyle}>{formatEuroInt(notar_euro)} €</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <StepperInput label="3. Maklerprovision (%)" value={formData.makler_p} onChange={(v) => updateField('makler_p', v)} step={0.01} isPercent={true} />
              <div style={badgeStyle}>{formatEuroInt(makler_euro)} €</div>
            </div>
            <div>
              <StepperInput label="4. Sonst. NK (€)" value={formData.sonst_nk} onChange={(v) => updateField('sonst_nk', v)} step={100} isCurrency={true} />
              <div style={badgeStyle}>{formatEuroInt(formData.sonst_nk)} €</div>
            </div>
          </div>

          <div style={{ background: '#FAF8F5', padding: '12px', borderRadius: '8px', border: '1px solid #E2D9CE', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <span>Summe Kaufnebenkosten:</span>
            <span>{formatEuroInt(summe_nk)} €</span>
          </div>

          <hr style={hrStyle} />

          <div>
            <label style={labelStyle}>Darlehensart</label>
            <select value={formData.loan_type} onChange={(e) => updateField('loan_type', e.target.value)} style={inputTextStyle}>
              <option value="Annuitätendarlehen">Annuitätendarlehen</option>
              <option value="Endfälliges Darlehen">Endfälliges Darlehen</option>
            </select>
          </div>

          <StepperInput label="Hausbank Zins (%)" value={formData.hb_zins} onChange={(v) => updateField('hb_zins', v)} step={0.1} isPercent={true} />
          <StepperInput label="Hausbank Tilgung (%)" value={formData.hb_tilg} onChange={(v) => updateField('hb_tilg', v)} step={0.1} isPercent={true} />
          <StepperInput label="Jährliche Sondertilgung (€)" value={formData.sondertilg} onChange={(v) => updateField('sondertilg', v)} step={500} isCurrency={true} tooltip="Freiwillige jährliche Sondertilgung" />
          <StepperInput label="Tilgungsfreie Jahre" value={formData.grace_years} onChange={(v) => updateField('grace_years', v)} step={1} isInteger={true} />

          <SubExpander title="Anschlussfinanzierung & Zinsbindung (Optional)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <StepperInput label="Zinsbindung (Jahre)" value={formData.zinsbindung} onChange={(v) => updateField('zinsbindung', v)} step={1} isInteger={true} />
              <StepperInput label="Folge-Zinssatz (%)" value={formData.folge_zins} onChange={(v) => updateField('folge_zins', v)} step={0.1} isPercent={true} />
              <div>
                <label style={labelStyle}>Folge-Modus</label>
                <select value={formData.folge_mode} onChange={(e) => updateField('folge_mode', e.target.value)} style={inputTextStyle}>
                  <option value="Rate konstant halten (Annuität)">Rate konstant halten (Annuität)</option>
                  <option value="Tilgung anpassen">Tilgung anpassen</option>
                </select>
              </div>
              <StepperInput label="Folge-Tilgung (%)" value={formData.folge_tilg} onChange={(v) => updateField('folge_tilg', v)} step={0.1} isPercent={true} />
            </div>
          </SubExpander>

          <SubExpander title="KfW-Darlehen (Optional)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <StepperInput label="KfW Darlehensbetrag (€)" value={formData.kfw_amt} onChange={(v) => updateField('kfw_amt', v)} step={5000} isCurrency={true} />
              <StepperInput label="KfW Zinssatz (%)" value={formData.kfw_zins} onChange={(v) => updateField('kfw_zins', v)} step={0.1} isPercent={true} />
              <StepperInput label="KfW Tilgung (%)" value={formData.kfw_tilg} onChange={(v) => updateField('kfw_tilg', v)} step={0.1} isPercent={true} />
              <StepperInput label="KfW Tilgungsfreie Jahre" value={formData.kfw_grace_years} onChange={(v) => updateField('kfw_grace_years', v)} step={1} isInteger={true} />
              <StepperInput label="KfW Tilgungszuschuss (€)" value={formData.kfw_grant} onChange={(v) => updateField('kfw_grant', v)} step={1000} isCurrency={true} />
            </div>
          </SubExpander>

          <hr style={hrStyle} />

          <div>
            <StepperInput label="Eingesetztes Eigenkapital (€)" value={formData.ek_euro} onChange={(v) => updateField('ek_euro', v)} step={1000} isCurrency={true} />
            <div style={infoBoxStyle}>
              EK-Empfehlung: Wir empfehlen mind. Kaufnebenkosten ({formatEuroInt(summe_nk)} €) einzubringen.
            </div>
          </div>
        </div>
      </Expander>

      {/* 3. ZIELMIETE & BEWIRTSCHAFTUNG */}
      <Expander title="3. Zielmiete & Bewirtschaftung">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <StepperInput label="Zielkaltmiete (€/Monat)" value={formData.target_monat} onChange={handleTargetMonatChange} step={50} isCurrency={true} />
            <StepperInput label="Zielkaltmiete (€/m²)" value={formData.target_sqm} onChange={handleTargetSqmChange} step={0.5} />
          </div>

          <StepperInput label="Anpassung in Jahr" value={formData.adj_year} onChange={(v) => updateField('adj_year', v)} step={1} isInteger={true} />

          <hr style={hrStyle} />

          <StepperInput label="Instandhaltung (€/m²/Jahr)" value={formData.inst_sqm} onChange={(v) => updateField('inst_sqm', v)} step={1} />
          <StepperInput label="Verwaltung (€/Monat)" value={formData.mgt_monat} onChange={(v) => updateField('mgt_monat', v)} step={5} isCurrency={true} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ color: '#4A5568' }}>Leerstandsquote (%)</span>
              <span style={{ color: '#9B2C2C', fontWeight: 'bold' }}>{formatPct(formData.vac_rate_pct)} %</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={formData.vac_rate_pct}
              onChange={(e) => updateField('vac_rate_pct', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#13381A', cursor: 'pointer' }}
            />
          </div>

          <hr style={hrStyle} />

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#13381A' }}>Flexible Sonderinvestitionen (Capex)</div>
            <div style={{ fontSize: '0.75rem', color: '#718096', margin: '4px 0 10px 0' }}>Sonder-Instandhaltungen für spezifische Jahre.</div>
            
            {capexList.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                <StepperInput label={`Jahr #${idx + 1}`} value={item.year} onChange={(v) => handleCapexChange(idx, 'year', v)} step={1} isInteger={true} />
                <StepperInput label={`Betrag (€) #${idx + 1}`} value={item.amount} onChange={(v) => handleCapexChange(idx, 'amount', v)} step={500} isCurrency={true} />
                {capexList.length > 1 && (
                  <button type="button" onClick={() => removeCapexRow(idx)} style={{ background: '#FFF5F5', color: '#9B2C2C', border: '1px solid #FEB2B2', borderRadius: '6px', padding: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <IconTrash />
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addCapexRow} style={{ marginTop: '6px', padding: '8px 12px', background: '#FAF8F5', color: '#13381A', border: '1px solid #E2D9CE', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              + Weitere Sonderinvestition hinzufügen
            </button>
          </div>
        </div>
      </Expander>

      {/* 4. STEUERN, MAKRO & EXIT */}
      <Expander title="4. Steuern, Makro & Exit">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ color: '#4A5568' }}>Grenzsteuersatz (%)</span>
              <span style={{ color: '#13381A', fontWeight: 'bold' }}>{formatPct(formData.tax_rate_pct)} %</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={formData.tax_rate_pct}
              onChange={(e) => updateField('tax_rate_pct', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#13381A', cursor: 'pointer' }}
            />
          </div>

          <div>
            <label style={labelStyle}>AfA-Modell</label>
            <select value={formData.afa_model} onChange={(e) => updateField('afa_model', e.target.value)} style={inputTextStyle}>
              <option value="Linear Standard">Linear Standard</option>
              <option value="Linear Neubau">Linear Neubau (3%)</option>
              <option value="Degressiv">Degressiv (5% p.a. nach § 7 Abs. 5a EStG)</option>
              <option value="Kombination: Degressiv + Sonder-AfA">Kombination: Degressiv + Sonder-AfA</option>
              <option value="Denkmalgeschützt">Denkmalgeschützt / Sanierung (§ 7h/7i EStG)</option>
            </select>
          </div>

          <StepperInput label="AfA %" value={formData.afa_lin} onChange={(v) => updateField('afa_lin', v)} step={0.1} isPercent={true} />
          <StepperInput label="Mietsteigerung p.a. (%)" value={formData.miet_inc} onChange={(v) => updateField('miet_inc', v)} step={0.1} isPercent={true} />
          <StepperInput label="Wertsteigerung p.a. (%)" value={formData.val_inc} onChange={(v) => updateField('val_inc', v)} step={0.1} isPercent={true} />

          <hr style={hrStyle} />

          <StepperInput label="Verkaufsnebenkosten / Exit (%)" value={formData.exit_cost} onChange={(v) => updateField('exit_cost', v)} step={0.1} isPercent={true} />
        </div>
      </Expander>

      <button type="submit" disabled={loading} style={{ padding: '16px', background: '#13381A', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(19,56,26,0.25)' }}>
        {loading ? 'Berechne Investment...' : 'Investition analysieren'}
      </button>

    </div>
  );
}
