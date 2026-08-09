import React, { useState, useMemo } from 'react';
import StepperInput from '../ui/StepperInput';
import MetricDeltaCard from './MetricDeltaCard';
import { grid2Style, labelStyle, inputStyle, selectContainerStyle, selectStyle } from '../../styles/formStyles';
import { formatEuroInt } from '../../utils/formatters';
import { OBJEKTARTEN, BUNDESLAENDER_DEFAULT } from '../../constants/realEstate';

export default function ScenarioColumn({ 
  title, 
  badgeBg,
  badgeColor, 
  data, 
  setData, 
  baselineResults, 
  isBaseline = false 
}) {
  // Einklapp-Zustände aller 4 Haupt-Sektionen
  const [openSections, setOpenSections] = useState({
    basisdaten: true,
    bewirtschaftung: true,
    finanzierung: true,
    steuer: false
  });

  // Einklapp-Zustände für Sub-Sektionen
  const [openSub, setOpenSub] = useState({
    nebenkosten: false,
    folgefinanzierung: false,
    kfw: false,
    denkmal: false
  });

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleSub = (key) => setOpenSub(prev => ({ ...prev, [key]: !prev[key] }));

  const updateField = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Mathematisch vollständiges Modell für das Szenario
  const kpis = useMemo(() => {
    if (!data) return null;

    const kaufpreis = Number(data.kaufpreis || 0);
    const qm = Number(data.qm || 50);

    // Kaufnebenkosten
    const grwtP = Number(data.grwt_p ?? 5.0);
    const notarP = Number(data.notar_p ?? 2.0);
    const maklerP = Number(data.makler_p ?? 3.57);
    const sonstNk = Number(data.sonst_nk ?? 0);
    const kaufnebenkosten = (kaufpreis * (grwtP + notarP + maklerP) / 100) + sonstNk;
    const gesamtinvestition = kaufpreis + kaufnebenkosten;

    // Finanzierung & Fremdkapital
    const ek = Number(data.ek_euro || 0);
    const kfwAmt = Number(data.kfw_amt || 0);
    const hauptDarlehen = Math.max(0, gesamtinvestition - ek - kfwAmt);

    const hbZins = Number(data.hb_zins ?? 3.8);
    const hbTilg = Number(data.hb_tilg ?? 2.0);
    const hauptRateMonat = (hauptDarlehen * ((hbZins + hbTilg) / 100)) / 12;

    const kfwZins = Number(data.kfw_zins ?? 2.1);
    const kfwTilg = Number(data.kfw_tilg ?? 3.0);
    const kfwRateMonat = (kfwAmt * ((kfwZins + kfwTilg) / 100)) / 12;

    const monatlicheRateGesamt = hauptRateMonat + kfwRateMonat;

    // Einnahmen & Bewirtschaftung
    const kaltmieteMonat = Number(data.kaltmiete_monat || 0);
    const mietausfallP = Number(data.vac_rate_pct ?? 2.0);
    const effektiveMiete = kaltmieteMonat * (1 - mietausfallP / 100);

    const hausgeldNichtUmlegbar = Number(data.hausgeld_nicht_umlegbar ?? (data.hausgeld ? data.hausgeld * 0.25 : 0));
    const verwaltungMonat = Number(data.mgt_monat ?? 30);
    const instandhaltungMonat = (qm * Number(data.inst_sqm ?? 12)) / 12;
    const bewirtschaftungMonat = verwaltungMonat + instandhaltungMonat + hausgeldNichtUmlegbar;

    // Cashflow vor Steuer
    const cashflowVorSteuer = effektiveMiete - bewirtschaftungMonat - monatlicheRateGesamt;

    // Steuerliche Betrachtung
    const zinsMonat = ((hauptDarlehen * (hbZins / 100)) + (kfwAmt * (kfwZins / 100))) / 12;
    const afaPct = Number(data.afa_lin ?? 2.0) / 100;
    const gebaeudeanteilPct = Number(data.gebaeude_anteil_pct ?? 80.0) / 100;
    const afaMonat = (kaufpreis * gebaeudeanteilPct * afaPct) / 12;
    
    const zuVersteuern = effektiveMiete - bewirtschaftungMonat - zinsMonat - afaMonat;
    const taxRate = Number(data.tax_rate_pct ?? 42) / 100;
    const steuerMonat = zuVersteuern > 0 ? zuVersteuern * taxRate : 0;
    const cashflowNachSteuer = cashflowVorSteuer - steuerMonat;

    // Renditen
    const nettoMietrendite = gesamtinvestition > 0 ? (((effektiveMiete - bewirtschaftungMonat) * 12) / gesamtinvestition) * 100 : 0;
    const ekRendite = ek > 0 ? ((cashflowVorSteuer * 12) / ek) * 100 : 0;

    // Vermögensaufbau (10 Jahre)
    const wertsteigerungP = Number(data.val_inc ?? 1.0);
    const wertNach10Jahren = kaufpreis * Math.pow(1 + wertsteigerungP / 100, 10);
    const tilgung10Jahre = ((hauptDarlehen * (hbTilg / 100)) + (kfwAmt * (kfwTilg / 100))) * 10;
    const vermoegen10Jahre = tilgung10Jahre + (wertNach10Jahren - kaufpreis);

    return {
      monatlicheRate: monatlicheRateGesamt,
      cashflowVorSteuer,
      cashflowNachSteuer,
      nettoMietrendite,
      ekRendite,
      vermoegen10Jahre
    };
  }, [data]);

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2D9CE',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Head Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E2D9CE' }}>
          <span style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '800',
            background: badgeBg,
            color: badgeColor
          }}>
            {title}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A' }}>
            {data?.obj_name ? data.obj_name : 'Muster-Objekt'}
          </span>
        </div>

        {/* ========================================== */}
        {/* SEKTION 1: BASISDATEN & KAUFPREIS          */}
        {/* ========================================== */}
        <div style={{ border: '1px solid #E2D9CE', borderRadius: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('basisdaten')}
            style={sectionHeaderStyle}
          >
            <span>1. Basisdaten & Kaufpreis</span>
            <span>{openSections.basisdaten ? '▲' : '▼'}</span>
          </button>

          {openSections.basisdaten && (
            <div style={sectionContentStyle}>
              <div>
                <label style={labelStyle}>Objektbezeichnung</label>
                <input
                  type="text"
                  value={data?.obj_name || ''}
                  onChange={(e) => updateField('obj_name', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={grid2Style}>
                <div>
                  <label style={labelStyle}>Objektart</label>
                  <div style={selectContainerStyle}>
                    <select
                      value={data?.objektart || 'Eigentumswohnung'}
                      onChange={(e) => updateField('objektart', e.target.value)}
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
                      value={data?.bundesland || 'Niedersachsen'}
                      onChange={(e) => {
                        updateField('bundesland', e.target.value);
                        if (BUNDESLAENDER_DEFAULT[e.target.value] !== undefined) {
                          updateField('grwt_p', BUNDESLAENDER_DEFAULT[e.target.value]);
                        }
                      }}
                      style={selectStyle}
                    >
                      {Object.keys(BUNDESLAENDER_DEFAULT).map((bl) => (
                        <option key={bl} value={bl}>{bl}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <StepperInput
                label="Kaufpreis (€)"
                value={data?.kaufpreis || 0}
                onChange={(v) => updateField('kaufpreis', v)}
                step={5000}
                isCurrency={true}
              />

              <div style={grid2Style}>
                <StepperInput
                  label="Wohnfläche (m²)"
                  value={data?.qm || 0}
                  onChange={(v) => updateField('qm', v)}
                  step={5}
                  isSqm={true}
                />
                <div>
                  <label style={labelStyle}>Baujahr</label>
                  <input
                    type="number"
                    value={data?.baujahr || 2000}
                    onChange={(e) => updateField('baujahr', parseInt(e.target.value, 10) || 2000)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* SEKTION 2: BEWIRTSCHAFTUNG & NEBENKOSTEN  */}
        {/* ========================================== */}
        <div style={{ border: '1px solid #E2D9CE', borderRadius: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('bewirtschaftung')}
            style={sectionHeaderStyle}
          >
            <span>2. Bewirtschaftung & Nebenkosten</span>
            <span>{openSections.bewirtschaftung ? '▲' : '▼'}</span>
          </button>

          {openSections.bewirtschaftung && (
            <div style={sectionContentStyle}>
              <StepperInput
                label="Ist-Kaltmiete (€ / Mo)"
                value={data?.kaltmiete_monat || 0}
                onChange={(v) => updateField('kaltmiete_monat', v)}
                step={25}
                isCurrency={true}
              />

              <StepperInput
                label="Hausgeld gesamt (€ / Mo)"
                value={data?.hausgeld || 0}
                onChange={(v) => {
                  updateField('hausgeld', v);
                  updateField('hausgeld_nicht_umlegbar', Math.round(v * 0.25));
                }}
                step={10}
                isCurrency={true}
              />

              <div style={grid2Style}>
                <StepperInput
                  label="Nicht umlegbar (€ / Mo)"
                  value={data?.hausgeld_nicht_umlegbar ?? (data?.hausgeld ? Math.round(data.hausgeld * 0.25) : 0)}
                  onChange={(v) => updateField('hausgeld_nicht_umlegbar', v)}
                  step={5}
                  isCurrency={true}
                />
                <StepperInput
                  label="Verwaltung (€ / Mo)"
                  value={data?.mgt_monat ?? 30}
                  onChange={(v) => updateField('mgt_monat', v)}
                  step={5}
                  isCurrency={true}
                />
              </div>

              <div style={grid2Style}>
                <StepperInput
                  label="Instandhaltung (€ / m²)"
                  value={data?.inst_sqm ?? 12}
                  onChange={(v) => updateField('inst_sqm', v)}
                  step={1}
                />
                <StepperInput
                  label="Mietausfallwagnis (%)"
                  value={data?.vac_rate_pct ?? 2.0}
                  onChange={(v) => updateField('vac_rate_pct', v)}
                  step={0.5}
                  isPercent={true}
                />
              </div>

              <StepperInput
                label="Sanierung / Umbau (€)"
                value={data?.sanierung || 0}
                onChange={(v) => updateField('sanierung', v)}
                step={1000}
                isCurrency={true}
              />

              {/* UNTER-AKKORDEON: KAUFNEBENKOSTEN */}
              <button
                type="button"
                onClick={() => toggleSub('nebenkosten')}
                style={subHeaderStyle}
              >
                <span>Details Kaufnebenkosten ({data?.grwt_p ?? 5}% GrESt etc.)</span>
                <span>{openSub.nebenkosten ? '▲' : '▼'}</span>
              </button>

              {openSub.nebenkosten && (
                <div style={subContentStyle}>
                  <div style={grid2Style}>
                    <StepperInput
                      label="Grunderwerbsteuer (%)"
                      value={data?.grwt_p ?? 5.0}
                      onChange={(v) => updateField('grwt_p', v)}
                      step={0.25}
                      isPercent={true}
                    />
                    <StepperInput
                      label="Notar & Grundbuch (%)"
                      value={data?.notar_p ?? 2.0}
                      onChange={(v) => updateField('notar_p', v)}
                      step={0.1}
                      isPercent={true}
                    />
                  </div>

                  <div style={grid2Style}>
                    <StepperInput
                      label="Maklercourtage (%)"
                      value={data?.makler_p ?? 3.57}
                      onChange={(v) => updateField('makler_p', v)}
                      step={0.01}
                      isPercent={true}
                    />
                    <StepperInput
                      label="Sonstige Nebenkosten (€)"
                      value={data?.sonst_nk ?? 0}
                      onChange={(v) => updateField('sonst_nk', v)}
                      step={250}
                      isCurrency={true}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* SEKTION 3: FINANZIERUNG & EIGENKAPITAL     */}
        {/* ========================================== */}
        <div style={{ border: '1px solid #E2D9CE', borderRadius: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('finanzierung')}
            style={sectionHeaderStyle}
          >
            <span>3. Finanzierung & Eigenkapital</span>
            <span>{openSections.finanzierung ? '▲' : '▼'}</span>
          </button>

          {openSections.finanzierung && (
            <div style={sectionContentStyle}>
              <StepperInput
                label="Eigenkapital-Einsatz (€)"
                value={data?.ek_euro || 0}
                onChange={(v) => updateField('ek_euro', v)}
                step={2500}
                isCurrency={true}
              />

              <div>
                <label style={labelStyle}>Darlehensart</label>
                <div style={selectContainerStyle}>
                  <select
                    value={data?.loan_type || 'Annuitätendarlehen'}
                    onChange={(e) => updateField('loan_type', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="Annuitätendarlehen">Annuitätendarlehen</option>
                    <option value="Endfälliges Darlehen">Endfälliges Darlehen</option>
                  </select>
                </div>
              </div>

              <div style={grid2Style}>
                <StepperInput
                  label="Sollzins Hausbank (%)"
                  value={data?.hb_zins ?? 3.8}
                  onChange={(v) => updateField('hb_zins', v)}
                  step={0.1}
                  isPercent={true}
                />
                <StepperInput
                  label="Anfängliche Tilgung (%)"
                  value={data?.hb_tilg ?? 2.0}
                  onChange={(v) => updateField('hb_tilg', v)}
                  step={0.1}
                  isPercent={true}
                />
              </div>

              <div style={grid2Style}>
                <StepperInput
                  label="Zinsbindung (Jahre)"
                  value={data?.zinsbindung || 10}
                  onChange={(v) => updateField('zinsbindung', v)}
                  step={1}
                />
                <StepperInput
                  label="Sondertilgung (€ / J.)"
                  value={data?.sondertilg || 0}
                  onChange={(v) => updateField('sondertilg', v)}
                  step={500}
                  isCurrency={true}
                />
              </div>

              {/* UNTER-AKKORDEON: KFW & ANSCHLUSS */}
              <button
                type="button"
                onClick={() => toggleSub('kfw')}
                style={subHeaderStyle}
              >
                <span>KfW-Darlehen & Förderungen</span>
                <span>{openSub.kfw ? '▲' : '▼'}</span>
              </button>

              {openSub.kfw && (
                <div style={subContentStyle}>
                  <StepperInput
                    label="KfW-Darlehensbetrag (€)"
                    value={data?.kfw_amt || 0}
                    onChange={(v) => updateField('kfw_amt', v)}
                    step={5000}
                    isCurrency={true}
                  />
                  <div style={grid2Style}>
                    <StepperInput
                      label="KfW Zins (%)"
                      value={data?.kfw_zins ?? 2.1}
                      onChange={(v) => updateField('kfw_zins', v)}
                      step={0.1}
                      isPercent={true}
                    />
                    <StepperInput
                      label="KfW Tilgung (%)"
                      value={data?.kfw_tilg ?? 3.0}
                      onChange={(v) => updateField('kfw_tilg', v)}
                      step={0.1}
                      isPercent={true}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* SEKTION 4: STEUERN, MAKRO & EXIT           */}
        {/* ========================================== */}
        <div style={{ border: '1px solid #E2D9CE', borderRadius: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('steuer')}
            style={sectionHeaderStyle}
          >
            <span>4. Steuern, Makro & Exit</span>
            <span>{openSections.steuer ? '▲' : '▼'}</span>
          </button>

          {openSections.steuer && (
            <div style={sectionContentStyle}>
              <StepperInput
                label="Grenzsteuersatz (%)"
                value={data?.tax_rate_pct ?? 42.0}
                onChange={(v) => updateField('tax_rate_pct', v)}
                step={0.5}
                isPercent={true}
              />

              <div>
                <label style={labelStyle}>AfA-Modell</label>
                <div style={selectContainerStyle}>
                  <select
                    value={data?.afa_model || 'Linear Standard'}
                    onChange={(e) => {
                      const m = e.target.value;
                      updateField('afa_model', m);
                      if (m === 'Linear Standard') updateField('afa_lin', 2.0);
                      else if (m === 'Linear Neubau') updateField('afa_lin', 3.0);
                      else if (m === 'Degressiv') updateField('afa_lin', 5.0);
                      else if (m === 'Denkmalgeschützt') updateField('afa_lin', 9.0);
                    }}
                    style={selectStyle}
                  >
                    <option value="Linear Standard">Linear Standard (2,0 % p.a.)</option>
                    <option value="Linear Neubau">Linear Neubau (3,0 % p.a.)</option>
                    <option value="Degressiv">Degressiv (5,0 %)</option>
                    <option value="Denkmalgeschützt">Denkmalgeschützt (§ 7h/7i - 9,0 %)</option>
                  </select>
                </div>
              </div>

              <div style={grid2Style}>
                <StepperInput
                  label="Gebäudeanteil (%)"
                  value={data?.gebaeude_anteil_pct ?? 80}
                  onChange={(v) => updateField('gebaeude_anteil_pct', v)}
                  step={5}
                  isPercent={true}
                />
                <StepperInput
                  label="AfA-Satz (%)"
                  value={data?.afa_lin ?? 2.0}
                  onChange={(v) => updateField('afa_lin', v)}
                  step={0.5}
                  isPercent={true}
                />
              </div>

              <div style={grid2Style}>
                <StepperInput
                  label="Mietsteigerung p.a. (%)"
                  value={data?.miet_inc ?? 1.0}
                  onChange={(v) => updateField('miet_inc', v)}
                  step={0.1}
                  isPercent={true}
                />
                <StepperInput
                  label="Wertsteigerung p.a. (%)"
                  value={data?.val_inc ?? 1.0}
                  onChange={(v) => updateField('val_inc', v)}
                  step={0.1}
                  isPercent={true}
                />
              </div>

              <StepperInput
                label="Verkaufsnebenkosten / Exit (%)"
                value={data?.exit_cost || 0.0}
                onChange={(v) => updateField('exit_cost', v)}
                step={0.5}
                isPercent={true}
              />
            </div>
          )}
        </div>

      </div>

      {/* Ergebnis-Metriken im Executive Dashboard Style */}
      {kpis && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2D9CE' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Ergebnis-Analyse
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <MetricDeltaCard 
              label="Cashflow n. St."
              value={kpis.cashflowNachSteuer}
              type="currency"
              compareValue={baselineResults?.cashflowNachSteuer}
              isBaseline={isBaseline}
            />
            <MetricDeltaCard 
              label="Cashflow v. St."
              value={kpis.cashflowVorSteuer}
              type="currency"
              compareValue={baselineResults?.cashflowVorSteuer}
              isBaseline={isBaseline}
            />
            <MetricDeltaCard 
              label="Netto-Mietrendite"
              value={kpis.nettoMietrendite}
              type="percent"
              compareValue={baselineResults?.nettoMietrendite}
              isBaseline={isBaseline}
              customColor="#13381A"
            />
            <MetricDeltaCard 
              label="EK-Rendite"
              value={kpis.ekRendite}
              type="percent"
              compareValue={baselineResults?.ekRendite}
              isBaseline={isBaseline}
              customColor="#A37841"
            />
            <MetricDeltaCard 
              label="Monatliche Rate"
              value={kpis.monatlicheRate}
              type="currency"
              compareValue={baselineResults?.monatlicheRate}
              isBaseline={isBaseline}
              invertColor={true}
            />
            <MetricDeltaCard 
              label="Vermögen (10 J.)"
              value={kpis.vermoegen10Jahre}
              type="currency"
              compareValue={baselineResults?.vermoegen10Jahre}
              isBaseline={isBaseline}
              customColor="#13381A"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const sectionHeaderStyle = {
  width: '100%',
  padding: '12px 14px',
  background: '#FAF8F5',
  border: 'none',
  borderBottom: '1px solid #E2D9CE',
  fontSize: '0.85rem',
  fontWeight: '800',
  color: '#13381A',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer'
};

const sectionContentStyle = {
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
  background: 'white'
};

const subHeaderStyle = {
  width: '100%',
  padding: '8px 10px',
  background: 'transparent',
  border: 'none',
  borderTop: '1px dashed #E2D9CE',
  fontSize: '0.78rem',
  fontWeight: '800',
  color: '#A37841',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  marginTop: '0.25rem'
};

const subContentStyle = {
  padding: '0.75rem',
  background: '#FAF8F5',
  borderRadius: '8px',
  border: '1px solid #E2D9CE',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};
