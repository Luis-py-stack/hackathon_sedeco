import React from 'react';
import { MAP_STYLES } from '../../constants';
import styles from '../../styles';

export default function MapStylePanel({ mapStyle, setMapStyle }) {
  return (
    <div style={styles.panelSection}>
      <h4 style={styles.sectionTitle}>Estilo de Mapa</h4>
      <div style={styles.mapStyleGrid}>
        {MAP_STYLES.map(s => (
          <button
            key={s.id}
            style={{ ...styles.mapStyleBtn, ...(mapStyle === s.id ? styles.mapStyleBtnActive : {}) }}
            onClick={() => setMapStyle(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}