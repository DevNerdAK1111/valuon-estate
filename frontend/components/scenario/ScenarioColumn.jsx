import React, { useState, useMemo } from 'react';
import StepperInput from '../ui/StepperInput';
import MetricDeltaCard from './MetricDeltaCard';
import { grid2Style } from '../../styles/formStyles';
import { formatEuroInt } from '../../utils/formatters';

export default function ScenarioColumn({ 
  title, 
  badgeBg,
  badgeColor, 
  data, 
  setData, 
  baselineResults, 
  isBaseline = false 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const kpis = useMemo(() => {
    if (!data) return null;

    const kaufpreis = Number(data.kaufpreis || 0);
    const grwtP = Number(data.grwt_p ?? 5.0);
    const notarP = Number(data.notar_p ?? 2.0);
    const maklerP = Number(data.makler_p ?? 3.57);
    const sonstNk = Number(data.sonst_nk ?? 0);
    
    const kaufnebenkosten = (kaufpreis * (grwtP + notarP + maklerP) / 100) + sonstNk;
    const gesamtinvestition = kaufpreis + kaufnebenkosten;

    const ek = Number(data.ek_euro || 0);
    const kreditsumme = Math.max(0, gesamtinvestition - ek);

    const zinsP = Number(data.hb_zins ?? 3.8);
    const tilgungP = Number(data.hb_tilg ?? 2.0);
    const monatlicheRate = (kreditsumme * ((zinsP + tilgungP) / 100)) / 12;

    const kaltmieteMonat = Number(data.kaltmiete_monat || 0);
    const mietausfallP = Number(data.vac_rate_pct ?? 2.0);
    const effektiveMiete = kaltmieteMonat * (1 - mietausfallP / 100);

    const verwaltungMonat = Number(data.mgt_monat ?? 30);
    const wohnflaeche = Number(data.qm || 50);
    const instandhaltungMonat = (wohnflaeche * Number(data.inst_sqm ?? 12)) / 12;
    const bewirtschaftung = verwaltungMonat + instandhaltungMonat;

    const cashflowVorSteuer = effektiveMiete - bewirtschaftung - monatlicheRate;

    const zinsMonat = (kreditsumme * (zinsP / 100)) / 12;
    const afaPct = Number(data.afa_lin ?? 2.0) / 100;
    const gebaeudeanteilPct = Number(data.gebaeude_anteil_pct ?? 80.0) / 100;
    const afaMonat = (kaufpreis * gebaeudeanteilPct * afaPct) / 12;
    
    const zuVersteuern = effektiveMiete - bewirtschaftung - zinsMonat - afaMonat;
    const taxRate = Number(data.tax_rate_pct ?? 42) / 100;
    const steuerMonat = zuVersteuern > 0 ? zuVersteuern * taxRate : 0;
    const cashflowNachSteuer = cashflowVorSteuer - steuerMonat;

    const nettoMietrendite = gesamtinvestition > 0 ? (((effektiveMiete - bewirtschaftung) * 12) / gesamtinvestition) * 100 : 0;
    const ekRendite = ek > 0 ? ((cashflowVorSteuer * 12) / ek) * 100 : 0;

    const wertsteigerungP = Number(data.val_inc ?? 1.0);
    const wertNach10Jahren = kaufpreis * Math.pow(1 + wertsteigerungP / 100, 10);
    const tilgung10Jahre = (kreditsumme * (tilgungP / 100)) * 10;
    const vermoegen10Jahre = tilgung10Jahre + (wertNach10Jahren - kaufpreis);

    return {
      monatlicheRate,
      cashflowVorSteuer,
      cashflowNachSteuer,
      nettoMietrendite,
      ekRendite,
      vermoegen10Jahre
    };
  }, [data]);

  const updateField = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Header der Spalte */}
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
            Kaufpreis: {formatEuroInt(data?.kaufpreis || 0)} €
          </span>
        </div>

        {/* Formularfelder & Stellschrauben im Analyse-Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Kategorie 1: Finanzierung */}
          <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '10px', border: '1px solid #E2D9CE' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#A37841', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              1. Finanzierung
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <StepperInput
                label="Eigenkapital-Einsatz (€)"
                value={data?.ek_euro || 0}
                onChange={(v) => updateField('ek_euro', v)}
                step={2500}
                isCurrency={true}
              />
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
              <StepperInput
                label="Zinsbindung (Jahre)"
                value={data?.zinsbindung || 10}
                onChange={(v) => updateField('zinsbindung', v)}
                step={1}
              />
            </div>
          </div>

          {/* Kategorie 2: Bewirtschaftung */}
          <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '10px', border: '1px solid #E2D9CE' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#13381A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              2. Miete & Bewirtschaftung
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <StepperInput
                label="Ist-Kaltmiete (€ / Mo)"
                value={data?.kaltmiete_monat || 0}
                onChange={(v) => updateField('kaltmiete_monat', v)}
                step={25}
                isCurrency={true}
              />
              <div style={grid2Style}>
                <StepperInput
                  label="Instandhaltung (€ / m²)"
                  value={data?.inst_sqm ?? 12}
                  onChange={(v) => updateField('inst_sqm', v)}
                  step={1}
                />
                <StepperInput
                  label="Verwaltung (€ / Mo)"
                  value={data?.mgt_monat ?? 30}
                  onChange={(v) => updateField('mgt_monat', v)}
                  step={5}
                  isCurrency={true}
                />
              </div>
              <StepperInput
                label="Mietausfallwagnis (%)"
                value={data?.vac_rate_pct ?? 2.0}
                onChange={(v) => updateField('vac_rate_pct', v)}
                step={0.5}
                isPercent={true}
              />
            </div>
          </div>

          {/* Kategorie 3: Entwicklung & Steuern */}
          <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '10px', border: '1px solid #E2D9CE' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#13381A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              3. Entwicklung & Steuern
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                label="Grenzsteuersatz (%)"
                value={data?.tax_rate_pct ?? 42.0}
                onChange={(v) => updateField('tax_rate_pct', v)}
                step={0.5}
                isPercent={true}
              />
            </div>
          </div>

          {/* EXPANDABLE SECTION FOR ADVANCED METHODOLOGY PARAMETERS */}
          <div style={{ borderTop: '1px dashed #E2D9CE', paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#A37841',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 0'
              }}
            >
              <span>{showAdvanced ? 'Weitere Parameter ausblenden' : 'Weitere Parameter der Methodik einblenden'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {showAdvanced && (
              <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '10px', border: '1px solid #E2D9CE', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Erweiterte Nebenkosten & AfA
                </h4>
                
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

                <div style={grid2Style}>
                  <StepperInput
                    label="Gebäudeanteil (%)"
                    value={data?.gebaeude_anteil_pct ?? 80}
                    onChange={(v) => updateField('gebaeude_anteil_pct', v)}
                    step={5}
                    isPercent={true}
                  />
                  <StepperInput
                    label="AfA %"
                    value={data?.afa_lin ?? 2.0}
                    onChange={(v) => updateField('afa_lin', v)}
                    step={0.5}
                    isPercent={true}
                  />
                </div>
              </div>
            )}
          </div>

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
            />
            <MetricDeltaCard 
              label="EK-Rendite"
              value={kpis.ekRendite}
              type="percent"
              compareValue={baselineResults?.ekRendite}
              isBaseline={isBaseline}
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
