'use client';
import { useState } from 'react';
import StepperInput from '../ui/StepperInput';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4A5568', marginBottom: '4px', height: '18px' };
const inputTextStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };
const sectionTitleStyle = { fontSize: '1.05rem', fontWeight: '800', color: '#13381A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' };
const collapseBtnStyle = { background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '10px 14px', width: '100%', textAlign: 'left', fontWeight: '800', fontSize: '0.85rem', color: '#13381A', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

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
  loading,
  handleReset
}) {
  // KLAPP-ZUSTÄNDE
  const [showAnschluss, setShowAnschluss] = useState(false);
  const [showKfw, setShowKfw] = useState(false);
  const [showNichtUmlegbar, setShowNichtUmlegbar] = useState(false);
  const [showMietDelay, setShowMietDelay] = useState(false);

  const sonstNkEuro = Number(formData.sonst_nk || 0);
  const totalNkEuro = grwt_euro + notar_euro + makler_euro + sonstNkEuro;
  const totalNkPct = formData.kaufpreis > 0 ? (totalNkEuro / formData.kaufpreis) * 100 : 0;
  
  const ekEuro = Number(formData.ek_euro || 0);
  const ekDiff = ekEuro - totalNkEuro;
  // PRÜFUNG: AUCH BEI EXAKTER DECKUNG (0 € DIFFERENZ) GRÜN
  const isNkCovered = ekEuro >= (totalNkEuro - 0.01);

  // DYNAMISCHE PRÜFUNG, OB ZIELMIETE ABWEICHT
  const isTargetDifferent = Math.abs((formData.target_monat || 0) - (formData.kaltmiete_monat || 0)) > 0.5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. OBJEKTDATEN */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={sectionTitleStyle}>1. Objektdaten</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Objektbezeichnung</label>
            <input
              type="text"
              value={formData.obj_name}
              onChange={(e) => updateField('obj_name', e.target.value)}
              style={inputTextStyle}
              placeholder="z.B. Eigentumswohnung Mitte"
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

          {/* STADT & STADTTEIL NEBENEINANDER */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Stadt / Ort</label>
              <input
                type="text"
                value={formData.stadt}
                onChange={(e) => updateField('stadt', e.target.value)}
                style={inputTextStyle}
                placeholder="z.B. Berlin"
              />
            </div>
            <div>
              <label style={labelStyle}>Stadtteil / Lage</label>
              <input
                type="text"
                value={formData.stadtteil}
                onChange={(e) => updateField('stadtteil', e.target.value)}
                style={inputTextStyle}
                placeholder="z.B. Mitte"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Baujahr"
              value={formData.baujahr}
              onChange={(v) => updateField('baujahr', v)}
              isYear={true}
              step={1}
            />
            <StepperInput
              label="Wohnfläche (m²)"
              value={formData.qm}
              onChange={(v) => handleQmChange(v)}
              step={5}
            />
          </div>

          <StepperInput
            label="Kaufpreis (€)"
            value={formData.kaufpreis}
            onChange={(v) => updateField('kaufpreis', v)}
            step={5000}
            isCurrency={true}
          />

          {/* IST-MIETE */}
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A', marginTop: '4px' }}>
            IST-Miete (Aktuell)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="IST-Kaltmiete mt. (€)"
              value={formData.kaltmiete_monat}
              onChange={(v) => handleIstMonatChange(v)}
              step={25}
              isCurrency={true}
            />
            <StepperInput
              label="IST-Miete / m² (€)"
              value={formData.ist_sqm}
              onChange={(v) => handleIstSqmChange(v)}
              step={0.5}
            />
          </div>

        </div>
      </div>

      {/* 2. FINANZIERUNG UND NEBENKOSTEN */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={sectionTitleStyle}>2. Finanzierung & Nebenkosten</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* KAUFNEBENKOSTEN */}
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A' }}>
            Kaufnebenkosten
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Grunderwerbsteuer (%)"
              value={formData.grwt_p}
              onChange={(v) => updateField('grwt_p', v)}
              step={0.25}
              isPercent={true}
            />
            <StepperInput
              label="Notar & Grundbuch (%)"
              value={formData.notar_p}
              onChange={(v) => updateField('notar_p', v)}
              step={0.1}
              isPercent={true}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="Maklerprovision (%)"
              value={formData.makler_p}
              onChange={(v) => updateField('makler_p', v)}
              step={0.01}
              isPercent={true}
            />
            <StepperInput
              label="Sonstige Nebenkosten (€)"
              value={formData.sonst_nk}
              onChange={(v) => updateField('sonst_nk', v)}
              step={250}
              isCurrency={true}
            />
          </div>

          {/* NEBENKOSTEN SUMMARY BOX */}
          <div style={{ background: '#FAF8F5', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2D9CE' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A', display: 'flex', justifyContent: 'space-between' }}>
              <span>Gesamte Kaufnebenkosten:</span>
              <span>{Math.round(totalNkEuro).toLocaleString('de-DE')} € ({totalNkPct.toFixed(2)} %)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div>• Grunderwerbsteuer ({formData.grwt_p}%): {Math.round(grwt_euro).toLocaleString('de-DE')} €</div>
              <div>• Notar & Grundbuch ({formData.notar_p}%): {Math.round(notar_euro).toLocaleString('de-DE')} €</div>
              <div>• Maklerprovision ({formData.makler_p}%): {Math.round(makler_euro).toLocaleString('de-DE')} €</div>
              {sonstNkEuro > 0 && <div>• Sonstige Kaufnebenkosten: {Math.round(sonstNkEuro).toLocaleString('de-DE')} €</div>}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '4px 0' }} />

          {/* EIGENKAPITAL & DECKUNG */}
          <StepperInput
            label="Eigenkapitaleinsatz (€)"
            value={formData.ek_euro}
            onChange={(v) => updateField('ek_euro', v)}
            step={2500}
            isCurrency={true}
          />

          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            lineHeight: '1.4',
            background: isNkCovered ? '#F0FFF4' : '#FFF5F5',
            border: isNkCovered ? '1px solid #C6F6D5' : '1px solid #FEB2B2',
            color: isNkCovered ? '#22543D' : '#9B2C2C'
          }}>
            {isNkCovered ? (
              <>
                <strong>✓ Kaufnebenkosten abgedeckt:</strong> Dein EK ({Math.round(ekEuro).toLocaleString('de-DE')} €) deckt die Nebenkosten ({Math.round(totalNkEuro).toLocaleString('de-DE')} €) vollständig ab. 
                {ekDiff > 0.01 ? ` Restliche ${Math.round(ekDiff).toLocaleString('de-DE')} € fließen in die Kaufpreis-Tilgung.` : ' (0 € Rest-EK in Tilgung).'}
              </>
            ) : (
              <>
                <strong>⚠️ EK-Hinweis:</strong> Dein Eigenkapital ({Math.round(ekEuro).toLocaleString('de-DE')} €) reicht nicht aus, um die vollen Kaufnebenkosten ({Math.round(totalNkEuro).toLocaleString('de-DE')} €) zu decken. Es fehlen <strong>{Math.round(Math.abs(ekDiff)).toLocaleString('de-DE')} €</strong> (100% NK-Finanzierung erforderlich).
              </>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '4px 0' }} />

          {/* HAUPTDARLEHEN */}
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A' }}>
            Hauptdarlehen (Bank)
          </div>

          <div>
            <label style={labelStyle}>Darlehensform</label>
            <select
              value={formData.loan_type}
              onChange={(e) => updateField('loan_type', e.target.value)}
              style={inputTextStyle}
            >
              <option value="Annuitätendarlehen">Annuitätendarlehen</option>
              <option value="Endfälliges Darlehen">Endfälliges Darlehen (Zinszahler)</option>
            </select>
          </div>

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
              label="Sondertilgung p.a. (€)"
              value={formData.sondertilg}
              onChange={(v) => updateField('sondertilg', v)}
              step={500}
              isCurrency={true}
            />
            <StepperInput
              label="Tilgungsfreie Jahre"
              value={formData.grace_years}
              onChange={(v) => updateField('grace_years', v)}
              step={1}
            />
          </div>

          <StepperInput
            label="Zinsbindung (Jahre)"
            value={formData.zinsbindung}
            onChange={(v) => updateField('zinsbindung', v)}
            step={1}
          />

          {/* ANSCHLUSSFINANZIERUNG (EINGEKLAPPT) */}
          <div style={{ marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setShowAnschluss(!showAnschluss)}
              style={collapseBtnStyle}
            >
              <span>{showAnschluss ? '▼' : '►'} Anschlussfinanzierung nach Zinsbindung</span>
              <span style={{ color: '#A37841', fontSize: '0.75rem' }}>{showAnschluss ? 'Einklappen' : 'Ausklappen'}</span>
            </button>

            {showAnschluss && (
              <div style={{ marginTop: '10px', padding: '12px', background: '#FAF8F5', borderRadius: '8px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <StepperInput
                    label="Anschlusszins (%)"
                    value={formData.folge_zins}
                    onChange={(v) => updateField('folge_zins', v)}
                    step={0.1}
                    isPercent={true}
                  />
                  <div>
                    <label style={labelStyle}>Anschluss-Modus</label>
                    <select
                      value={formData.folge_mode}
                      onChange={(e) => updateField('folge_mode', e.target.value)}
                      style={inputTextStyle}
                    >
                      <option value="Rate konstant halten (Annuität)">Rate konstant halten</option>
                      <option value="Tilgung anpassen">Tilgung festlegen</option>
                    </select>
                  </div>
                </div>

                <StepperInput
                  label="Folge-Tilgung (%)"
                  value={formData.folge_tilg}
                  onChange={(v) => updateField('folge_tilg', v)}
                  step={0.25}
                  isPercent={true}
                />
              </div>
            )}
          </div>

          {/* KFW-FÖRDERUNG (EINGEKLAPPT) */}
          <div>
            <button
              type="button"
              onClick={() => setShowKfw(!showKfw)}
              style={collapseBtnStyle}
            >
              <span>{showKfw ? '▼' : '►'} KfW-Förderung & Ergänzungsdarlehen</span>
              <span style={{ color: '#A37841', fontSize: '0.75rem' }}>{showKfw ? 'Einklappen' : 'Ausklappen'}</span>
            </button>

            {showKfw && (
              <div style={{ marginTop: '10px', padding: '12px', background: '#FAF8F5', borderRadius: '8px', border: '1px solid #E2D9CE', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <StepperInput
                  label="KfW-Darlehensbetrag (€)"
                  value={formData.kfw_amt}
                  onChange={(v) => updateField('kfw_amt', v)}
                  step={5000}
                  isCurrency={true}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <StepperInput
                    label="KfW-Sollzins p.a. (%)"
                    value={formData.kfw_zins}
                    onChange={(v) => updateField('kfw_zins', v)}
                    step={0.1}
                    isPercent={true}
                  />
                  <StepperInput
                    label="KfW-Tilgung (%)"
                    value={formData.kfw_tilg}
                    onChange={(v) => updateField('kfw_tilg', v)}
                    step={0.25}
                    isPercent={true}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <StepperInput
                    label="KfW-Tilgungsfreie Jahre"
                    value={formData.kfw_grace_years}
                    onChange={(v) => updateField('kfw_grace_years', v)}
                    step={1}
                  />
                  <StepperInput
                    label="KfW-Tilgungszuschuss (€)"
                    value={formData.kfw_grant}
                    onChange={(v) => updateField('kfw_grant', v)}
                    step={1000}
                    isCurrency={true}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. BEWIRTSCHAFTUNG */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={sectionTitleStyle}>3. Bewirtschaftung</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <StepperInput
            label="Hausgeld monatlich (€)"
            value={formData.hausgeld}
            onChange={(v) => handleHausgeldChange(v)}
            step={10}
            isCurrency={true}
            tooltip="Gesamtes monatliches Hausgeld laut Wirtschaftsplan (inkl. Instandhaltungsrücklage & Verwaltergebühr)"
          />

          {/* EINGEKLAPPTER NICHT-UMLEGBARER ANTEIL */}
          <div>
            <button
              type="button"
              onClick={() => setShowNichtUmlegbar(!showNichtUmlegbar)}
              style={{ ...collapseBtnStyle, background: '#FFFFFF', border: '1px dashed #CBD5E0' }}
            >
              <span>{showNichtUmlegbar ? '▼' : '►'} Nicht umlegbaren Anteil anpassen</span>
              <span style={{ color: '#718096', fontSize: '0.75rem' }}>Standard: 25% vom Hausgeld</span>
            </button>

            {showNichtUmlegbar && (
              <div style={{ marginTop: '10px' }}>
                <StepperInput
                  label="Davon nicht umlegbar mt. (€)"
                  value={formData.hausgeld_nicht_umlegbar}
                  onChange={(v) => handleHausgeldNichtUmlegbarChange(v)}
                  step={5}
                  isCurrency={true}
                  tooltip="Echte Eigentümer-Kosten (Verwaltergebühr + Zuführung Instandhaltungsrücklage). Kann nicht auf den Mieter umgelegt werden."
                />
              </div>
            )}
          </div>

          {/* INSTANDHALTUNG MIT ERKLAERUNG */}
          <StepperInput
            label="Instandhaltung (€/m²/Jahr)"
            value={formData.inst_sqm}
            onChange={(v) => updateField('inst_sqm', v)}
            step={1}
            tooltip={`Geschätzter Richtwert für Baujahr ${formData.baujahr} (${formData.objektart}). Empfehlung nach II. BV / Petersscher Formel: <1980 ca. 15-18€, 1980-2000 ca. 12-15€, >2000 ca. 9-12€/m² p.a.`}
          />

          {/* VERWALTUNGSKOSTEN MIT ERKLAERUNG */}
          <StepperInput
            label="Verwaltung monatlich (€)"
            value={formData.mgt_monat}
            onChange={(v) => updateField('mgt_monat', v)}
            step={5}
            isCurrency={true}
            tooltip={`Geschätzter Verwaltungsaufwand für Baujahr ${formData.baujahr}. Branchenüblich sind 25 € bis 35 € pro Monat/Einheit.`}
          />

          <StepperInput
            label="Mietausfallwagnis (%)"
            value={formData.vac_rate_pct}
            onChange={(v) => updateField('vac_rate_pct', v)}
            step={0.5}
            isPercent={true}
          />

          {/* CAPEX GEPLANTE SANIERUNGEN (STARTET LEER) */}
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
              style={{ padding: '8px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#13381A', cursor: 'pointer' }}
            >
              + Weitere Sanierung hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* 4. STEUERN & ENTWICKLUNG */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
        <div style={sectionTitleStyle}>4. Steuern & Entwicklung</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* STEUERN */}
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

          <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '4px 0' }} />

          {/* ZIEL-MIETE & MAKRO-ENTWICKLUNG */}
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A' }}>
            ZIEL-Miete & Makro-Entwicklung
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StepperInput
              label="ZIEL-Kaltmiete mt. (€)"
              value={formData.target_monat}
              onChange={(v) => handleTargetMonatChange(v)}
              step={25}
              isCurrency={true}
            />
            <StepperInput
              label="ZIEL-Miete / m² (€)"
              value={formData.target_sqm}
              onChange={(v) => handleTargetSqmChange(v)}
              step={0.5}
            />
          </div>

          {/* NUR EINBLENDEN, WENN ZIELMIETE VON IST-MIETE ABWEICHT */}
          {isTargetDifferent && (
            <StepperInput
              label="Anpassung Zielmiete ab Jahr"
              value={formData.adj_year}
              onChange={(v) => updateField('adj_year', v)}
              step={1}
              tooltip="Jahr, ab dem die Mietanpassung auf die Zielmiete realisiert wird"
            />
          )}

          {/* MIETSTEIGERUNG */}
          <StepperInput
            label="Mietsteigerung p.a. (%)"
            value={formData.miet_inc}
            onChange={(v) => updateField('miet_inc', v)}
            step={0.25}
            isPercent={true}
          />

          {/* VERZÖGERTER MIETSTEIGERUNGS-START (EINGEKLAPPT) */}
          <div>
            <button
              type="button"
              onClick={() => setShowMietDelay(!showMietDelay)}
              style={{ ...collapseBtnStyle, background: '#FFFFFF', border: '1px dashed #CBD5E0' }}
            >
              <span>{showMietDelay ? '▼' : '►'} Mietsteigerung erst ab Jahr X</span>
              <span style={{ color: '#718096', fontSize: '0.75rem' }}>Standard: sofort</span>
            </button>

            {showMietDelay && (
              <div style={{ marginTop: '10px' }}>
                <StepperInput
                  label="Mietsteigerung erst ab Jahr"
                  value={formData.miet_inc_start_year || 1}
                  onChange={(v) => updateField('miet_inc_start_year', v)}
                  step={1}
                  tooltip="Jahr, ab dem die jährliche prozentuale Mietsteigerung greift (z.B. nach Sanierung)"
                />
              </div>
            )}
          </div>

          {/* KOSTENSTEIGERUNG DIREKT UNTER DER MIETSTEIGERUNG */}
          <StepperInput
            label="Kostensteigerung p.a. (%)"
            value={formData.cost_inc}
            onChange={(v) => updateField('cost_inc', v)}
            step={0.25}
            isPercent={true}
            tooltip="Jährliche Inflation für Hausgeld, Instandhaltung und Verwaltung"
          />

          <StepperInput
            label="Wertsteigerung p.a. (%)"
            value={formData.val_inc}
            onChange={(v) => updateField('val_inc', v)}
            step={0.25}
            isPercent={true}
          />

          <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '4px 0' }} />

          {/* EXIT / VERKAUF */}
          <StepperInput
            label="Verkaufsnebenkosten / Exit (%)"
            value={formData.exit_cost}
            onChange={(v) => updateField('exit_cost', v)}
            step={0.5}
            isPercent={true}
          />

        </div>
      </div>

      {/* BUTTONS: SUBMIT & RESET */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

        <button
          type="button"
          onClick={handleReset}
          style={{
            width: '100%',
            padding: '10px',
            background: '#FAF8F5',
            color: '#718096',
            border: '1px solid #E2D9CE',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Eingaben zurücksetzen
        </button>
      </div>

    </div>
  );
}
