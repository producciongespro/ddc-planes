# ESPECIFICACIÓN TÉCNICA Y FUNCIONAL (SPEC.MD)
## Sistema Repositorio Oficial de Planes Digitales Curriculares 2027
**Ministerio de Educación Pública de Costa Rica (MEP)**  
**Dirección de Desarrollo Curricular (DDC)**  
**Consejo Superior de Educación (CSE)**  

---

| Metadato | Detalle |
| :--- | :--- |
| **Documento:** | `app/docs/spec.md` |
| **Rol en el Proyecto:** | **Única Fuente de Verdad (SSOT - Single Source of Truth)** |
| **Metodología:** | Spec-Driven Development (SDD) |
| **Versión del Sistema:** | `1.0.1` (`[versión].[liberación].[compilado]`) |
| **Estado:** | Aprobado y Vigente |
| **Repositorio:** | `producciongespro/ddc-planes-digitales` |

---

## 1. Contexto Institucional y Propósito

### Coordinación de desarrollo
El contrato operativo de agentes está en `app/docs/agents.md`. El agente principal
coordina tres perfiles persistentes (`implementador`, `qa_tester`,
`guardrail_auditor`) registrados en `.codex/config.toml` y definidos en `app/agents/`.
Esta configuración es metadato de desarrollo fuera del código de producción.
La delegación usa las herramientas del host, hereda permisos y modelo y exige
asignación de archivos, espera de resultados y consolidación de evidencia.
No introduce backend ni procesos permanentes en el sitio.

### Integridad de archivos del catálogo
Cada entrada de `archivos[]` debe corresponder a un archivo físico único. La
`rutaDescarga` principal debe figurar entre esas entradas. La auditoría compara
todos los archivos del árbol público con todos los anexos del JSON y rechaza
archivos huérfanos, enlaces rotos y referencias duplicadas. Un registro puede
tener varios ZIP sin aumentar el número de planeamientos.

El **Repositorio Curricular Digital 2027** es una plataforma web oficial desarrollada para el Ministerio de Educación Pública de Costa Rica (MEP), concebida bajo la supervisión directa de la Dirección de Desarrollo Curricular (DDC).

### 1.1 Objetivo General
Proveer a todo el cuerpo docente de Costa Rica un canal institucional centralizado, veloz, accesible y autónomo para la consulta, filtrado dinámico y descarga segura de los **197 planeamientos de estudio normados** para el ciclo lectivo 2027, aprobados por el Consejo Superior de Educación (CSE).

### 1.2 Alcance del Repositorio
- **Total de Planeamientos Oficiales:** Exactamente 197 paquetes curriculares normados.
- **Formato de Entrega:** Archivos empaquetados en `.zip` con documentos oficiales en Word (`.docx`) y/o PDF.
- **Soporte Multi-archivo:** Cada registro curricular puede contener uno o múltiples archivos complementarios (planes principales, anexos, guías de mediación pedagógica, plantillas).
- **Cobertura Territorial:** Diseñado para funcionar de manera fluida en cualquier centro educativo del país, incluso bajo redes con ancho de banda limitado o intermitente.

---

## 2. Requisitos Funcionales (RF)

### RF-01: Carga Asíncrona Desacoplada del Catálogo Curricular
- **Descripción:** La aplicación no empaqueta los datos dentro del bundle JavaScript de React. Consulta el archivo `/data/ddc-planeamientos.json` como una API estática externa al iniciar.
- **Comportamiento:**
  - Ejecuta un `fetch('/data/ddc-planeamientos.json?_t=[timestamp]', { cache: 'no-cache' })`.
  - Permite la actualización en caliente ("hot-update") de materias, rutas o anexos directamente en el servidor sin necesidad de recompilar la aplicación (`npm run build`).
  - Si la petición es exitosa, inicializa el catálogo en memoria y fusiona los contadores de descargas persistidos en el cliente.

### RF-02: Pantalla de Carga Institucional (Splash Screen) y Resiliencia de Red
- **Descripción:** Mientras los datos son consultados por red, la interfaz muestra una pantalla de bienvenida institucional a pantalla completa.
- **Comportamiento:**
  - Despliega el isotipo curricular provisional (escudo y libro académico en SVG MEP · DDC 2027), spinner de doble anillo giratorio y leyendas oficiales.
  - En caso de falla en la conexión (error 404, 500 o caída de red), conmuta automáticamente a una vista de contingencia con mensaje amigable y botón **"Reintentar conexión"**.

### RF-03: Búsqueda Libre Predictiva en Tiempo Real
- **Descripción:** Barra de búsqueda predictiva ubicada en la barra de herramientas principal.
- **Comportamiento:**
  - Filtra instantáneamente por coincidencia insensible a mayúsculas, minúsculas y tildes sobre: *Asignatura*, *Oferta Educativa*, *Grado* y *Nombre de Archivos*.
  - Actualiza de forma reactiva el contador de registros encontrados y recalcula la paginación.

### RF-04: Filtros Multidimensionales en Cabeceras de Columna (`ColumnFilter`)
- **Descripción:** Menús popover flotantes integrados en los encabezados `<th>` de las columnas *Oferta Educativa*, *Asignatura* y *Grado*.
- **Comportamiento:**
  - Operación en modo **borrador (draft)**: El usuario puede marcar/desmarcar opciones sin alterar la tabla hasta que presione explícitamente el botón **"Aplicar Filtro"**.
  - Opciones de acción rápida: Botones para **"Marcar todas"**, **"Desmarcar todas"** y **"Cancelar"**.
  - Buscador interno dentro del popover para listas largas de opciones.
  - Indicador visual destacado en el encabezado de la columna cuando tiene un filtro activo.

### RF-05: Descarga Multi-Archivo Híbrida y Secuencial
- **Descripción:** Flexibilidad total para descarga unitaria o en lote de todos los documentos asociados a una asignatura.
- **Comportamiento:**
  - **Descarga en Lote (Botón de Acción Principal):** Al presionar el botón azul zafiro de la fila, se descargan secuencialmente todos los archivos ZIP vinculados a esa asignatura con un intervalo de **350 ms** entre descargas para evitar bloqueos del navegador web. Muestra un badge numérico si hay más de 1 archivo.
  - **Descarga Unitaria por Chip:** Cada etiqueta amarilla en la columna *Archivos* es un botón clickeable independiente que dispara la descarga exclusiva de ese archivo específico.
  - Cada evento de descarga incrementa el contador de métricas del registro y lo persiste en `localStorage`.

### RF-06: Persistencia Ligera de Métricas de Descarga
- **Descripción:** Almacenamiento local en el navegador exclusivo para registrar las descargas docentes.
- **Comportamiento:**
  - Clave en `localStorage`: `mep-ddc-planes-2027-downloads`.
  - Estructura: Diccionario plano `{ [id]: numeroDescargas }`.
  - Migración automática retrocompatible: Si el cliente posee datos en la clave antigua `mep-ddc-planes-2027`, se migran los contadores y se purga el almacenamiento obsoleto para no guardar catálogos pesados en el cliente.

### RF-07: Paginador Seguro con Ventana Deslizante
- **Descripción:** Controles de navegación en tabla con selector de filas por página (`15`, `20`, `50`, `Todos`).
- **Comportamiento:**
  - Ventana deslizante matemática de 5 páginas adyacentes a la actual.
  - Botones de salto rápido: **« Primero**, **‹ Anterior**, **Siguiente ›** y **Último »**.
  - Generación de claves DOM únicas (`pag-btn-${pNum}`) para evitar duplicación de nodos y errores de renderizado.

### RF-08: Podio Dinámico "Top de Descargas"
- **Descripción:** Sección visual que rankea en tiempo real los planeamientos con mayor demanda.
- **Comportamiento:**
  - Ordena de mayor a menor según el número de descargas.
  - Estado vacío (*Zero State*): Si el total de descargas es 0, despliega un mensaje motivacional docente invitando a explorar los planes.

### RF-09: Soporte Nativo de Temas Claro / Oscuro
- **Descripción:** Selector de modo en el encabezado con conmutación fluida de clases Tailwind en `<html>`.
- **Comportamiento:**
  - Persiste la preferencia en `localStorage` bajo la clave `mep-theme` (`'light'` o `'dark'`).
  - Detección automática de preferencia del sistema operativo (`prefers-color-scheme`) en la primera visita.

### RF-10: Modales Institucionales
- **Acerca de (`AboutModal.jsx`):** Muestra el contexto normativo, créditos institucionales de la DDC y directrices del CSE.
- **Mantenimiento y Reinicio (`ResetConfirmModal.jsx`):** Modal de confirmación con doble advertencia para restablecer contadores de descarga a cero absoluto.

---

## 3. Requisitos No Funcionales (RNF)

| Identificador | Requisito | Criterio de Aceptación |
| :--- | :--- | :--- |
| **RNF-01** | **Arquitectura App Shell** | Header fijo (`z-20`), Footer fijo (`z-20`). El único contenedor con barra de desplazamiento es el cuerpo central (`flex-1 overflow-y-auto`). Prohibido cualquier scroll horizontal en resoluciones desde 320px hasta 4K. |
| **RNF-02** | **Rendimiento y Peso** | El bundle JavaScript final compilado (`dist/assets/*.js`) no debe exceder los 300 KB. El tiempo de carga interactivo (LCP) debe ser inferior a 1.2 segundos sobre conexiones estándar. |
| **RNF-03** | **Portabilidad y Despliegue** | 100% estático. Debe ejecutarse de manera idéntica en Apache, NGINX, Azure Static Web Apps, AWS S3, IIS o GitHub Pages sin requerir motores PHP, Node.js ni bases de datos en el servidor de producción. |
| **RNF-04** | **Tratamiento y Accesibilidad** | Redacción formal dirigida al usuario mediante tratamiento de respeto de «usted» (*«seleccione»*, *«consulte»*, *«descargue»*). Contraste de colores apto para estándar WCAG AA. |
| **RNF-05** | **Dualidad Ortográfica Estricta** | **En la Interfaz (UI):** Respeto riguroso de la ortografía RAE con todas las tildes y diacríticos oficiales (*Matemática*, *Educación Cívica*, *Sétimo*, *II Ciclos*, etc.). **En el Sistema de Archivos / Rutas:** Carpetas y nombres en disco limpios, sin tildes ni caracteres conflictivos para compatibilidad con servidores Linux/Apache. |
| **RNF-06** | **Blindaje Anti-Mojibake y UTF-8** | Todos los archivos de código, marcado, estilos y datos deben persistirse estrictamente en **UTF-8 sin BOM**. Todo script o tool debe forzar explícitamente `encoding: utf8` para impedir la corrupción de caracteres (`Ã¡`, `Ã©`, `Ã±`). |
| **RNF-07** | **Certificación Multi-Pantalla (20 Viewports)** | Layout certificado bajo una matriz exhaustiva de 20 resoluciones comerciales estándar (desde móviles plegables de 320px hasta monitores 4K de 3840px, pasando por tablets, netbooks escolares y pizarras interactivas de aula) sin quiebre de componentes. |

---

## 4. Contrato de Datos (Data Schema)

El archivo [`app/public/data/ddc-planeamientos.json`](file:///c:/xampp/htdocs/ddc-planes-digitales/app/public/data/ddc-planeamientos.json) es la única fuente de verdad taxonómica.

### 4.1 Definición TypeScript / Schema de Cada Registro Curricular

```typescript
interface ArchivoCurricular {
  nombre: string;          // Ej: "plan-interactivo-i.zip"
  tipo: string;            // Ej: "ZIP", "PDF", "DOCX"
  ruta: string;            // Ruta web relativa accesible: "/ddc-planeamientos/preescolar/interactivo-i/plan-interactivo-i.zip"
  tamanoBytes: number;     // Tamaño exacto en bytes (ej: 1057)
  tamanoLegible: string;   // Tamaño formateado para el docente (ej: "1.0 KB", "2.4 MB")
}

interface PlaneamientoCurricular2027 {
  id: string;                  // Identificador oficial único (Ej: "DDC-2027-001")
  ofertaCodigo: string;        // Código normalizado (Ej: "PREESCOLAR", "PRIMARIA", "SECUNDARIA")
  ofertaNombre: string;        // Nombre visual institucional oficial (Ej: "Educación Preescolar")
  ofertaBadgeColor: string;    // Color temático Tailwind (Ej: "amber", "emerald", "blue", "indigo", "rose", "cyan", "violet")
  asignatura: string;          // Nombre de la asignatura o área curricular (Ej: "Educación Cívica", "Matemática")
  grado: string;               // Nivel o grado académico (Ej: "Primer Año (1°)", "Sétimo Año")
  rutaRelativa: string;        // Subruta física dentro de ddc-planeamientos (Ej: "preescolar/interactivo-i")
  archivos: ArchivoCurricular[]; // Lista de todos los archivos disponibles para esta materia
  archivoPrincipal: string;    // Nombre del archivo representativo primario
  rutaDescarga: string;        // Ruta web de descarga del archivo principal
  descargas: number;           // Contador local de descargas (por defecto 0)
  vigencia: string;            // Ciclo de vigencia oficial ("2027")
}
```

### 4.2 Almacenamiento en `localStorage`

1. **Descargas:**
   - **Clave:** `mep-ddc-planes-2027-downloads`
   - **Valor:** `{ [id: string]: number }` (Ej: `{"DDC-2027-001": 5, "DDC-2027-015": 2}`)
2. **Tema Visual:**
   - **Clave:** `mep-theme`
   - **Valor:** `"light"` | `"dark"`

---

## 5. Taxonomía Oficial de las 7 Ofertas Educativas de la DDC

| # | Código | Oferta Curricular Oficial | Color Temático | Distribución de Registros |
| :---: | :--- | :--- | :---: | :--- |
| **1** | `PREESCOLAR` | **Educación Preescolar** | Ámbar (`amber`) | Materno Infantil (Interactivo I) y Transición (Interactivo II). |
| **2** | `PRIMARIA` | **I y II Ciclos** | Esmeralda (`emerald`) | Primaria regular de 1° a 6° año (todas las asignaturas básicas y complementarias). |
| **3** | `SECUNDARIA` | **III Ciclo y Educación Diversificada** | Azul (`blue`) | Secundaria Académica y Técnica de 7° a 11°/12° año. |
| **4** | `EPJA` | **Educación de Personas Jóvenes y Adultas** | Índigo (`indigo`) | Orientaciones y guías modulares para IPEC y CINDEA. |
| **5** | `ESPECIAL` | **Educación Especial** | Rosa (`rose`) | Centros Especiales, Aula Integrada, Audición, Lenguaje, PNV y Primera Infancia. |
| **6** | `INTERCULTURAL` | **Educación Intercultural** | Cian (`cyan`) | Culturas y Lenguas Indígenas oficiales: Bribri, Cabécar, Boruca, Ngäbe y Maleku. |
| **7** | `UNIDOCENTES` | **Escuelas Unidocentes** | Violeta (`violet`) | Programas multigrado adaptados de 1° a 6° año de primaria rural. |

**Total Auditado:** 197 carpetas y registros oficiales.

---

## 6. Guardrails y Reglas Inquebrantables del Arnés

Estas reglas son obligatorias y no pueden ser alteradas por ningún desarrollador ni agente autónomo de IA:

1. **PROHIBIDO EL USO DE BACKEND DINÁMICO (PHP / NODE RUNTIME):**
   - El aplicativo debe permanecer 100% estático. No se permite reincorporar endpoints PHP ni dependencias que requieran un servidor de aplicaciones en tiempo de ejecución.
2. **PROHIBIDO ACOPLAR EL CATÁLOGO AL BUNDLE:**
   - No se permite importar `ddc-planeamientos.json` directamente en archivos `.js`/`.jsx` de React. El catálogo siempre debe obtenerse mediante `fetch('/data/ddc-planeamientos.json')`.
3. **REGLA ESTRICTA DE CONTROL DE VERSIONES (GIT):**
   - **NUNCA** ejecutar `git commit` ni `git push` de manera automática. Todas las tareas deben validarse primero en local y esperar la autorización explícita de Chris antes de sincronizar con el repositorio remoto.
4. **BLINDAJE DE CODIFICACIÓN UTF-8 SIN BOM:**
   - Cualquier archivo generado o editado debe garantizar codificación UTF-8 sin BOM para prevenir el mojibake.
5. **PRESERVACIÓN DEL APP SHELL:**
   - El Header y Footer deben permanecer fijos en la pantalla (`flex-shrink-0 z-20`). El único scroll permitido es el vertical en el área de contenido principal (`flex-1 overflow-y-auto`).
6. **ÚNICA FUENTE DE VERDAD (SSOT):**
   - Cualquier cambio en la arquitectura, requisitos o estructura debe actualizarse prioritariamente en `app/docs/spec.md` y documentarse en `app/docs/MEMORY.md`.
