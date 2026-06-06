# Documentación Técnica del Proyecto Numeralia C5

Esta documentación explica cómo funciona la aplicación, cómo se comunica el Frontend con el Backend, y cómo modificar y desplegar la API de FastAPI.

---

## 1. Arquitectura y Comunicación

La aplicación sigue una arquitectura **Cliente-Servidor**:

*   **Frontend (Cliente):** React (Vite)
*   **Backend (Servidor):** Python (FastAPI)
*   **Datos:** Archivos Excel/Shapefiles procesados con Pandas/GeoPandas.

### ¿Cómo llama el Frontend al Backend?

Aunque el frontend está en el puerto `5173` y el backend en el `8000`, la comunicación es transparente gracias a un **Proxy de Desarrollo**.

1.  **En el código (Frontend):**
    El frontend hace peticiones relativas a `/api`.
    ```javascript
    // Ejemplo en frontend/src/App.jsx
    const res = await fetch(`/api/camaras?alcaldias=...`);
    ```

2.  **El Proxy (Vite):**
    El archivo `frontend/vite.config.js` intercepta estas llamadas y las redirige.
    ```javascript
    // frontend/vite.config.js
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000', // Redirige al backend
          changeOrigin: true,
        }
      }
    }
    ```

3.  **El Backend (FastAPI):**
    Recibe la petición como si fuera local y responde con JSON.

---

## 2. Funcionamiento del Backend (FastAPI)

El backend se encuentra en `backend/main.py`. Utiliza la librería **FastAPI** para crear una API REST rápida y moderna.

### Estructura de `main.py`

1.  **Definición de la App:**
    ```python
    app = FastAPI(title="API Numeralia CDMX")
    ```

2.  **Carga de Datos:**
    Al iniciar, el script lee el archivo Excel `numeralia_fallas.xlsx` usando `pandas` y lo convierte en un `GeoDataFrame` (datos geográficos). Esto se hace una sola vez en memoria para que la API sea rápida.

3.  **Endpoints (Rutas):**
    Se usan "decoradores" para definir las URLs disponibles.
    
    *   `@app.get("/api/camaras")`: Devuelve el GeoJSON de las cámaras filtradas.
    *   `@app.get("/api/stats/resumen")`: Devuelve estadísticas calculadas para la tabla.

### ¿Cómo modificar el Backend?

**Ejemplo: Agregar un nuevo endpoint para obtener la hora del servidor.**

1.  Abre `backend/main.py`.
2.  Agrega una nueva función con el decorador `@app.get`.

```python
from datetime import datetime

@app.get("/api/hora")
async def obtener_hora():
    return {
        "hora_servidor": datetime.now().isoformat(),
        "mensaje": "Endpoint nuevo funcionando"
    }
```

3.  Guarda el archivo. Si el servidor está corriendo con `--reload`, se actualizará automáticamente.
4.  En el frontend, puedes consumirlo así:
    ```javascript
    fetch('/api/hora').then(res => res.json()).then(console.log);
    ```

### TypeScript y Tipado

Si migras el frontend a TypeScript, la única diferencia es definir interfaces para las respuestas del backend:

```typescript
// Ejemplo de interfaz para los datos de la cámara
interface Camara {
  type: "Feature";
  properties: {
    ID_BCT_O: string;
    ALCALDIA: string;
    NUMCAMS: number;
    // ... otros campos
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}
```

---

## 3. Ejecución y "Exportación" (Despliegue)

En Python/FastAPI, "exportar" generalmente se refiere a cómo ejecutar el código para que otros lo usen (Despliegue).

### Ejecución en Desarrollo (Local)

Para trabajar en tu máquina, abre una terminal en la carpeta `backend/` y ejecuta:

```bash
uvicorn main:app --reload --port 8000
```

*   `main`: Nombre del archivo (`main.py`).
*   `app`: Nombre de la variable dentro del archivo (`app = FastAPI(...)`).
*   `--reload`: Reinicia el servidor automáticamente si cambias el código.

### Ejecución en Producción ("Exportar" para uso real)

Para un entorno real (servidor), no usas `--reload` y sueles usar múltiples "workers" para soportar más tráfico.

1.  **Comando de producción:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 80 --workers 4
    ```

2.  **Docker (Contenedorización):**
    La forma más estándar de "exportar" hoy en día es crear una imagen Docker.

    Crea un archivo `Dockerfile` en la carpeta `backend/`:
    ```dockerfile
    FROM python:3.9

    WORKDIR /app

    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt

    COPY . .

    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
    ```

    Luego construyes la imagen:
    ```bash
    docker build -t numeralia-backend .
    ```

### Documentación Automática (Swagger UI)

Una gran ventaja de FastAPI es que genera documentación interactiva automáticamente.

1.  Asegúrate de que el backend esté corriendo.
2.  Entra en tu navegador a: **`http://localhost:8000/docs`**
3.  Verás una interfaz donde puedes probar todos tus endpoints, ver qué parámetros requieren y qué devuelven. ¡Es ideal para aprender y probar sin escribir código de frontend!
