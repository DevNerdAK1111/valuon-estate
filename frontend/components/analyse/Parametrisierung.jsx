'use client';
import { useState } from 'react';
import StepperInput from '../ui/StepperInput';
import { formatEuroInt } from '../../utils/formatters';

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
  handleReset,
  setFormData
}) {
  // State für die 4 Hauptbereiche
  const [openSections, setOpenSections] = useState({
    basisdaten: true,
    bewirtschaftung: true,
    finanzierung: true,
    steuer: true
  });

  // State für die einklappbaren Unterbereiche
  const [openSubSections, setOpenSubSections] = useState({
    folgefinanzierung: false,
    kfw: false,
    capex: false
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSubSection = (key) => {
    setOpenSubSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllSections = () => {
    const allOpen = Object.values(openSections).every(Boolean);
    const newState = !allOpen;
    setOpenSections({
      basisdaten: newState,
      bewirtschaftung: newState,
      finanzierung: newState,
      steuer: newState
    });
  };

  const allSectionsOpen = Object.values(openSections).every(Boolean);

  // Farblogik Eigenkapital (Grün bei EK >= Nebenkosten)
  const ekEuro = Number(formData?.ek_euro || 0);
  const nkTotal = Number(summe_nk || 0);
  const isEkCoveringNk = ekEuro >= nkTotal;

  const onFieldChange = (field, value) => {
    if (updateField) {
      updateField(field, value);
    } else if (setFormData) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (pingBackend) pingBackend();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* 1. KOPFZEILE: OBJEKT PARAMETER */}
      <div style={{
        background: 'white',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid #E2D9CE'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#13381A' }}>
          Objekt-Parameter
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#718096', marginTop: '2px', display: 'block' }}>
          Eingabemaske für Kalkulation
        </span>
      </div>

      {/* 2. EIGENE ZEILE FÜR BUTTONS */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={toggleAllSections}
          style={{
            flex: 1,
            padding: '0.6rem 1rem',
            background: 'white',
            border: '1px solid #E2D9CE',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#13381A',
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          {allSectionsOpen ? 'Alle einklappen' : 'Alle ausklappen'}
        </button>

        {handleReset && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#FFF5F5',
              border: '1px solid #FEB2B2',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#9B2C2C',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* HAUPTBEREICH 1: BASISDATEN */}
      <MainCard
        title="1. Basisdaten & Kaufpreis"
        isOpen={openSections.basisdaten}
        onToggle={() => toggleSection('basisdaten')}
      >
        <div>
          <label style={labelStyle}>Objektbezeichnung</label>
          <input
            type="text"
            value={formData.obj_name || ''}
            onChange={(e) => onFieldChange('obj_name', e.target.value)}
            placeholder="z.B. ETW Musterstraße"
            style={inputStyle}
          />
        </div>

        <div style={grid2Style}>
          <div>
            <label style={labelStyle}>Objektart</label>
            <div style={selectContainerStyle}>
              <select
                value={formData.objektart || 'Eigentumswohnung'}
                onChange={(e) => onFieldChange('objektart', e.target.value)}
                style={selectStyle}
              >
                <option value="Eigentumswohnung">Eigentumswohnung</option>
                <option value="Einfamilienhaus">Einfamilienhaus</option>
                <option value="Zweifamilienhaus">Zweifamilienhaus</option>
                <option value="Reihenhaus / Doppelhaushälfte">Reihenhaus / Doppelhaushälfte</option>
                <option value="Mehrfamilienhaus">Mehrfamilienhaus</option>
                <option value="Wohn- und Geschäftshaus">Wohn- und Geschäftshaus</option>
                <option value="Mikroapartment / Studentisches Wohnen">Mikroapartment</option>
                <option value="Pflege- / Seniorenimmobilie">Pflege- / Seniorenimmobilie</option>
                <option value="Gewerbeimmobilie / Sonstiges">Gewerbeimmobilie / Sonstiges</option>
              </select>
              <ChevronIcon isOpen={true} isSelect={true} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Bundesland</label>
            <div style={selectContainerStyle}>
              <select
                value={formData.bundesland || 'Niedersachsen'}
                onChange={(e) => onFieldChange('bundesland', e.target.value)}
                style={selectStyle}
              >
                {Object.keys(grunderwerbsteuerSätze || {}).map((bl) => (
                  <option key={bl} value={bl}>{bl}</option>
                ))}
              </select>
              <ChevronIcon isOpen={true} isSelect={true} />
            </div>
          </div>
        </div>

        <div style={grid2Style}>
          <div>
            <label style={labelStyle}>Stadt</label>
            <input
              type="text"
              value={formData.stadt || ''}
              onChange={(e) => onFieldChange('stadt', e.target.value)}
              placeholder="z.B. Weyhe"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Stadtteil</label>
            <input
              type="text"
              value={formData.stadtteil || ''}
              onChange={(e) => onFieldChange('stadtteil', e.target.value)}
              placeholder="z.B. Leeste"
              style={inputStyle}
            />
          </div>
        </div>

        <StepperInput
          label="Kaufpreis (€)"
          value={formData.kaufpreis || 0}
          onChange={(v) => onFieldChange('kaufpreis', v)}
          step={5000}
          isCurrency={true}
        />

        <div style={grid2Style}>
          <StepperInput
            label="Wohnfläche (m²)"
            value={formData.qm || 0}
            onChange={(v) => handleQmChange ? handleQmChange(v) : onFieldChange('qm', v)}
            step={5}
            isSqm={true}
          />
          <StepperInput
            label="Baujahr"
            value={formData.baujahr || 2000}
            onChange={(v) => onFieldChange('baujahr', v)}
            step={1}
          />
        </div>
      </MainCard>

      {/* HAUPTBEREICH 2: BEWIRTSCHAFTUNG & NEBENKOSTEN */}
      <MainCard
        title="2. Miete & Bewirtschaftung"
        isOpen={openSections.bewirtschaftung}
        onToggle={() => toggleSection('bewirtschaftung')}
      >
        <div style={grid2Style}>
          <StepperInput
            label="Ist-Kaltmiete (€ / Mo)"
            value={formData.kaltmiete_monat || 0}
            onChange={(v) => handleIstMonatChange ? handleIstMonatChange(v) : onFieldChange('kaltmiete_monat', v)}
            step={25}
            isCurrency={true}
          />
          <StepperInput
            label="Ist-Miete (€ / m²)"
            value={formData.ist_sqm || 0}
            onChange={(v) => handleIstSqmChange ? handleIstSqmChange(v) : onFieldChange('ist_sqm', v)}
            step={0.5}
          />
        </div>

        <div style={grid2Style}>
          <StepperInput
            label="Target-Miete (€ / Mo)"
            value={formData.target_monat || 0}
            onChange={(v) => handleTargetMonatChange ? handleTargetMonatChange(v) : onFieldChange('target_monat', v)}
            step={25}
            isCurrency={true}
          />
          <StepperInput
            label="Target-Miete (€ / m²)"
            value={formData.target_sqm || 0}
            onChange={(v) => handleTargetSqmChange ? handleTargetSqmChange(v) : onFieldChange('target_sqm', v)}
            step={0.5}
          />
        </div>

        <StepperInput
          label="Anpassung ab Jahr"
          value={formData.adj_year || 1}
          onChange={(v) => onFieldChange('adj_year', v)}
          step={1}
        />

        <div style={grid2Style}>
          <StepperInput
            label="Hausgeld gesamt (€ / Mo)"
            value={formData.hausgeld || 0}
            onChange={(v) => handleHausgeldChange ? handleHausgeldChange(v) : onFieldChange('hausgeld', v)}
            step={10}
            isCurrency={true}
          />
          <StepperInput
            label="Davon nicht umlegbar (€ / Mo)"
            value={formData.hausgeld_nicht_umlegbar || 0}
            onChange={(v) => handleHausgeldNichtUmlegbarChange ? handleHausgeldNichtUmlegbarChange(v) : onFieldChange('hausgeld_nicht_umlegbar', v)}
            step={5}
            isCurrency={true}
          />
        </div>

        <div style={grid2Style}>
          <StepperInput
            label="Instandhaltung (€ / m² / J.)"
            value={formData.inst_sqm || 12}
            onChange={(v) => onFieldChange('inst_sqm', v)}
            step={1}
          />
          <StepperInput
            label="Verwaltung (€ / Mo)"
            value={formData.mgt_monat || 30}
            onChange={(v) => onFieldChange('mgt_monat', v)}
            step={5}
            isCurrency={true}
          />
        </div>

        <div style={grid2Style}>
          <StepperInput
            label="Mietausfallwagnis (%)"
            value={formData.vac_rate_pct || 2.0}
            onChange={(v) => onFieldChange('vac_rate_pct', v)}
            step={0.5}
            isPercent={true}
          />
          <StepperInput
            label="Sanierung / Umbau (€)"
            value={formData.sanierung || 0}
            onChange={(v) => onFieldChange('sanierung', v)}
            step={1000}
            isCurrency={true}
          />
        </div>

        <div style={infoBoxStyle}>
          <div style={{ fontWeight: '800', marginBottom: '4px' }}>
            Kaufnebenkosten Gesamt: {formatEuroInt(nkTotal)} €
          </div>
          <div style={{ fontSize: '0.8rem', color: '#4A5568' }}>
            GrESt: {formData.grwt_p || 5}% ({formatEuroInt(grwt_euro || 0)} €) • Notar: {formData.notar_p || 2}% ({formatEuroInt(notar_euro || 0)} €) • Makler: {formData.makler_p || 3.57}% ({formatEuroInt(makler_euro || 0)} €)
          </div>
        </div>
      </MainCard>

      {/* HAUPTBEREICH 3: FINANZIERUNG & EIGENKAPITAL */}
      <MainCard
        title="3. Finanzierung & Eigenkapital"
        isOpen={openSections.finanzierung}
        onToggle={() => toggleSection('finanzierung')}
      >
        <StepperInput
          label="Eigenkapital-Einsatz (€)"
          value={formData.ek_euro || 0}
          onChange={(v) => onFieldChange('ek_euro', v)}
          step={2500}
          isCurrency={true}
        />

        {/* NEBENKOSTEN-DECKUNG (GRÜN WENN EK >= NEBENKOSTEN) */}
        <div style={{
          padding: '10px 12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '700',
          background: isEkCoveringNk ? '#F0FFF4' : '#FFF5F5',
          border: isEkCoveringNk ? '1px solid #C6F6D5' : '1px solid #FEB2B2',
          color: isEkCoveringNk ? '#22543D' : '#9B2C2C',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{isEkCoveringNk ? '✓' : '⚠'}</span>
          <span>
            {isEkCoveringNk
              ? `Eigenkapital deckt die Nebenkosten (${formatEuroInt(nkTotal)} €) vollständig.`
              : `Eigenkapital deckt die Nebenkosten (${formatEuroInt(nkTotal)} €) noch nicht vollständig.`}
          </span>
        </div>

        <div>
          <label style={labelStyle}>Darlehensart</label>
          <div style={selectContainerStyle}>
            <select
              value={formData.loan_type || 'Annuitätendarlehen'}
              onChange={(e) => onFieldChange('loan_type', e.target.value)}
              style={selectStyle}
            >
              <option value="Annuitätendarlehen">Annuitätendarlehen (Zins + Tilgung konstant)</option>
              <option value="Endfälliges Darlehen">Endfälliges Darlehen (Nur Zinszahlung)</option>
            </select>
            <ChevronIcon isOpen={true} isSelect={true} />
          </div>
        </div>

        <div style={grid2Style}>
          <StepperInput
            label="Sollzins Hausbank (%)"
            value={formData.hb_zins || 3.8}
            onChange={(v) => onFieldChange('hb_zins', v)}
            step={0.1}
            isPercent={true}
          />
          <StepperInput
            label="Anfängliche Tilgung (%)"
            value={formData.hb_tilg || 2.0}
            onChange={(v) => onFieldChange('hb_tilg', v)}
            step={0.1}
            isPercent={true}
          />
        </div>

        <div style={grid2Style}>
          <StepperInput
            label="Sondertilgung (€ / J.)"
            value={formData.sondertilg || 0}
            onChange={(v) => onFieldChange('sondertilg', v)}
            step={500}
            isCurrency={true}
          />
          <StepperInput
            label="Zinsbindung (Jahre)"
            value={formData.zinsbindung || 10}
            onChange={(v) => onFieldChange('zinsbindung', v)}
            step={1}
          />
        </div>

        {/* UNTERBEREICH 1: ANSCHLUSSFINANZIERUNG */}
        <SubContainerCard
          title="Anschlussfinanzierung (nach Zinsbindung)"
          isOpen={openSubSections.folgefinanzierung}
          onToggle={() => toggleSubSection('folgefinanzierung')}
        >
          <StepperInput
            label="Folgezins (%)"
            value={formData.folge_zins || 3.8}
            onChange={(v) => onFieldChange('folge_zins', v)}
            step={0.1}
            isPercent={true}
          />
          <div>
            <label style={labelStyle}>Anschluss-Modus</label>
            <div style={selectContainerStyle}>
              <select
                value={formData.folge_mode || 'Rate konstant halten (Annuität)'}
                onChange={(e) => onFieldChange('folge_mode', e.target.value)}
                style={selectStyle}
              >
                <option value="Rate konstant halten (Annuität)">Rate konstant halten (Annuität)</option>
                <option value="Neuer Tilgungssatz festlegen">Neuen Tilgungssatz festlegen</option>
              </select>
              <ChevronIcon isOpen={true} isSelect={true} />
            </div>
          </div>

          {formData.folge_mode !== 'Rate konstant halten (Annuität)' && (
            <StepperInput
              label="Folge-Tilgung (%)"
              value={formData.folge_tilg || 2.0}
              onChange={(v) => onFieldChange('folge_tilg', v)}
              step={0.1}
              isPercent={true}
            />
          )}
        </SubContainerCard>

        {/* UNTERBEREICH 2: KFW DARLEHEN & ZUSCHÜSSE */}
        <SubContainerCard
          title="KfW-Darlehen & Zuschüsse"
          isOpen={openSubSections.kfw}
          onToggle={() => toggleSubSection('kfw')}
        >
          <StepperInput
            label="KfW-Darlehensbetrag (€)"
            value={formData.kfw_amt || 0}
            onChange={(v) => onFieldChange('kfw_amt', v)}
            step={5000}
            isCurrency={true}
          />
          <div style={grid2Style}>
            <StepperInput
              label="KfW Zins (%)"
              value={formData.kfw_zins || 2.1}
              onChange={(v) => onFieldChange('kfw_zins', v)}
              step={0.1}
              isPercent={true}
            />
            <StepperInput
              label="KfW Tilgung (%)"
              value={formData.kfw_tilg || 3.0}
              onChange={(v) => onFieldChange('kfw_tilg', v)}
              step={0.1}
              isPercent={true}
            />
          </div>
          <StepperInput
            label="KfW Tilgungszuschuss (€)"
            value={formData.kfw_grant || 0}
            onChange={(v) => onFieldChange('kfw_grant', v)}
            step={1000}
            isCurrency={true}
          />
        </SubContainerCard>
      </MainCard>

      {/* HAUPTBEREICH 4: AFA, STEUERN & WERTENTWICKLUNG */}
      <MainCard
        title="4. AfA, Steuern & Wertentwicklung"
        isOpen={openSections.steuer}
        onToggle={() => toggleSection('steuer')}
      >
        <div>
          <label style={labelStyle}>AfA-Modell (Abschreibung)</label>
          <div style={selectContainerStyle}>
            <select
              value={formData.afa_model || 'Linear Standard'}
              onChange={(e) => onFieldChange('afa_model', e.target.value)}
              style={selectStyle}
            >
              <option value="Linear Standard">Linear Standard (2.0 % p.a.)</option>
              <option value="Linear Neubau">Linear Neubau (3.0 % p.a.)</option>
              <option value="Degressiv">Degressiv (§ 7 Abs. 5a - 5.0 %)</option>
              <option value="Kombination: Degressiv + Sonder-AfA">Degressiv + Sonder-AfA § 7b (5.0 % + 5.0 %)</option>
              <option value="Denkmalgeschützt">Denkmalgeschützt (§ 7h/7i)</option>
            </select>
            <ChevronIcon isOpen={true} isSelect={true} />
          </div>
        </div>

        <StepperInput
          label="Individueller Grenzsteuersatz (%)"
          value={formData.tax_rate_pct || 42.0}
          onChange={(v) => onFieldChange('tax_rate_pct', v)}
          step={0.5}
          isPercent={true}
        />

        <div style={grid2Style}>
          <StepperInput
            label="Mietsteigerung (% p.a.)"
            value={formData.miet_inc || 1.0}
            onChange={(v) => onFieldChange('miet_inc', v)}
            step={0.1}
            isPercent={true}
          />
          <StepperInput
            label="Kostensteigerung (% p.a.)"
            value={formData.cost_inc || 2.0}
            onChange={(v) => onFieldChange('cost_inc', v)}
            step={0.1}
            isPercent={true}
          />
        </div>

        <div style={grid2Style}>
          <StepperInput
            label="Wertsteigerung (% p.a.)"
            value={formData.val_inc || 1.0}
            onChange={(v) => onFieldChange('val_inc', v)}
            step={0.1}
            isPercent={true}
          />
          <StepperInput
            label="Exit-Kosten bei Verkauf (%)"
            value={formData.exit_cost || 0.0}
            onChange={(v) => onFieldChange('exit_cost', v)}
            step={0.5}
            isPercent={true}
          />
        </div>

        {/* UNTERBEREICH 3: CAPEX PLANUNG */}
        <SubContainerCard
          title="CapEx & Instandhaltungs-Fahrplan"
          isOpen={openSubSections.capex}
          onToggle={() => toggleSubSection('capex')}
        >
          {capexList && capexList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {capexList.map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={row.year || row.jahr || 1}
                    onChange={(e) => handleCapexChange && handleCapexChange(idx, 'year', parseInt(e.target.value, 10))}
                    placeholder="Jahr"
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
                    ×
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

      {/* BUTTON: INVESTITION ANALYSIEREN */}
      <button
        type="submit"
        disabled={loading}
        onClick={() => {
          setTimeout(() => {
            const el = document.getElementById('executive-dashboard-view');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
        style={{
          padding: '1rem',
          background: '#13381A',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1.05rem',
          fontWeight: '900',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 14px rgba(19,56,26,0.25)',
          marginTop: '0.5rem'
        }}
      >
        {loading ? 'Berechne Investment...' : 'Investition analysieren →'}
      </button>

    </div>
  );
}

// -----------------------------------------------------------------------------
// HELPER COMPONENTS & STYLES (ORIGINAL STANDARDS)
// -----------------------------------------------------------------------------

function MainCard({ title, isOpen, onToggle, children }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #E2D9CE',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      overflow: 'hidden'
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          background: 'white'
        }}
      >
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#13381A' }}>
          {title}
        </h4>
        <ChevronIcon isOpen={isOpen} />
      </div>

      {isOpen && (
        <div style={{
          padding: '0 1.25rem 1.25rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SubContainerCard({ title, isOpen, onToggle, children }) {
  return (
    <div style={{
      background: '#FAF8F5',
      border: '1px solid #E2D9CE',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          fontWeight: '800',
          fontSize: '0.85rem',
          color: '#13381A'
        }}
      >
        <span>{title}</span>
        <ChevronIcon isOpen={isOpen} />
      </div>

      {isOpen && (
        <div style={{
          padding: '12px 14px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderTop: '1px solid #E2D9CE'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ isOpen, isSelect = false }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#718096"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        position: isSelect ? 'absolute' : 'static',
        right: isSelect ? '12px' : 'auto',
        pointerEvents: isSelect ? 'none' : 'auto',
        transform: isOpen && !isSelect ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
        flexShrink: 0
      }}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#4A5568',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  height: '42px',
  padding: '0 12px',
  borderRadius: '8px',
  border: '1px solid #CBD5E0',
  fontSize: '0.9rem',
  fontWeight: '500',
  outline: 'none',
  background: 'white',
  boxSizing: 'border-box',
  color: '#2D3748'
};

const selectContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%'
};

const selectStyle = {
  width: '100%',
  height: '42px',
  padding: '0 36px 0 12px',
  borderRadius: '8px',
  border: '1px solid #CBD5E0',
  fontSize: '0.9rem',
  fontWeight: '500',
  outline: 'none',
  background: 'white',
  boxSizing: 'border-box',
  color: '#2D3748',
  appearance: 'none',
  cursor: 'pointer'
};

const grid2Style = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem'
};

const infoBoxStyle = {
  background: '#FAF8F5',
  border: '1px solid #E2D9CE',
  borderRadius: '8px',
  padding: '12px 14px',
  fontSize: '0.85rem',
  color: '#13381A'
};
