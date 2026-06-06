import geopandas as gpd
from pathlib import Path

base_dir = Path("backend/assets/Poligonos")
files = ["alcaldias.gpkg", "c2.gpkg", "colonias.gpkg", "cuadrantes.gpkg", "sectores.gpkg"]

for f in files:
    path = base_dir / f
    if path.exists():
        try:
            gdf = gpd.read_file(path)
            print(f"File: {f}")
            print(f"Columns: {list(gdf.columns)}")
            print("-" * 20)
        except Exception as e:
            print(f"Error reading {f}: {e}")
    else:
        print(f"File not found: {f}")
