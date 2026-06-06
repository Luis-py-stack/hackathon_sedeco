import { useState, useCallback } from 'react';

const INITIAL_FILTERS = {
  alcaldias:      [],
  sectores:       [],
  c2:             [],
  colonias:       [],
  cuadrantes:     [],
  territorios_paz:[],
  selectedTypes:  [],
  Mercados:       [],
  Panteones:      [],
  Media_Superior: [],
  spatialFilterPolygons: null,
  polygons: {
    alcaldias:       false,
    c2:              false,
    sectores:        false,
    cuadrantes:      false,
    colonias:        false,
    territorios_paz: false,
    Mercados:        false,
    Panteones:       false,
    Media_Superior:  false,
  },
};

export function useFilters() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const togglePolygonLayer = useCallback((layer) => {
    setFilters(prev => ({
      ...prev,
      polygons: { ...prev.polygons, [layer]: !prev.polygons[layer] },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const clearPoisFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: [], // Limpia el listado dinámico
      polygons: {
        ...prev.polygons,
        Mercados: false,
        Panteones: false,
        Media_Superior: false,
        Secundarias: false
      }
    }));
  }, []);

  return { filters, updateFilter, togglePolygonLayer, clearFilters, clearPoisFilters };
}