import React from 'react';

/**
 * Encabezado de sección con checkbox "Mostrar límites" para activar capas de polígonos.
 */
export default function SectionTitleWithToggle({ title, isChecked, onToggle }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #eee',
      paddingBottom: 8,
      marginBottom: 4,
    }}>
      <h4 style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: 0 }}>{title}</h4>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', color: '#666', fontWeight: 500 }}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          style={{ width: 13, height: 13, cursor: 'pointer' }}
        />
        Mostrar límites
      </label>
    </div>
  );
}