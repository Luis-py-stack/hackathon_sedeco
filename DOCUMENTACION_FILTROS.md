# Documentación Técnica del Sistema de Filtros

Este documento describe a detalle el funcionamiento del sistema de filtros de la aplicación Numeralia C5. El sistema utiliza una arquitectura de **filtrado en cascada** (especialmente para Colonias y Cuadrantes) y **actualización reactiva** del mapa.

## 1. Arquitectura General

El flujo de datos funciona de la siguiente manera:

1.  **Frontend (UI):** El usuario interactúa con los paneles (ej. selecciona una Alcaldía).
2.  **Frontend (Estado):** Se actualiza el estado global de filtros.
3.  **Frontend (Hooks):** 
    *   `useCamaras` detecta el cambio y solicita los puntos geográficos (GeoJSON).
    *   `useStats` detecta el cambio y solicita las estadísticas numéricas.
    *   Los paneles individuales solicitan `/api/filtros/opciones` para actualizar sus listas desplegables (Lógica de Cascada).
4.  **Backend (API):** Recibe los parámetros, filtra el DataFrame de Pandas/GeoPandas y retorna los resultados JSON.

---

## 2. Frontend (`App.jsx`)

### Gestión del Estado (`useFilters`)
Existe un hook personalizado que maneja el objeto de estado central:

```javascript
const [filters, setFilters] = useState({
  alcaldias: [],    // Array de strings
  tiposPoste: [],   // Array de strings
  sectores: [],     // Array de strings
  c2: [],           // Array de strings
  colonias: [],     // Array de strings
  cuadrantes: [],   // Array de strings (CVE_CUADRA)
  ids: [],          // Array de strings (ID_BCT_O)
});
```

### Lógica de Cascada (Ejemplo: `ColoniaPanel` y `CuadrantePanel`)
Estos paneles no son estáticos; sus opciones cambian dinámicamente.

1.  **Carga Inicial:** Se llama a `/api/filtros/opciones` sin parámetros para llenar el dropdown de "Alcaldías".
2.  **Selección de Alcaldía:**
    *   Se actualiza el filtro global `alcaldias`.
    *   Se hace un fetch a `/api/filtros/opciones?alcaldias=X`.
    *   El backend retorna solo los **Sectores** que pertenecen a esa alcaldía.
3.  **Selección de Sector:**
    *   Se actualiza el filtro global `sectores`.
    *   Se hace un fetch a `/api/filtros/opciones?alcaldias=X&sectores=Y`.
    *   El backend retorna solo las **Colonias** (o **Cuadrantes**) que pertenecen a ese sector y alcaldía.

### Hooks de Datos
*   **`useCamaras(filters)`**: Construye una Query String (ej. `?alcaldias=IZTAPALAPA&sectores=OASIS`) y llama a `/api/camaras`.
*   **`useStats(filters)`**: Similar al anterior, pero llama a `/api/stats/resumen`.

---

## 3. Backend (`main.py`)

El backend utiliza `FastAPI` y procesa los datos utilizando `pandas` y `geopandas`.

### Endpoint: `/api/filtros/opciones`
Este es el cerebro de la cascada. Determina qué opciones mostrar en los dropdowns basándose en lo que ya se ha seleccionado.

*   **Entrada (Query Params):** `alcaldias`, `c2`, `sectores`.
*   **Procesamiento:**
    1.  Carga el DataFrame completo.
    2.  Si viene `alcaldias`, filtra el DF por esas alcaldías.
    3.  Si viene `sectores`, filtra el DF resultante por esos sectores.
*   **Salida (JSON):**
    Devuelve listas ordenadas de valores únicos disponibles en el subset de datos filtrado.
    *   `alcaldias`: [...]
    *   `sectores`: [...]
    *   `colonias`: [...]
    *   `cuadrantes`: Lista de valores únicos de la columna **`CVE_CUADRA`**.
    *   `ids_camara`: Lista de valores únicos de la columna **`ID_BCT_O`**.

### Endpoint: `/api/camaras`
Retorna la geometría para el mapa.

*   **Entrada:** Todos los filtros (`alcaldias`, `tipos_poste`, `sectores`, `colonias`, `cuadrantes`, `ids`).
*   **Lógica de Filtrado:**
    *   Se aplica una intersección de filtros (AND logic).
    *   **Importante:** El parámetro `cuadrantes` filtra sobre la columna `CVE_CUADRA` del Excel/DataFrame.
    *   El parámetro `ids` filtra sobre la columna `ID_BCT_O`.
*   **Salida:** GeoJSON estándar (`FeatureCollection`).

---

## 4. Estructura de Datos (Mapping)

Es crucial mantener la coherencia entre los nombres de parámetros del frontend y las columnas del backend:

| Parámetro URL (Frontend) | Columna DataFrame (Backend) | Descripción |
|--------------------------|-----------------------------|-------------|
| `alcaldias`              | `ALCALDIA`                  | Nombre de la alcaldía (Mayúsculas) |
| `sectores`               | `SECTOR`                    | Nombre del sector policial |
| `colonias`               | `COLONIA`                   | Nombre de la colonia |
| `c2`                     | `C2`                        | Centro de comando (Norte, Sur, etc.) |
| `tipos_poste`            | `TIPO_POSTE`                | 9m, 20m, Totem, etc. |
| **`cuadrantes`**         | **`CVE_CUADRA`**            | Clave del cuadrante (Ej. C-123) |
| **`ids`**                | **`ID_BCT_O`**              | ID único de la cámara/brazo |

---

## 5. Guía para realizar cambios

### ¿Cómo agregar un nuevo filtro?

Si deseas agregar un filtro nuevo (ej. "Estado de Conectividad"):

1.  **Backend (`main.py`):**
    *   Verificar que la columna existe en el Excel/DataFrame (ej. `STATUS_CON`).
    *   En `get_camaras`: Agregar el parámetro `status: Optional[str]`. Agregar la lógica `if status: data = data[data['STATUS_CON'].isin(...)]`.
    *   En `get_filter_options`: Agregar lógica si este filtro debe afectar a otros dropdowns, y agregarlo al objeto de retorno JSON (`"status": sorted(...)`).

2.  **Frontend (`App.jsx`):**
    *   En `useFilters`: Agregar la clave `status: []` al estado inicial.
    *   En `useCamaras` y `useStats`: Agregar la línea para incluir `status` en la URL param string.
    *   **UI:** Crear un nuevo Panel (o editar uno existente) que muestre los checkboxes/selects y llame a `updateFilter('status', nuevoValor)`.

### ¿Cómo cambiar la lógica de Cascada?

Si deseas que al seleccionar "C2" se filtren las "Alcaldías":

1.  **Backend (`get_filter_options`):**
    *   Recibir el parámetro `c2`.
    *   Filtrar el DataFrame por ese C2 *antes* de extraer la lista de alcaldías únicas.
2.  **Frontend (Panel):**
    *   Cuando el usuario seleccione C2, disparar el fetch a `/api/filtros/opciones?c2=SELECCION`.
    *   Actualizar el estado local `availableAlcaldias` con la respuesta.

### Solución de Problemas Comunes

*   **El mapa no se actualiza:** Verifica que `useCamaras` esté incluyendo el nuevo parámetro en la URL y que el backend lo esté recibiendo.
*   **El dropdown sale vacío:** Verifica que la petición a `/api/filtros/opciones` esté enviando los parámetros padre (ej. alcaldía) correctamente escritos.
*   **Error "Column not found":** Asegúrate que en `main.py` el nombre de la columna (ej. `CVE_CUADRA`) coincida exactamente con el Excel cargado.
