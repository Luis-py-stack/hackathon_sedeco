import geopandas as gpd
from pathlib import Path

base_dir = Path("backend/assets/Poligonos")

# print("C2 Zonas:")
# try:
#     c2 = gpd.read_file(base_dir / "c2.gpkg")
#     print(c2['ZONA'].unique())
# except Exception as e:
#     print(e)

# print("\nColonias Nom Asenta (sample):")
# try:
#     cols = gpd.read_file(base_dir / "colonias.gpkg")
#     print(cols['NOM_ASENTA'].unique()[:10])
# except Exception as e:
#     print(e)

print("\nColonias Nom Asenta:")
try:
    cols = gpd.read_file(base_dir / "colonias.gpkg")
    print(cols['NOM_MUNICI'].unique())
except Exception as e:
    print(e)
