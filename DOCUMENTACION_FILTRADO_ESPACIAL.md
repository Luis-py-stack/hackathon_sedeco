# Documentación: Filtrado Espacial en el Cliente

Esta documentación explica la lógica implementada para filtrar cámaras dinámicamente utilizando polígonos dibujados por el usuario, permitiendo la coexistencia de múltiples figuras y la intersección con otros filtros del sistema.

## 1. Arquitectura de Datos

El sistema utiliza un flujo de datos en dos etapas para garantizar que el mapa solo muestre puntos dentro de las áreas de interés:

1.  **Carga desde Backend (`useCamaras`)**: Se recuperan los puntos que cumplen con los filtros de sectorización (Alcaldía, Colonia, etc.). Si no hay filtros de sectorización pero hay un polígono activo, se traen todos los puntos relevantes de la base de datos.
2.  **Filtrado Geográfico en Frontend (`App.jsx`)**: Se procesan los puntos recuperados utilizando la librería `Turf.js` para realizar una validación geométrica punto-en-polígono contra todas las figuras dibujadas.

## 2. Componentes Clave

### A. Estado Global (`useFilter.js`)
Se añadió la propiedad `spatialFilterPolygons` al objeto de filtros globales. Esta propiedad almacena un `FeatureCollection` de GeoJSON que contiene todas las figuras (polígonos y círculos) dibujadas en el mapa.

### B. Lógica de Intersección (`App.jsx`)
Utilizamos `useMemo` para recalcular los puntos visibles cada vez que cambian los datos crudos o las figuras del filtro espacial:

```javascript
const camarasData = React.useMemo(() => {
  if (!rawCamarasData || !filters.spatialFilterPolygons) return rawCamarasData;
  
  const features = rawCamarasData.features.filter(f => {
    const p = point(f.geometry.coordinates);
    // Verifica si el punto está dentro de AL MENOS UNO de los polígonos dibujados
    return filters.spatialFilterPolygons.features.some(poly => 
      booleanPointInPolygon(p, poly)
    );
  });
  
  return { ...rawCamarasData, features, ... };
}, [rawCamarasData, filters.spatialFilterPolygons]);
```

### C. Manejo de Herramientas de Dibujo
*   **Polígonos**: Utiliza el modo estándar de `mapbox-gl-draw`.
*   **Círculos**: Se implementó una lógica personalizada que calcula un polígono de 64 lados a partir de un centro y un radio, permitiendo que el motor de filtrado los trate como cualquier otro polígono.

## 3. Comportamiento del Usuario

1.  **Dibujo**: El usuario dibuja una o más figuras. El panel muestra un conteo previo de cámaras encontradas pero **no oculta** las cámaras fuera todavía.
2.  **Aplicación**: Al presionar "Aplicar Filtros activos", se actualiza el estado global con las geometrías dibujadas.
3.  **Resultado**: El componente `App` detecta el cambio, ejecuta la lógica de `Turf.js` y entrega al mapa solo los puntos que intersectan con las áreas dibujadas. Cualquier punto fuera de estas áreas "desaparece" visualmente y del conteo de la barra de estado.
4.  **Combinación**: Si el usuario selecciona una Alcaldía, el backend envía solo los puntos de esa Alcaldía, y el frontend luego los recorta con el polígono dibujado, logrando una **intersección perfecta**.

## 4. Herramientas Utilizadas
*   **Mapbox GL Draw**: Para la creación y edición de geometrías.
*   **Turf.js**: Para cálculos espaciales (`booleanPointInPolygon`, `area`, `length`, `circle`).
*   **React Memoization**: Para asegurar un rendimiento fluido incluso con miles de puntos.
