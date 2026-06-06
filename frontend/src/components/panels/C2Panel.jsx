import React, { useState, useEffect } from 'react';
import { C2_OPTIONS, API_BASE } from '../../constants';
import SectionTitleWithToggle from './SectionTitleWithToggle';
import styles from '../../styles';

const TERRITORIOS_C2 = {
  'CENTRO':          ['Cuauhtémoc'],
  'CENTRO HISTORICO':['Morelos', 'Centro', 'Alameda', 'Congreso'],
  'ORIENTE':         ['Iztapalapa', 'Milpa Alta', 'Tláhuac', 'Xochimilco'],
  'NORTE':           ['Venustiano Carranza', 'Iztacalco', 'Gustavo A. Madero'],
  'PONIENTE':        ['Álvaro Obregón', 'Azcapotzalco', 'Cuajimalpa', 'Magdalena Contreras', 'Miguel Hidalgo'],
  'SUR':             ['Benito Juárez', 'Coyoacán', 'Tlalpan'],
  'CEDA':            ['Central de Abasto'],
};

export default function C2Panel({ filters, updateFilter, togglePolygonLayer }) {
  const [availableC2, setAvailableC2] = useState(C2_OPTIONS);
  const [selectedC2,  setSelectedC2]  = useState(filters.c2 || []);

  useEffect(() => { setSelectedC2(filters.c2 || []); }, [filters.c2]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.alcaldias.length) params.set('alcaldias', filters.alcaldias.join(','));
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json())
      .then(d => { if (d.c2?.length) setAvailableC2(d.c2); })
      .catch(console.error);
  }, [filters.alcaldias]);

  const handleToggle = (c2) => {
    const next = selectedC2.includes(c2) ? selectedC2.filter(i => i !== c2) : [...selectedC2, c2];
    setSelectedC2(next); updateFilter('c2', next);
  };
  const handleClear = () => { setSelectedC2([]); updateFilter('c2', []); };

  return (
    <div style={styles.panelSection}>
      <SectionTitleWithToggle title="Búsqueda por C2" isChecked={filters.polygons.c2} onToggle={() => togglePolygonLayer('c2')} />

      <div style={styles.checkboxGrid}>
        {availableC2.map(c2 => (
          <label key={c2} style={styles.checkboxItem}>
            <input type="checkbox" checked={selectedC2.includes(c2)} onChange={() => handleToggle(c2)} style={styles.checkbox} />
            <span style={styles.checkboxLabel}>{c2}</span>
          </label>
        ))}
      </div>

      {selectedC2.length > 0 && (
        <>
          <div style={styles.divider} />
          <h4 style={styles.sectionTitle}>Territorios Abarcados</h4>
          <div style={{ fontSize: 12, color: '#555', paddingLeft: 4 }}>
            {selectedC2.map(c2 => (
              <div key={c2} style={{ marginBottom: 8 }}>
                <strong style={{ color: '#9F2241' }}>{c2}:</strong>
                <div style={{ marginLeft: 8, marginTop: 2 }}>
                  {TERRITORIOS_C2[c2]?.join(', ') ?? 'Sin información de territorios'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={styles.divider} />
      <button onClick={handleClear} style={styles.clearBtn}>Limpiar filtros</button>
    </div>
  );
}