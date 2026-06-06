import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';
import SectionTitleWithToggle from './SectionTitleWithToggle';
import Icons from '../../utils/icons';
import styles from '../../styles';

export default function TerritoriosPazPanel({ filters, updateFilter, togglePolygonLayer }) {
  const [selectedAlcaldia,      setSelectedAlcaldia]      = useState('');
  const [selectedSector,        setSelectedSector]        = useState('');
  const [checkedTerritorios,    setCheckedTerritorios]    = useState([]);
  const [allAlcaldias,          setAllAlcaldias]          = useState([]);
  const [availSectores,         setAvailSectores]         = useState([]);
  const [availTerritorios,      setAvailTerritorios]      = useState([]);
  const [search,                setSearch]                = useState('');

  // Carga inicial
  useEffect(() => {
    fetch(`${API_BASE}/filtros/opciones`).then(r => r.json())
      .then(d => { setAllAlcaldias(d.alcaldias); setAvailSectores(d.sectores); setAvailTerritorios(d.territorios_paz); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAlcaldia) params.set('alcaldias', selectedAlcaldia);
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json()).then(d => setAvailSectores(d.sectores)).catch(console.error);
  }, [selectedAlcaldia]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAlcaldia) params.set('alcaldias', selectedAlcaldia);
    if (selectedSector)   params.set('sectores',  selectedSector);
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json()).then(d => setAvailTerritorios(d.territorios_paz)).catch(console.error);
  }, [selectedAlcaldia, selectedSector]);

  const handleAlcaldiaChange = (e) => {
    const v = e.target.value;
    setSelectedAlcaldia(v); setSelectedSector(''); setCheckedTerritorios([]);
    updateFilter('alcaldias', v ? [v] : []); updateFilter('sectores', []); updateFilter('territorios_paz', []);
  };
  const handleSectorChange = (e) => {
    const v = e.target.value;
    setSelectedSector(v); setCheckedTerritorios([]);
    updateFilter('sectores', v ? [v] : []); updateFilter('territorios_paz', []);
  };
  const toggleTerritorio = (t) => {
    const next = checkedTerritorios.includes(t) ? checkedTerritorios.filter(x => x !== t) : [...checkedTerritorios, t];
    setCheckedTerritorios(next); updateFilter('territorios_paz', next);
  };
  const handleClear = () => {
    setSelectedAlcaldia(''); setSelectedSector(''); setCheckedTerritorios([]); setSearch('');
    updateFilter('alcaldias', []); updateFilter('sectores', []); updateFilter('territorios_paz', []);
    fetch(`${API_BASE}/filtros/opciones`).then(r => r.json())
      .then(d => { setAvailSectores(d.sectores); setAvailTerritorios(d.territorios_paz); });
  };

  const displayed = (availTerritorios || []).filter(t => t.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.panelSection}>
      <SectionTitleWithToggle title="Territorios de Paz" isChecked={filters.polygons.territorios_paz} onToggle={() => togglePolygonLayer('territorios_paz')} />

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
        <label style={styles.inputLabel}>Seleccionar Territorios ({checkedTerritorios.length})</label>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>{Icons.search}</span>
          <input type="text" placeholder="Buscar territorio..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
        </div>
      </div>

      <div style={{ ...styles.alcaldiasList, maxHeight: 200, backgroundColor: '#fafafa', padding: 8, borderRadius: 8, border: '1px solid #eee' }}>
        {displayed.length > 0 ? displayed.map(ter => (
          <label key={ter} style={styles.checkboxItem}>
            <input type="checkbox" checked={checkedTerritorios.includes(ter)} onChange={() => toggleTerritorio(ter)} style={styles.checkbox} />
            <span style={{ ...styles.checkboxLabel, fontSize: 12 }}>{ter}</span>
          </label>
        )) : <div style={{ padding: 10, textAlign: 'center', color: '#999', fontSize: 12 }}>No se encontraron territorios de paz</div>}
      </div>

      <div style={styles.divider} />
      <button onClick={handleClear} style={styles.clearBtn}>Limpiar filtros</button>
    </div>
  );
}