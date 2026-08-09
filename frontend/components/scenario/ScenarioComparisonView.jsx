import React, { useState, useEffect, useMemo } from 'react';
import ScenarioColumn from './ScenarioColumn';
import { calculateInvestmentApi } from '../../lib/propertyApi';
import { calculateInvestmentModel } from '../../utils/calculateInvestment';
import { selectStyle } from '../../styles/formStyles';
import { formatEuroInt } from '../../utils/formatters';

export default function ScenarioComparisonView({ basePropertyData, dbProperties, setFormData }) {
  const initialData = useMemo(() => {
    return {
      obj_name: 'Musterobjekt',
      objektart: 'Eigentumswohnung',
      bundesland: 'Niedersachsen',
      kaufpreis: 250000,
      qm: 65,
      baujahr: 2000,
      ek_euro: 50000,
      hb_zins: 3.8,
      hb_tilg: 2.0,
      zinsbindung: 10,
      sondertilg: 0,
      loan_type: 'Annuitätendarlehen',
      kaltmiete_monat: 1100,
      hausgeld: 250,
      hausgeld_nicht_umlegbar: 60,
      inst_sqm: 12,
      mgt_monat: 30,
      vac_rate_pct: 2.0,
      sanierung: 0,
      grwt_p: 5.0,
      notar_p: 2.0,
      makler_p: 3.57,
      sonst_nk: 0,
      tax_rate_pct: 42.0,
      afa_model: 'Linear Standard',
      gebaeude_anteil_pct: 80.0,
      afa_lin: 2.0,
      miet_inc: 1.0,
      val_inc: 1.0,
      exit_cost: 0.0,
      kfw_amt: 0,
      kfw_zins: 2.1,
      kfw_tilg: 3.0,
      ...basePropertyData
    };
  }, [basePropertyData]);

  const [scenarioA, setScenarioA] = useState(initialData);
  const [scenarioB, setScenarioB] = useState(initialData);

  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Trigger Backend-Berechnung für Szenario A bei Parameter-Änderung
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setLoadingA(true);
      try {
        const res = await calculateInvestmentApi(scenarioA, scenarioA.capexList || []);
        if (isMounted) setResultA(res);
      } catch (err) {
        console.error('Fehler bei der Backend-Berechnung für Szenario A:', err);
      } finally {
        if (isMounted) setLoadingA(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [scenarioA]);

  // Trigger Backend-Berechnung für Szenario B bei Parameter-Änderung
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setLoadingB(true);
      try {
        const res = await calculateInvestmentApi(scenarioB, scenarioB.capexList || []);
        if (isMounted) setResultB(res);
      } catch (err) {
        console.error('Fehler bei der Backend-Berechnung für Szenario B:', err);
      } finally {
        if (isMounted) setLoadingB(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [scenarioB]);

  // Offizielles Modell aus dem Executive Dashboard ableiten
  const modelA = useMemo(() => {
    if (!resultA) return null;
    return calculateInvestmentModel(scenarioA, '10', resultA);
  }, [scenarioA, resultA]);

  const modelB = useMemo(() => {
    if (!resultB) return null;
    return calculateInvestmentModel(scenarioB, '10', resultB);
  }, [scenarioB, resultB]);

  // Kennzahlen-Extraktion exakt aus dem Executive Dashboard
  const kpisA = useMemo(() => {
    if (!modelA) return null;
    const firstRow = modelA.slicedProjection?.[0] || {};
    return {
      cashflowNachSteuer: modelA.kpis?.avgMonthlyCashflow ?? firstRow.cashflowNachSteuerMo,
      cashflowVorSteuer: firstRow.cashflowVorSteuerMo || 0,
      nettoMietrendite: modelA.kpis?.nettoMietrenditeInitial || 0,
      ekRendite: modelA.kpis?.validIrr || 0,
      monatlicheRate: (firstRow.kapitaldienst || 0) / 12,
      gesamtGewinn: modelA.kpis?.gesamtGewinn || 0
    };
  }, [modelA]);

  const kpisB = useMemo(() => {
    if (!modelB) return null;
    const firstRow = modelB.slicedProjection?.[0] || {};
    return {
      cashflowNachSteuer: modelB.kpis?.avgMonthlyCashflow ?? firstRow.cashflowNachSteuerMo,
      cashflowVorSteuer: firstRow.cashflowVorSteuerMo || 0,
      nettoMietrendite: modelB.kpis?.nettoMietrenditeInitial || 0,
      ekRendite: modelB.kpis?.validIrr || 0,
      monatlicheRate: (firstRow.kapitaldienst || 0) / 12,
      gesamtGewinn: modelB.kpis?.gesamtGewinn || 0
    };
  }, [modelB]);

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
              Simultane Backend-Analyse & Stresstest in Echtzeit
            </p>
          </div>
        </div>

        {/* Database Selector Dropdown */}
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
          kpis={kpisA}
          baselineResults={kpisA}
          isBaseline={true}
          loading={loadingA}
        />

        <ScenarioColumn 
          title="Szenario B (Anpassung)"
          badgeBg="#F0FFF4"
          badgeColor="#2F855A"
          data={scenarioB}
          setData={setScenarioB}
          kpis={kpisB}
          baselineResults={kpisA}
          isBaseline={false}
          loading={loadingB}
        />
      </div>

      {/* Direct Delta Highlights */}
      {kpisA && kpisB && (
        <div style={{ background: 'white', border: '1px solid #E2D9CE', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#13381A' }}>
            Gesamtauswirkung Backend-Prognose (Szenario B vs. Szenario A)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Cashflow-Differenz (Monat)</span>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: (kpisB.cashflowNachSteuer - kpisA.cashflowNachSteuer) >= 0 ? '#276749' : '#9B2C2C', marginTop: '4px' }}>
                {(kpisB.cashflowNachSteuer - kpisA.cashflowNachSteuer) >= 0 ? '+' : ''}{formatEuroInt(kpisB.cashflowNachSteuer - kpisA.cashflowNachSteuer)} €
              </div>
              <span style={{ fontSize: '0.72rem', color: '#718096', marginTop: '2px', display: 'block' }}>Unterschied Netto-Cashflow n. St.</span>
            </div>

            <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Rendite-Abweichung (Netto)</span>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#13381A', marginTop: '4px' }}>
                {(kpisB.nettoMietrendite - kpisA.nettoMietrendite) >= 0 ? '+' : ''}{(kpisB.nettoMietrendite - kpisA.nettoMietrendite).toFixed(2).replace('.', ',')} %
              </div>
              <span style={{ fontSize: '0.72rem', color: '#718096', marginTop: '2px', display: 'block' }}>Unterschied Netto-Mietrendite</span>
            </div>

            <div style={{ background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '10px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase' }}>Gesamtgewinn-Delta (10 J.)</span>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: (kpisB.gesamtGewinn - kpisA.gesamtGewinn) >= 0 ? '#276749' : '#9B2C2C', marginTop: '4px' }}>
                {(kpisB.gesamtGewinn - kpisA.gesamtGewinn) >= 0 ? '+' : ''}{formatEuroInt(kpisB.gesamtGewinn - kpisA.gesamtGewinn)} €
              </div>
              <span style={{ fontSize: '0.72rem', color: '#718096', marginTop: '2px', display: 'block' }}>Kumulierter Vermögensgewinn</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
