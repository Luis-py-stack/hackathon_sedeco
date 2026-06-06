import React, { useState } from 'react';
import Icons from '../../utils/icons';
import styles from '../../styles';

export default function CoordinatesPanel({ onGoToCoordinates, onClear }) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [marker, setMarker] = useState(null);

  const handleSearch = () => {
    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      onGoToCoordinates({ latitude, longitude });
      setMarker({ latitude, longitude });
    }
  };

  const handleClearInternal = () => {
    setLat('');
    setLng('');
    setMarker(null);
    if (onClear) onClear();
  };

  return (
    <div style={styles.panelSection}>
      <h4 style={styles.sectionTitle}>Ir a Coordenadas</h4>

      <div style={styles.inputGroup}>
        <label style={styles.inputLabel}>Longitud</label>
        <input type="text" placeholder="Ej: -99.1332" value={lng} onChange={e => setLng(e.target.value)} style={styles.textInput} />
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.inputLabel}>Latitud</label>
        <input type="text" placeholder="Ej: 19.4326" value={lat} onChange={e => setLat(e.target.value)} style={styles.textInput} />
      </div>

      <button onClick={handleSearch} style={styles.primaryBtn}>
        {Icons.location}
        <span style={{ marginLeft: 8 }}>Ir a ubicación</span>
      </button>

      {marker && (
        <div style={styles.markerInfo}>
          📍 Marcador en: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
        </div>
      )}
      <div style={styles.divider} />
      <button onClick={handleClearInternal} style={{ ...styles.clearBtn, width: '100%', marginTop: 0 }}>
        Borrar marcador
      </button>
    </div>
  );
}