{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": 6,
   "id": "8670e293",
   "metadata": {},
   "outputs": [
    {
     "ename": "ModuleNotFoundError",
     "evalue": "No module named 'folium'",
     "output_type": "error",
     "traceback": [
      "\u001b[31m---------------------------------------------------------------------------\u001b[39m",
      "\u001b[31mModuleNotFoundError\u001b[39m                       Traceback (most recent call last)",
      "\u001b[36mCell\u001b[39m\u001b[36m \u001b[39m\u001b[32mIn[6]\u001b[39m\u001b[32m, line 2\u001b[39m\n\u001b[32m      1\u001b[39m \u001b[38;5;28;01mimport\u001b[39;00m\u001b[38;5;250m \u001b[39m\u001b[34;01mgeopandas\u001b[39;00m\u001b[38;5;250m \u001b[39m\u001b[38;5;28;01mas\u001b[39;00m\u001b[38;5;250m \u001b[39m\u001b[34;01mgpd\u001b[39;00m\n\u001b[32m----> \u001b[39m\u001b[32m2\u001b[39m \u001b[38;5;28;01mimport\u001b[39;00m\u001b[38;5;250m \u001b[39m\u001b[34;01mfolium\u001b[39;00m\n\u001b[32m      3\u001b[39m \u001b[38;5;28;01mimport\u001b[39;00m\u001b[38;5;250m \u001b[39m\u001b[34;01mfiona\u001b[39;00m\n",
      "\u001b[31mModuleNotFoundError\u001b[39m: No module named 'folium'"
     ]
    }
   ],
   "source": [
    "import geopandas as gpd\n",
    "import folium\n",
    "import fiona\n"
   ]
  },
  {
   "cell_type": "markdown",
   "id": "d28a3006",
   "metadata": {},
   "source": [
    "Ingresa en la siguiente celda qué secro"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "decf963e",
   "metadata": {},
   "outputs": [],
   "source": [
    "capa_cartográfica = \"colonias\""
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "6abcb7a7",
   "metadata": {},
   "outputs": [],
   "source": [
    "\n",
    "# 1. Cargar GeoPackage\n",
    "\n",
    "# Para revisar las capas disponibles en un GeoPackage\n",
    "#print(fiona.listlayers(\"assets/poligonos/colonias.gpkg\"))\n",
    "\n",
    "gdf = gpd.read_file(\"assets/poligonos/territorios_paz.gpkg\", layer=\"capa\")\n",
    "\n"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "558126b8",
   "metadata": {},
   "outputs": [],
   "source": [
    "\n",
    "# 2. Asegurar CRS geográfico (lat/lon)\n",
    "if gdf.crs is None:\n",
    "    raise ValueError(\"El GeoPackage no tiene CRS\")\n",
    "    \n"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "c8d4c804",
   "metadata": {},
   "outputs": [
    {
     "name": "stderr",
     "output_type": "stream",
     "text": [
      "C:\\Users\\naomi\\AppData\\Local\\Temp\\ipykernel_47800\\3482921291.py:5: DeprecationWarning: The 'unary_union' attribute is deprecated, use the 'union_all()' method instead.\n",
      "  centro = gdf.geometry.unary_union.centroid\n"
     ]
    }
   ],
   "source": [
    "\n",
    "if gdf.crs.to_epsg() != 4326:\n",
    "    gdf = gdf.to_crs(epsg=4326)\n",
    "\n",
    "# 3. Centrar mapa\n",
    "centro = gdf.geometry.unary_union.centroid\n",
    "m = folium.Map(location=[centro.y, centro.x], zoom_start=11)\n",
    "\n",
    "# 4. Agregar polígonos\n",
    "folium.GeoJson(\n",
    "    gdf,\n",
    "    name=\"Territorios de Paz\",\n",
    "    style_function=lambda x: {\n",
    "        \"fillColor\": \"#7e0a89\",\n",
    "        \"color\": \"#000000\",\n",
    "        \"weight\": 1,\n",
    "        \"fillOpacity\": 0.3,\n",
    "    },\n",
    ").add_to(m)\n",
    "\n",
    "# 5. Control de capas\n",
    "folium.LayerControl().add_to(m)\n",
    "\n",
    "# 6. Guardar / mostrar\n",
    "m.save(\"assets/mapas_html/mapa_territorios_paz.html\")\n"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.14.2"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}
