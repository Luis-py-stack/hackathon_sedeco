# Requisitos del Sistema para Proyecto Numeralia C5

Este documento lista el software, versiones y permisos necesarios para configurar el entorno de desarrollo del proyecto "Numeralia C5" en equipos corporativos con restricciones.

## 1. Software Base (Instalación Requerida)

### A. Python (Backend)
El backend utiliza FastAPI y librerías de análisis de datos geoespaciales (`geopandas`, `shapely`).
*   **Software:** Python
*   **Versión Recomendada:** 3.10.x o 3.11.x (Evitar 3.12 por compatibilidad de algunas librerías geoespaciales antiguas si las hubiera).
*   **Importante durante la instalación:**
    *   Marcar la casilla **"Add Python to PATH"** (Agregar Python a las variables de entorno).
    *   Asegurar que se instale `pip` (gestor de paquetes).

### B. Node.js (Frontend)
El frontend utiliza React con Vite (Vite 5 requiere versiones modernas de Node).
*   **Software:** Node.js
*   **Versión Requerida:** LTS (Long Term Support) actual. Recomendado **v20.x** o superior (mínimo v18).
*   **Incluye:** `npm` (Node Package Manager).

### C. Control de Versiones
*   **Software:** Git
*   **Versión:** Última estable.
*   **Configuración:** Permiso para usar la terminal (CMD o PowerShell) para ejecutar comandos de git.

### D. Entorno de Desarrollo (IDE)
*   **Software:** Visual Studio Code (VS Code)
*   **Extensiones recomendadas (opcional pero útil para productividad):**
    *   *Python* (Microsoft)
    *   *ES7+ React/Redux/React-Native snippets*
    *   *Prettier - Code formatter*

---

## 2. Permisos de Red (Firewall / Proxy)

Para que el desarrollador pueda instalar las dependencias del proyecto, se requiere acceso a los siguientes repositorios de paquetes. Si hay un proxy corporativo, se deben configurar las excepciones o proveer las credenciales al desarrollador.

### Para Python (pip):
*   Dominio: `pypi.org`
*   Dominio: `files.pythonhosted.org`

### Para Node.js (npm):
*   Dominio: `registry.npmjs.org`

---

## 3. Resumen de Dependencias del Proyecto
*(Referencia técnica para verificar compatibilidad)*

*   **Backend (`requirements.txt`):**
    *   `fastapi`, `uvicorn` (Servidor Web)
    *   `pandas` (v2.1.4), `openpyxl` (Procesamiento Excel)
    *   `geopandas` (v0.14.2), `shapely` (Procesamiento Geográfico)
*   **Frontend (`package.json`):**
    *   `react`, `react-dom` (Framework UI)
    *   `vite` (Build tool)
    *   `maplibre-gl` (Mapas)

## 4. Datos Necesarios (Archivos Locales)
El sistema requiere que los siguientes archivos estén presentes en el disco local (no requieren instalación, solo copia):
1.  `backend/data/numeralia_fallas.xlsx`
2.  `backend/assets/Poligonos/` (Shapefiles)
