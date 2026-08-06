'use client';
import StepperInput from '../../ui/StepperInput';
import { MainCard, SubContainerCard } from '../../ui/CollapsibleCard';
import { formatEuroInt } from '../../../utils/formatters';

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#4A5568', marginBottom: '6px' };
const inputStyle = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem', fontWeight: '500', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#2D3748' };
const grid2Style = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const infoBoxStyle = { background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '8px', padding: '12px 14px', fontSize: '0.85rem', color: '#13381A' };

export default function SectionBewirtschaftung({
  formData,
  isOpen,
  onToggle,
  openSubSections,
  toggleSubSection,
  onFieldChange,
  handleLocalIstMonat,
  handleLocalIstSqm,
  handleLocalZielMonat,
  handleLocalZielSqm,
  handleLocalHausgeldGesamt,
  handleLocalHausgeldNichtUmlegbar,
  grwtP,
  notarP,
  maklerP,
  sonstNk,
  displayNkTotal,
  displayGrwtEuro,
  displayNotarEuro,
  displayMaklerEuro
}) {
  return (
    <MainCard title="2. Bewirtschaftung & Nebenkosten" isOpen={isOpen} onToggle={onToggle}>
      <div style={grid2Style}>
        <StepperInput
          label="Ist-Kaltmiete (€ / Mo)"
          value={formData?.kaltmiete_monat || 0}
          onChange={handleLocalIstMonat}
          step={25}
          isCurrency={true}
        />
        <StepperInput
          label="Ist-Miete (€ / m²)"
          value={formData?.ist_sqm || 0}
          onChange={handleLocalIstSqm}
          step={0.5}
        />
      </div>

      <div style={grid2Style}>
        <StepperInput
          label="Ziel-Kaltmiete (€ / Mo)"
          value={formData?.target_monat || 0}
          onChange={handleLocalZielMonat}
          step={25}
          isCurrency={true}
        />
        <StepperInput
          label="Ziel-Miete (€ / m²)"
          value={formData?.target_sqm || 0}
          onChange={handleLocalZielSqm}
          step={0.5}
        />
      </div>

      <div>
        <label style={labelStyle}>Anpassung ab Jahr</label>
        <input
          type="number"
          step="1"
          min="1"
          value={formData?.adj_year || 1}
          onChange={(e) => onFieldChange('adj_year', parseInt(e.target.value, 10) || 1)}
          style={inputStyle}
        />
      </div>

      <StepperInput
        label="Hausgeld gesamt (€ / Mo)"
        value={formData?.hausgeld || 0}
        onChange={handleLocalHausgeldGesamt}
        step={10}
        isCurrency={true}
      />

      <SubContainerCard
        title="Nicht umlegbarer Anteil & Details"
        isOpen={openSubSections.hausgeld}
        onToggle={() => toggleSubSection('hausgeld')}
      >
        <StepperInput
          label="Nicht umlegbar (€ / Mo)"
          value={formData?.hausgeld_nicht_umlegbar || 0}
          onChange={handleLocalHausgeldNichtUmlegbar}
          step={5}
          isCurrency={true}
        />

        <div style={infoBoxStyle}>
          <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#13381A', marginBottom: '4px' }}>
            Faustformel (25 / 75 % Logik):
          </div>
          <div style={{ fontSize: '0.75rem', color: '#4A5568', lineHeight: '1.4' }}>
            Im Durchschnitt sind ca. 75 % des Hausgeldes umlagefähige Betriebskosten. Die verbleibenden 25 % (Instandhaltungsrücklage & Hausverwaltung) trägt der Eigentümer.
          </div>
        </div>
      </SubContainerCard>

      <div style={grid2Style}>
        <StepperInput
          label="Instandhaltung (€ / m² p.a.)"
          value={formData?.inst_sqm || 12}
          onChange={(v) => onFieldChange('inst_sqm', v)}
          step={1}
          tooltip="Orientiert sich standardmäßig am Baujahr und der Objektart."
        />

        <StepperInput
          label="Verwaltung (€ / Mo)"
          value={formData?.mgt_monat || 30}
          onChange={(v) => onFieldChange('mgt_monat', v)}
          step={5}
          isCurrency={true}
          tooltip="Orientiert sich standardmäßig am Baujahr und der Objektart."
        />
      </div>

      <div style={grid2Style}>
        <StepperInput
          label="Mietausfallwagnis (%)"
          value={formData?.vac_rate_pct || 2.0}
          onChange={(v) => onFieldChange('vac_rate_pct', v)}
          step={0.5}
          isPercent={true}
        />
        <StepperInput
          label="Sanierung / Umbau (€)"
          value={formData?.sanierung || 0}
          onChange={(v) => onFieldChange('sanierung', v)}
          step={1000}
          isCurrency={true}
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E2D9CE', margin: '0.25rem 0' }} />

      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#13381A' }}>
        Kaufnebenkosten Parameter
      </div>

      <div style={grid2Style}>
        <StepperInput
          label="Grunderwerbsteuer (%)"
          value={formData?.grwt_p ?? 5.0}
          onChange={(v) => onFieldChange('grwt_p', v)}
          step={0.25}
          isPercent={true}
        />
        <StepperInput
          label="Notar & Grundbuch (%)"
          value={formData?.notar_p ?? 2.0}
          onChange={(v) => onFieldChange('notar_p', v)}
          step={0.1}
          isPercent={true}
        />
      </div>

      <div style={grid2Style}>
        <StepperInput
          label="Maklercourtage (%)"
          value={formData?.makler_p ?? 3.57}
          onChange={(v) => onFieldChange('makler_p', v)}
          step={0.01}
          isPercent={true}
        />
        <StepperInput
          label="Sonstige Nebenkosten (€)"
          value={formData?.sonst_nk ?? 0}
          onChange={(v) => onFieldChange('sonst_nk', v)}
          step={250}
          isCurrency={true}
        />
      </div>

      <div style={infoBoxStyle}>
        <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '8px', borderBottom: '1px solid #E2D9CE', paddingBottom: '4px' }}>
          Kaufnebenkosten Gesamt: {formatEuroInt(displayNkTotal)} €
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#4A5568' }}>
          <div>• <strong>Grunderwerbsteuer ({grwtP}%):</strong> {formatEuroInt(displayGrwtEuro)} €</div>
          <div>• <strong>Notar & Grundbuch ({notarP}%):</strong> {formatEuroInt(displayNotarEuro)} €</div>
          <div>• <strong>Maklercourtage ({maklerP}%):</strong> {formatEuroInt(displayMaklerEuro)} €</div>
          {sonstNk > 0 && <div>• <strong>Sonstige Nebenkosten:</strong> {formatEuroInt(sonstNk)} €</div>}
        </div>
      </div>
    </MainCard>
  );
}
