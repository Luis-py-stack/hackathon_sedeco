import React, { useState, useEffect, useRef } from 'react';
import Icons from '../../utils/icons';
import styles from '../../styles';

export default function FloatingPanel({
  id,
  title,
  icon,
  isOpen,
  onClose,
  children,
  initialPosition = { x: 70, y: 100 },
  width = 350,
  minHeight = 200,
}) {
  const [position,    setPosition]    = useState(initialPosition);
  const [isDragging,  setIsDragging]  = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.panel-content')) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup',   handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup',   handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        ...styles.floatingPanel,
        left:   position.x,
        top:    position.y,
        width,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header draggable */}
      <div style={styles.panelHeader} onMouseDown={handleMouseDown}>
        <div style={styles.panelHeaderLeft}>
          <span style={styles.panelIcon}>{icon}</span>
          <span style={styles.panelTitle}>{title}</span>
        </div>
        <div style={styles.panelHeaderButtons}>
          <button
            style={styles.panelBtn}
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {Icons.minimize}
          </button>
          <button style={styles.panelBtn} onClick={onClose} title="Cerrar">
            {Icons.close}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="panel-content" style={{ ...styles.panelContent, minHeight }}>
          {children}
        </div>
      )}
    </div>
  );
}