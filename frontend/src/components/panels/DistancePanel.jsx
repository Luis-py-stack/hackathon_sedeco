import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationArrow, faArrowsLeftRightToLine,faDrawPolygon } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles';

export default function DistancePanel({
  measurements,
  mode,
  onClear,
  onDelete,
  onFilter,
  filteredCount,
  onSetTool,
  activeTool,
}) {
  const isFilter = mode === 'measure_filtrar';

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
          title="Dibujar Línea"
          style={{ ...styles.toolBtn, backgroundColor: activeTool === 'line' ? '#9F2241' : '#f8fafc', color: activeTool === 'line' ? '#fff' : '#64748b' }}
          onClick={() => onSetTool('line')}
        >
          <FontAwesomeIcon icon={faArrowsLeftRightToLine} />
          <span style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>Línea</span>
        </button>


      </div>

      <div style={styles.divider} />

      {/* Resultados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={styles.measureResultCard}>
          <span style={styles.measureLabel}>Distancia Total</span>
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
            disabled={measurements.perimeter === 0}
          >
            Filtrar cámaras
          </button>
        )}
        <button onClick={() => onSetTool('edit')} style={{ ...styles.clearBtn, flex: 1, marginTop: 0 }}>
          Editar
        </button>
        <button onClick={onDelete} style={{ ...styles.clearBtn, flex: 1, marginTop: 0 }}>
          Eliminar
        </button>
      </div>

      <div style={styles.divider} />
      <button onClick={onClear} style={{ ...styles.clearBtn, marginTop: 0 }}>
        Reiniciar
      </button>
      
    </div>
  );
}
      