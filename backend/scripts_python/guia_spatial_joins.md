# Guia Completa de Spatial Joins

## Tabla de contenidos

1. [Que es un Spatial Join](#que-es-un-spatial-join)
2. [Conceptos previos fundamentales](#conceptos-previos-fundamentales)
3. [Como funcionan los Spatial Joins](#como-funcionan-los-spatial-joins)
4. [Tipos de predicados espaciales](#tipos-de-predicados-espaciales)
5. [Tipos de join (how)](#tipos-de-join-how)
6. [Herramientas necesarias](#herramientas-necesarias)
7. [Como se usaron en este proyecto](#como-se-usaron-en-este-proyecto)
8. [Ejemplos practicos paso a paso](#ejemplos-practicos-paso-a-paso)
9. [Errores comunes y como evitarlos](#errores-comunes-y-como-evitarlos)
10. [Recursos adicionales](#recursos-adicionales)

---

## Que es un Spatial Join

Un **spatial join** (unión espacial) es una operación que combina dos conjuntos de datos geográficos basándose en su **relación espacial** (ubicación geográfica), en lugar de una columna clave como en un join tradicional de SQL o pandas.

### Analogia simple

Imagina que tienes:
- Una lista de **restaurantes** con sus coordenadas (puntos)
- Un mapa de **colonias** dibujadas como polígonos

Un spatial join te permite responder: **"¿En qué colonia está cada restaurante?"** — sin necesidad de que ambos datasets compartan una columna en común. La relación se determina por la **geometría**: si el punto del restaurante cae **dentro** del polígono de la colonia.

### Comparacion con un join tradicional

| Aspecto | Join tradicional (pandas) | Spatial Join (geopandas) |
|---|---|---|
| **Base de la unión** | Columna clave compartida | Relación geométrica (ubicación) |
| **Ejemplo** | `merge(df1, df2, on="id")` | `sjoin(gdf1, gdf2, predicate="within")` |
| **Requisito** | Valores iguales en columna | Geometrías que se relacionan espacialmente |
| **Datos necesarios** | Cualquier DataFrame | GeoDataFrames con columna `geometry` |

---

## Conceptos previos fundamentales

### 1. GeoDataFrame

Un `GeoDataFrame` es un DataFrame de pandas que tiene una columna especial llamada `geometry` que almacena formas geométricas (puntos, líneas, polígonos).

```python
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

# Crear un GeoDataFrame a partir de coordenadas
df = pd.DataFrame({
    "nombre": ["Camara 1", "Camara 2"],
    "latitud": [19.4326, 19.4000],
    "longitud": [-99.1332, -99.1500]
})

gdf = gpd.GeoDataFrame(
    df,
    geometry=[Point(lon, lat) for lon, lat in zip(df["longitud"], df["latitud"])],
    crs="EPSG:4326"  # Sistema de coordenadas WGS84
)

print(gdf)
#     nombre   latitud  longitud                   geometry
# 0  Camara 1  19.4326  -99.1332  POINT (-99.1332 19.4326)
# 1  Camara 2  19.4000  -99.1500  POINT (-99.1500 19.4000)
```

### 2. Tipos de geometria

| Tipo | Descripcion | Ejemplo |
|---|---|---|
| **Point** | Un punto en el espacio (x, y) | Ubicación de una cámara |
| **LineString** | Una línea formada por puntos | Una calle o ruta |
| **Polygon** | Un área cerrada | Una colonia, alcaldía o sector |
| **MultiPolygon** | Varios polígonos agrupados | Una alcaldía con islas o zonas separadas |

### 3. CRS (Sistema de Referencia de Coordenadas)

El CRS define cómo se mapean las coordenadas al mundo real. El más común es:

- **EPSG:4326** (WGS 84): Usa latitud y longitud en grados decimales. Es el estándar de GPS y Google Maps.

> **Regla importante**: Ambos GeoDataFrames deben tener el **mismo CRS** para que el spatial join funcione correctamente.

```python
# Verificar el CRS
print(gdf.crs)  # EPSG:4326

# Reproyectar si es necesario
gdf = gdf.to_crs("EPSG:4326")
```

### 4. Geopackage (.gpkg)

Un **Geopackage** es un formato de archivo que almacena datos geográficos (geometrías + atributos) en un solo archivo SQLite. Es el sucesor moderno del Shapefile (.shp).

```python
# Leer un geopackage
poligonos = gpd.read_file("alcaldias.gpkg")

# Guardar como geopackage
gdf.to_file("salida.gpkg", driver="GPKG")
```

---

## Como funcionan los Spatial Joins

### Sintaxis basica

```python
resultado = gpd.sjoin(
    gdf_izquierdo,    # GeoDataFrame principal (ej: puntos de cámaras)
    gdf_derecho,       # GeoDataFrame secundario (ej: polígonos de alcaldías)
    how="left",        # Tipo de join: "left", "right", "inner"
    predicate="within" # Relación espacial: "within", "intersects", "contains"
)
```

### Diagrama del proceso

```
GeoDataFrame 1 (Puntos)          GeoDataFrame 2 (Poligonos)
┌─────────────────────┐          ┌──────────────────────────┐
│ id  nombre  geometry│          │ nombre_zona    geometry  │
│ 1   Cam-A   POINT   │          │ Zona Norte     POLYGON  │
│ 2   Cam-B   POINT   │          │ Zona Sur       POLYGON  │
│ 3   Cam-C   POINT   │          │ Zona Centro    POLYGON  │
└─────────────────────┘          └──────────────────────────┘
         │                                  │
         └──────── sjoin (within) ──────────┘
                        │
                        ▼
              Resultado del Spatial Join
┌──────────────────────────────────────────┐
│ id  nombre  geometry  nombre_zona        │
│ 1   Cam-A   POINT     Zona Norte         │
│ 2   Cam-B   POINT     Zona Sur           │
│ 3   Cam-C   POINT     Zona Centro        │
└──────────────────────────────────────────┘
```

El motor geométrico (Shapely) evalúa, para **cada punto**, en cuál polígono cae, y agrega las columnas del polígono correspondiente.

---

## Tipos de predicados espaciales

El parámetro `predicate` define **qué relación geométrica** debe cumplirse para que dos registros se unan.

### within (dentro de)

```python
gpd.sjoin(puntos, poligonos, predicate="within")
```

El punto A está **dentro** del polígono B.

```
    ┌─────────────┐
    │  Polígono B  │
    │     • A      │    → A within B = True
    │              │
    └─────────────┘

    • C                 → C within B = False
```

**Uso típico**: Determinar en qué alcaldía/colonia está una cámara.

### intersects (intersecta)

```python
gpd.sjoin(puntos, poligonos, predicate="intersects")
```

A y B comparten **al menos un punto** en común (se tocan o se superponen).

```
    ┌─────────┐
    │    A    ─┼──────┐
    │         ││  B   │   → A intersects B = True
    └─────────┼┘      │
              └───────┘
```

**Uso típico**: Encontrar todas las calles que cruzan una zona.

### contains (contiene)

```python
gpd.sjoin(poligonos, puntos, predicate="contains")
```

El polígono A **contiene completamente** al punto/polígono B. Es el inverso de `within`.

```
    ┌─────────────┐
    │  Polígono A  │
    │     • B      │    → A contains B = True
    │              │
    └─────────────┘
```

### Otros predicados disponibles

| Predicado | Descripcion |
|---|---|
| `touches` | Se tocan en el borde pero no se superponen |
| `crosses` | Se cruzan (una línea cruza un polígono) |
| `overlaps` | Se superponen parcialmente (mismo tipo de geometría) |
| `covers` | A cubre completamente a B (incluye bordes) |
| `covered_by` | A está completamente cubierto por B |

---

## Tipos de join (how)

### left (izquierdo) - El mas comun

```python
gpd.sjoin(camaras, alcaldias, how="left", predicate="within")
```

- Conserva **todos** los registros del GeoDataFrame izquierdo (cámaras)
- Si una cámara no cae en ningún polígono, las columnas del polígono quedan como `NaN`
- Equivalente a `LEFT JOIN` en SQL

```
Camaras (izq)     Alcaldias (der)      Resultado
┌────────┐        ┌──────────┐         ┌────────────────────┐
│ Cam-1  │───────→│ Coyoacán │         │ Cam-1  │ Coyoacán  │
│ Cam-2  │───────→│ Tlalpan  │         │ Cam-2  │ Tlalpan   │
│ Cam-3  │───✗    │          │         │ Cam-3  │ NaN       │  ← Se conserva
└────────┘        └──────────┘         └────────────────────┘
```

### inner (interno)

```python
gpd.sjoin(camaras, alcaldias, how="inner", predicate="within")
```

- Solo conserva registros que tienen match espacial
- Descarta puntos que no caen en ningún polígono

```
Resultado
┌────────────────────┐
│ Cam-1  │ Coyoacán  │
│ Cam-2  │ Tlalpan   │    ← Cam-3 se descarta
└────────────────────┘
```

### right (derecho)

```python
gpd.sjoin(camaras, alcaldias, how="right", predicate="within")
```

- Conserva **todos** los polígonos del GeoDataFrame derecho
- Si un polígono no contiene ningún punto, las columnas del punto quedan como `NaN`

---

## Herramientas necesarias

### Instalacion

```bash
pip install geopandas shapely pandas openpyxl
```

### Dependencias y que hace cada una

| Libreria | Funcion |
|---|---|
| **geopandas** | Extiende pandas con operaciones geográficas (read_file, sjoin, etc.) |
| **shapely** | Motor geométrico: crea y manipula puntos, líneas, polígonos |
| **pandas** | Manipulación de datos tabulares |
| **openpyxl** | Lectura/escritura de archivos Excel (.xlsx) |
| **fiona** | Backend de geopandas para leer/escribir formatos geográficos (gpkg, shp) |
| **pyproj** | Manejo de sistemas de coordenadas y reproyecciones |

---

## Como se usaron en este proyecto

### Contexto

Tenemos una base de datos de **50,281 cámaras de videovigilancia** en la Ciudad de México. Cada cámara tiene coordenadas (latitud, longitud). Después de fusionar dos bases de datos, **17,605 registros nuevos** necesitaban que se les asignara el **Territorio de Paz** al que pertenecen.

### Archivos involucrados

```
backend/
├── data/
│   ├── numeralia_fallas.xlsx        # Base original (49,355 registros)
│   ├── BASE_10FEB26_V11.xlsx        # Base nueva (50,281 registros)
│   ├── numeralia_merged.xlsx        # Resultado del merge
│   └── numeralia_final.xlsx         # Resultado final con columnas recalculadas
├── assets/poligonos/
│   ├── alcaldias.gpkg               # 16 polígonos de alcaldías
│   ├── c2.gpkg                      # 6 polígonos de centros C2
│   ├── colonias.gpkg                # 2,125 polígonos de colonias
│   ├── cuadrantes.gpkg              # 1,038 polígonos de cuadrantes
│   ├── sectores.gpkg                # 73 polígonos de sectores
│   └── territorios_paz.gpkg         # 61 polígonos de territorios de paz
└── scripts_python/
    ├── merge_bases.py               # Fusión de bases
    └── fill_geographic_columns.py   # Recálculo de columnas geográficas
```

### Paso a paso de lo que hicimos

#### 1. Cargar los puntos (camaras)

```python
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# Leer la base de datos con las cámaras
merged = pd.read_excel("backend/data/numeralia_merged.xlsx")

# Filtrar solo los registros nuevos (17,605)
mask_nuevos = merged["ALCALDIA A"].isna()
nuevos = merged.loc[mask_nuevos].copy()

# Convertir a GeoDataFrame usando las coordenadas
nuevos_gdf = gpd.GeoDataFrame(
    nuevos,
    geometry=[
        Point(lon, lat)
        for lon, lat in zip(nuevos["LONGITUD"], nuevos["LATITUD"])
    ],
    crs="EPSG:4326"
)
```

> **Nota importante**: `Point()` recibe los argumentos en orden `(longitud, latitud)`, NO `(latitud, longitud)`. Esto es porque en geometría `x = longitud` e `y = latitud`.

#### 2. Cargar los poligonos (territorios de paz)

```python
# Leer el geopackage con los polígonos
terri_paz = gpd.read_file("backend/assets/poligonos/territorios_paz.gpkg")

print(terri_paz.head())
#          NOM_POL                    NOMBRE          ...  geometry
# 0   POL1 CHALMA   CHALMA DE GUADALUPE             ...  POLYGON(...)
# 1   POL2 CHALMA   CAMPAMENTO 2 DE OCTUBRE         ...  POLYGON(...)
```

#### 3. Ejecutar el spatial join

```python
# Unir: ¿en qué territorio de paz cae cada cámara nueva?
joined = gpd.sjoin(
    nuevos_gdf,                           # Puntos (cámaras)
    terri_paz[["NOMBRE", "geometry"]],    # Polígonos (territorios)
    how="left",                           # Conservar todas las cámaras
    predicate="within"                    # El punto debe estar DENTRO del polígono
)
```

#### 4. Asignar el resultado

```python
# Extraer el nombre del territorio para cada cámara
# (groupby + first para manejar casos donde un punto cae en polígonos superpuestos)
terri_map = joined.groupby(joined.index)["NOMBRE"].first()

# Asignar al DataFrame original
merged.loc[terri_map.index, "TERRI_PAZ"] = terri_map.values

# Resultado: 954 de 17,605 cámaras nuevas cayeron en un territorio de paz
```

#### Visualizacion del resultado

```
  Territorio de Paz (polígono)
  ┌─────────────────────────┐
  │  CHALMA DE GUADALUPE    │
  │                         │
  │   • CAM-001             │  → TERRI_PAZ = "CHALMA DE GUADALUPE"
  │          • CAM-002      │  → TERRI_PAZ = "CHALMA DE GUADALUPE"
  │                         │
  └─────────────────────────┘
                    • CAM-003   → TERRI_PAZ = NaN (fuera del polígono)
```

### Por que solo 954 de 17,605?

Los Territorios de Paz son zonas **pequeñas y específicas** dentro de la ciudad (61 polígonos). La mayoría de las cámaras no están dentro de estos polígonos, lo cual es normal. Solo el ~6% de todas las cámaras de la CDMX caen dentro de un Territorio de Paz.

---

## Ejemplos practicos paso a paso

### Ejemplo 1: Encontrar en que alcaldia esta cada camara

```python
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

# 1. Cargar cámaras
camaras = pd.DataFrame({
    "id": ["CAM-001", "CAM-002", "CAM-003"],
    "latitud": [19.4326, 19.3500, 19.4800],
    "longitud": [-99.1332, -99.1600, -99.1100]
})

camaras_gdf = gpd.GeoDataFrame(
    camaras,
    geometry=[Point(lon, lat) for lon, lat in zip(camaras["longitud"], camaras["latitud"])],
    crs="EPSG:4326"
)

# 2. Cargar polígonos de alcaldías
alcaldias = gpd.read_file("backend/assets/poligonos/alcaldias.gpkg")

# 3. Spatial join
resultado = gpd.sjoin(camaras_gdf, alcaldias[["ALCALDIA", "geometry"]], how="left", predicate="within")

print(resultado[["id", "ALCALDIA"]])
#        id          ALCALDIA
# 0  CAM-001       CUAUHTEMOC
# 1  CAM-002         COYOACAN
# 2  CAM-003  GUSTAVO A. MADERO
```

### Ejemplo 2: Encontrar en que sector y cuadrante esta cada camara

```python
# Cargar polígonos
sectores = gpd.read_file("backend/assets/poligonos/sectores.gpkg")
cuadrantes = gpd.read_file("backend/assets/poligonos/cuadrantes.gpkg")

# Join con sectores
resultado = gpd.sjoin(camaras_gdf, sectores[["SECTOR", "geometry"]], how="left", predicate="within")

# Join con cuadrantes (encadenar sobre el resultado anterior)
# Primero restaurar la geometría (sjoin puede alterarla)
resultado = resultado.drop(columns=["index_right"])
resultado = gpd.sjoin(resultado, cuadrantes[["CVE_CUADRA", "geometry"]], how="left", predicate="within")

print(resultado[["id", "SECTOR", "CVE_CUADRA"]])
```

### Ejemplo 3: Contar cuantas camaras hay por alcaldia

```python
# Después del spatial join
resultado = gpd.sjoin(camaras_gdf, alcaldias[["ALCALDIA", "geometry"]], how="inner", predicate="within")

# Contar por alcaldía
conteo = resultado.groupby("ALCALDIA").size().sort_values(ascending=False)
print(conteo)
# IZTAPALAPA             3130
# GUSTAVO A. MADERO      2185
# CUAUHTEMOC             1705
# ...
```

### Ejemplo 4: Encontrar camaras dentro de un radio (buffer)

```python
from shapely.geometry import Point

# Definir un punto central (ej: Zócalo de la CDMX)
zocalo = Point(-99.1332, 19.4326)

# Crear un buffer de ~1km (en grados, ~0.009 grados ≈ 1km)
buffer_1km = zocalo.buffer(0.009)

# Crear un GeoDataFrame con el buffer
zona = gpd.GeoDataFrame(
    {"nombre": ["Radio 1km Zócalo"]},
    geometry=[buffer_1km],
    crs="EPSG:4326"
)

# Encontrar cámaras dentro del radio
camaras_cercanas = gpd.sjoin(camaras_gdf, zona, how="inner", predicate="within")
print(f"Cámaras a menos de 1km del Zócalo: {len(camaras_cercanas)}")
```

> **Nota sobre el buffer**: Usar grados como unidad de distancia es una aproximación. Para cálculos precisos, reproyecta a un CRS métrico (como EPSG:6372 para México) antes de hacer el buffer.

---

## Errores comunes y como evitarlos

### 1. CRS diferente entre los dos GeoDataFrames

```python
# ERROR: CRS no coinciden
# puntos.crs = EPSG:4326
# poligonos.crs = EPSG:32614

# SOLUCION: Reproyectar uno de los dos
poligonos = poligonos.to_crs("EPSG:4326")
```

**Señal de alerta**: El spatial join devuelve 0 resultados o resultados incorrectos.

### 2. Orden incorrecto de longitud/latitud en Point()

```python
# INCORRECTO - invierte las coordenadas
geometry = Point(latitud, longitud)

# CORRECTO - longitud primero (es la X), latitud después (es la Y)
geometry = Point(longitud, latitud)
```

**Señal de alerta**: Todos los puntos caen en el océano o en otro continente.

### 3. Registros duplicados por poligonos superpuestos

Si un punto cae en la intersección de dos polígonos, el spatial join produce **dos filas** para ese punto.

```python
# PROBLEMA: Duplicados
resultado = gpd.sjoin(puntos, poligonos, how="left", predicate="within")
# Un punto puede aparecer dos veces si está en dos polígonos

# SOLUCION: Quedarse con el primero
resultado = resultado.groupby(resultado.index).first()
# O usar drop_duplicates
resultado = resultado.drop_duplicates(subset=["id_camara"])
```

### 4. Puntos exactamente en el borde de un poligono

Un punto en el borde exacto de un polígono puede no ser detectado por `within`. Usa `intersects` en su lugar.

```python
# within: el punto debe estar estrictamente DENTRO
# intersects: el punto puede estar dentro O en el borde
resultado = gpd.sjoin(puntos, poligonos, predicate="intersects")
```

### 5. Coordenadas nulas o invalidas

```python
# Filtrar antes de crear el GeoDataFrame
df_limpio = df.dropna(subset=["LATITUD", "LONGITUD"])

# Validar rangos (para CDMX)
df_limpio = df_limpio[
    (df_limpio["LATITUD"].between(19.0, 19.8)) &
    (df_limpio["LONGITUD"].between(-99.5, -98.8))
]
```

### 6. Memoria insuficiente con datasets grandes

```python
# Para datasets muy grandes, procesar en lotes
chunk_size = 10000
resultados = []

for i in range(0, len(puntos), chunk_size):
    chunk = puntos.iloc[i:i+chunk_size]
    chunk_gdf = gpd.GeoDataFrame(chunk, geometry=..., crs="EPSG:4326")
    resultado = gpd.sjoin(chunk_gdf, poligonos, how="left", predicate="within")
    resultados.append(resultado)

final = pd.concat(resultados)
```

---

## Recursos adicionales

### Documentacion oficial

- [GeoPandas - Merging Data (sjoin)](https://geopandas.org/en/stable/docs/user_guide/mergingdata.html)
- [Shapely - Geometric Objects](https://shapely.readthedocs.io/en/stable/geometry.html)
- [GeoPandas - sjoin API Reference](https://geopandas.org/en/stable/docs/reference/api/geopandas.sjoin.html)

### Conceptos relacionados para seguir aprendiendo

| Concepto | Descripcion | Ejemplo |
|---|---|---|
| **sjoin_nearest** | Join al polígono/punto más cercano (no necesita estar dentro) | Encontrar el hospital más cercano a cada cámara |
| **overlay** | Operaciones entre polígonos (intersección, unión, diferencia) | Encontrar el área donde se superponen dos alcaldías |
| **buffer** | Crear zonas alrededor de geometrías | Zona de 500m alrededor de cada escuela |
| **dissolve** | Fusionar polígonos por un atributo | Unir cuadrantes en sectores |
| **geocoding** | Convertir direcciones a coordenadas | "Reforma 222, CDMX" → (19.427, -99.168) |
| **reverse geocoding** | Convertir coordenadas a direcciones | (19.427, -99.168) → "Reforma 222, CDMX" |

### Formatos de archivos geograficos

| Formato | Extension | Ventajas | Desventajas |
|---|---|---|---|
| **GeoPackage** | .gpkg | Un solo archivo, soporta múltiples capas, estándar OGC | Menos universal que Shapefile |
| **Shapefile** | .shp + .dbf + .shx + .prj | Muy extendido, compatible con todo | Múltiples archivos, nombres truncados a 10 caracteres |
| **GeoJSON** | .geojson | Legible por humanos, ideal para web | Archivos grandes, menos eficiente |
| **KML** | .kml | Compatible con Google Earth | Menos funcionalidades para análisis |

> **Dato curioso del proyecto**: Los nombres truncados de las columnas en `numeralia_fallas.xlsx` (como `ALCALDIA A`, `ESTADIO _1`, `PERIMETR_3`) se deben a que originalmente los datos estaban en formato **Shapefile**, que limita los nombres de columnas a **10 caracteres**.
