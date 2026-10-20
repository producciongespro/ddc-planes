# PROTOCOLO DE PUERTAS DE CALIDAD Y ARNESES PRE-COMMIT (QUALITY-GATES.MD)
## Repositorio Curricular Oficial de Planes Digitales 2027
**Ministerio de Educación Pública de Costa Rica (MEP)**  
**Dirección de Desarrollo Curricular (DDC)**  

---

| Metadato | Detalle |
| :--- | :--- |
| **Documento:** | `app/docs/quality-gates.md` |
| **Rol en el Proyecto:** | **Protocolo de Blindaje Pre-Commit y CI/CD (SDD)** |
| **Nivel de Estándar:** | Enterprise Quality Gate (Google / Meta Standard) |
| **Estado:** | Aprobado y Activo |
| **Versión del Sistema:** | `1.0.1` |

---

## 1. Propósito y Filosofía

La experiencia vigente presenta únicamente el catálogo filtrable y sus chips de
descarga. Las estadísticas, el Top de Descargas y el reinicio de conteos fueron
retirados por decisión del sponsor. La cantidad histórica de pruebas de este
documento debe leerse junto con el resultado actual de `npm test`.

Garantizar que **ningún error humano, degradación visual, corrupción de caracteres o falla arquitectónica pueda llegar jamás al repositorio en GitHub ni a producción**. 

Cada solicitud de commit y sincronización debe superar obligatoriamente una batería de **3 Puertas de Calidad en Cascada** ejecutada por los subagentes y herramientas del arnés antes de realizar cualquier cambio en el control de versiones.

---

## 2. Las 3 Puertas de Calidad en Cascada (Quality Gates)

```
        [Instrucción de Chris: "Ejecuta commit y sincroniza"]
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  PUERTA 1: AUDITORÍA DE GUARDRAILS (Subagente Auditor)      │
  │  - Cero Mojibake en todo el código y JSON                   │
  │  - Cero rutas físicas de Windows (C:\) en catálogo          │
  │  - Cero imports directos del catálogo al bundle de React     │
  │  - Tratamiento formal institucional («usted»)               │
  │  - Cero puntos en nombres de carpetas y cero espacios web   │
  │  - Cero prefijos numéricos ("1. ") en UI y asignaturas      │
  │  - Verificación 100% de existencia física de los 197 ZIPs   │
  │  - Guardrail Físico de Directorios Kebab-case en disco      │
  │  - Guardrail Físico de Archivos ZIP Kebab-case en disco     │
  │  - Guardrail de Paridad Bidireccional (0 huérfanos/rotos)   │
  │  Comando: `npm run audit:guardrails` (10 guardrails)        │
  └────────────────────────────┬────────────────────────────────┘
                               │ (Superado al 100% ✅)
                               ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  PUERTA 2: SUITE DE PRUEBAS AUTOMATIZADAS (Subagente Tester)│
  │  - 63 pruebas en 8 suites completas (Vitest + jsdom)        │
  │  - Matriz de 20 Dimensiones Comerciales (320px a 4K UHD)    │
  │  - Arnés de Caos (Red offline, JSON corrupto, clics, cuota) │
  │  - Arnés Sensorial (Accesibilidad Ley 7600 y WCAG AA)       │
  │  - React 19 Enterprise Error Boundary (Tolerancia a UI)     │
  │  - WCAG 2.4.1 Skip Link accesible a catálogo principal      │
  │  - Resiliencia de red y Splash Screen con reintento         │
  │  - Descarga individual y paginador matemático               │
  │  Comando: `npm test`                                        │
  └────────────────────────────┬────────────────────────────────┘
                               │ (Superado al 100% ✅)
                               ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  PUERTA 3: COMPILACIÓN DE PRODUCCIÓN Y TAMAÑO DE BUNDLE     │
  │  - Compilación limpia con Vite (`npm run build`)            │
  │  - Verificación de peso: Bundle JS < 300 KB                 │
  │  - Cero errores de sintaxis o empaquetado                   │
  │  Comando: `npm run build`                                   │
  └────────────────────────────┬────────────────────────────────┘
                               │ (Superado al 100% ✅)
                               ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  AUTORIZACIÓN DE CONTROL DE VERSIONES (GIT)                 │
  │  - Staging completo de archivos (`git add -A`)              │
  │  - Commit con fecha y descripción institucional             │
  │  - Sincronización con GitHub (`git push origin ...`)        │
  │  - Reporte consolidado de certificación a Chris             │
  └─────────────────────────────────────────────────────────────┘
```

---

## 3. Criterios de Aborto Inmediato (Reglas de Parada)

Si cualquiera de las siguientes condiciones se presenta durante la ejecución, el proceso de commit se **aborta de inmediato**, se revierte cualquier cambio en el área de preparación y se le notifica a Chris el archivo y línea exactos del fallo:

1. **Detección de Mojibake:** Detección de secuencias corruptas (`Ã¡`, `Ã©`, `Ã±`, `Â°`, etc.) en cualquier archivo `.js`, `.jsx`, `.json`, `.html`, `.css` o `.md`.
2. **Presencia de Rutas Locales:** Existencia de cadenas como `C:\` o nombres de disco duro en `public/data/ddc-planeamientos.json`.
3. **Acoplamiento del Catálogo:** Detección de cualquier sentencia `import` que cargue estáticamente el archivo `ddc-planeamientos.json` o `planes2027.json` en lugar de utilizar `fetch()`.
4. **Fallo en Pruebas Unitarias, Caos, Sensorial o Layout:** Cualquier aserción no cumplida en las 59 pruebas de Vitest o desbordamiento en los 20 viewports comerciales.
5. **Violación de Nomenclatura en Disco:** Carpetas o archivos en `public/ddc-planeamientos/` con mayúsculas, espacios, puntos o prefijos numéricos.
6. **Exceso de Peso en Bundle:** Archivo JavaScript compilado superior a 300 KB.

---

## 4. Implementación en Git y la Nube (CI/CD)

### 4.1 Git Hook Local (`.git/hooks/pre-commit`)
- Intercepta automáticamente cualquier intento de commit manual o automatizado.
- Corre `npm test` en el directorio `app/`. Si hay fallas, Git rechaza el commit con código de salida `1`.

### 4.2 Pipeline de GitHub Actions (`.github/workflows/ci.yml`)
- Cada push a la rama `ddc-planes-digitales-1.0.0` o `main` activa un contenedor Ubuntu con Node.js 20.
- Ejecuta:
  1. `npm install`
  2. `npm test`
  3. `npm run build`
- Asigna el checkmark verde oficial de GitHub **`✓ All checks have passed`** garantizando calidad transparente ante autoridades institucionales y patrocinadores.
