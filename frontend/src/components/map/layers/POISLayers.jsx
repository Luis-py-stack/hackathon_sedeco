import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { LAYER_COLORS } from '../../../constants';

const POI_TYPE_TO_ICON = {
  'C2': 'gobierno',
  'COORDINACIONES TERRITORIALES': 'gobierno',
  'DEFENSORIAS DE OFICIO': 'gobierno',
  'INFRAESTRUCTURA SSC': 'seguridad',
  'JUZGADOS CIVILES Y PENALES': 'gobierno',
  'MINISTERIOS PUBLICOS': 'seguridad',
  'MODULOS SSP': 'seguridad',
  'OFICINAS DE GOBIERNO': 'gobierno',
  'REGISTRO CIVIL': 'gobierno',
  'TESORERIAS': 'gobierno',
  'BOMBEROS': 'seguridad',
  'CUARTELES DE POLICIA AUXILIAR': 'seguridad',
  'CUARTELES FGJ': 'seguridad',
  'CENTRO DE ACOPIO EN CASO DE EMERGENCIAS': 'seguridad',
  'RECLUSORIOS': 'seguridad',
  'CLINICA': 'salud',
  'HOSPITALES': 'salud',
  'ATENCION A VIOLENCIA DE LAS MUJERES': 'salud',
  'MODULOS DE ATENCION AL ADULTO MAYOR': 'salud',
  'SEDES 65 Y MAS': 'salud',
  'EDUCACION PUBLICA': 'educacion',
  'EDUCACION PRIVADA': 'educacion',
  'BIBLIOTECAS': 'educacion',
  'CASAS Y CENTROS DE LA CULTURA': 'educacion',
  'CINE': 'educacion',
  'FONOTECAS': 'educacion',
  'FOTOTECA': 'educacion',
  'GALERIAS': 'educacion',
  'MUSEOS Y TEATROS': 'educacion',
  'PILARES': 'educacion',
  'CABLEBUS': 'cablebus',
  'CENTRAL CAMIONERA': 'transporte',
  'CETRAMS': 'cetram',
  'CICLOESTACIONES': 'ecobici',
  'ESTACIONES DEL SISTEMA DE TRASPORTE COLECTIVO METRO': 'metro',
  'METROBUS': 'metrobus',
  'TREN LIGERO': 'tren_ligero',
  'TURIBUS': 'transporte',
  'DEPOSITOS DE VEHICULOS': 'transporte',
  'VERIFICENTRO': 'verificentro',
  'BANCOS': 'comercio',
  'CENTROS COMERCIALES': 'comercio',
  'GASOLINERAS': 'comercio',
  'GASERA': 'comercio',
  'LECHERIA LICONSA': 'comercio',
  'MERCADOS': 'comercio',
  'OXXO': 'comercio',
  'TIENDAS DEPARTAMENTALES': 'comercio',
  'NOTARIAS': 'comercio',
  'CENTRO DE ATENCION CFE': 'servicios',
  'OFICINA DE SACMEX': 'servicios',
  'PRESAS Y VASOS DE REGULACION': 'servicios',
  'SUBESTACIONES ELECTRICAS': 'servicios',
  'ESPECTACULARES': 'servicios',
  'LUNAS': 'servicios',
  'ALOJAMIENTO TEMPORAL': 'comunidad',
  'COMEDORES COMUNITARIOS': 'comunidad',
  'GUARDERIA': 'comunidad',
  'IGLESIAS Y TEMPLOS': 'comunidad',
  'PANTEONES': 'comunidad',
  'PARQUES Y RECREACION': 'comunidad',
  'CREMATORIOS': 'comunidad',
  'EVENTOS MASIVOS': 'eventos',
  'EMBAJADAS Y CONSULADOS': 'eventos',
};

export default function PoisLayer({ poisData }) {
  if (!poisData || Object.keys(poisData).length === 0) return null;

  return (
    <>
      {Object.entries(poisData).map(([type, geojson]) => {
        if (!geojson?.features || geojson.features.length === 0) return null;

        // ← Log temporal aquí
        if (poisData?.CAPAS_POIs?.features?.length > 0) {
          const valoresUnicos = [...new Set(
            poisData.CAPAS_POIs.features.map(f => f.properties?.POI)
          )].sort();
          //console.log('📍 POI values en features:', valoresUnicos);
        }

        const layerColor = LAYER_COLORS[type] || '#E91E63';
        const isDynamicLayer = type === 'CAPAS_POIs';
        
        return (
          <Source key={type} id={`source-poi-${type}`} type="geojson" data={geojson}>
            {isDynamicLayer ? (
              /* RENDERIZADO COMO ICONOS PARA EL LISTADO DINÁMICO */
              <Layer
                id={`layer-poi-${type}-point`}
                type="symbol"
                layout={{
                  'icon-image': [
                    'match',
                    ['upcase', ['coalesce', ['get', 'POI'], '']],
                    ...Object.entries(POI_TYPE_TO_ICON).flat(),
                    'transporte' // fallback
                  ],
                  'icon-size': 0.3,  // 64px * 0.4 = ~25px en pantalla
                  'icon-allow-overlap': true,
                }}
              />
            ) : (
              /* RENDERIZADO COMO POLÍGONOS PARA LAS CAPAS ESTÁTICAS (Mercados, Panteones, etc) */
              <>
                <Layer
                  id={`layer-poi-${type}-fill`}
                  type="fill"
                  paint={{
                    'fill-color': layerColor,
                    'fill-opacity': 0.4
                  }}
                />
                <Layer
                  id={`layer-poi-${type}-outline`}
                  type="line"
                  paint={{
                    'line-color': '#000000',
                    'line-width': 1.2,
                    'line-opacity': 0.8
                  }}
                />
              </>
            )}
          </Source>
        );
      })}
    </>
  );
}
