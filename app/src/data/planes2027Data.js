/**
 * Capa de datos desacoplada para el repositorio de planes curriculares 2027.
 * El catálogo oficial se consulta dinámicamente mediante fetch() a /data/ddc-planeamientos.json
 * para permitir actualizaciones en caliente sin recompilar el bundle de React.
 */

/**
 * Consulta el catálogo oficial de planes curriculares mediante fetch() como API estática.
 * Aplica cabeceras anti-caché para garantizar siempre la lectura del archivo más reciente.
 * @returns {Promise<Array<any>>}
 */
export async function fetchPlanesCatalog() {
  const url = `/data/ddc-planeamientos.json?_t=${Date.now()}`;
  const response = await fetch(url, {
    cache: 'no-cache',
    headers: {
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    }
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo curricular (Código HTTP: ${response.status})`);
  }

  const catalog = await response.json();
  if (!Array.isArray(catalog)) {
    throw new Error('El formato del archivo ddc-planeamientos.json no es una lista válida.');
  }

  return catalog;
}
