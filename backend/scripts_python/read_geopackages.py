import fiona
import geopandas as gpd

# Revisar las capas dentro del geopackage
#fiona.listlayers("assets/poligonos/colonias.gpkg")

gdf = gpd.read_file("assets/poligonos/TERRPAZ2.shp")

# Para ver las columnas de la capa
# ----
#print(gdf.columns)

#Eliminar columna fid
gdf = gdf.drop(columns=["fid"])

gdf.to_file("assets/poligonos/territorios_paz.gpkg", layer="capa", driver="GPKG")