# Agentes de desarrollo y coordinación

## Contrato operativo

El agente principal de Codex coordina el trabajo de esta conversación. La
configuración de proyecto `.codex/config.toml` registra perfiles TOML en
`app/agents/`. No se agregan agentes ni dependencias a la aplicación publicada.
Esta configuración de herramientas y el `AGENTS.md` raíz son la excepción de
metadatos a la ubicación exclusiva del código de aplicación en `app/`.

| Rol | Perfil | Responsabilidad | Escritura |
| --- | --- | --- | --- |
| Orquestador | AGENTS.md raíz y app/AGENTS.md | Acotar, asignar, integrar, esperar resultados y reportar | Dentro del alcance autorizado |
| implementador | app/agents/implementador.toml | Implementar cambios acotados | Solo archivos asignados |
| qa_tester | app/agents/qa-tester.toml | Revisar comportamiento y ejecutar verificaciones | Sin editar; salidas temporales de herramientas permitidas |
| guardrail_auditor | app/agents/guardrail-auditor.toml | Auditar restricciones e integridad | Sin editar |

Los roles heredan modelo, permisos y servicios de la sesión. Las restricciones de
escritura indicadas son instrucciones de trabajo, no un sandbox independiente.
Máximo tres subagentes concurrentes además del principal; sin delegación recursiva.

## Flujo obligatorio

1. El principal lee documentación y estado Git; registra los cambios previos.
2. Para trabajo independiente, delega con objetivo, entradas, archivos asignados,
   límites, comprobaciones y resultado esperado. No se delega por mera formalidad.
3. Asigna un único escritor por archivo. QA y auditor pueden investigar en paralelo;
   sus verificaciones finales se ejecutan sobre los cambios terminados. No se corren
   pruebas sobre archivos que otro agente todavía está modificando.
4. El principal espera los informes, resuelve discrepancias y devuelve correcciones
   al implementador o las realiza directamente. Repite solo controles afectados.
5. Informa archivos, evidencia, pruebas, códigos de salida y limitaciones. Actualiza
   MEMORY.md. Un fallo previo sigue siendo fallo; no se declara calidad aprobada.
6. Commit y push requieren orden expresa y las puertas de calidad vigentes.

Formato de devolución: estado; alcance; archivos; hallazgos con ubicación;
comandos y códigos de salida; pruebas aprobadas/fallidas; pendientes y limitaciones.

## Activación y uso

Abra este repositorio como proyecto confiable en una sesión compatible de Codex.
La configuración se carga al iniciar la sesión; una sesión ya abierta puede requerir
recarga para descubrir los nuevos roles. El principal puede ejecutar desde ahora
los perfiles mediante las herramientas disponibles leyendo sus instrucciones.
El nombre mostrado por el host puede diferir del nombre de la tarea delegada.

Ejemplo: «Implemente este cambio con implementador y pida a qa_tester y
guardrail_auditor que revisen el resultado». AGENTS.md también instruye al principal
a delegar automáticamente cuando la tarea tenga partes independientes.

Los perfiles persistentes no son procesos permanentes, un servicio de producción
ni un scheduler. Si faltan herramientas multiagente, el principal informa la
limitación y realiza el trabajo secuencialmente. No inventa una ejecución delegada.

## Validación y estado inicial

- En esta implementación se usaron subagentes reales QA y auditor, coordinados
  mediante las herramientas de creación, mensajes y espera de la sesión.
- La configuración persistente debe ser aceptada por el lector de configuración
  de Codex; esto no acredita por sí solo una invocación futura de cada perfil.
- Validación del 20 de octubre de 2026: TOML, referencias y UTF-8 sin BOM
  comprobados con Python tomllib (salida 0); revisión independiente QA y auditor
  sin hallazgos bloqueantes. `git diff --check` terminó con salida 0.
- Prueba funcional: `codex exec --strict-config --sandbox read-only --json`
  desde la raíz terminó con salida 0. Sesión
  `01a15a17-db30-7ee3-84f3-bb0fe1d53f52`: el coordinador solicitó los tres tipos
  exactos sin contexto heredado y recogió sus respuestas. Cada rol devolvió la
  restricción de edición de su perfil. No se ejecutaron comandos de la aplicación.
- Limitación observada: el primer intento con `--ephemeral` aceptó el registro,
  pero falló al crear subagentes por `no rollout found for thread id`. Para esta
  versión del host use una sesión normal con historial para delegar. El código de
  salida 0 del coordinador no basta para certificar éxito: hay que leer resultados.
- Línea base de la revisión anterior: 63 pruebas, 60 aprobadas y tres fallos de
  integridad/nomenclatura/paridad de ZIP. No se corrigen con esta configuración.
- Las pruebas jsdom existentes no acreditan layout real ni accesibilidad integral.

Referencia oficial de configuración:
https://learn.chatgpt.com/docs/config-file/config-reference
Referencia oficial de subagentes:
https://learn.chatgpt.com/docs/agent-configuration/subagents
