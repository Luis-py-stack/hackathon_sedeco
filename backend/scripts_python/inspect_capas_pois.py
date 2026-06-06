import geopandas as gpd
from pathlib import Path
import sys

path = Path("backend/assets/poligonos/POI/CAPAS_POIs.gpkg")
if path.exists():
    gdf = gpd.read_file(path)
    print(f"File: {path}")
    print(f"Columns: {list(gdf.columns)}")
    if 'POI' in gdf.columns:
        print(f"Unique POI types: {gdf['POI'].unique().tolist()}")
    print(f"Sample data:\n{gdf.head()}")
else:
    print(f"File not found: {path}")
