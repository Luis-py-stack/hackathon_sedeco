import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../constants';

const INITIAL_DATA = {
  alcaldias:       null,
  c2:              null,
  sectores:        null,
  cuadrantes:      null,
  colonias:        null,
  territorios_paz: null,
};

export function usePolygons(filters) {
  const [data, setData] = useState(INITIAL_DATA);

  const buildParams = useCallback((layer) => {
    const params = new URLSearchParams();
    params.set('layer', layer);
    if (filters.c2.length)              params.set('c2',              filters.c2.join(','));
    if (filters.alcaldias.length)       params.set('alcaldias',       filters.alcaldias.join(','));
    if (filters.sectores.length)        params.set('sectores',        filters.sectores.join(','));
    if (filters.colonias.length)        params.set('colonias',        filters.colonias.join(','));
    if (filters.cuadrantes.length)      params.set('cuadrantes',      filters.cuadrantes.join(','));
    if (filters.territorios_paz.length) params.set('territorios_paz', filters.territorios_paz.join(','));
    return params.toString();
  }, [
    filters.c2, filters.alcaldias, filters.sectores,
    filters.colonias, filters.cuadrantes, filters.territorios_paz,
  ]);

  useEffect(() => {
    const activeLayers = Object.entries(filters.polygons)
      .filter(([, isActive]) => isActive)
      .map(([layer]) => layer);

      console.log('activeLayers:', activeLayers); // ← ¿aparece 'cuadrantes'?

    // Fetch capas activas
    activeLayers.forEach(async (layer) => {
      try {
        const qs = buildParams(layer);
        console.log(`URL: ${API_BASE}/poligonos?${qs}`); // ← ¿qué URL construye?
        const res     = await fetch(`${API_BASE}/poligonos?${qs}`);

        if (!res.ok) {
            const text = await res.text();
            console.error(`[${layer}] HTTP ${res.status}:`, text);
            return;
        }
        const geojson = await res.json();
        setData(prev => ({ ...prev, [layer]: geojson }));
      } catch (err) {
        console.error(`usePolygons error [${layer}]:`, err);
      }
    });

    // Limpiar capas desactivadas
    Object.entries(filters.polygons)
      .filter(([, isActive]) => !isActive)
      .forEach(([layer]) => {
        setData(prev => prev[layer] !== null ? { ...prev, [layer]: null } : prev);
      });
  }, [
    filters.polygons, filters.c2, filters.alcaldias,
    filters.sectores, filters.colonias, filters.cuadrantes,
    filters.territorios_paz, buildParams,
  ]);

  return data;
}