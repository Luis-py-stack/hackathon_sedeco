export const API_BASE = '/api';

export const ALCALDIAS = [
  'AZCAPOTZALCO', 'ALVARO OBREGON', 'BENITO JUAREZ', 'COYOACAN',
  'CUAJIMALPA', 'CUAUHTEMOC', 'GUSTAVO A. MADERO', 'IZTACALCO',
  'IZTAPALAPA', 'MAGDALENA CONTRERAS', 'MIGUEL HIDALGO', 'MILPA ALTA',
  'TLAHUAC', 'TLALPAN', 'VENUSTIANO CARRANZA', 'XOCHIMILCO',
];

export const C2_OPTIONS = [
  'CENTRO HISTORICO', 'ORIENTE', 'NORTE', 'SUR', 'CENTRO', 'PONIENTE', 'CEDA',
];

export const MAPTILER_KEY = 'OYnxwS1WRkqh1lkgws7H';

export const MAP_STYLES = [
  { id: 'positron', name: 'Claro',         url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
  { id: 'dark',     name: 'Oscuro',        url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
  { id: 'voyager',  name: 'Navegación',    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
  { id: 'satellite',name: 'Satélite',      url: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}` },
  { id: 'osm',      name: 'OpenStreetMap', url: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_KEY}` },
];

// Campo del GeoJSON usado como nombre del territorio y su etiqueta de tipo
export const LAYER_FIELD_MAP = {
  alcaldias:       { field: 'ALCALDIA',   label: 'Alcaldía' },
  c2:              { field: 'ZONA',       label: 'C2' },
  sectores:        { field: 'SECTOR',     label: 'Sector' },
  colonias:        { field: 'NOM_ASENTA', label: 'Colonia' },
  cuadrantes:      { field: 'CVE_CUADRA', label: 'Cuadrante' },
  territorios_paz: { field: 'NOMBRE',     label: 'Territorio de Paz' },
  Mercados:        { field: 'NOMBRE_POI', label: 'Mercado' },
  Panteones:       { field: 'PANTEONES_POI_NOMBRE_POI', label: 'Panteón' },
  Media_Superior:  { field: 'NOMBRE_POI', label: 'Institución de Media Superior' },
};

// Colores de cada capa (deben coincidir con los usados en MapLibre)
export const LAYER_COLORS = {
  c2:              '#9F2241',
  alcaldias:       '#55e75c',
  sectores:        '#bf6ce2',
  colonias:        '#cc7290',
  cuadrantes:      '#4FC3F7',
  territorios_paz: '#FFD700',
  Mercados:        '#ef451f',
  Panteones:       '#494a4b',
  Media_Superior:  '#0f2391',
};