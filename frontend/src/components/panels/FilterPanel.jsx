import React, { useState, useEffect } from 'react';
import { ALCALDIAS, API_BASE } from '../../constants';
import SectionTitleWithToggle from './SectionTitleWithToggle';
import Icons from '../../utils/icons';
import styles from '../../styles';

export default function FilterPanel({ filters, updateFilter, togglePolygonLayer, clearFilters }) {
  const [searchTerm,        setSearchTerm]        = useState('');
  const [availableAlcaldias, setAvailableAlcaldias] = useState(ALCALDIAS);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.c2.length      > 0) params.set('c2',      filters.c2.join(','));
    if (filters.sectores.length > 0) params.set('sectores', filters.sectores.join(','));

    fetch(`${API_BASE}/filtros/opciones?${params}`)
      .then(r => r.json())
      .then(d => setAvailableAlcaldias(d.alcaldias?.length ? d.alcaldias : []))
      .catch(console.error);
  }, [filters.c2, filters.sectores]);

  const filtered = availableAlcaldias.filter(a =>
    a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.panelSection}>
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>{Icons.search}</span>
        <input
          type="text"
          placeholder="Buscar alcaldía..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <SectionTitleWithToggle
        title="Alcaldías"
        isChecked={filters.polygons.alcaldias}
        onToggle={() => togglePolygonLayer('alcaldias')}
      />

      <div style={styles.alcaldiasList}>
        {filtered.length > 0 ? filtered.map(alc => (
          <label key={alc} style={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={filters.alcaldias.includes(alc)}
              onChange={e => {
                const newValue = e.target.checked
                  ? [...filters.alcaldias, alc]
                  : filters.alcaldias.filter(a => a !== alc);
                updateFilter('alcaldias', newValue);
              }}
              style={styles.checkbox}
            />
            <span style={styles.checkboxLabel}>{alc}</span>
          </label>
        )) : (
          <div style={{ padding: 10, textAlign: 'center', color: '#999', fontSize: 13 }}>
            No hay alcaldías disponibles para el filtro seleccionado.
          </div>
        )}
      </div>

      <div style={styles.divider} />
      <button onClick={clearFilters} style={styles.clearBtn}>Limpiar todos los filtros</button>
    </div>
  );
}