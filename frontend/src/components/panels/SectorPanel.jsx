import React, { useState, useEffect } from 'react';
import { ALCALDIAS, API_BASE } from '../../constants';
import SectionTitleWithToggle from './SectionTitleWithToggle';
import Icons from '../../utils/icons';
import styles from '../../styles';

export default function SectorPanel({ filters, updateFilter, togglePolygonLayer }) {
  const [availAlcaldias, setAvailAlcaldias] = useState(ALCALDIAS);
  const [selectedAlcaldia, setSelectedAlcaldia] = useState('');
  const [sectorOptions, setSectorOptions] = useState([]);
  const [search, setSearch] = useState('');

  const currentSectors = filters.sectores || [];

  // Alcaldías disponibles según C2
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.c2.length) params.set('c2', filters.c2.join(','));
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json())
      .then(d => { if (d.alcaldias) setAvailAlcaldias(d.alcaldias); })
      .catch(console.error);
  }, [filters.c2]);

  // Sectores disponibles según alcaldía y C2
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAlcaldia)  params.set('alcaldias', selectedAlcaldia);
    else if (filters.c2.length) params.set('c2', filters.c2.join(','));
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json())
      .then(d => setSectorOptions(d.sectores || []))
      .catch(console.error);
  }, [selectedAlcaldia, filters.c2]);

  const filtered = sectorOptions.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  const handleToggle = (sector) => {
    const next = currentSectors.includes(sector)
      ? currentSectors.filter(s => s !== sector)
      : [...currentSectors, sector];
    updateFilter('sectores', next);
  };

  const handleAlcaldiaChange = (e) => {
  const alc = e.target.value;
  setSelectedAlcaldia(alc);
  // Propagar al filtro global para que el endpoint de polígonos lo reciba
  updateFilter('alcaldias', alc ? [alc] : []);
};

  const handleClear = () => { updateFilter('sectores', []); setSearch(''); setSelectedAlcaldia(''); };

  return (
    <div style={styles.panelSection}>
      <SectionTitleWithToggle title="Sectores" isChecked={filters.polygons.sectores} onToggle={() => togglePolygonLayer('sectores')} />

      <div style={styles.inputGroup}>
        <label style={styles.inputLabel}>Filtrar por Alcaldía</label>
        <select style={styles.textInput} value={selectedAlcaldia} onChange={handleAlcaldiaChange}>
          <option value="">Todas</option>
          {availAlcaldias.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>{Icons.search}</span>
        <input type="text" placeholder="Buscar sector..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
      </div>

      <div style={styles.alcaldiasList}>
        {filtered.map(sec => {
          const isSelected = currentSectors.includes(sec);
          return (
            <div key={sec}
              style={{ ...styles.dropdownItem, backgroundColor: isSelected ? 'rgba(159,34,65,0.1)' : 'transparent', borderLeft: isSelected ? '4px solid #9F2241' : '4px solid transparent', fontWeight: isSelected ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 12 }}
              onClick={() => handleToggle(sec)}
            >
              <span>{sec}</span>
              {isSelected && <span style={{ color: '#9F2241' }}>✓</span>}
            </div>
          );
        })}
      </div>

      <div style={styles.divider} />
      <button onClick={handleClear} style={styles.clearBtn}>Limpiar filtro de sector</button>
    </div>
  );
}