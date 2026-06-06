"""
Script para fusionar la base nueva (BASE_10FEB26_V11.xlsx) con la base actual
(numeralia_fallas.xlsx), usando ID_BCT_O como llave de cruce.

Estrategia:
1. Renombrar columnas de la base nueva para que coincidan con la actual.
2. Para los registros que coinciden en ambas bases: actualizar con datos de la nueva
   y conservar las columnas extras de la actual.
3. Para los registros nuevos (solo en base nueva): agregarlos con columnas extras en NaN.
4. Los registros que solo existen en la base actual se descartan.
5. El resultado se guarda en un archivo nuevo, sin modificar los originales.
"""

import pandas as pd
from pathlib import Path

# Rutas
BASE_DIR = Path(__file__).resolve().parent.parent / "data"
RUTA_ACTUAL = BASE_DIR / "numeralia_fallas.xlsx"
RUTA_NUEVA = BASE_DIR / "BASE_10FEB26_V11.xlsx"
RUTA_SALIDA = BASE_DIR / "numeralia_merged.xlsx"

# Mapeo de columnas: nombre en base nueva -> nombre en base actual
RENAME_MAP = {
    "ESQUINA / ENTRE CALLES": "ESQUINA /",
    "COLONIA_V11": "COLONIA",
    "SECTOR_V11": "SECTOR",
    "ALCALDIA_V11": "ALCALDIA",
    "C2_V11": "C2",
    "CUADRANTE_V11": "CVE_CUADRA",
    "CLASIFICACION": "CLASIFICAC",
    "CANT_ALTAVOZ": "CANT_ALTAV",
    "TIPO CAMARA": "TIPO CAMAR",
    "SUBPROYECTO": "SUBPROYECT",
}


def load_data():
    print(f"Leyendo base actual: {RUTA_ACTUAL}")
    actual = pd.read_excel(RUTA_ACTUAL)
    print(f"  -> {actual.shape[0]} filas x {actual.shape[1]} columnas")

    print(f"Leyendo base nueva: {RUTA_NUEVA}")
    nueva = pd.read_excel(RUTA_NUEVA)
    print(f"  -> {nueva.shape[0]} filas x {nueva.shape[1]} columnas")

    return actual, nueva


def rename_columns(nueva):
    print("\nRenombrando columnas de la base nueva...")
    nueva = nueva.rename(columns=RENAME_MAP)
    for old, new in RENAME_MAP.items():
        print(f"  {old} -> {new}")
    return nueva


def resolve_duplicates(actual):
    n_dups = actual["ID_BCT_O"].duplicated().sum()
    if n_dups > 0:
        print(f"\nResolviendo {n_dups} duplicados en base actual (conservando último registro)...")
        actual = actual.drop_duplicates(subset="ID_BCT_O", keep="last")
        print(f"  -> {actual.shape[0]} filas tras eliminar duplicados")
    return actual


def merge_bases(actual, nueva):
    # Columnas que vienen de la base nueva (sin ID_BCT_O que es la llave)
    cols_nueva = [c for c in nueva.columns if c != "ID_BCT_O"]

    # Columnas extras que solo existen en la base actual
    cols_solo_actual = [c for c in actual.columns if c not in nueva.columns and c != "ID_BCT_O"]

    print(f"\nColumnas de la base nueva: {len(cols_nueva)}")
    print(f"Columnas extras de la base actual: {len(cols_solo_actual)}")

    # Preparar la base actual solo con las columnas extras + la llave
    actual_extras = actual[["ID_BCT_O"] + cols_solo_actual].copy()

    # Merge: partimos de la base nueva y le pegamos las columnas extras de la actual
    merged = nueva.merge(actual_extras, on="ID_BCT_O", how="left")

    # Conteo de resultados
    ids_actual = set(actual["ID_BCT_O"])
    ids_nueva = set(nueva["ID_BCT_O"])
    coinciden = len(ids_actual & ids_nueva)
    solo_nueva = len(ids_nueva - ids_actual)
    descartados = len(ids_actual - ids_nueva)

    print(f"\n=== Resultado del merge ===")
    print(f"  Registros actualizados (coinciden): {coinciden}")
    print(f"  Registros nuevos (solo en base nueva): {solo_nueva}")
    print(f"  Registros descartados (solo en base actual): {descartados}")
    print(f"  Total filas resultado: {merged.shape[0]}")
    print(f"  Total columnas resultado: {merged.shape[1]}")

    return merged


def reorder_columns(merged, actual):
    # Intentar mantener el orden de columnas de la base actual, agregando nuevas al final
    cols_actual_order = [c for c in actual.columns if c in merged.columns]
    cols_nuevas_extra = [c for c in merged.columns if c not in actual.columns]
    final_order = cols_actual_order + cols_nuevas_extra
    merged = merged[final_order]
    return merged


def main():
    actual, nueva = load_data()
    nueva = rename_columns(nueva)
    actual = resolve_duplicates(actual)
    merged = merge_bases(actual, nueva)
    merged = reorder_columns(merged, actual)

    print(f"\nGuardando resultado en: {RUTA_SALIDA}")
    merged.to_excel(RUTA_SALIDA, index=False)
    print("Listo.")


if __name__ == "__main__":
    main()
