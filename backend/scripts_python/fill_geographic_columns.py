"""
Script para recalcular las columnas geográficas de los registros nuevos
en numeralia_merged.xlsx usando spatial joins con los geopackages.

Columnas a recalcular para los 17,605 registros nuevos:
1. TERRI_PAZ - Territorio de paz (spatial join con territorios_paz.gpkg)
2. 15 columnas binarias de alcaldía (one-hot encoding basado en columna ALCALDIA)
3. Columnas de perímetros y eventos masivos (se inicializan en 0)

No modifica los archivos originales. Genera numeralia_final.xlsx.
"""

import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from pathlib import Path

# =============================================================================
# Rutas
# =============================================================================
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
GPKG_DIR = BASE_DIR / "assets" / "poligonos"

RUTA_MERGED = DATA_DIR / "numeralia_merged.xlsx"
RUTA_SALIDA = DATA_DIR / "numeralia_final.xlsx"

# =============================================================================
# Paso 1: Cargar datos
# =============================================================================
print("=" * 60)
print("PASO 1: Cargando datos")
print("=" * 60)

merged = pd.read_excel(RUTA_MERGED)
print(f"Registros totales: {merged.shape[0]}")

# Identificar registros nuevos (los que tienen NaN en columnas que venían de la base actual)
# Usamos 'ALCALDIA A' como indicador: si es NaN, es un registro nuevo
mask_nuevos = merged["ALCALDIA A"].isna()
n_nuevos = mask_nuevos.sum()
n_existentes = (~mask_nuevos).sum()
print(f"Registros existentes (ya tienen datos): {n_existentes}")
print(f"Registros nuevos (necesitan recálculo): {n_nuevos}")

# =============================================================================
# Paso 2: Revisar columnas de los geopackages
# =============================================================================
print("\n" + "=" * 60)
print("PASO 2: Revisando geopackages disponibles")
print("=" * 60)

gpkg_files = sorted(GPKG_DIR.glob("*.gpkg"))
for f in gpkg_files:
    gdf = gpd.read_file(f)
    cols = [c for c in gdf.columns if c != "geometry"]
    print(f"\n  {f.name}: {gdf.shape[0]} polígonos")
    print(f"    Columnas: {cols}")

# =============================================================================
# Paso 3: Recalcular TERRI_PAZ con spatial join
# =============================================================================
print("\n" + "=" * 60)
print("PASO 3: Recalculando TERRI_PAZ (spatial join)")
print("=" * 60)

# Cargar territorios de paz
terri_paz = gpd.read_file(GPKG_DIR / "territorios_paz.gpkg")
print(f"Polígonos de Territorios de Paz: {terri_paz.shape[0]}")
print(f"Columnas: {terri_paz.columns.tolist()}")
# Columna relevante: NOMBRE (nombre del territorio de paz)

# Crear GeoDataFrame solo con registros nuevos que tienen coordenadas válidas
nuevos = merged.loc[mask_nuevos].copy()
nuevos_con_coords = nuevos.dropna(subset=["LATITUD", "LONGITUD"])
print(f"Registros nuevos con coordenadas válidas: {len(nuevos_con_coords)}")

nuevos_gdf = gpd.GeoDataFrame(
    nuevos_con_coords,
    geometry=[Point(xy) for xy in zip(nuevos_con_coords["LONGITUD"], nuevos_con_coords["LATITUD"])],
    crs="EPSG:4326",
)

# Spatial join: qué registros nuevos caen dentro de un territorio de paz
joined_terri = gpd.sjoin(nuevos_gdf, terri_paz[["NOMBRE", "geometry"]], how="left", predicate="within")

# Asignar TERRI_PAZ donde hubo match
terri_map = joined_terri.groupby(joined_terri.index)["NOMBRE"].first()
merged.loc[terri_map.index, "TERRI_PAZ"] = terri_map.values

n_terri = terri_map.notna().sum()
print(f"Registros nuevos asignados a un Territorio de Paz: {n_terri}")

# =============================================================================
# Paso 4: Recalcular columnas binarias de alcaldía (one-hot encoding)
# =============================================================================
print("\n" + "=" * 60)
print("PASO 4: Recalculando columnas binarias de alcaldía")
print("=" * 60)

# Mapeo: columna truncada -> nombre de alcaldía en la base
# Determinado por análisis cruzado de los datos existentes
ALCALDIA_BIN_MAP = {
    "ALCALDIA A": "ALVARO OBREGON",
    "ALCALDIA_1": "AZCAPOTZALCO",
    "ALCALDIA B": "BENITO JUAREZ",
    "ALCALDIA C": "COYOACAN",
    "ALCALDIA_2": "CUAJIMALPA",
    "ALCALDIA G": "GUSTAVO A. MADERO",
    "ALCALDIA I": "IZTACALCO",
    "ALCALDIA_3": "IZTAPALAPA",
    "ALCALDIA M": "MAGDALENA CONTRERAS",
    "ALCALDIA_4": "MIGUEL HIDALGO",
    "ALCALDIA_5": "MILPA ALTA",
    "ALCALDIA T": "TLAHUAC",
    "ALCALDIA_6": "TLALPAN",
    "ALCALDIA V": "VENUSTIANO CARRANZA",
    "ALCALDIA X": "XOCHIMILCO",
}
# Nota: CUAUHTEMOC no tiene columna binaria (16 alcaldías, 15 columnas)

for col_bin, alcaldia_nombre in ALCALDIA_BIN_MAP.items():
    merged.loc[mask_nuevos, col_bin] = (
        merged.loc[mask_nuevos, "ALCALDIA"].str.upper() == alcaldia_nombre.upper()
    ).astype(int)

# Verificar
print("Asignaciones para registros nuevos:")
for col_bin, alcaldia_nombre in ALCALDIA_BIN_MAP.items():
    n = merged.loc[mask_nuevos, col_bin].sum()
    if n > 0:
        print(f"  {col_bin} ({alcaldia_nombre}): {int(n)} registros")

# Contar registros nuevos sin ninguna alcaldía binaria asignada (serían CUAUHTEMOC)
sin_alcaldia_bin = merged.loc[mask_nuevos, list(ALCALDIA_BIN_MAP.keys())].sum(axis=1) == 0
n_cuauhtemoc = sin_alcaldia_bin.sum()
print(f"  Sin columna binaria -> CUAUHTEMOC: {n_cuauhtemoc} registros")

# =============================================================================
# Paso 5: Inicializar columnas de perímetros y eventos masivos en 0
# =============================================================================
print("\n" + "=" * 60)
print("PASO 5: Inicializando columnas de perímetros/eventos masivos")
print("=" * 60)

# Estas columnas son binarias (0/1) que indican si una cámara está dentro
# de un perímetro de seguridad de un evento masivo. Sin los polígonos
# correspondientes, se inicializan en 0.
PERIMETER_COLS = [
    "ARENA CIUD", "ARENA MEXI", "AUDITORIO", "AUDITORI_1",
    "CENTRO BAN", "ESTADIO AL", "ESTADIO AZ", "ESTADIO _1",
    "ESTADIO OL", "EXPO SANTA", "FORMULA 1", "HIPODROMO",
    "PALACIO DE", "PEPSI CENT", "PERIMETRO", "PERIMETR_1",
    "PERIMETROS", "PERIMETR_2", "PERIMETR_3", "POLIGONO S",
    "TEATRO MET", "VELODROMO", "ZOCALO",
]

for col in PERIMETER_COLS:
    if col in merged.columns:
        merged.loc[mask_nuevos, col] = 0

print(f"Se inicializaron {len(PERIMETER_COLS)} columnas de perímetros en 0 para {n_nuevos} registros nuevos")
print("NOTA: Estas columnas requieren polígonos de perímetros de eventos masivos")
print("      que no están disponibles en los geopackages actuales.")

# =============================================================================
# Paso 6: Inicializar EVENTOS_MA y FID
# =============================================================================
print("\n" + "=" * 60)
print("PASO 6: Inicializando EVENTOS_MA y FID")
print("=" * 60)

# EVENTOS_MA es un campo de texto que indica eventos masivos cercanos
# Se deja como NaN para registros nuevos (no hay info disponible)
print(f"EVENTOS_MA: se mantiene como NaN para registros nuevos (sin datos disponibles)")

# FID: asignar IDs consecutivos a los registros nuevos
max_fid = merged.loc[~mask_nuevos, "FID"].max()
if pd.notna(max_fid):
    new_fids = range(int(max_fid) + 1, int(max_fid) + 1 + n_nuevos)
    merged.loc[mask_nuevos, "FID"] = list(new_fids)
    print(f"FID: asignados IDs del {int(max_fid) + 1} al {int(max_fid) + n_nuevos}")

# =============================================================================
# Paso 7: Resumen y guardado
# =============================================================================
print("\n" + "=" * 60)
print("PASO 7: Resumen final")
print("=" * 60)

# Verificar nulos restantes en columnas clave
cols_check = (
    ["ALCALDIA", "C2", "SECTOR", "COLONIA", "CVE_CUADRA", "TERRI_PAZ"]
    + list(ALCALDIA_BIN_MAP.keys())
    + PERIMETER_COLS[:5]
)
print("\nNulos por columna clave:")
for col in cols_check:
    if col in merged.columns:
        nulos = merged[col].isna().sum()
        pct = nulos / len(merged) * 100
        print(f"  {col}: {nulos} ({pct:.1f}%)")

print(f"\nTotal filas: {merged.shape[0]}")
print(f"Total columnas: {merged.shape[1]}")

print(f"\nGuardando resultado en: {RUTA_SALIDA}")
merged.to_excel(RUTA_SALIDA, index=False)
print("Listo.")
