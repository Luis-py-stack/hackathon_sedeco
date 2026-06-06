import { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

export function usePois(poisFilters = {}) {
  const [data, setData] = useState({});
  const [menuOptions, setMenuOptions] = useState([]);
  const [especialidades, setEspecialidades] = useState({}); // ← nuevo estado

  // 1. Cargar las opciones del menú dinámico + especialidades
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Ambas peticiones en paralelo
        const [resOptions, resEsp] = await Promise.all([
          fetch(`${API_BASE}/pois/options`),
          fetch(`${API_BASE}/pois/especialidades`),  // ← nuevo
        ]);

        if (!resOptions.ok) throw new Error('Error al cargar opciones');
        if (!resEsp.ok) throw new Error('Error al cargar especialidades');

        const jsonOptions = await resOptions.json();
        const jsonEsp = await resEsp.json();

        setMenuOptions(jsonOptions.options);
        setEspecialidades(jsonEsp.especialidades);  // ← nuevo
      } catch (err) {
        console.error("Error cargando opciones de POI:", err);
      }
    };
    fetchOptions();
  }, []); // Solo se ejecuta una vez al montar

  // 2. Efecto para cargar los datos geográficos
  useEffect(() => {
    const staticLayers = ['Mercados', 'Panteones', 'Media_Superior']
      .filter(key => poisFilters[key]);

    const dynamicTypes = poisFilters.selectedTypes || [];

    staticLayers.forEach(async (layer) => {
      if (!poisFilters.polygons?.[layer] || data[layer]) return;
      try {
        const res = await fetch(`${API_BASE}/poligonos?layer=${layer}`);
        const geojson = await res.json();
        setData(prev => ({ ...prev, [layer]: geojson }));
      } catch (err) {
        console.error(`Error en fetch de ${layer}:`, err);
      }
    });

    const fetchDynamicPois = async () => {
      if (dynamicTypes.length === 0) {
        if (data['CAPAS_POIs']) {
          setData(prev => {
            const { CAPAS_POIs, ...rest } = prev;
            return rest;
          });
        }
        return;
      } 

      try {
        const filterVals = dynamicTypes.join(',');
        const alcParam = poisFilters.alcaldias?.length > 0
          ? `&alcaldias=${poisFilters.alcaldias.join(',')}`
          : '';
        const res = await fetch(`${API_BASE}/poligonos?layer=CAPAS_POIs&filter_vals=${filterVals}${alcParam}`);
        const geojson = await res.json();

        // ↓ Filtrar por ESPECIALID si hay selecciones activas
        const selectedEsp = poisFilters.selectedEspecialidades || {};
        const tiposConFiltro = Object.keys(selectedEsp).filter(
          tipo => selectedEsp[tipo]?.length > 0
        );

        const geojsonFiltrado = tiposConFiltro.length === 0
      ? geojson  // sin filtro de especialidad → devuelve todo
      : {
          ...geojson,
          features: geojson.features.filter(feature => {
            const poi = feature.properties?.POI?.toUpperCase();
            const esp = feature.properties?.ESPECIALID?.toUpperCase();

            // Si este tipo de POI tiene filtro activo, verificar que la especialidad esté seleccionada
            if (tiposConFiltro.includes(poi)) {
              return selectedEsp[poi].map(e => e.toUpperCase()).includes(esp);
            }
            // Si este tipo no tiene filtro de especialidad, pasa sin restricción
            return true;
          }),
        };


        setData(prev => ({ ...prev, ['CAPAS_POIs']: geojsonFiltrado }));
      } catch (err) {
        console.error("Error cargando CAPAS_POIs:", err);
      }
    };

    fetchDynamicPois();

    setData(prev => {
      const newData = { ...prev };
      let changed = false;
      Object.keys(prev).forEach(key => {
        if (['Mercados', 'Panteones', 'Media_Superior'].includes(key)) {
          if (!poisFilters.polygons?.[key]) {
            delete newData[key];
            changed = true;
          }
        }
        if (key === 'CAPAS_POIs' && (!poisFilters.selectedTypes || poisFilters.selectedTypes.length === 0)) {
          delete newData[key];
          changed = true;
        }
      });
      return changed ? newData : prev;
    });

  }, [JSON.stringify(poisFilters)]);

  return { data, menuOptions, especialidades }; // ← agrega especialidades al return
}