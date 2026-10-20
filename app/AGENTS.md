# AGENTS.md — ddc-planes-digitales (Directrices del Proyecto)

Aplicación web profesional oficial tipo Repositorio Curricular Digital para que los docentes del Ministerio de Educación Pública (MEP) de Costa Rica consulten, filtren y descarguen los planeamientos de estudio oficiales correspondientes al ciclo 2027 aprobados por el Consejo Superior de Educación (CSE).

## Ámbito de trabajo y Única Fuente de Verdad (SSOT)
- **Carpeta de trabajo del proyecto:** `app/`.
- **Única Fuente de Verdad (SSOT - Spec-Driven Development):** Reside exclusivamente en `app/docs/`.
  - Todas las especificaciones, requisitos, arquitectura (`spec.md`) y memoria técnica persistente (`MEMORY.md`) se gestionan dentro de `app/docs/`.
  - El código debe ceñirse con fidelidad a lo especificado en `app/docs/`.
- **Regla estricta:** Fuera de `app/` no se debe crear ni modificar código fuente. Todo el desarrollo de la aplicación se realiza exclusivamente dentro de `app/` y sus subcarpetas.
- **Excepción de Git:** Las operaciones de Git (`commit`, `push`, `pull`, `sync`) se ejecutan desde la raíz `ddc-planes-digitales`.
- **Regla Estricta de Control de Versiones:** NUNCA ejecutar `git commit` ni sincronizar (`git push`) de forma automática. Siempre implementar y verificar en local, y consultar/esperar la instrucción expresa de Chris antes de commitear y sincronizar.

## Coordinación de agentes de desarrollo
- **Agentes de desarrollo:** El agente principal coordina `implementador`, `qa_tester` y `guardrail_auditor`, registrados en `.codex/config.toml` de la raíz con perfiles en `app/agents/`.
- **Protocolo obligatorio:** Lea `app/docs/agents.md`; delegue trabajo independiente con un único escritor por archivo, espere informes y consolide evidencia. QA y auditor no editan; los subagentes no delegan recursivamente.
- **Excepción de metadatos:** `AGENTS.md` y `.codex/config.toml` en la raíz son configuración de desarrollo; el código del sitio y la SSOT permanecen en `app/`.

## Nomenclatura de Versión Institucional
- Formato oficial de versión: `[versión].[liberación].[compilado]` (ej. `1.0.1`).
  - **Versión (Mayor):** `1`
  - **Liberación (Release):** `0`
  - **Compilado (Build):** `1`
- Gestionado centralizadamente en `app/src/data/version.json`.

## Stack y Estructura
- **Tecnologías:** React 19 + JavaScript (ES Modules) + Vite + Tailwind CSS (dentro de `app/`).
- **Arquitectura de Datos:** **100% Estática y Desacoplada**. No utiliza PHP ni escaneo de backend. El frontend consulta asíncronamente `/data/ddc-planeamientos.json` como una API externa con cabeceras anti-caché.
- **Iconografía:** Iconos en SVG nativo sin dependencias pesadas (`src/components/Icons.jsx`).
- **Arquitectura de Maquetación:** **App Shell** (Header fijo superior `flex-shrink-0 z-20`, Footer fijo inferior `flex-shrink-0 z-20`, y contenedor principal `flex-1 overflow-y-auto` como único elemento con scroll).
- **Repositorio Físico de Documentos:** Reside **ÚNICAMENTE** en `app/public/ddc-planeamientos/`.
  - Organizado en las **7 Ofertas Educativas Oficiales de la DDC** en kebab-case limpio:
    1. `preescolar` (Materno Infantil y Transición).
    2. `primero-y-segundo-ciclos` (Primaria: 1° a 6° año).
    3. `tercer-ciclo-y-educacion-diversificada` (Secundaria: 7° a 11°/12° año en modalidades Académica y Técnica).
    4. `4.EDUCACION PERSONAS JOVENES Y ADULTAS` (EPJA: Orientaciones Generales y Guías Específicas IPEC/CINDEA).
    5. `5.EDUCACION ESPECIAL` (Centros Especiales, Aula Integrada, Audición y Lenguaje, Primera Infancia, Plan Nacional Vocacional).
    6. `6.EDUCACION INTERCULTURAL` (Culturas y Lenguas Indígenas: Bribri, Cabécar, Boruca, Ngäbe-Buglé, Maleku).
    7. `7.UNIDOCENTES` (Escuelas Unidocentes multigrado de 1° a 6°).
  - Total exacto: **197 carpetas finales con paquetes ZIP y documentos normados**.
  - Estructura multi-archivo: Cada fila soporta múltiples archivos ZIP/anexos con descarga secuencial en lote y chips interactivos individuales.

## Comandos Oficiales y Arnés de Pruebas
- **Servidor local de desarrollo:** `npm run dev` (ejecutado dentro de `app/`, accesible en `http://localhost:5173`).
- **Verificación de compilación:** `npm run build` (ejecutado dentro de `app/`).
- **Ejecución de Pruebas Unitarias y 20 Viewports:** `npm test` (ejecutado dentro de `app/`, Vitest + jsdom).
- **Auditoría Automatizada de Guardrails:** `npm run audit:guardrails` (anti-mojibake, cero rutas Windows, desacople).
- **Protocolo de Puerta de Calidad Pre-Commit (Quality Gate Enterprise):**
  Cada vez que Chris ordene un commit, es **obligatorio** certificar las 3 puertas en cascada antes de commitear:
  1. `npm run audit:guardrails`
  2. `npm test`
  3. `npm run build`
- **Comandos Git (desde raíz `ddc-planes-digitales`, SOLO bajo autorización expresa de Chris tras superar el Quality Gate):**
  - `git add -A`
  - `git commit -m "DD-MM-YYYY: [descripción de cambios]"`
  - `git push origin ddc-planes-digitales-1.0.0`

## Arquitectura de Componentes y Flujo UI
1. **Pantalla de Carga y Contingencia de Red (`SplashScreen.jsx`):**
   - Isotipo curricular provisional institucional (escudo y libro académico MEP · DDC 2027).
   - Spinner de doble anillo en rotación suave.
   - Manejo de contingencia por desconexión o fallo HTTP con botón de reintento.
2. **Encabezado Institucional Fijo (`Header.jsx`):**
   - Identidad visual oficial MEP / DDC (`header.jpg`).
   - Métricas globales en vivo (total de planeamientos y total nacional de descargas).
   - Botón institucional "Acerca de" con modal informativo (`AboutModal.jsx`).
   - Botón toggle de tema Claro / Oscuro con persistencia en `localStorage`.
   - Botón de mantenimiento "Reiniciar datos" con modal de confirmación (`ResetConfirmModal.jsx`).
3. **Banner Institucional Compacto (`WelcomeHero.jsx`):**
   - Franja de bienvenida y acreditación curricular aprobada por el CSE.
4. **Sección 1 (Hero Maestro) - Catálogo Oficial 2027 (`GeneralTable.jsx`):**
   - **Encabezado Institucional:** Título oficial y subtítulo normativo de la DDC.
   - **Barra de Herramientas Unificada (Opción A):** Franja de una sola fila compacta con buscador predictivo libre, métricas, botón "Restablecer" y selector de paginado (`15`, `20`, `50`, `Todos`).
   - **Filtros por Columna con Checkboxes (`ColumnFilter.jsx`):** Popovers flotantes multiselección con estado borrador (draft), botones *Aplicar*, *Cancelar*, *Marcar todas* y *Desmarcar todas*.
   - **Tabla interactiva de 6 columnas (sin columna Código):** Columnas *Oferta Educativa*, *Asignatura* (con icono vectorial temático), *Grado*, *Archivos* (chips interactivos individuales con tamaño en KB/MB), *Descargas* y **botón azul zafiro compacto con badge numérico para descarga de paquete completo**.
   - **Paginador matemático seguro:** Ventana deslizante (`paginasVisibles`) con botones *« Primero*, *‹ Anterior*, numéricos, *Siguiente ›* y *Último »*.
5. **Sección 2 - Top de Descargas Docentes (`TopDownloads.jsx`):**
   - Podio nacional de los planeamientos más descargados con botón directo.
6. **Pie de Página Fijo (`Footer.jsx`):**
   - Fondo transparente con imagen institucional `footer.jpg` escalada al 100% (`bg-cover`) y badge oficial con versión `1.0.1`.

## Datos y Persistencia
- **Catálogo Maestro:** Reside exclusivamente en `app/public/data/ddc-planeamientos.json` (rutas relativas universales, sin rutas físicas de Windows).
- **Persistencia Ligera en `localStorage`:** Clave `mep-ddc-planes-2027-downloads` que almacena únicamente el mapa `{ [id]: conteoDescargas }`.
- **Clave interna oculta:** La clave técnica de almacenamiento es exclusivamente de uso interno; nunca debe exponerse en textos visibles.

## Convenciones de Código y Calidad
- **Tratamiento en UI:** Todo texto dirigido a la persona usuaria debe emplear tratamiento formal de usted («seleccione», «consulte», «descargue»).
- **Ortografía RAE estricta en UI vs Rutas:** En la interfaz visual todos los nombres llevan acentuación y diacríticos oficiales (*Matemática*, *Educación Cívica*, *Sétimo*, *Décimo*, *II Ciclos*, *III Ciclo*, etc.). Las rutas en disco se mantienen limpias y sin tildes para compatibilidad con servidores Apache/Linux.
- **Regla Estricta Anti-Mojibake y Codificación UTF-8:**
  El **mojibake** (corrupción de caracteres diacríticos como tildes, eñes o signos: `Ã¡`, `Ã©`, `Ã­`, `Ã³`, `Ãº`, `Ã±`, `Â°`, `â€“`) está terminantemente prohibido en cualquier archivo del proyecto. Para prevenirlo de forma infalible, se establecen las siguientes directrices obligatorias:
  1. **Codificación Universal UTF-8 sin BOM:** Todo archivo creado o modificado (`.json`, `.jsx`, `.js`, `.html`, `.md`, `.css`, `.txt`) DEBE guardarse estrictamente en formato **UTF-8 sin BOM** (Byte Order Mark).
  2. **Operaciones en Terminal y Scripts (PowerShell / Node.js):** Nunca asumir la codificación por defecto del sistema operativo (evitar Windows-1252 o ANSI). En Node.js, siempre declarar explícitamente `encoding: 'utf8'` en lecturas y escrituras (`fs.readFileSync(path, 'utf8')`, `fs.writeFileSync(path, data, 'utf8')`). En PowerShell, forzar `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` y parámetros `-Encoding utf8` en `Set-Content` / `Out-File`.
  3. **Catálogo `public/data/ddc-planeamientos.json`:** Los valores con tildes (*Educación*, *Orientación*, *Ciencias*, *Español*, *Francés*, *Guía*, *Música*, *Filosofía*, etc.) deben conservarse como caracteres UTF-8 nativos directos y legibles, nunca con dobles codificaciones ni caracteres rotos.
  4. **Metadatos Web y HTTP:** `index.html` debe mantener `<meta charset="UTF-8" />` como primer hijo del `<head>`.
  5. **Auditoría Preventiva Obligatoria:** Antes de dar por concluida cualquier edición, se debe verificar que los textos con caracteres especiales en español (`á, é, í, ó, ú, ñ, Ñ, ¿, ¡, °`) se lean limpios e impecables en la interfaz y en disco.
- **Certificación Multi-Pantalla Obligatoria (20 Viewports):** Todo cambio en componentes de UI debe someterse a la batería de pruebas en 20 resoluciones comerciales estándar (de 320px a 3840px) para certificar cero desbordamientos horizontales (`overflow-x`) y preservación del App Shell.
- **Memoria técnica:** Mantener actualizado [`app/docs/MEMORY.md`](file:///c:/xampp/htdocs/ddc-planes-digitales/app/docs/MEMORY.md) al concluir cada tarea relevante.
