import React, { useState } from 'react';
import Icons from '../../utils/icons';
import styles from '../../styles';

const CATEGORY_ICONS = {
  "GOBIERNO Y SERVICIOS PUBLICOS": Icons.government,
  "SEGURIDAD Y EMERGENCIAS": Icons.security,
  "SALUD Y BIENESTAR": Icons.health,
  "EDUCACION Y CULTURA": Icons.education,
  "TRANSPORTE Y MOVILIDAD": Icons.transport,
  "COMERCIO Y ABASTO": Icons.commerce,
  "INFRAESTRUCTURA Y SERVICIOS BASICOS": Icons.services,
  "COMUNIDAD Y VIDA COTIDIANA": Icons.community,
  "EVENTOS Y REPRESENTACION INTERNACIONAL": Icons.globe,
};

const CATEGORIZED_POIS = {
  "GOBIERNO Y SERVICIOS PUBLICOS": ["C2", "COORDINACIONES TERRITORIALES", "DEFENSORIAS DE OFICIO", "INFRAESTRUCTURA SSC", "JUZGADOS CIVILES Y PENALES", "MINISTERIOS PUBLICOS", "MODULOS SSP", "OFICINAS DE GOBIERNO", "REGISTRO CIVIL", "TESORERIAS"],
  "SEGURIDAD Y EMERGENCIAS": ["BOMBEROS", "CUARTELES DE POLICIA AUXILIAR", "CUARTELES FGJ", "CENTRO DE ACOPIO EN CASO DE EMERGENCIAS", "RECLUSORIOS"],
  "SALUD Y BIENESTAR": ["CLINICA", "HOSPITALES", "ATENCION A VIOLENCIA DE LAS MUJERES", "MODULOS DE ATENCION AL ADULTO MAYOR", "SEDES 65 Y MAS"],
  "EDUCACION Y CULTURA": ["EDUCACION PUBLICA", "EDUCACION PRIVADA", "BIBLIOTECAS", "CASAS Y CENTROS DE LA CULTURA", "CINE", "FONOTECAS", "FOTOTECA", "GALERIAS", "MUSEOS Y TEATROS", "PILARES"],
  "TRANSPORTE Y MOVILIDAD": ["CABLEBUS", "CENTRAL CAMIONERA", "CETRAMS", "CICLOESTACIONES", "ESTACIONES DEL SISTEMA DE TRASPORTE COLECTIVO METRO", "METROBUS", "TREN LIGERO", "TURIBUS", "DEPOSITOS DE VEHICULOS", "VERIFICENTRO"],
  "COMERCIO Y ABASTO": ["BANCOS", "CENTROS COMERCIALES", "GASOLINERAS", "GASERA", "LECHERIA LICONSA", "MERCADOS", "OXXO", "TIENDAS DEPARTAMENTALES", "NOTARIAS"],
  "INFRAESTRUCTURA Y SERVICIOS BASICOS": ["CENTRO DE ATENCION CFE", "OFICINA DE SACMEX", "PRESAS Y VASOS DE REGULACION", "SUBESTACIONES ELECTRICAS", "ESPECTACULARES", "LUNAS"],
  "COMUNIDAD Y VIDA COTIDIANA": ["ALOJAMIENTO TEMPORAL", "COMEDORES COMUNITARIOS", "GUARDERIA", "IGLESIAS Y TEMPLOS", "PANTEONES", "PARQUES Y RECREACION", "CREMATORIOS"],
  "EVENTOS Y REPRESENTACION INTERNACIONAL": ["EVENTOS MASIVOS", "EMBAJADAS Y CONSULADOS"]
};
// Tipos que tienen subfilro por ESPECIALID
const TIPOS_CON_ESPECIALIDAD = ['EDUCACION PUBLICA', 'EDUCACION PRIVADA', 'TIENDAS DEPARTAMENTALES'];

// Mapeo: qué POIs tienen también capa de polígono y cuál es su key
const POLYGON_LAYER_MAP = {
  'MERCADOS': 'Mercados',
  'EDUCACION PUBLICA': 'Media_Superior',
  'PANTEONES': 'Panteones',
};

const PolygonBadge = () => (
  <span style={{
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#9F2241',
    border: '1px solid #9F2241',
    borderRadius: '3px',
    padding: '1px 4px',
    marginLeft: '4px',
    whiteSpace: 'nowrap',
    letterSpacing: '0.3px',
  }}>
    POLÍGONO
  </span>
);

export default function PoisPanel({ filters, togglePolygonLayer, updateFilter, menuOptions, clearPoisFilters, especialidades = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListadoOpen, setIsListadoOpen] = useState(true);
  const [openEspecialidades, setOpenEspecialidades] = useState({});

  const handleDynamicChange = (type) => {
    const currentSelected = filters.selectedTypes || [];
    const nextSelected = currentSelected.includes(type)
      ? currentSelected.filter(item => item !== type)
      : [...currentSelected, type];
    updateFilter('selectedTypes', nextSelected);

    // Si se desactiva el POI, cerramos su desplegable
      if (currentSelected.includes(type)) {
        setOpenEspecialidades(prev => ({ ...prev, [type]: false }));
      }
    };
    
    // ↓ Toggle del desplegable de especialidades
    const toggleEspecialidadOpen = (type) => {
      setOpenEspecialidades(prev => ({ ...prev, [type]: !prev[type] }));
    };

    // ↓ Manejo de selección individual de especialidad
    const handleEspecialidadChange = (tipo, especialidad) => {
      const current = filters.selectedEspecialidades?.[tipo] || [];
      const next = current.includes(especialidad)
        ? current.filter(e => e !== especialidad)
        : [...current, especialidad];
      updateFilter('selectedEspecialidades', {
        ...filters.selectedEspecialidades,
        [tipo]: next,
      });
    };

  // ↓ Seleccionar/deseleccionar todas las especialidades de un tipo
  const handleTodasEspecialidades = (tipo, opciones) => {
    const current = filters.selectedEspecialidades?.[tipo] || [];
    const next = current.length === opciones.length ? [] : [...opciones];
    updateFilter('selectedEspecialidades', {
      ...filters.selectedEspecialidades,
      [tipo]: next,
    });
  };
  
  const handleClear = () => {
    clearPoisFilters();
  };
   return (
    <div style={{ padding: '15px', color: '#6e5e5e', fontFamily: 'sans-serif' }}>

      {/* Buscador */}
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>{Icons.search}</span>
        <input
          type="text"
          placeholder="Buscar POI"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Listado unificado */}
      <div
        onClick={() => setIsListadoOpen(!isListadoOpen)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Listado de POIS</p>
        <span style={{ fontSize: '10px' }}>{isListadoOpen ? '▲' : '▼'}</span>
      </div>

      {isListadoOpen && (
        <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '5px' }}>
          {Object.entries(CATEGORIZED_POIS).map(([category, items]) => {
            const matches = items.filter(item =>
              item.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matches.length === 0) return null;

            return (
              <div key={category} style={{ marginBottom: '15px' }}>
                {/* Encabezado de categoría */}
                <div style={{
                  fontSize: '11px', fontWeight: 'bold', color: '#9F2241',
                  borderBottom: '1px solid #eee', paddingBottom: '3px',
                  marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  {CATEGORY_ICONS[category]}
                  {category}
                </div>

                {/* Items */}
                {matches.map((type) => {
                  const polygonKey = POLYGON_LAYER_MAP[type];
                  const isPolygon = !!polygonKey;
                  const tieneEspecialidad = TIPOS_CON_ESPECIALIDAD.includes(type);
                  const isChecked = (filters.selectedTypes || []).includes(type);
                  const isEspOpen = openEspecialidades[type] || false;
                  const opcionesEsp = especialidades[type] || [];
                  const selectedEsp = filters.selectedEspecialidades?.[type] || [];
                  const todasSeleccionadas = opcionesEsp.length > 0 && selectedEsp.length === opcionesEsp.length;

                  return (
                    <div key={type} style={{ marginBottom: '8px' }}>

                      {/* Fila principal: checkbox + label + flecha */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleDynamicChange(type)}
                          />
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {type}
                            {isPolygon && <PolygonBadge />}
                          </span>
                        </label>

                        {/* Flecha solo si: tiene especialidades, está activado y hay datos */}
                        {tieneEspecialidad && isChecked && opcionesEsp.length > 0 && (
                          <span
                            onClick={() => toggleEspecialidadOpen(type)}
                            style={{ fontSize: '10px', cursor: 'pointer', padding: '2px 6px', color: '#9F2241' }}
                          >
                            {isEspOpen ? '▲' : '▼'}
                          </span>
                        )}
                      </div>

                      {/* Capa de polígono (indentada) */}
                      {isPolygon && (
                        <label style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          fontSize: '11px', color: '#9F2241', cursor: 'pointer',
                          paddingLeft: '23px', marginTop: '3px',
                        }}>
                          <input
                            type="checkbox"
                            checked={!!filters.polygons[polygonKey]}
                            onChange={() => togglePolygonLayer(polygonKey)}
                          />
                          Ver como capa de polígono
                        </label>
                      )}

                      {/* Desplegable de especialidades */}
                      {tieneEspecialidad && isChecked && isEspOpen && opcionesEsp.length > 0 && (
                        <div style={{
                          paddingLeft: '23px',
                          marginTop: '6px',
                          marginLeft: '6px',
                          borderLeft: '2px solid #eee',
                        }}>
                          {/* Opción "Todas" */}
                          <label style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '12px', marginBottom: '5px', cursor: 'pointer',
                            color: '#9F2241', fontWeight: 'bold',
                          }}>
                            <input
                              type="checkbox"
                              checked={todasSeleccionadas}
                              onChange={() => handleTodasEspecialidades(type, opcionesEsp)}
                            />
                            Todas
                          </label>

                          {/* Lista de especialidades */}
                          {opcionesEsp.map(esp => (
                            <label key={esp} style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              fontSize: '12px', marginBottom: '4px', cursor: 'pointer',
                            }}>
                              <input
                                type="checkbox"
                                checked={selectedEsp.includes(esp)}
                                onChange={() => handleEspecialidadChange(type, esp)}
                              />
                              {esp}
                            </label>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            );
          })}

          {Object.values(CATEGORIZED_POIS).flat().filter(i =>
            i.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && (
            <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>No se encontraron resultados</p>
          )}
        </div>
      )}

      {/* Limpiar */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleClear}
          style={{
            width: '100%', padding: '10px',
            backgroundColor: '#9F2241', color: 'white',
            border: 'none', borderRadius: '5px',
            fontWeight: 'bold', cursor: 'pointer',
            fontSize: '13px', transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#7d1b33'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#9F2241'}
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );


}