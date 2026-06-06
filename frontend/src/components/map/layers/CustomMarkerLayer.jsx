import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';

/**
 * Punto rojo para el marcador de búsqueda por coordenadas.
 * marker: { latitude, longitude } | null
 */
export default function CustomMarkerLayer({ marker }) {
  if (!marker) return null;
  return (
    <Source
      id="custom-marker"
      type="geojson"
      data={{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [marker.longitude, marker.latitude] },
      }}
    >
      <Layer
        id="custom-marker-point"
        type="circle"
        paint={{
          'circle-radius':       12,
          'circle-color':        '#FF0000',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        }}
      />
    </Source>
  );
}