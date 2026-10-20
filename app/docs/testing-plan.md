# PLAN DE PRUEBAS AUTOMATIZADAS Y ARNÉS DE CALIDAD (TESTING-PLAN.MD)
## Repositorio Curricular Oficial de Planes Digitales 2027
**Ministerio de Educación Pública de Costa Rica (MEP)**  
**Dirección de Desarrollo Curricular (DDC)**  

---

| Metadato | Detalle |
| :--- | :--- |
| **Documento:** | `app/docs/testing-plan.md` |
| **Rol en el Proyecto:** | **Especificación del Arnés de Pruebas y Subagentes (SDD)** |
| **Framework:** | Vitest + React Testing Library + jsdom |
| **Estado:** | Aprobado para Implementación |
| **Versión del Sistema:** | `1.0.1` |

---

## 1. Objetivo del Plan de Pruebas

Garantizar la **estabilidad, resiliencia y cero regresiones** del Repositorio Curricular Oficial 2027 mediante la implementación de un arnés de pruebas automatizadas y la asignación de tareas a subagentes autónomos especializados.

---

## 2. Pila Tecnológica del Arnés (Testing Stack)

| Herramienta | Rol en el Arnés | Justificación Técnica |
| :--- | :--- | :--- |
| **Vitest** | Test Runner principal | Framework nativo de Vite, soporta módulos ESM directamente, ejecuta pruebas a ultra-alta velocidad y comparte la misma configuración de `vite.config.js`. |
| **@testing-library/react** | Pruebas de componentes UI | Evalúa los componentes desde la perspectiva del usuario docente (accesibilidad, clicks, inputs, renderizado). |
| **@testing-library/jest-dom** | Matchers semánticos del DOM | Proporciona aserciones expresivas (`toBeInTheDocument`, `toBeDisabled`, `toHaveClass`). |
| **jsdom** | Entorno simulado de navegador | Emula `window`, `document`, `localStorage` y APIs de red en memoria para Node.js. |

---

## 3. Arquitectura y Roles de los Subagentes

```
                       ┌────────────────────────────────────────┐
                       │    AGENTE PRINCIPAL (Orquestador)      │
                       │   - Coordina ejecución con Chris       │
                       │   - Respeta estrictamente los Guardrails│
                       └───────────────────┬────────────────────┘
                                           │
                ┌──────────────────────────┴──────────────────────────┐
                ▼                                                     ▼
     ┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
     │  SUBAGENTE: QA & Unit Tester        │   │  SUBAGENTE: Guardrail Auditor       │
     │  - Capa de datos y lógica           │   │  - Certificación Anti-Mojibake      │
     │  - Paginador matemático             │   │  - Certificación Zero-Windows-Paths │
     │  - Filtros en borrador (Draft)      │   │  - Certificación Desacople Bundle   │
     │  - Ciclo de vida y SplashScreen     │   │  - Resiliencia y Pruebas de Caos    │
     └─────────────────────────────────────┘   └─────────────────────────────────────┘
```

---

## 4. Matriz Exhaustiva de Pruebas Unitarias y de Integración

### Suite 1: `planes2027Data.test.js` (Capa de Datos y Persistencia Ligera)
- **TEST-01:** `fetchPlanesCatalog()` consulta exitosamente `/data/ddc-planeamientos.json` y devuelve los 197 registros curriculares.
- **TEST-02:** `fetchPlanesCatalog()` adjunta cabeceras anti-caché (`cache: 'no-cache'`, `Pragma: no-cache`) y parámetro temporal `_t`.
- **TEST-03:** Manejo de contingencia: si el servidor retorna un error HTTP (ej. 404 o 500) o un JSON no válido, la función lanza una excepción descriptiva en español sin romper la ejecución.
- **TEST-04:** La consulta devuelve el catálogo sin leer ni escribir estadísticas locales.

### Suite 2: `GeneralTable.test.jsx` (Paginación Matemática y Filtros)
- **TEST-07:** El paginador calcula con exactitud matemática las páginas visibles (ventana deslizante de 5) sin generar **números duplicados** en ningún caso de borde (primera página, página intermedia, última página).
- **TEST-08:** Los botones **« Primero** y **‹ Anterior** se encuentran deshabilitados (`disabled`) cuando la tabla se ubica en la página 1.
- **TEST-09:** Los botones **Siguiente ›** y **Último »** se encuentran deshabilitados cuando la tabla se ubica en la última página.
- **TEST-10:** El componente `ColumnFilter` implementa fielmente el patrón **Borrador (Draft)**: marcar o desmarcar opciones no modifica los datos de la tabla hasta que el usuario presione el botón **"Aplicar Filtro"**.
- **TEST-11:** El botón **"Cancelar"** en `ColumnFilter` descarta los cambios en borrador y preserva el estado previo de la tabla.
- **TEST-12:** Los botones de acción rápida **"Marcar todas"** y **"Desmarcar todas"** seleccionan o deseleccionan el 100% de los elementos visibles del filtro.
- **TEST-13:** El buscador predictivo filtra reactivamente registros ignorando diferencias de mayúsculas, minúsculas y tildes (ej. buscar *"musica"* o *"MÚSICA"* debe encontrar *"Educación Musical"*).

### Suite 3: `SplashScreen.test.jsx` y `App.test.jsx` (Ciclo de Vida y Resiliencia)
- **TEST-14:** `SplashScreen` se renderiza de forma predeterminada mientras el estado `isLoading` sea `true`.
- **TEST-15:** Si ocurre un fallo de conexión, `SplashScreen` conmuta a la vista de error mostrando la tarjeta de contingencia y el botón **"Reintentar conexión"**.
- **TEST-16:** Presionar el botón de reintento dispara una nueva invocación a la función de carga.
- **TEST-17:** El chip de archivo descarga únicamente el documento seleccionado, sin registrar estadísticas.

### Suite 4: `guardrails.test.js` (Auditoría Automatizada de Seguridad y Arnés)
- **TEST-18 (Anti-Mojibake):** Escaneo recursivo de todo el proyecto certificando que ningún archivo contenga secuencias de caracteres UTF-8 corruptos (`Ã¡`, `Ã©`, `Ã­`, `Ã³`, `Ãº`, `Ã±`, `Â°`, `â€“`).
- **TEST-19 (Zero-Windows-Paths):** Certifica que ninguna entrada en `app/public/data/ddc-planeamientos.json` contenga rutas locales de Windows (`C:\` ni `C:\\`).
- **TEST-20 (Desacople del Bundle):** Certifica que ningún archivo en `app/src/` importe `ddc-planeamientos.json` de forma estática.
- **TEST-21 (Regla de Tratamiento Formal):** Verifica que los textos visibles dirigidos al usuario docente en los componentes principales mantengan tratamiento de respeto de «usted».
- **TEST-25 (Rutas Web Limpias Kebab-Case):** Certifica que ninguna carpeta en `ddc-planeamientos.json` contenga puntos ni espacios en blanco, y que las URLs de descarga sean 100% minúsculas bajo estándar POSIX RFC 3986.
- **TEST-26 (Visualización Limpia Docente):** Certifica que ninguna asignatura, grado u oferta presente prefijos numéricos ("1. ", "2. ") de cara al usuario.
- **TEST-27 (Verificación Física 100%):** Certifica que los 197 archivos ZIP existan físicamente en el disco en sus nuevas rutas relativas públicas.
- **TEST-28 (Guardrail Físico de Directorios):** Escaneo recursivo de todo el árbol en disco de `app/public/ddc-planeamientos/`. Certifica que cada carpeta cumpla con `^[a-z0-9]+(-[a-z0-9]+)*$` (cero puntos, cero espacios, cero mayúsculas, cero números con punto).
- **TEST-29 (Guardrail Físico de Archivos ZIP):** Escaneo recursivo de todos los archivos ZIP en disco. Certifica que cada archivo cumpla con `^[a-z0-9]+(-[a-z0-9]+)*\.zip$` (cero espacios, cero mayúsculas, cero puntos intermedios).
- **TEST-30 (Guardrail de Paridad Bidireccional):** Valida paridad matemática 1:1 entre los archivos del disco y los registros de `ddc-planeamientos.json` (0 archivos huérfanos y 0 enlaces rotos).

### Suite 5: `responsive.test.jsx` (Matriz de 20 Dimensiones Comerciales de Pantalla)
- **Objetivo:** Simular y certificar la fidelidad del layout App Shell, ausencia de desbordamiento horizontal (`overflow-x: hidden`) y persistencia visual de Header y Footer a lo largo de **20 resoluciones comerciales estándar**:

| # | Dispositivo / Perfil Comercial | Ancho (px) | Alto (px) | Categoría |
| :---: | :--- | :---: | :---: | :--- |
| **01** | Galaxy Z Fold (Plegado / Ultra-compacto) | **320** | 653 | Móvil ultra-estrecho |
| **02** | iPhone SE (2da/3ra gen) | **375** | 667 | Móvil compacto |
| **03** | iPhone 12 / 13 / 14 / 15 regular | **390** | 844 | Móvil estándar |
| **04** | Google Pixel 7 / 8 | **412** | 915 | Móvil Android estándar |
| **05** | iPhone 14 Pro Max / 15 Plus | **430** | 932 | Móvil grande |
| **06** | Samsung Galaxy S23 Ultra | **412** | 915 | Móvil insignia Android |
| **07** | iPad Mini (Retrato) | **768** | 1024 | Tablet compacta |
| **08** | iPad Air / 10.9" (Retrato) | **820** | 1180 | Tablet estándar |
| **09** | iPad Pro 11" (Retrato) | **834** | 1194 | Tablet profesional |
| **10** | Microsoft Surface Pro 8 | **912** | 1368 | Tablet / Laptop híbrida |
| **11** | iPad Mini (Paisaje) | **1024** | 768 | Tablet horizontal |
| **12** | iPad Air (Paisaje) | **1180** | 820 | Tablet horizontal |
| **13** | Netbook / Laptop compacta escolar | **1280** | 720 | Laptop HD compacta |
| **14** | Laptop estándar de oficina (HD) | **1366** | 768 | Laptop estándar más común |
| **15** | Laptop MacBook Pro 14" / Dell XPS | **1440** | 900 | Laptop WXGA+ |
| **16** | Monitor Laptop Full HD (15.6") | **1536** | 864 | Laptop FHD escalada |
| **17** | Monitor Desktop Oficial MEP (FHD) | **1920** | 1080 | Desktop institucional 1080p |
| **18** | Pizarra Digital Escolar Interactiva | **1920** | 1200 | Pantalla de aula docente (WUXGA) |
| **19** | Monitor QHD / 2K de Oficina | **2560** | 1440 | Monitor panorámico |
| **20** | Monitor Profesional 4K UHD | **3840** | 2160 | Pantalla Ultra HD |

- **TEST-22 (Zero Horizontal Overflow):** En cada una de las 20 resoluciones, la aplicación y la tabla no deben provocar scroll horizontal forzado ni deformar los contenedores padres (`scrollWidth <= clientWidth`).
- **TEST-23 (App Shell Fixed Anchors):** En las 20 resoluciones, el Header y Footer mantienen sus anclajes fijos (`flex-shrink-0 z-20`) y el área central es el único contenedor de scroll (`flex-1 overflow-y-auto`).
- **TEST-24 (Modal & Popover Viewport Bounds):** Los modales institucionales y menús flotantes `ColumnFilter` se recalculan para no desbordar los límites del viewport en pantallas pequeñas (320px a 430px).

### Suite 6: `chaos.test.jsx` (Arnés de Caos y Resiliencia Extrema)
- **CHAOS-01 (Corte Abrupto de Red / Offline):** Simula caída total de red (`TypeError: Failed to fetch`). Certifica ausencia de pantalla blanca y renderizado de tarjeta de contingencia en `SplashScreen`.
- **CHAOS-02 (Recuperación Resiliente):** Certifica que presionar "Reintentar conexión" tras restablecerse la red monte exitosamente el catálogo completo.
- **CHAOS-03 (JSON Corrupto en Servidor):** Simula sintaxis malformada en `ddc-planeamientos.json` (`SyntaxError`). Captura el fallo sin romper el ciclo de vida de React.
- **CHAOS-04 (Códigos HTTP 500 / 502 Bad Gateway):** Verifica la presentación clara del código de error al usuario.
- **CHAOS-05 (Payload No Tabular):** Rechazo defensivo y mensaje explícito cuando el servidor entrega un objeto o valor nulo en vez de un arreglo.
- **CHAOS-06:** Retirado al eliminar el almacenamiento de estadísticas; la preferencia de tema conserva su manejo defensivo independiente.
- **CHAOS-07 (Tolerancia a Registros Nulos/Corruptos):** Inyección de datos incompletos (`archivos: null`, grados nulos). Certifica renderizado defensivo sin excepciones de `Cannot read properties of undefined/null`.
- **CHAOS-08 (Ráfaga Frenética de Clics):** Ráfaga masiva de clics en menos de 50ms al botón de descarga. Certifica consistencia y ausencia de duplicaciones anómalas.

### Suite 7: `sensory.test.jsx` (Arnés Sensorial, Accesibilidad Ley 7600 y WCAG AA)
- **SENS-01 (Etiquetas Accesibles Universales):** Certifica que el 100% de los botones interactivos cuente con texto visible, `aria-label` o `title` descriptivo para lectores de pantalla.
- **SENS-02 (Jerarquía Semántica y Landmarks):** Certifica la presencia de `<header role="banner">`, `<main>`, `<footer role="contentinfo">` y título maestro institucional `<h1>`.
- **SENS-03 (Navegabilidad por Teclado):** Certifica ausencia de `tabIndex` negativo en los controles primarios de la aplicación.
- **SENS-04 (Orientación de Campos de Entrada):** Certifica que el buscador predictivo posea `placeholder` orientativo para tecnologías de asistencia.
- **SENS-05 (Asistencia en Pantalla de Carga):** Certifica que el `SplashScreen` posea texto narrativo claro sobre el estado del proceso.
- **SENS-06 (Retroalimentación Cuantitativa):** Certifica que los contadores de planeamientos ofrezcan formato textual semántico en tiempo real.

---

## 5. Fases de Ejecución

1. **Fase 1: Configuración del Arnés en `app/`**
   - Instalación de dependencias de desarrollo (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`).
   - Configuración de `setupTests.js` para simular `localStorage`, `fetch` y APIs de descarga del DOM.
   - Actualización de `app/vite.config.js` y `app/package.json` con el comando `npm test`.

2. **Fase 2: Despliegue del Subagente `QA & Unit Tester`**
   - Creación de los archivos de pruebas en `app/src/__tests__/`:
     - `planes2027Data.test.js`
     - `GeneralTable.test.jsx`
     - `SplashScreen.test.jsx`

3. **Fase 3: Despliegue del Subagente `Guardrail Auditor`**
   - Creación del archivo de auditoría automática:
     - `app/src/__tests__/guardrails.test.js`

4. **Fase 4: Ejecución, Certificación y Reporte a Chris**
   - Ejecución de `npm test` con reporte de cobertura.
   - Verificación de compilación limpia con `npm run build`.
   - Espera de la autorización expresa de Chris antes de cualquier commit a Git.
