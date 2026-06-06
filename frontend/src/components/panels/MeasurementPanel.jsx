import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationArrow, faDrawPolygon } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles';

export default function MeasurementPanel({
  measurements,
  mode,
  onClear,
  onDelete,
  onFilter,
  filteredCount,
  onSetTool,
  activeTool,
}) {
  const isFilter = mode === 'measure_colonia';

  return (
    <div style={styles.panelSection}>
      {/* Selector de herramientas */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 2, justifyContent: 'space-between' }}>
        <button
          title="Seleccionar"
          style={{ ...styles.toolBtn, backgroundColor: activeTool === 'select' ? '#9F2241' : '#f8fafc', color: activeTool === 'select' ? '#fff' : '#64748b' }}
          onClick={() => onSetTool('select')}
        >
          <FontAwesomeIcon icon={faLocationArrow} />
          <span style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>Seleccionar</span>
        </button>

        <button
          title="Dibujar Polígono"
          style={{ ...styles.toolBtn, backgroundColor: activeTool === 'polygon' ? '#9F2241' : '#f8fafc', color: activeTool === 'polygon' ? '#fff' : '#64748b' }}
          onClick={() => onSetTool('polygon')}
        >
          <FontAwesomeIcon icon={faDrawPolygon} />
          <span style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>Polígono</span>
        </button>

        <button
          title="Dibujar Círculo"
          style={{ ...styles.toolBtn, backgroundColor: activeTool === 'circle' ? '#9F2241' : '#f8fafc', color: activeTool === 'circle' ? '#fff' : '#64748b' }}
          onClick={() => onSetTool('circle')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>Círculo</span>
        </button>
      </div>

      <div style={styles.divider} />

      {/* Resultados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isFilter ? (
          <div style={{ ...styles.measureResultCard, backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
            <span style={{ ...styles.measureLabel, color: '#0369a1' }}>Cámaras detectadas</span>
            <div style={{ ...styles.measureValue, color: '#0369a1' }}>
              {filteredCount !== null ? <>{filteredCount}<span style={styles.measureUnit}> dispositivos</span></> : '---'}
            </div>
          </div>
        ) : (
          <div style={styles.measureResultCard}>
            <span style={styles.measureLabel}>Área Superficial</span>
            <div style={styles.measureValue}>
              {measurements.area > 0
                ? <>{measurements.area.toLocaleString('en-US', { maximumFractionDigits: 2 })}<span style={styles.measureUnit}> m²</span></>
                : '---'}
            </div>
          </div>
        )}

        <div style={styles.measureResultCard}>
          <span style={styles.measureLabel}>Perímetro / Distancia</span>
          <div style={styles.measureValue}>
            {measurements.perimeter > 0 ? (
              measurements.perimeter < 1000
                ? `${measurements.perimeter.toLocaleString('en-US', { maximumFractionDigits: 2 })} m`
                : `${(measurements.perimeter / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 })} km`
            ) : '---'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 15 }}>
        {isFilter && (
          <button
            style={{ ...styles.primaryBtn, flex: 1, backgroundColor: '#0369a1', marginTop: 0 }}
            onClick={onFilter}
            disabled={measurements.area === 0 && measurements.perimeter === 0}
          >
            Filtrar cámaras
          </button>
        )}
        <button onClick={() => onSetTool('edit')} style={{ ...styles.clearBtn, flex: isFilter ? 0.5 : 1, marginTop: 0 }}>
          Editar puntos
        </button>
        <button onClick={onDelete} style={{ ...styles.clearBtn, flex: isFilter ? 0.5 : 1, marginTop: 0 }}>
          Eliminar seleccionados
        </button>
      </div>

      <div style={styles.divider} />
      <button onClick={onClear} style={{ ...styles.clearBtn, marginTop: 0 }}>
        Reiniciar
      </button>
    </div>
  );
}