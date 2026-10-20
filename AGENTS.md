# Coordinación de agentes del repositorio

Antes de trabajar, lea `app/AGENTS.md`, `app/docs/spec.md` y `app/docs/MEMORY.md`.
La aplicación y su documentación técnica residen en `app/`. La configuración
de Codex en `.codex/config.toml` es metadato de desarrollo, no código del sitio.

El agente principal de la conversación es el orquestador. Para tareas de
implementación con trabajo independiente, use los subagentes definidos en
`app/agents/`: `implementador`, `qa_tester` y `guardrail_auditor`. Esta instrucción
autoriza delegar dentro del alcance pedido por el usuario, sin nueva confirmación.
Para consultas breves o pasos dependientes, trabaje directamente.

Protocolo obligatorio: `app/docs/agents.md`. Asigne objetivos, archivos y resultados
esperados antes de delegar. Un solo responsable puede editar cada archivo a la vez.
QA y auditor revisan sin editar; el orquestador integra y espera sus resultados.
No permita que subagentes creen otros subagentes. No declare éxito si hay fallos
pendientes ni confunda una revisión con pruebas ejecutadas.

No modifique cambios previos ajenos. No haga commit ni push sin instrucción
expresa del usuario. Conserve los permisos y el modelo de la sesión.
Si el host no ofrece subagentes, informe la limitación y haga la revisión de forma
secuencial, sin afirmar que hubo ejecución multiagente.
