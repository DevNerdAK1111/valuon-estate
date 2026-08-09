import React, { useState, useMemo } from 'react';
import ScenarioColumn from './ScenarioColumn';
import { selectStyle } from '../../styles/formStyles';
import { formatEuroInt } from '../../utils/formatters';

export default function ScenarioComparisonView({ basePropertyData, dbProperties, setFormData }) {
  const initialData = useMemo(() => {
    return {
      obj_name: 'Musterobjekt',
      kaufpreis: 250000,
      ek_euro: 50000,
      hb_zins: 3.8,
      hb_tilg: 2.0,
      zinsbindung: 10,
      kaltmiete_monat: 1100,
      inst_sqm: 12,
      mgt_monat: 30,
      vac_rate_pct: 2.0,
      miet_inc: 1.0,
      val_inc: 1.0,
      tax_rate_pct: 42,
      qm: 65,
      grwt_p: 5.0,
      notar_p: 1.5,
      makler_p: 3.57,
      sonst_nk: 0,
      afa_lin: 2.0,
      gebaeude_anteil_pct: 80.0,
      ...basePropertyData
    };
  }, [basePropertyData]);

  const [scenarioA, setScenarioA] = useState(initialData);
  const [scenarioB, setScenarioB] = useState(initialData);

  const handleSelectDbProperty = (propertyId) => {
    if (!propertyId) return;
    const found = dbProperties?.find(p => String(p.id) === String(propertyId));
    if (found && found.form_data) {
      const merged = { ...initialData, ...found.form_data };
      setScenarioA(merged);
      setScenarioB(merged);
      if (setFormData) setFormData(merged);
    }
  };

  const calculateQuickKpis = (d) => {
    if (!d) return { cashflowNachSteuer: 0, nettoMietrendite: 0, vermoegen10Jahre: 0 };
    const kaufpreis = Number(d.kaufpreis || 0);
    const grwtP = Number(d.grwt_p ?? 5.0);
    const notarP = Number(d.notar_p ?? 2.0);
    const maklerP = Number(d.makler_p ?? 3.57);
    const sonstNk = Number(d.sonst_nk ?? 0);
    const kaufnebenkosten = (kaufpreis * (grwtP + notarP + maklerP) / 100) + sonstNk;
    const gesamtinvestition = kaufpreis + kaufnebenkosten;

    const ek = Number(d.ek_euro || 0);
    const kreditsumme = Math.max(0, gesamtinvestition - ek);
    const zinsP = Number(d.hb_zins ?? 3.8);
    const tilgungP = Number(d.hb_tilg ?? 2.0);
    const monatlicheRate = (kreditsumme * ((zinsP + tilgungP) / 100)) / 12;

    const kaltmieteMonat = Number(d.kaltmiete_monat || 0);
    const mietausfallP = Number(d.vac_rate_pct ?? 2.0);
    const effektiveMiete = kaltmieteMonat * (1 - mietausfallP / 100);

    const verwaltungMonat = Number(d.mgt_monat ?? 30);
    const wohnflaeche = Number(d.qm || 50);
    const instandhaltungMonat = (wohnflaeche * Number(d.inst_sqm ?? 12)) / 12;
    const bewirtschaftung = verwaltungMonat + instandhaltungMonat;

    const cashflowVorSteuer = effektiveMiete - bewirtschaftung - monatlicheRate;
    const zinsMonat = (kreditsumme * (zinsP / 100)) / 12;
    const afaMonat = (kaufpreis * (Number(d.gebaeude_anteil_pct ?? 80) / 100) * (Number(d.afa_lin ?? 2) / 100)) / 12;
    const zuVersteuern = effektiveMiete - bewirtschaftung - zinsMonat - afaMonat;
    const taxRate = Number(d.tax_rate_pct ?? 42) / 100;
    const steuerMonat = zuVersteuern > 0 ? zuVersteuern * taxRate : 0;
    
    return {
      cashflowNachSteuer: cashflowVorSteuer - steuerMonat,
      nettoMietrendite: gesamtinvestition > 0 ? (((effektiveMiete - bewirtschaftung) * 12) / gesamtinvestition) * 100 : 0,
      vermoegen10Jahre: ((kreditsumme * (tilgungP / 100)) * 10) + (kaufpreis * Math.pow(1 + (Number(d.val_inc ?? 1) / 100), 10) - kaufpreis)
    };
  };

  const resultsA = useMemo(() => calculateQuickKpis(scenarioA), [scenarioA]);
  const resultsB = useMemo(() => calculateQuickKpis(scenarioB), [scenarioB]);

  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'interest_plus':
        setScenarioB(prev => ({ ...prev, hb_zins: Math.round(((parseFloat(prev.hb_zins) || 0) + 1.5) * 10) / 10 }));
        break;
      case 'discount_price':
        setScenarioB(prev => ({ ...prev, kaufpreis: Math.round((parseFloat(prev.kaufpreis) || 0) * 0.9) }));
        break;
      case 'rent_plus':
        setScenarioB(prev => ({ ...prev, kaltmiete_monat: Math.round((parseFloat(prev.kaltmiete_monat) || 0) * 1.1) }));
        break;
      case 'vacancy_risk':
        setScenarioB(prev => ({ ...prev, vac_rate_pct: 8.33 }));
        break;
      case 'reset':
        setScenarioB({ ...scenarioA });
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Head-Bar im Executive Dashboard Style */}
      <div style={{
        background: 'white',
        border: '1px solid #E2D9CE',
        padding: '1.2rem 1.5rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#13381A', color: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#13381A', letterSpacing: '-0.5px' }}>
              Szenario-Vergleich
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#718096', fontWeight: '500' }}>
              Simultane Parameter-Analyse in Echtzeit
            </p>
          </div>
        </div>

        {/* Database Selector Dropdown for Base Property */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#13381A' }}>
            Basis-Objekt laden:
          </label>
          <div style={{ width: '220px' }}>
            <select
              onChange={(e) => handleSelectDbProperty(e.target.value)}
              style={selectStyle}
            >
              <option value="">{scenarioA?.obj_name || 'Aktuelles Objekt'}</option>
              {dbProperties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || p.form_data?.obj_name || `Objekt #${p.id}`} ({p.form_data?.kaufpreis ? formatEuroInt(p.form_data.kaufpreis) + ' €' : ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', marginRight: '4px' }}>Presets für B:</span>
          
          <button 
            type="button"
            onClick={() => applyPreset('interest_plus')}
            style={{ padding: '6px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#13381A', cursor: 'pointer' }}
          >
            Zins +1,5 %
          </button>
          
          <button 
            type="button"
            onClick={() => applyPreset('discount_price')}
            style={{ padding: '6px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#13381A', cursor: 'pointer' }}
          >
            Kaufpreis -10 %
          </button>
          
          <button 
            type="button"
            onClick={() => applyPreset('rent_plus')}
            style={{ padding: '6px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#13381A', cursor: 'pointer' }}
          >
            Miete +10 %
          </button>

          <button 
            type="button"
            onClick={() => applyPreset('vacancy_risk')}
            style={{ padding: '6px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#13381A', cursor: 'pointer' }}
          >
            1 Mo. Leerstand
          </button>

          <button 
            type="button"
            onClick={() => applyPreset('reset')}
            style={{ padding: '6px 14px', background: '#13381A', border: 'none', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', color: '#F7F4EC', cursor: 'pointer' }}
          >
            Szenario A kopieren
          </button>
        </div>
      </div>

      {/* Grid: 2 Szenario-Spalten */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <ScenarioColumn 
          title="Szenario A (Basis)"
          badgeBg="#EBF8FF"
          badgeColor="#2B6CB0"
          data={scenarioA}
          setData={setScenarioA}
          baselineResults={resultsA}
          isBaseline={true}
        />

        <ScenarioColumn 
          title="Szenario B (Anpassung)"
          badgeBg="#F0FFF4"
          badgeColor="#2F855A"
          data={scenarioB}
          setData={setScenarioB}
          baselineResults={resultsA}
          isBaseline={false}
        />
      </div>

      {/* Direct Delta Highlights */}
      <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#13381A' }}>
          Gesamtauswirkung (Szenario B vs. Szenario A)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Cashflow-Differenz (Monat)</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#13381A', marginTop: '4px' }}>
              {(resultsB.cashflowNachSteuer - resultsA.cashflowNachSteuer) >= 0 ? '+' : ''}{formatEuroInt(resultsB.cashflowNachSteuer - resultsA.cashflowNachSteuer)} €
            </div>
            <span style={{ fontSize: '0.72rem', color: '#718096', marginTop: '2px', display: 'block' }}>Unterschied Netto-Cashflow</span>
          </div>

          <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Rendite-Abweichung (Netto)</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#13381A', marginTop: '4px' }}>
              {(resultsB.nettoMietrendite - resultsA.nettoMietrendite) >= 0 ? '+' : ''}{(resultsB.nettoMietrendite - resultsA.nettoMietrendite).toFixed(2).replace('.', ',')} %
            </div>
            <span style={{ fontSize: '0.72rem', color: '#718096', marginTop: '2px', display: 'block' }}>Unterschied Netto-Mietrendite</span>
          </div>

          <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Vermögenszuwachs-Delta (10 J.)</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#13381A', marginTop: '4px' }}>
              {(resultsB.vermoegen10Jahre - resultsA.vermoegen10Jahre) >= 0 ? '+' : ''}{formatEuroInt(resultsB.vermoegen10Jahre - resultsA.vermoegen10Jahre)} €
            </div>
            <span style={{ fontSize: '0.72rem', color: '#718096', marginTop: '2px', display: 'block' }}>Kumuliertes Vermögens-Delta</span>
          </div>
        </div>
      </div>

    </div>
  );
}
