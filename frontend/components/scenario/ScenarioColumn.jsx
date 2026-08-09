import React, { useMemo } from 'react';
import MetricDeltaCard from './MetricDeltaCard';

export default function ScenarioColumn({ 
  title, 
  badgeBg,
  badgeColor, 
  data, 
  setData, 
  baselineResults, 
  isBaseline = false 
}) {
  // Integrierte, fehlerresistente Berechnung aller Immobilienmetriken
  const kpis = useMemo(() => {
    if (!data) return null;

    const kaufpreis = Number(data.kaufpreis) || 0;
    const ek = Number(data.ek_euro) || 0;
    const kreditsumme = Math.max(0, kaufpreis - ek);

    const zinsP = Number(data.zins_p) || 0;
    const tilgungP = Number(data.tilgung_p) || 0;
    const monatlicheRate = (kreditsumme * ((zinsP + tilgungP) / 100)) / 12;

    const kaltmieteMonat = Number(data.kaltmiete_monat) || 0;
    const mietausfallP = Number(data.mietausfall_p) || 0;
    const effektiveMiete = kaltmieteMonat * (1 - mietausfallP / 100);

    const verwaltungMonat = Number(data.verwaltung_monat) || 0;
    const wohnflaeche = Number(data.wohnflaeche) || 50;
    const instandhaltungMonat = (wohnflaeche * (Number(data.instandhaltung_qm_jahr) || 0)) / 12;
    const bewirtschaftung = verwaltungMonat + instandhaltungMonat;

    const cashflowVorSteuer = effektiveMiete - bewirtschaftung - monatlicheRate;

    // Steuerliche Annäherung
    const zinsMonat = (kreditsumme * (zinsP / 100)) / 12;
    const afaMonat = (kaufpreis * 0.8 * 0.03) / 12; // 3% AfA auf 80% Gebäudeteil
    const zuVersteuern = effektiveMiete - bewirtschaftung - zinsMonat - afaMonat;
    const taxRate = Number(data.tax_rate_pct || data.steuer_p || 42) / 100;
    const steuerMonat = zuVersteuern > 0 ? zuVersteuern * taxRate : 0;
    const cashflowNachSteuer = cashflowVorSteuer - steuerMonat;

    const nettoMietrendite = kaufpreis > 0 ? (((effektiveMiete - bewirtschaftung) * 12) / kaufpreis) * 100 : 0;
    const ekRendite = ek > 0 ? ((cashflowVorSteuer * 12) / ek) * 100 : 0;

    // Vermögensaufbau über 10 Jahre (Tilgung + geschätzte Wertsteigerung)
    const wertsteigerungP = Number(data.wertsteigerung_p) || 0;
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
    const numVal = parseFloat(value);
    setData(prev => ({
      ...prev,
      [field]: isNaN(numVal) ? value : numVal
    }));
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2D9CE',
      borderRadius: '16px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Header der Spalte */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: '0.75rem', borderBottom: '1px solid #E2D9CE', paddingBottom: '0.75rem' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: badgeBg,
            color: badgeColor
          }}>
            {title}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#13381A' }}>
            Kaufpreis: {data?.kaufpreis ? Number(data.kaufpreis).toLocaleString('de-DE') : 0} €
          </span>
        </div>

        {/* Formularfelder & Stellschrauben */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Kategorie 1: Finanzierung */}
          <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#A37841', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              1. Finanzierung
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Eigenkapital (€)</label>
                <input 
                  type="number"
                  value={data?.ek_euro ?? ''}
                  onChange={(e) => updateField('ek_euro', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Sollzins (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={data?.zins_p ?? ''}
                  onChange={(e) => updateField('zins_p', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Tilgung (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={data?.tilgung_p ?? ''}
                  onChange={(e) => updateField('tilgung_p', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Zinsbindung (J.)</label>
                <input 
                  type="number"
                  value={data?.zinsbindung_j ?? ''}
                  onChange={(e) => updateField('zinsbindung_j', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>
            </div>
          </div>

          {/* Kategorie 2: Einnahmen & Bewirtschaftung */}
          <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#2F855A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              2. Miete & Bewirtschaftung
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Miete (€/Monat)</label>
                <input 
                  type="number"
                  value={data?.kaltmiete_monat ?? ''}
                  onChange={(e) => updateField('kaltmiete_monat', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Instandh. (€/m²/J.)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={data?.instandhaltung_qm_jahr ?? ''}
                  onChange={(e) => updateField('instandhaltung_qm_jahr', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Verwaltung (€/Mo.)</label>
                <input 
                  type="number"
                  value={data?.verwaltung_monat ?? ''}
                  onChange={(e) => updateField('verwaltung_monat', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Mietausfall (%)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={data?.mietausfall_p ?? ''}
                  onChange={(e) => updateField('mietausfall_p', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>
            </div>
          </div>

          {/* Kategorie 3: Entwicklung */}
          <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#2B6CB0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              3. Entwicklung & Steuern
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Mietstg. (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={data?.mietsteigerung_p ?? ''}
                  onChange={(e) => updateField('mietsteigerung_p', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 6px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Wertstg. (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={data?.wertsteigerung_p ?? ''}
                  onChange={(e) => updateField('wertsteigerung_p', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 6px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#4A5568', marginBottom: '2px' }}>Steuer (%)</label>
                <input 
                  type="number"
                  value={data?.tax_rate_pct ?? data?.steuer_p ?? ''}
                  onChange={(e) => updateField('tax_rate_pct', e.target.value)}
                  style={{ width: '100%', background: 'white', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '6px 6px', fontSize: '0.85rem', fontWeight: '600', color: '#13381A' }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Ergebnis-Metriken */}
      {kpis && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2D9CE' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Ergebnis-Analyse
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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
