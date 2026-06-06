import geopandas as gpd
import pandas as pd
from pathlib import Path

# Cargar datos
colonias = gpd.read_file("assets/poligonos/colonias.gpkg")
df = pd.read_excel("data/numeralia_final.xlsx")
df['COLONIA'] = df['COLONIA'].str.strip().str.upper()
df['ALCALDIA'] = df['ALCALDIA'].str.strip().str.upper()

# ¿Qué columnas tiene el gpkg de colonias?
print("Columnas del GeoPackage:", colonias.columns.tolist())

# Colonias duplicadas por nombre en el gpkg
dups_gpkg = colonias[colonias.duplicated('NOM_ASENTA', keep=False)][['NOM_ASENTA']].drop_duplicates()
print(f"\nColonias con nombre duplicado en gpkg: {len(dups_gpkg)}")
print(dups_gpkg.head(20))

# Colonias que aparecen en más de una alcaldía en el Excel
dups_excel = (
    df.groupby('COLONIA')['ALCALDIA'].nunique()
    .reset_index()
    .query('ALCALDIA > 1')
    .rename(columns={'ALCALDIA': 'num_alcaldias'})
)
print(f"\nColonias en múltiples alcaldías (Excel): {len(dups_excel)}")
print(dups_excel.head(20))