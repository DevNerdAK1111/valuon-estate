'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard, SubContainerCard } from '../../ui/CollapsibleCard';
import { formatEuroInt } from '../../../utils/formatters';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#4A5568', marginBottom: '6px' };
const selectContainerStyle = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' };
const selectStyle = { width: '100%', height: '42px', padding: '0 28px 0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', fontWeight: '500', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748', cursor: 'pointer' };
const grid2Style = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

export default function SectionFinanzierung({
  formData,
  isOpen,
  onToggle,
  openSubSections,
  toggleSubSection,
  onFieldChange,
  isEkCoveringNk,
  displayNkTotal
}) {
  return (
    <MainCard title="3. Finanzierung & Eigenkapital" isOpen={isOpen} onToggle={onToggle}>
      <StepperInput
        label="Eigenkapital-Einsatz (€)"
        value={formData?.ek_euro || 0}
        onChange={(v) => onFieldChange('ek_euro', v)}
        step={2500}
        isCurrency={true}
      />

      <div style={{
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontWeight: '700',
        background: isEkCoveringNk ? '#F0FFF4' : '#FFF5F5',
        border: isEkCoveringNk ? '1px solid #C6F6D5' : '1px solid #FEB2B2',
        color: isEkCoveringNk ? '#22543D' : '#9B2C2C',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        <span style={{ fontSize: '1rem', lineHeight: '1.2' }}>{isEkCoveringNk ? '✓' : '⚠'}</span>
        <div>
          <div>
            {isEkCoveringNk
              ? `Eigenkapital deckt die Kaufnebenkosten (${formatEuroInt(displayNkTotal)} €) vollständig ab.`
              : `Eigenkapital deckt die Kaufnebenkosten (${formatEuroInt(displayNkTotal)} €) nicht vollständig ab.`}
          </div>
          <div style={{ fontWeight: 'normal', fontSize: '0.75rem', marginTop: '4px', opacity: 0.9 }}>
            {isEkCoveringNk
              ? 'Gute Voraussetzung für eine klassische 100%-Finanzierung des Kaufpreises durch die Bank.'
              : 'Hinweis: Müsste die Bank Kaufnebenkosten mitfinanzieren (> 100 % Beleihung), verlangen Kreditinstitute in der Regel Risikoaufschläge beim Sollzins sowie strengere Bonitätsanforderungen.'}
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Darlehensart</label>
        <div style={selectContainerStyle}>
          <select
            value={formData?.loan_type || 'Annuitätendarlehen'}
            onChange={(e) => onFieldChange('loan_type', e.target.value)}
            style={selectStyle}
          >
            <option value="Annuitätendarlehen">Annuitätendarlehen (Konstante Monatsrate)</option>
            <option value="Endfälliges Darlehen">Endfälliges Darlehen (Nur Zinszahlung)</option>
          </select>
        </div>
      </div>

      <div style={grid2Style}>
        <StepperInput
          label="Sollzins Hausbank (%)"
          value={formData?.hb_zins || 3.8}
          onChange={(v) => onFieldChange('hb_zins', v)}
          step={0.1}
          isPercent={true}
        />
        <StepperInput
          label="Anfängliche Tilgung (%)"
          value={formData?.hb_tilg || 2.0}
          onChange={(v) => onFieldChange('hb_tilg', v)}
          step={0.1}
          isPercent={true}
        />
      </div>

      <div style={grid2Style}>
        <StepperInput
          label="Tilgungsfreie Jahre"
          value={formData?.grace_years || 0}
          onChange={(v) => onFieldChange('grace_years', v)}
          step={1}
        />
        <StepperInput
          label="Zinsbindung (Jahre)"
          value={formData?.zinsbindung || 10}
          onChange={(v) => onFieldChange('zinsbindung', v)}
          step={1}
        />
      </div>

      <StepperInput
        label="Sondertilgung (€ / J.)"
        value={formData?.sondertilg || 0}
        onChange={(v) => onFieldChange('sondertilg', v)}
        step={500}
        isCurrency={true}
      />

      <SubContainerCard
        title="Anschlussfinanzierung (nach Zinsbindung)"
        isOpen={openSubSections.folgefinanzierung}
        onToggle={() => toggleSubSection('folgefinanzierung')}
      >
        <StepperInput
          label="Folgezins (%)"
          value={formData?.folge_zins || 3.8}
          onChange={(v) => onFieldChange('folge_zins', v)}
          step={0.1}
          isPercent={true}
        />
        <div>
          <label style={labelStyle}>Anschluss-Modus</label>
          <div style={selectContainerStyle}>
            <select
              value={formData?.folge_mode || 'Rate konstant halten (Annuität)'}
              onChange={(e) => onFieldChange('folge_mode', e.target.value)}
              style={selectStyle}
            >
              <option value="Rate konstant halten (Annuität)">Rate konstant halten (Annuität)</option>
              <option value="Neuer Tilgungssatz festlegen">Neuen Tilgungssatz festlegen</option>
            </select>
          </div>
        </div>

        {formData?.folge_mode !== 'Rate konstant halten (Annuität)' && (
          <StepperInput
            label="Folge-Tilgung (%)"
            value={formData?.folge_tilg || 2.0}
            onChange={(v) => onFieldChange('folge_tilg', v)}
            step={0.1}
            isPercent={true}
          />
        )}
      </SubContainerCard>

      <SubContainerCard
        title="KfW-Darlehen & Zuschüsse"
        isOpen={openSubSections.kfw}
        onToggle={() => toggleSubSection('kfw')}
      >
        <StepperInput
          label="KfW-Darlehensbetrag (€)"
          value={formData?.kfw_amt || 0}
          onChange={(v) => onFieldChange('kfw_amt', v)}
          step={5000}
          isCurrency={true}
        />
        <div style={grid2Style}>
          <StepperInput
            label="KfW Zins (%)"
            value={formData?.kfw_zins || 2.1}
            onChange={(v) => onFieldChange('kfw_zins', v)}
            step={0.1}
            isPercent={true}
          />
          <StepperInput
            label="KfW Tilgung (%)"
            value={formData?.kfw_tilg || 3.0}
            onChange={(v) => onFieldChange('kfw_tilg', v)}
            step={0.1}
            isPercent={true}
          />
        </div>
        <div style={grid2Style}>
          <StepperInput
            label="KfW Tilgungsfreie Jahre"
            value={formData?.kfw_grace_years || 0}
            onChange={(v) => onFieldChange('kfw_grace_years', v)}
            step={1}
          />
          <StepperInput
            label="KfW Tilgungszuschuss (€)"
            value={formData?.kfw_grant || 0}
            onChange={(v) => onFieldChange('kfw_grant', v)}
            step={1000}
            isCurrency={true}
          />
        </div>
      </SubContainerCard>
    </MainCard>
  );
}
