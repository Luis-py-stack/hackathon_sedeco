import React, { useState } from 'react';
import styles from '../../styles';
import Icons from '../../utils/icons';

export default function UploadPanel({ onLayerAdded, onLayerRemoved, onLayersCleared }) {
  const [file, setFile] = useState(null); // Para mostrar el nombre en el recuadro
  const [linkUrl, setLinkUrl] = useState('');
  const [loadedLayers, setLoadedLayers] = useState([]); // Para la lista de abajo
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile); // Esto hace que el nombre aparezca en el recuadro gris inmediatamente
    }
  };

  const handleUploadClick = async () => {
    if (!file) return alert("Por favor, selecciona un archivo primero.");
    setIsUploading(true);
    
    const reader = new FileReader();

    reader.onload = async (e) => {
      // Convertimos el binario (GPKG/Excel) a una cadena de texto Base64
      const base64Content = e.target.result.split(',')[1];

      try {
        const response = await fetch('http://localhost:8000/api/upload_base64',{
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            content: base64Content
          }),
        });

        const data = await response.json();

        console.log("Datos recibidos del servidor:", data);

        if (data && data.type === 'FeatureCollection') {
          const newLayer = {
            id: `user-layer-${Date.now()}`,
            name: file.name.toUpperCase(),
            data: data
          };
          setLoadedLayers(prev => [...prev, newLayer]); // Lo muestra en la lista del panel
          if (onLayerAdded) onLayerAdded(newLayer);     // Lo envía al mapa (App.jsx)   
          alert("¡Capa visualizada!");
        } else { 
            alert("Error: El servidor no devolvió un GeoJSON válido.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLayer = (id) => {
    setLoadedLayers(prev => prev.filter(l => l.id !== id));
    if (onLayerRemoved) onLayerRemoved(id);
  };
  const handleClearAll = () => {
    setLoadedLayers([]); // Limpia el panel
    if (onLayersCleared) onLayersCleared(); // LIMPIA EL MAPA REAL
    setFile(null);
    alert("Mapa limpio");
  };

  const [urlPortal, setUrlPortal] = useState('');
  const [opcionesExternas, setOpcionesExternas] = useState([]);

  const analizarURL = async () => {
    setIsUploading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/universal_analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlPortal })
      });
      const resultado = await resp.json();
      if (resultado.options) {
        setOpcionesExternas(resultado.options);
      } else {
        alert("No se detectaron datos compatibles en este portal.");
      }
    } catch (e) {
      console.error("Error de conexión con el backend nativo", e);
    } finally {
      setIsUploading(false);
    }
  };

  const cargarRecurso = async (opcion) => {
    setIsUploading(true);
    try {
      // Aquí llamarías a un endpoint que descargue el archivo específico
      const resp = await fetch(`http://localhost:8000/api/load_external_resource?url=${encodeURIComponent(opcion.url)}`);
      const geojson = await resp.json();

      if (geojson.error || !geojson.type || geojson.type !== "FeatureCollection") {
        alert(`Aviso: ${geojson.error || "El formato del archivo no es compatible con el mapa."}`);
        setIsUploading(false);
        return;
      }
      
      const nuevaCapa = {
        id: `ext-${Date.now()}`,
        name: opcion.name.toUpperCase(),
        data: geojson,
        isExternal: true// Esto servirá para que el mapa sepa que debe ser Heatmap
      };
      
      if (onLayerAdded) onLayerAdded(nuevaCapa);
      setLoadedLayers(prev => [...prev, nuevaCapa]);
    } catch (e) {
      alert("Error al procesar el archivo del portal.");
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div style={styles.panelSection}>
      {/* Área de selección */}
      <div 
        style={{...styles.uploadArea, border: file ? '2px solid #9F2241' : '2px dashed #bbb'}} 
        onClick={() => document.getElementById('fileInput').click()}
      >
        <div style={{ color: '#aaa', marginBottom: '5px' }}>{Icons.upload}</div>
        <p style={{fontWeight: 'bold', fontSize: '13px'}}>
          {file ? file.name : 'SELECCIONAR ARCHIVO'}
        </p>
        <p style={{fontSize: '11px', color: '#777'}}>GPKG, XLSX, CSV</p>
      </div>

      <input 
        id="fileInput" 
        type="file" 
        accept=".gpkg, .xlsx, .xls, .csv" 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {/* Botón de acción real */}
      <button 
        style={{...styles.primaryBtn, opacity: isUploading ? 0.6 : 1}} 
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        {isUploading ? 'Procesando...' : 'Cargar a la Maqueta'}
      </button>

      <div style={styles.divider} />

      {/* SECCIÓN VISUAL PARA LA URL */}
      <p style={{...styles.sectionTitle, fontSize: '12px', marginTop: '10px'}}>CARGA URL</p>
      <input 
        type="text" 
        placeholder="Pegar enlace del portal (ej. datos.cdmx.gob.mx)" 
        style={{width: '90%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '11px'}}
        value={urlPortal}
        onChange={(e) => setUrlPortal(e.target.value)}
      />
      <button 
        style={{...styles.primaryBtn, background: '#545454', opacity: isUploading ? 0.6 : 1}} 
        onClick={analizarURL}
        disabled={isUploading}
      >
        {isUploading ? 'Analizando...' : 'Analizar URL'}
      </button>

      {/* Lista dinámica que aparece si encuentra datos */}
      {opcionesExternas.length > 0 && (
        <div style={{marginTop: '10px', maxHeight: '150px', overflowY: 'auto'}}>
            <p style={{fontSize: '11px', color: '#666'}}>Selecciona un conjunto de datos:</p>
            {opcionesExternas.map(opt => (
                <button 
                    key={opt.id}
                    style={{
                        display: 'block', width: '100%', textAlign: 'left', padding: '6px', 
                        fontSize: '11px', marginBottom: '4px', cursor: 'pointer',
                        background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '3px'
                    }}
                    onClick={() => cargarRecurso(opt)}
                >
                    📥 {opt.name} ({opt.format})
                </button>
            ))}
        </div>
      )}

      <div style={styles.divider} />

      {/* Lista de capas (para que veas qué has subido) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <p style={styles.sectionTitle}>Capas del usuario:</p>
        
        {/* AGREGAR BOTÓN "LIMPIAR MAPA" */}
        {loadedLayers.length > 0 && (
            <button 
            style={{
                background: 'none', border: 'none', color: '#9F2241', 
                cursor: 'pointer', fontSize: '11px', textDecoration: 'underline'
            }}
            onClick={() => {
                setLoadedLayers([]); // Borra la lista del panel
                if (onLayerAdded) {
                // Opción 1: Mandar un array vacío si App.jsx espera eso
                // onLayerAdded([]); 
                
                // Opción 2: Si onLayerAdded solo agrega, necesitamos crear una prop onLayersCleared
                if (onLayersCleared) onLayersCleared(); 
                }
                alert("Mapa limpiado con éxito");
            }}
            >
            Limpiar mapa
            </button>
        )}
        </div>

        {loadedLayers.map(layer => (
        <div key={layer.id} style={{display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px'}}>
            {Icons.layers} <span>{layer.name}</span>
            </div>
            <button 
            style={{background: 'none', border: 'none', color: '#9F2241', cursor: 'pointer', fontSize: '16px'}}
            onClick={() => {
                // 1. Quitar de la lista local del panel
                setLoadedLayers(prev => prev.filter(l => l.id !== layer.id));
                
                // 2. AVISAR A APP.JSX PARA QUITAR DEL MAPA
                // Necesitamos agregar esta nueva prop para que App.jsx sepa cuál borrar
                if (onLayerRemoved) onLayerRemoved(layer.id);
            }}
            >
            ×
            </button>
        </div>
        ))}

    </div>
  );
}