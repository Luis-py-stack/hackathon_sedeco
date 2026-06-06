import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { LAYER_COLORS } from '../../../constants';

/**
 * Renderiza todas las capas de polígonos activas (alcaldías, C2, sectores…).
 * polygonsData: { [layerName]: GeoJSON | null }
 */
export default function PolygonLayers({ polygonsData }) {
  return (
    <>
      {Object.entries(polygonsData).map(([layer, geojson]) => {
        if (!geojson?.features) return null;
        const color = LAYER_COLORS[layer] ?? '#888888';
        return (
          <Source key={layer} id={`source-${layer}`} type="geojson" data={geojson}>
            <Layer
              id={`layer-${layer}-fill`}
              type="fill"
              paint={{ 'fill-color': color, 'fill-opacity': 0.08 }}
            />
            <Layer
              id={`layer-${layer}-outline`}
              type="line"
              paint={{ 'line-color': color, 'line-width': 1.8, 'line-opacity': 0.9 }}
            />
          </Source>
        );
      })}
    </>
  );
}