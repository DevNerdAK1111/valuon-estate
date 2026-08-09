import React, { useState, useMemo } from 'react';
import ScenarioColumn from './ScenarioColumn';

export default function ScenarioComparisonView({ basePropertyData, dbProperties, setFormData }) {
  const initialData = useMemo(() => {
    return {
      objektName: 'Musterobjekt',
      kaufpreis: 250000,
      ek_euro: 50000,
      zins_p: 3.8,
      tilgung_p: 2.0,
      zinsbindung_j: 10,
      kaltmiete_monat: 1100,
      instandhaltung_qm_jahr: 12,
      verwaltung_monat: 30,
      mietausfall_p: 2.0,
      mietsteigerung_p: 1.5,
      wertsteigerung_p: 1.0,
      tax_rate_pct: 42,
      wohnflaeche: 65,
      grwt_p: 5.0,
      notar_p: 1.5,
      makler_p: 3.57,
      sonst_nk: 0,
      afa_pct: 3.0,
      gebaeudeanteil_pct: 80.0,
      ...basePropertyData
    };
  }, [basePropertyData]);

  const [scenarioA, setScenarioA] = useState(initialData);
  const [scenarioB, setScenarioB] = useState(initialData);

  // Objekt aus der Datenbank in Szenario A und B laden
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
    const kaufpreis = Number(d.kaufpreis) || 0;
    const grwtP = Number(d.grwt_p) || 0;
    const notarP = Number(d.notar_p) || 0;
    const maklerP = Number(d.makler_p) || 0;
    const sonstNk = Number(d.sonst_nk) || 0;
    const kaufnebenkosten = (kaufpreis * (grwtP + notarP + maklerP) / 100) + sonstNk;
    const gesamtinvestition = kaufpreis + kaufnebenkosten;

    const ek = Number(d.ek_euro) || 0;
    const kreditsumme = Math.max(0, gesamtinvestition - ek);
    const zinsP = Number(d.zins_p) || 0;
    const tilgungP = Number(d.tilgung_p) || 0;
    const monatlicheRate = (kreditsumme * ((zinsP + tilgungP) / 100)) / 12;

    const kaltmieteMonat = Number(d.kaltmiete_monat) || 0;
    const mietausfallP = Number(d.mietausfall_p) || 0;
    const effektiveMiete = kaltmieteMonat * (1 - mietausfallP / 100);

    const verwaltungMonat = Number(d.verwaltung_monat) || 0;
    const wohnflaeche = Number(d.wohnflaeche) || 50;
    const instandhaltungMonat = (wohnflaeche * (Number(d.instandhaltung_qm_jahr) || 0)) / 12;
    const bewirtschaftung = verwaltungMonat + instandhaltungMonat;

    const cashflowVorSteuer = effektiveMiete - bewirtschaftung - monatlicheRate;
    const zinsMonat = (kreditsumme * (zinsP / 100)) / 12;
    const afaMonat = (kaufpreis * (Number(d.gebaeudeanteil_pct || 80) / 100) * (Number(d.afa_pct || 3) / 100)) / 12;
    const zuVersteuern = effektiveMiete - bewirtschaftung - zinsMonat - afaMonat;
    const taxRate = Number(d.tax_rate_pct || d.steuer_p || 42) / 100;
    const steuerMonat = zuVersteuern > 0 ? zuVersteuern * taxRate : 0;
    
    return {
      cashflowNachSteuer: cashflowVorSteuer - steuerMonat,
      nettoMietrendite: gesamtinvestition > 0 ? (((effektiveMiete - bewirtschaftung) * 12) / gesamtinvestition) * 100 : 0,
      vermoegen10Jahre: ((kreditsumme * (tilgungP / 100)) * 10) + (kaufpreis * Math.pow(1 + (Number(d.wertsteigerung_p) || 0) / 100, 10) - kaufpreis)
    };
  };

  const resultsA = useMemo(() => calculateQuickKpis(scenarioA), [scenarioA]);
  const resultsB = useMemo(() => calculateQuickKpis(scenarioB), [scenarioB]);

  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'interest_plus':
        setScenarioB(prev => ({ ...prev, zins_p: Math.round(((parseFloat(prev.zins_p) || 0) + 1.5) * 10) / 10 }));
        break;
      case 'discount_price':
        setScenarioB(prev => ({ ...prev, kaufpreis: Math.round((parseFloat(prev.kaufpreis) || 0) * 0.9) }));
        break;
      case 'rent_plus':
        setScenarioB(prev => ({ ...prev, kaltmiete_monat: Math.round((parseFloat(prev.kaltmiete_monat) || 0) * 1.1) }));
        break;
      case 'vacancy_risk':
        setScenarioB(prev => ({ ...prev, mietausfall_p: 8.33 }));
        break;
      case 'reset':
        setScenarioB({ ...scenarioA });
        break;
      default:
        break;
    }
  };

  const formatEuro = (v) => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Upper Control Bar */}
      <div style={{
        background: 'white',
        border: '1px solid #E2D9CE',
        padding: '1.25rem',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#13381A', color: '#F7F4EC', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
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
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#555759', fontWeight: '500' }}>
              Simultane Parameter-Analyse in Echtzeit.
            </p>
          </div>
        </div>

        {/* Database Selector Dropdown for Base Property */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#13381A' }}>
            Basis-Objekt laden:
          </label>
          <select
            onChange={(e) => handleSelectDbProperty(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px solid #E2D9CE',
              background: '#FAF8F5',
              color: '#13381A',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value="">{scenarioA?.objektName || 'Aktuelles Objekt'}</option>
            {dbProperties?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || p.form_data?.objektName || `Objekt #${p.id}`} ({p.form_data?.kaufpreis ? Number(p.form_data.kaufpreis).toLocaleString('de-DE') + ' €' : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#718096', marginRight: '4px' }}>Presets für B:</span>
          
          <button 
            type="button"
            onClick={() => applyPreset('interest_plus')}
            style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '700', color: '#13381A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Zins +1,5 %</span>
          </button>
          
          <button 
            type="button"
            onClick={() => applyPreset('discount_price')}
            style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '700', color: '#13381A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Kaufpreis -10 %</span>
          </button>
          
          <button 
            type="button"
            onClick={() => applyPreset('rent_plus')}
            style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '700', color: '#13381A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Miete +10 %</span>
          </button>

          <button 
            type="button"
            onClick={() => applyPreset('vacancy_risk')}
            style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '700', color: '#13381A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>1 Mo. Leerstand</span>
          </button>

          <button 
            type="button"
            onClick={() => applyPreset('reset')}
            style={{ padding: '6px 12px', background: '#13381A', border: 'none', borderRadius: '14px', fontSize: '0.75rem', fontWeight: '700', color: '#F7F4EC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Szenario A kopieren</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Szenario-Spalten */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
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
      <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: '800', color: '#13381A' }}>
          Gesamtauswirkung (Szenario B vs. Szenario A)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#718096' }}>Cashflow-Differenz (Monat)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#13381A', marginTop: '4px' }}>
              {formatEuro(resultsB.cashflowNachSteuer - resultsA.cashflowNachSteuer)}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#A0AEC0', marginTop: '2px', display: 'block' }}>Unterschied Netto-Cashflow</span>
          </div>

          <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#718096' }}>Rendite-Abweichung (Netto)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#13381A', marginTop: '4px' }}>
              {(resultsB.nettoMietrendite - resultsA.nettoMietrendite).toFixed(2)} %
            </div>
            <span style={{ fontSize: '0.7rem', color: '#A0AEC0', marginTop: '2px', display: 'block' }}>Unterschied Netto-Mietrendite</span>
          </div>

          <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#718096' }}>Vermögenszuwachs-Delta (10 J.)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#13381A', marginTop: '4px' }}>
              {formatEuro(resultsB.vermoegen10Jahre - resultsA.vermoegen10Jahre)}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#A0AEC0', marginTop: '2px', display: 'block' }}>Kumuliertes Vermögens-Delta</span>
          </div>
        </div>
      </div>

    </div>
  );
}
