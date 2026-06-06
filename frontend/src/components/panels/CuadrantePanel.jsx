import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';
import SectionTitleWithToggle from './SectionTitleWithToggle';
import Icons from '../../utils/icons';
import styles from '../../styles';

export default function CuadrantePanel({ filters, updateFilter, togglePolygonLayer }) {
  const [selectedAlcaldia,   setSelectedAlcaldia]   = useState('');
  const [selectedSector,     setSelectedSector]     = useState('');
  const [checkedCuadrantes,  setCheckedCuadrantes]  = useState([]);
  const [allAlcaldias,       setAllAlcaldias]       = useState([]);
  const [availSectores,      setAvailSectores]      = useState([]);
  const [availCuadrantes,    setAvailCuadrantes]    = useState([]);
  const [search,             setSearch]             = useState('');

  useEffect(() => { setSelectedAlcaldia(filters.alcaldias[0] ?? ''); }, [filters.alcaldias]);
  useEffect(() => { setSelectedSector(filters.sectores[0] ?? '');    }, [filters.sectores]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.c2.length) params.set('c2', filters.c2.join(','));
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json())
      .then(d => { setAllAlcaldias(d.alcaldias || []); setAvailSectores(d.sectores || []); setAvailCuadrantes(d.cuadrantes || []); })
      .catch(console.error);
  }, [filters.c2]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAlcaldia) params.set('alcaldias', selectedAlcaldia);
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json()).then(d => setAvailSectores(d.sectores)).catch(console.error);
  }, [selectedAlcaldia]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAlcaldia) params.set('alcaldias', selectedAlcaldia);
    if (selectedSector)   params.set('sectores',  selectedSector);
    fetch(`${API_BASE}/filtros/opciones?${params}`).then(r => r.json()).then(d => setAvailCuadrantes(d.cuadrantes)).catch(console.error);
  }, [selectedAlcaldia, selectedSector]);

  const handleAlcaldiaChange = (e) => {
    const v = e.target.value;
    setSelectedAlcaldia(v); setSelectedSector(''); setCheckedCuadrantes([]);
    updateFilter('alcaldias', v ? [v] : []); updateFilter('sectores', []); updateFilter('cuadrantes', []);
  };
  const handleSectorChange = (e) => {
    const v = e.target.value;
    setSelectedSector(v); setCheckedCuadrantes([]);
    updateFilter('sectores', v ? [v] : []); updateFilter('cuadrantes', []);
  };
  const toggleCuadrante = (c) => {
    const next = checkedCuadrantes.includes(c) ? checkedCuadrantes.filter(x => x !== c) : [...checkedCuadrantes, c];
    setCheckedCuadrantes(next); updateFilter('cuadrantes', next);
  };
  const handleClear = () => {
    setSelectedAlcaldia(''); setSelectedSector(''); setCheckedCuadrantes([]); setSearch('');
    updateFilter('alcaldias', []); updateFilter('sectores', []); updateFilter('cuadrantes', []);
    fetch(`${API_BASE}/filtros/opciones`).then(r => r.json()).then(d => { setAvailSectores(d.sectores); setAvailCuadrantes(d.cuadrantes); });
  };

  const displayed = availCuadrantes.filter(id => id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.panelSection}>
      <SectionTitleWithToggle title="Cuadrantes" isChecked={filters.polygons.cuadrantes} onToggle={() => togglePolygonLayer('cuadrantes')} />

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
        <label style={styles.inputLabel}>Seleccionar Cuadrantes ({checkedCuadrantes.length})</label>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>{Icons.search}</span>
          <input type="text" placeholder="Buscar CVE..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
        </div>
      </div>

      <div style={{ ...styles.alcaldiasList, maxHeight: 200, backgroundColor: '#fafafa', padding: 8, borderRadius: 8, border: '1px solid #eee' }}>
        {displayed.length > 0 ? displayed.slice(0, 500).map(id => (
          <label key={id} style={styles.checkboxItem}>
            <input type="checkbox" checked={checkedCuadrantes.includes(id)} onChange={() => toggleCuadrante(id)} style={styles.checkbox} />
            <span style={{ ...styles.checkboxLabel, fontSize: 12 }}>{id}</span>
          </label>
        )) : <div style={{ padding: 10, textAlign: 'center', color: '#999', fontSize: 12 }}>No se encontraron cuadrantes</div>}
      </div>

      <div style={styles.divider} />
      <button onClick={handleClear} style={styles.clearBtn}>Limpiar filtros</button>
    </div>
  );
}