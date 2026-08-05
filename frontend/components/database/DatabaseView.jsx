'use client';
import { IconFolder, IconRefresh, IconTrash } from '../ui/Icons';
import { formatEuroInt, formatPct } from '../../utils/formatters';

export default function DatabaseView({
  loadingDb,
  dbProperties,
  fetchDatabaseProperties,
  loadPropertyFromDb,
  deletePropertyFromDb
}) {
  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D9CE' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#13381A' }}>Objekt Datenbank & Pipeline</h2>
        <button onClick={fetchDatabaseProperties} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#FAF8F5', border: '1px solid #E2D9CE', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <IconRefresh /> Aktualisieren
        </button>
      </div>

      {loadingDb ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Lade Objekte aus Supabase...</div>
      ) : dbProperties.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#888', border: '2px dashed #E2D9CE', borderRadius: '8px' }}>
          Noch keine Objekte in der Datenbank gespeichert.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#FAF8F5', borderBottom: '2px solid #E2D9CE' }}>
                <th style={{ padding: '12px' }}>Objektname</th>
                <th style={{ padding: '12px' }}>Typ</th>
                <th style={{ padding: '12px' }}>Ort</th>
                <th style={{ padding: '12px' }}>Kaufpreis</th>
                <th style={{ padding: '12px' }}>Wohnfläche</th>
                <th style={{ padding: '12px' }}>IRR Rendite</th>
                <th style={{ padding: '12px' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {dbProperties.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid #E2D9CE' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#13381A' }}>{item.name || item.obj_name || item.form_data?.obj_name}</td>
                  <td style={{ padding: '12px' }}>{item.objektart || item.form_data?.objektart}</td>
                  <td style={{ padding: '12px' }}>{item.stadt || item.form_data?.stadt}</td>
                  <td style={{ padding: '12px' }}>{formatEuroInt(item.kaufpreis || item.form_data?.kaufpreis)} €</td>
                  <td style={{ padding: '12px' }}>{item.qm || item.form_data?.qm} m²</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#A37841' }}>
                    {item.irr ? formatPct(item.irr * 100) + ' %' : '–'}
                  </td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => loadPropertyFromDb(item)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#13381A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <IconFolder /> In Analyse laden
                    </button>
                    <button onClick={() => deletePropertyFromDb(item.id)} style={{ padding: '6px 10px', background: '#FFF5F5', color: '#9B2C2C', border: '1px solid #FEB2B2', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
