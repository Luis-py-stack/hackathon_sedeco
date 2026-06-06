# Contexto del Proyecto: Numeralia C5

## Propósito

Plataforma de consulta cartográfica interactiva para visualizar la infraestructura de postes y cámaras del **Centro de Comando, Control, Cómputo, Comunicaciones y Contacto Ciudadano (C5)** de Ciudad de México. Permite filtrar, analizar y exportar datos geoespaciales de postes con equipamiento de vigilancia.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 + MapLibre GL 4 |
| Mapas | react-map-gl 7, @mapbox/mapbox-gl-draw |
| Análisis espacial | Turf.js |
| Gráficas | Recharts |
| UI | react-select, Font Awesome |
| Backend | FastAPI 0.109 + uvicorn |
| Datos | Pandas, GeoPandas, Shapely |
| Archivos | Excel (.xlsx), CSV, GeoPackage (.gpkg) |

---

## Arquitectura general

```
Frontend (Puerto 5173)          Proxy Vite              Backend (Puerto 8000)
┌─────────────────────┐         ┌──────────┐          ┌──────────────────┐
│  React Application  │         │          │          │   FastAPI API    │
│  - UI Components    │────────>│ /api --> │────────> │ - Endpoints      │
│  - Hooks de estado  │<────────│          │<─────────│ - Pandas/GeoPandas│
│  - MapLibre GL      │         │          │          │ - GeoJSON output │
└─────────────────────┘         └──────────┘          └──────────────────┘
                                                              │
                                                   ┌──────────────────────┐
                                                   │   Datos en disco     │
                                                   │ - numeralia_final.*  │
                                                   │ - *.gpkg por capa    │
                                                   └──────────────────────┘
```

El frontend llama URLs relativas `/api/...`; Vite las proxea a `localhost:8000` en desarrollo.

---

## Estructura de carpetas

```
numeralia-c5/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # Componente raíz, maneja estado global
│   │   ├── main.jsx                  # Entry point
│   │   ├── components/
│   │   │   ├── layout/               # Header, Toolbar, FloatingPanel
│   │   │   ├── map/MapView.jsx       # Mapa principal con MapLibre GL
│   │   │   └── panels/               # Paneles de filtros y funcionalidades
│   │   ├── hooks/                    # useCamaras, useStats, usePois, usePolygons, useFilter
│   │   ├── constants/index.js        # Colores, estilos, alcaldías, API_BASE
│   │   └── utils/
│   │       ├── mapExport.js          # Lógica de descarga HTML
│   │       └── mapTemplate.js        # Template HTML completo (string gigante)
│   └── vite.config.js                # Proxy /api → localhost:8000
│
├── backend/
│   ├── main.py                       # API FastAPI, toda la lógica del servidor
│   ├── requirements.txt
│   ├── data/
│   │   └── numeralia_final.xlsx/.csv # Dataset principal de postes
│   └── assets/
│       ├── poligonos/                # GeoPackages de capas administrativas
│       │   ├── alcaldias.gpkg
│       │   ├── c2.gpkg
│       │   ├── sectores.gpkg
│       │   ├── cuadrantes.gpkg
│       │   ├── colonias.gpkg
│       │   ├── territorios_paz.gpkg
│       │   └── POI/
│       │       ├── CAPAS_POIs.gpkg   # POIs del C5 (educación, salud, etc.)
│       │       ├── Mercados.gpkg
│       │       ├── Panteones.gpkg
│       │       └── MEDIA_SUPERIOR_PUBLICA.gpkg
│       └── mapas_html/               # Mapas pre-generados
│
└── Documentación/
    ├── DOCUMENTACION_TECNICA.md
    ├── DOCUMENTACION_FILTROS.md
    └── DOCUMENTACION_EXPORTACION_HTML.md
```

---

## Paneles disponibles (`frontend/src/components/panels/`)

| Panel | Función |
|-------|---------|
| `FilterPanel.jsx` | Filtro por Alcaldía (principal) + toggle límites |
| `C2Panel.jsx` | Filtro por Centro de Comando (C2) |
| `SectorPanel.jsx` | Filtro por Sector policial (cascada desde Alcaldía) |
| `ColoniaPanel.jsx` | Filtro por Colonia (cascada desde Sector/Alcaldía) |
| `CuadrantePanel.jsx` | Filtro por Cuadrante / CVE_CUADRA |
| `TerritoriosPazPanel.jsx` | Filtro por Territorios de Paz |
| `PoisPanel.jsx` | Selección de POIs con subfiltro por especialidad |
| `TablePanel.jsx` | Tabla de estadísticas con descarga CSV |
| `SearchByIdPanel.jsx` | Búsqueda de postes por ID_BCT_O |
| `MeasurementPanel.jsx` | Herramienta de medición (área, perímetro, distancia) |
| `DistancePanel.jsx` | Cálculo de distancias en el mapa |
| `FilterPolygonPanel.jsx` | Filtrado espacial por polígonos dibujados |
| `LayersPanel.jsx` | Toggle de visibilidad de capas |
| `MapStylePanel.jsx` | Cambio de estilo del mapa (Claro, Oscuro, Satélite, OSM) |
| `CoordinatesPanel.jsx` | Display de coordenadas del cursor |
| `UploadPanel.jsx` | Carga de archivos GeoPackage/Excel/CSV propios |

---

## Requerimiento funcional clave: Descarga de mapas en HTML

### Flujo completo

1. **Captura de estado** en `App.jsx` al pulsar el botón descargar:
   - `camarasData` — GeoJSON de postes filtrados
   - `polygonsData` — Polígonos de límites administrativos activos
   - `poisData` — Puntos de interés seleccionados
   - `drawnPolygon` — Geometría dibujada por el usuario
   - `mapStyle` — ID del estilo actual
   - `resumen` — Array de estadísticas de la tabla
   - `viewState` — Lat, lng, zoom actual

2. **`mapExport.js`** invoca `downloadMapHTML({...})`:
   - Obtiene el template desde `mapTemplate.js`
   - Reemplaza placeholders (`__CAMARAS_DATA__`, `__POIS_DATA__`, `__MAP_STYLE_URL__`, etc.) con `JSON.stringify(dato)`
   - Crea un `Blob` de tipo `text/html`
   - Dispara descarga automática via enlace temporal

3. **`mapTemplate.js`** contiene un string con HTML completo:
   - HTML: Header, sidebar, contenedor del mapa
   - CSS: Estilos embebidos, leyenda, tabla, rombos (◆) para POIs
   - JS: MapLibre GL puro, checkboxes de visibilidad, estadísticas

4. **El HTML generado es independiente** del servidor: usa CDNs para MapLibre GL y tiene todos los datos embebidos como JSON.

---

## Endpoints principales del backend

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/camaras` | GeoJSON de postes con filtros opcionales |
| GET | `/api/poligonos` | GeoJSON de polígonos de una capa específica |
| GET | `/api/pois/options` | Lista de tipos de POI disponibles |
| GET | `/api/pois/especialidades` | Especialidades por tipo de POI |
| GET | `/api/stats/resumen` | Estadísticas de postes/cámaras/fallas |
| GET | `/api/alcaldias` | Lista de alcaldías disponibles en el dataset |
| GET | `/api/sectores` | Sectores (filtrables por alcaldía) |
| GET | `/api/colonias` | Colonias (filtrables por sector/alcaldía) |
| POST | `/api/upload_base64` | Carga de GPKG/Excel/CSV del usuario |
| POST | `/api/universal_analyzer` | Análisis de portales CKAN de datos abiertos |

### Parámetros de `/api/camaras`

```
alcaldias       string  Comma-separated (ej. "IZTAPALAPA,COYOACAN")
tipos_poste     string  Comma-separated (ej. "9M,20M")
sectores        string  Comma-separated
colonias        string  Comma-separated
c2              string  Comma-separated
ids             string  IDs de postes específicos
territorios_paz string  Comma-separated
bbox            string  "minLng,minLat,maxLng,maxLat"
limit           int     Default 5000
```

---

## Flujo de datos y filtrado

### Filtrado server-side (por unidades administrativas)
```
Usuario interactúa con panel
    → updateFilter() en hook useFilter
    → Hook detecta cambio en filters
    → Llama GET /api/camaras?alcaldias=X&sectores=Y
    → Backend filtra DataFrame con pandas
    → Retorna GeoJSON filtrado
    → MapView renderiza nuevos postes
```

### Filtrado client-side (por polígono dibujado)
```
Usuario dibuja polígono en mapa
    → onUpdatePolygon() en App.jsx
    → Filtra rawCamarasData con @turf/boolean-point-in-polygon
    → camarasData = solo postes dentro del polígono
    → MapView y TablePanel se actualizan
```

### Filtrado de POIs
```
Usuario selecciona tipo de POI
    → updateFilter('selectedTypes', [...])
    → usePois() detecta cambio
    → GET /api/poligonos?layer=CAPAS_POIs&filter_vals=EDUCACION%20PUBLICA
    → Backend filtra por columna POI + normaliza texto (sin acentos, uppercase)
    → Si hay especialidad: filtra además por columna ESPECIALID
    → Si hay polígono dibujado: aplica filtrado espacial adicional
    → MapView renderiza círculos de color por tipo de POI
```

---

## Estructura del dataset principal

**Archivo:** `backend/data/numeralia_final.xlsx` / `numeralia_final.csv`

Columnas relevantes por poste:

| Columna | Descripción |
|---------|-------------|
| `ID_BCT_O` | Identificador único del poste |
| `TIPO_POSTE` | Tipo: 9M, 20M, TOTEM, GABINETE, etc. |
| `ALCALDIA` | Alcaldía donde se ubica |
| `SECTOR` | Sector policial |
| `COLONIA` | Colonia |
| `NUMCAMS` | Número de cámaras en el poste |
| `NUMALT` | Número de altavoces |
| `BOTON` | "CON BOTON" o "SIN BOTON" |
| `ESTATUS_CA` | Estado de cámaras: "OK" / "NOK" |
| `ESTATUS_BO` | Estado de botón de auxilio |
| `ESTATUS_AL` | Estado de altavoces |

> **Nota:** Puede haber varias filas por poste (ej. TOTEMs con múltiples cámaras). Las estadísticas usan `drop_duplicates(subset=['ID_BCT_O'])` para contar postes únicos.

---

## Lógica de negocio relevante

### Normalización de texto (backend)
```python
def normalizar_texto(texto: str) -> str:
    texto_norm = unicodedata.normalize('NFD', texto)
    texto_limpio = "".join(c for c in texto_norm if unicodedata.category(c) != 'Mn')
    return texto_limpio.strip().upper()
```
Se usa para comparar nombres con/sin acentos en filtros de colonias, POIs, etc.

### Cálculo de estadísticas por tipo de poste
Por cada tipo (`9M`, `20M`, `TOTEM`, etc.):
- `num_postes`: conteo de IDs únicos
- `num_camaras`: suma de `NUMCAMS`
- `num_botones`: conteo donde `BOTON == 'CON BOTON'`
- `num_altavoces`: suma de `NUMALT`
- `fallas_camara`: conteo donde `ESTATUS_CA == 'NOK'`
- `fallas_boton`: conteo donde `ESTATUS_BO == 'NOK'`
- `fallas_altavoz`: conteo donde `ESTATUS_AL == 'NOK'`

### Colores de tipos de poste (frontend/constants)
```javascript
TIPO_POSTE_COLORS = {
  '9M':       '#00b300',  // verde
  '20M':      '#0066cc',  // azul
  'TOTEM':    '#cc0000',  // rojo
  'GABINETE': '#ff9900',  // naranja
  // ...
}
```

---

## Cómo correr el proyecto

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
# Disponible en http://localhost:5173
```

---

## Estado del proyecto (mayo 2026)

Funcionalidades completadas:
- Filtrado multi-nivel por unidades administrativas
- Visualización de POIs con subfiltros de especialidad
- Herramientas de medición y dibujo
- Tabla de estadísticas con descarga CSV
- Exportación de mapas a HTML autónomo e interactivo (mapa de calor de URLs externas incluido)
- Carga de datos propios (GeoPackage, Excel, CSV)
- Análisis de portales CKAN de datos abiertos

Commits recientes relevantes:
- `e8c338f` Mapa de calor de las URL externas
- `380bc91` Lectura de URLs y listado de datos a analizar
- `25bea52` Descarga de mapa casi completa (tabla resumen pendiente)
- `0f7e28f` Filtrado por sectorización y polígonos dibujados

---

## Documentación adicional disponible

- `Documentación/DOCUMENTACION_TECNICA.md` — Detalles de arquitectura
- `Documentación/DOCUMENTACION_FILTROS.md` — Lógica de filtros en cascada
- `Documentación/DOCUMENTACION_EXPORTACION_HTML.md` — Detalles de exportación HTML
