import React from 'react';
import styles from '../../styles';

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <img
          src="/assets/Logo_CDMX.png"
          alt="CDMX"
          style={styles.logo}
          onError={(e) => (e.target.style.display = 'none')}
        />
        <div style={styles.headerTitles}>
          <span style={styles.headerTitle}>C5</span>
          <span style={styles.headerSubtitle}>
            CENTRO DE COMANDO, CONTROL, CÓMPUTO, COMUNICACIONES Y CONTACTO CIUDADANO
          </span>
        </div>
      </div>
      <div style={styles.headerRight}>
        <span style={styles.userName}>👤 nombre_usuario</span>
      </div>
    </header>
  );
}
