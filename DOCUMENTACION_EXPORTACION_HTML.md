# Documentación: Sistema de Exportación de Mapas HTML

Esta documentación detalla el sistema de exportación de mapas a formato HTML autónomo. Este sistema permite a los usuarios descargar una versión interactiva y funcional del mapa actual, incluyendo filtros, simbología y datos técnicos, sin necesidad de una conexión activa al servidor de la aplicación.

---

## 1. Archivos Involucrados

La lógica de exportación está distribuida en cuatro archivos principales:

### A. `frontend/src/constants/index.js`
Es el **repositorio central de estilos**. 
- **Función:** Define los colores de las capas (`LAYER_COLORS`) y las categorías de infraestructura (`POI_CATEGORY_COLORS`). 
- **Importancia:** Al modificar un color aquí, el cambio se refleja tanto en la aplicación web como en el mapa que el usuario descarga, manteniendo la consistencia visual.

### B. `frontend/src/utils/mapTemplate.js`
Es el **plano (blueprint)** del archivo descargable.
- **Contenido:** Es una cadena de texto (string) que contiene la estructura completa de un sitio web autónomo:
    - **HTML:** Estructura de la barra lateral, el contenedor del mapa y los contenedores de leyenda.
    - **CSS:** Estilos para la interfaz, incluyendo el diseño de los **rombos** (`.legend-diamond`) y las tarjetas de estadísticas.
    - **JavaScript:** Código puro de MapLibre GL que se ejecutará en la computadora del usuario al abrir el archivo.
- **Placeholders:** Contiene etiquetas especiales (ej: `__CAMARAS_DATA__`, `__POIS_DATA__`) que son reemplazadas por datos reales al momento de la descarga.

### C. `frontend/src/utils/mapExport.js`
Es el **orquestador** de la exportación.
- **Función:** Recibe los datos del estado de React (datos filtrados, zoom, posición), los convierte a texto plano (JSON strings) y utiliza el método `.replace()` para inyectar esos datos en el `mapTemplate.js`.
- **Mecanismo de descarga:** Crea un objeto `Blob` de tipo `text/html` y genera un enlace temporal en el DOM para que el navegador dispare la descarga del archivo de forma automática.

### D. `frontend/src/App.jsx`
Es el **punto de entrada**.
- **Función:** Captura el evento del usuario (clic en el botón de descarga), recopila la información actual del mapa desde los hooks de datos y llama a la función de exportación pasándole todos los parámetros necesarios.

---

## 2. Elementos Clave de Visualización

Para garantizar que el mapa exportado sea ligero y no dependa de archivos externos locales, se implementaron las siguientes soluciones técnicas:

### Visualización de POIs como Rombos (◆)
En lugar de depender de imágenes PNG o SVG, los puntos de infraestructura se renderizan como símbolos vectoriales nativos:
- **En el Mapa:** Se utiliza una capa de tipo `symbol` en MapLibre que dibuja el carácter especial `◆`. 
- **Color Dinámico:** El color del rombo se asigna mediante una expresión `match` que relaciona el tipo de POI con su categoría y color correspondiente definidos en las constantes.
- **Etiquetas de Nombre:** Se incluyó una capa de texto secundaria que muestra el nombre de cada punto (ej: "Mercado Central", "Escuela Benito Juárez") justo debajo del rombo para una identificación rápida.

### Simbología Interactiva
La barra lateral del archivo exportado incluye una leyenda inteligente:
- **Cámaras:** Permite activar o desactivar tipos de cámaras (9M, 20M, Totem, etc.) mediante checkboxes, actualizando el mapa instantáneamente sin recargar la página.
- **Infraestructura:** Muestra los rombos con sus colores respectivos y el conteo exacto de elementos presentes en el área analizada.

### Independencia Tecnológica (Portabilidad)
El archivo generado utiliza **CDNs** para cargar la librería MapLibre y los estilos base. Esto asegura que el archivo descargado sea extremadamente pequeño (pocos KB), ya que solo contiene datos GeoJSON y lógica de visualización, delegando la carga de mapas base a servidores optimizados de terceros.

---

## 3. Flujo para Futuras Modificaciones

Para mantener o extender el sistema, siga estas pautas:

1.  **¿Cambiar un color global?** Modifique el valor en `frontend/src/constants/index.js`.
2.  **¿Modificar el diseño de la exportación?** Edite el HTML/CSS dentro de los arreglos de `frontend/src/utils/mapTemplate.js`.
3.  **¿Agregar una nueva capa de datos?** 
    - Asegúrese de que `App.jsx` pase los datos a la función `downloadMapHTML`.
    - Agregue un nuevo placeholder en `mapTemplate.js` (ej: `__MI_NUEVA_CAPA__`).
    - En `mapExport.js`, realice el reemplazo: `.replace('__MI_NUEVA_CAPA__', JSON.stringify(datos))`.
    - Agregue la lógica de `map.addLayer` en el script del template para visualizarla.

---
*Documento de referencia para el equipo de desarrollo de la plataforma de Consulta Cartográfica.*
