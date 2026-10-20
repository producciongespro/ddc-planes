# MEMORY.md — ddc-planes-digitales (Memoria persistente)
Memoria técnica del proyecto en `app/docs/` (Única Fuente de Verdad - SSOT).

## Estado actual
- Corrección de integridad de Español de octavo (20 de octubre de 2026): el registro DDC-2027-124 ahora referencia los dos ZIP existentes `plan-espanol-octavo-s1.zip` y `plan-espanol-octavo-s2.zip`; el primero es la ruta principal. El guardrail de existencia revisa todos los anexos y el de paridad compara todos los archivos de `archivos[]`, además de exigir que la ruta principal figure allí y que no haya referencias duplicadas. Validación local: 10/10 guardrails, 63/63 pruebas y build correcto (JS 287,21 kB). Atención al sincronizar: ambos ZIP están ignorados por la modificación previa de `app/.gitignore`; se requiere incluirlos expresamente junto al catálogo para no publicar enlaces rotos. No se hizo commit ni push.
- Validación de roles: TOML y referencias correctos, revisión QA/auditor sin bloqueos y prueba real por nombres en Codex con `--strict-config --sandbox read-only` aprobada (sesión 01a15a17-db30-7ee3-84f3-bb0fe1d53f52, salida 0). Cada uno de los tres perfiles respondió con su restricción de edición. El modo --ephemeral falló por falta de rollout; usar sesiones normales para delegación en este host. No se repitió la suite del sitio, ya que no se cambió su código.
- Coordinación de agentes (20 de octubre de 2026): agregado AGENTS.md raíz, registro de roles en .codex/config.toml y perfiles implementador, qa_tester y guardrail_auditor en app/agents/. Contrato en app/docs/agents.md: un escritor por archivo, QA/auditor sin edición, máximo tres subagentes y consolidación por el principal. Heredan modelo y permisos. La disponibilidad persistente depende de que el host cargue la configuración; no son procesos permanentes. Se preservan cambios previos de .gitignore y ZIP y los tres fallos de guardrails de la línea base.
- Versión 1.0.1 (Nomenclatura [versión].[liberación].[compilado]. Catálogo Oficial Completo del MEP Costa Rica: 197 planeamientos normados ciclo 2027 en formato ZIP).
- Arquitectura 100% Estática Desacoplada: Catálogo remoto en `/data/ddc-planeamientos.json` consultado vía `fetch()` con cabeceras anti-caché.
- Repositorio oficial en `app/public/ddc-planeamientos/` organizado en las 7 Ofertas Educativas de la DDC bajo estándar POSIX kebab-case.
- Frontend React 19 + Vite + Tailwind CSS con arquitectura App Shell (Header y Footer fijos, scroll en contenedor central).
- Splash Screen institucional con isotipo curricular provisional, spinner doble anillo y reintento ante errores de red.
- Modo Claro / Oscuro persistente en `localStorage` (`mep-theme`).
- Persistencia ligera de descargas en `localStorage` (`mep-ddc-planes-2027-downloads`).
- 15 iconos temáticos en SVG nativo sin dependencias externas.

## Decisiones tomadas (y por qué)
- **Estandarización y Atemporalidad de Rutas (`ddc-planeamientos`):** Renombrada la carpeta pública raíz a `app/public/ddc-planeamientos/` y el archivo JSON maestro a `app/public/data/ddc-planeamientos.json`. Esto desvincula la estructura de URLs y almacenamiento de un solo año calendario (2027), permitiendo que la aplicación opere de forma genérica y soporte múltiples años o vigencias curriculares a futuro.
- **Implementación de Estándares Internacionales de Nivel Corporativo:** Incorporadas 4 mejores prácticas de clase mundial: (1) Skip Link accesible (`WCAG 2.4.1 - Bypass Blocks`) para navegación con teclado y lectores de pantalla; (2) React 19 Enterprise Error Boundary (`ErrorBoundary.jsx`) para protección ante excepciones de UI imprevistas; (3) Metadatos W3C, SEO y Open Graph en `index.html` para previsualización institucional en Teams/WhatsApp; (4) Cierre accesible de modales con tecla `Escape` (WAI-ARIA Dialog). Evaluadas 63 pruebas en 8 suites automatizadas.
- **Depuración Plurianual de la Interfaz Visual:** Eliminadas referencias rígidas a "2027" de las secciones principales de usuario (título Hero H1 renombrado a *"Repositorio de Planeamientos Curriculares"*, removidos badges "DDC · MEP" y "Vigencia 2027" del banner, secciones renombradas a *"1. Catálogo Oficial de Planeamientos"* y *"2. Top de Descargas Docentes"*, y textos de carga neutros). Se mantiene la vigencia curricular viva y configurable exclusivamente en el badge verde del Footer (`appVersion.estado = "Planeamientos 2027"`), permitiendo alternar años lectivos de forma centralizada.
- **Arquitectura 100% Estática Basada en JSON (Desacoplada de PHP y del Bundle):** Eliminada dependencia de scripts PHP y middlewares en Vite. El catálogo oficial se consulta asíncronamente mediante `fetch('/data/ddc-planeamientos.json', { cache: 'no-cache' })`. Permite actualizaciones en caliente en el servidor sin necesidad de recompilar (`npm run build`), y redujo el bundle JavaScript en casi 180 KB.
- **Saneamiento Universal del Catálogo:** Removida la propiedad `carpetaFisica` (rutas locales de Windows) de los 197 registros, garantizando portabilidad absoluta en cualquier servidor web (Apache, Nginx, Azure, AWS, IIS).
- **Única Fuente de Verdad (SSOT) en `app/docs/`:** Centralización de especificaciones (`spec.md`), directrices y memoria persistente (`MEMORY.md`) dentro de `app/docs/`.
- **Splash Screen Institucional y Resiliencia de Red:** Pantalla de carga con isotipo curricular provisional (MEP · DDC 2027), spinner de doble anillo institucional y tarjeta de contingencia con botón de reintento ante caídas de red.
- **Persistencia Ligera en localStorage:** Se eliminó el almacenamiento del catálogo completo en el navegador; ahora únicamente se persiste un mapa de descargas del usuario `{ [id]: conteo }` fusionado al vuelo con los datos remotos.
- **Descarga Multi-Archivo Híbrida y Chips Interactivos:** Botón de acción principal descarga automáticamente todos los archivos asociados a la fila de forma secuencial (micro-intervalo 350ms para evitar bloqueos del navegador), con badge numérico indicador. Cada chip de archivo individual en la columna Archivos es interactivo para descarga unitaria bajo demanda.
- **Barra de Herramientas Unificada (Opción A):** Franja de una sola fila compacta con buscador predictivo global, contador reactivo, botón restablecer y selector de elementos por página.
- **Filtros en Cabeceras de Columna (ColumnFilter):** Popovers flotantes con estado borrador (draft) que congelan la tabla mientras se seleccionan checkboxes, aplicando cambios únicamente al presionar *Aplicar Filtro*, con botones de *Cancelar*, *Desmarcar todas* y *Marcar todas*.
- **Altura Mínima de Tabla (`min-h-[480px]`):** Evita el colapso vertical cuando hay pocos registros (1 a 8 líneas) y previene el recorte o solapamiento del menú flotante de filtros.
- **Eliminación de la Columna Código:** Removida por carecer de valor pedagógico directo para el docente, liberando más de 120px de ancho para máxima legibilidad de las materias y grados.
- **Eliminación del Scroll Horizontal:** Ajuste milimétrico de columnas, anchos responsivos y botón de acción compacto solo con icono (`IconDownload`) en azul zafiro institucional.
- **Paginación Matemática Segura:** Controles completos con botones *« Primero*, *‹ Anterior*, ventana deslizante numérica estricta, *Siguiente ›* y *Último »*, con `key` única que previene duplicación de índices o clonación de nodos DOM.
- **Pie de Página (Footer) Transparente:** Removido color de respaldo oscuro y borde superior; `footer.jpg` escala al 100% de la altura (`bg-cover`) con texto en blanco de alto contraste.
- **Depuración de Archivos Obsoletos:** Eliminado `planesData.js` (83 KB del prototipo inicial), consolidando el código en `planes2027Data.js` y el catálogo taxonómico único `public/data/ddc-planeamientos.json`.
- **Ortografía RAE estricta en UI vs Sistema de Archivos:** Nombres visuales con tildes y numerales romanos normados (`II Ciclos`, `III Ciclo y Educación Diversificada`), manteniendo carpetas en disco limpias y compatibles con Apache/Linux.

## Aprendizajes y errores a evitar
- Nunca usar `localStorage` sin validación de esquema para evitar estados antiguos obsoletos.
- Nunca calcular rangos de paginación que generen números repetidos; las `key` duplicadas corrompen la reconciliación DOM de React.
- Responder al modismo costarricense "dale viaje" con "¡Mae listo, pura vida, todo quedó excelente!".
- **Regla Estricta Anti-Mojibake:** Forzar siempre UTF-8 sin BOM en scripts, lecturas, escrituras de archivos y metadatos; verificar que caracteres diacríticos (`á, é, í, ó, ú, ñ, Ñ, ¿, ¡, °`) no se corrompan por defaults de Windows/PowerShell.
- **Regla Estricta de Control de Versiones:** NUNCA ejecutar `git commit` ni sincronizar (`git push`) de forma automática. Siempre implementar y verificar en local, y consultar/esperar la instrucción expresa de Chris antes de commitear y sincronizar.

- **Certificación Multi-Pantalla (20 Viewports):** Todo cambio visual debe auditarse en la suite `responsive.test.jsx` contra 20 resoluciones comerciales (320px a 3840px) para blindar el App Shell.
- **Puertas de Calidad Pre-Commit (Quality Gate Enterprise):** Implementado protocolo de 3 capas en cascada (Guardrails -> 39 Tests + 20 Viewports -> Build < 300 KB), Git hook local `.git/hooks/pre-commit` y workflow de GitHub Actions `.github/workflows/ci.yml`.

## Próximos pasos
- Monitoreo continuo y adición de futuros anexos en las subcarpetas del ciclo 2027 según requerimientos de la DDC.
