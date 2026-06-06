import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';
import SectionTitleWithToggle from './SectionTitleWithToggle';
import Icons from '../../utils/icons';
import styles from '../../styles';

export default function ColoniaPanel({ filters, updateFilter, togglePolygonLayer }) {
  const [selectedAlcaldia, setSelectedAlcaldia] = useState('');
  const [selectedSector,   setSelectedSector]   = useState('');
  const [checkedColonias,  setCheckedColonias]  = useState([]);
  const [allAlcaldias,     setAllAlcaldias]     = useState([]);
  const [availSectores,    setAvailSectores]    = useState([]);
  const [availColonias,    setAvailColonias]    = useState([]);
  const [search,           setSearch]           = useState('');

  // Sincronizar desde filtros globales
  useEffect(() => { setSelectedAlcaldia(filters.alcaldias[0] ?? ''); }, [filters.alcaldias]);
  useEffect(() => { setSelectedSector(filters.sectores[0] ?? '');    }, [filters.sectores]);

  // Carga inicial / cambio C2
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.c2.length) params.set('c2', filters.c2.join(','));
    fetch(`${API_BASE}/filtros/opciones?${params}`)
      .then(r => r.json())
      .then(d => { setAllAlcaldias(d.alcaldias || []); setAvailSectores(d.sectores || []); setAvailColonias(d.colonias || []); })
      .catch(console.error);
  }, [filters.c2]);

  // Cambio alcaldía → sectores
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAlcaldia) params.set('alcaldias', selectedAlcaldia);
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json()).then(d => setAvailSectores(d.sectores)).catch(console.error);
  }, [selectedAlcaldia]);

  // Cambio alcaldía o sector → colonias
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAlcaldia) params.set('alcaldias', selectedAlcaldia);
    if (selectedSector)   params.set('sectores',  selectedSector);
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json()).then(d => setAvailColonias(d.colonias)).catch(console.error);
  }, [selectedAlcaldia, selectedSector]);

  const handleAlcaldiaChange = (e) => {
    const v = e.target.value;
    setSelectedAlcaldia(v); setSelectedSector(''); setCheckedColonias([]);
    updateFilter('alcaldias', v ? [v] : []); updateFilter('sectores', []); updateFilter('colonias', []);
  };
  const handleSectorChange = (e) => {
    const v = e.target.value;
    setSelectedSector(v); setCheckedColonias([]);
    updateFilter('sectores', v ? [v] : []); updateFilter('colonias', []);
  };
  const toggleColonia = (col) => {
    const next = checkedColonias.includes(col) ? checkedColonias.filter(c => c !== col) : [...checkedColonias, col];
    setCheckedColonias(next); updateFilter('colonias', next);
  };
  const handleClear = () => {
    setSelectedAlcaldia(''); setSelectedSector(''); setCheckedColonias([]); setSearch('');
    updateFilter('alcaldias', []); updateFilter('sectores', []); updateFilter('colonias', []);
    fetch(`${API_BASE}/filtros/opciones`).then(r => r.json()).then(d => { setAvailSectores(d.sectores); setAvailColonias(d.colonias); });
  };

  const displayed = availColonias.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.panelSection}>
      <SectionTitleWithToggle title="Colonias" isChecked={filters.polygons.colonias} onToggle={() => togglePolygonLayer('colonias')} />

      <div style={styles.inputGroup}>
        <label style={styles.inputLabel}>Alcaldía</label>
        <select style={styles.textInput} value={selectedAlcaldia} onChange={handleAlcaldiaChange}>
          <option value="">Todas</option>
          {allAlcaldias.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.inputLabel}>Sector</label>
        <select style={styles.textInput} value={selectedSector} onChange={handleSectorChange}>
          <option value="">Todos</option>
          {availSectores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={styles.divider} />

      <div style={styles.inputGroup}>
        <label style={styles.inputLabel}>Seleccionar Colonias ({checkedColonias.length})</label>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>{Icons.search}</span>
          <input type="text" placeholder="Buscar colonia..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
        </div>
      </div>

      <div style={{ ...styles.alcaldiasList, maxHeight: 200, backgroundColor: '#fafafa', padding: 8, borderRadius: 8, border: '1px solid #eee' }}>
        {displayed.length > 0 ? displayed.map(col => (
          <label key={col} style={styles.checkboxItem}>
            <input type="checkbox" checked={checkedColonias.includes(col)} onChange={() => toggleColonia(col)} style={styles.checkbox} />
            <span style={{ ...styles.checkboxLabel, fontSize: 12 }}>{col}</span>
          </label>
        )) : <div style={{ padding: 10, textAlign: 'center', color: '#999', fontSize: 12 }}>No se encontraron colonias</div>}
      </div>

      <div style={styles.divider} />
      <button onClick={handleClear} style={styles.clearBtn}>Limpiar filtros</button>
    </div>
  );
}