import React, { useState, useEffect, useMemo } from 'react';
import { AsignaturaIcon, IconTable, IconDownload, IconSearch, IconFilter, IconRefresh } from './Icons';
import { ColumnFilter } from './ColumnFilter';

const ordenPreescolar = [
  'Materno Infantil (Interactivo I)',
  'Interactivo II',
  'Transición',
  'Grupo Heterogéneo'
];

const ordenarGrados = (a, b) => {
  const indicePreescolarA = ordenPreescolar.indexOf(a);
  const indicePreescolarB = ordenPreescolar.indexOf(b);
  if (indicePreescolarA !== -1 || indicePreescolarB !== -1) {
    if (indicePreescolarA === -1) return 1;
    if (indicePreescolarB === -1) return -1;
    return indicePreescolarA - indicePreescolarB;
  }

  const numeroA = Number(a.match(/\bAño \((\d{1,2})°\)$/)?.[1]);
  const numeroB = Number(b.match(/\bAño \((\d{1,2})°\)$/)?.[1]);
  const esAnioA = numeroA >= 1 && numeroA <= 12;
  const esAnioB = numeroB >= 1 && numeroB <= 12;
  if (esAnioA || esAnioB) {
    if (!esAnioA) return 1;
    if (!esAnioB) return -1;
    return numeroA - numeroB;
  }

  return a.localeCompare(b, 'es');
};

export function GeneralTable({
  planes,
  onDownload,
  onDownloadAll,
  downloadingId,
  downloadNotice,
  filtros,
  onFiltrosChange,
  onResetFiltros
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(20);

  // 1. Ofertas educativas con conteo, ordenadas por su nombre visible
  const ofertasDisponibles = useMemo(() => {
    const map = new Map();
    planes.forEach((p) => {
      if (p.ofertaNombre) map.set(p.ofertaNombre, (map.get(p.ofertaNombre) || 0) + 1);
    });
    return Array.from(map.keys())
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map((o) => ({ value: o, count: map.get(o) }));
  }, [planes]);

  // 2. Asignaturas o Áreas dinámicas según las ofertas seleccionadas
  const asignaturasDisponibles = useMemo(() => {
    let subset = planes;
    if (filtros.ofertas && filtros.ofertas.length > 0) {
      subset = subset.filter((p) => filtros.ofertas.includes(p.ofertaNombre));
    }
    const countMap = new Map();
    subset.forEach((p) => {
      countMap.set(p.asignatura, (countMap.get(p.asignatura) || 0) + 1);
    });
    return Array.from(countMap.keys())
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map((asig) => ({ value: asig, count: countMap.get(asig) }));
  }, [planes, filtros.ofertas]);

  // 3. Grados, Años o Subáreas dinámicas según ofertas y asignaturas seleccionadas
  const gradosDisponibles = useMemo(() => {
    let subset = planes;
    if (filtros.ofertas && filtros.ofertas.length > 0) {
      subset = subset.filter((p) => filtros.ofertas.includes(p.ofertaNombre));
    }
    if (filtros.asignaturas && filtros.asignaturas.length > 0) {
      subset = subset.filter((p) => filtros.asignaturas.includes(p.asignatura));
    }
    const countMap = new Map();
    subset.forEach((p) => {
      countMap.set(p.grado, (countMap.get(p.grado) || 0) + 1);
    });
    return Array.from(countMap.keys())
      .sort(ordenarGrados)
      .map((g) => ({ value: g, count: countMap.get(g) }));
  }, [planes, filtros.ofertas, filtros.asignaturas]);

  // 4. Filtrado reactivo en tiempo real
  const planesFiltrados = useMemo(() => {
    const textoNormalizado = (filtros.texto || '').trim().toLowerCase();

    return planes.filter((doc) => {
      if (filtros.ofertas?.length > 0 && !filtros.ofertas.includes(doc.ofertaNombre)) {
        return false;
      }
      if (filtros.asignaturas?.length > 0 && !filtros.asignaturas.includes(doc.asignatura)) {
        return false;
      }
      if (filtros.grados?.length > 0 && !filtros.grados.includes(doc.grado)) {
        return false;
      }
      if (textoNormalizado) {
        const nombresArchivos = Array.isArray(doc.archivos)
          ? doc.archivos.map((archivo) => archivo?.nombre || '').join(' ')
          : '';
        const busquedaFuente = `${doc.ofertaNombre || ''} ${doc.asignatura || ''} ${doc.grado || ''} ${doc.archivoPrincipal || ''} ${nombresArchivos}`.toLowerCase();
        if (!busquedaFuente.includes(textoNormalizado)) return false;
      }
      return true;
    });
  }, [planes, filtros]);

  // Reiniciar a página 1 cuando cambia el resultado de los filtros o el tamaño de página
  useEffect(() => {
    setPaginaActual(1);
  }, [filtros.texto, filtros.ofertas, filtros.asignaturas, filtros.grados, elementosPorPagina]);

  // Paginación reactiva
  const limite = elementosPorPagina === 'todos' ? planesFiltrados.length || 1 : Number(elementosPorPagina);
  const totalPaginas = Math.ceil(planesFiltrados.length / limite) || 1;

  // Cálculo seguro y matemático de números de página visibles (sin duplicados)
  const paginasVisibles = useMemo(() => {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }
    if (paginaActual <= 4) {
      return [1, 2, 3, 4, 5, 6, 7];
    }
    if (paginaActual >= totalPaginas - 3) {
      return [
        totalPaginas - 6,
        totalPaginas - 5,
        totalPaginas - 4,
        totalPaginas - 3,
        totalPaginas - 2,
        totalPaginas - 1,
        totalPaginas
      ];
    }
    return [
      paginaActual - 3,
      paginaActual - 2,
      paginaActual - 1,
      paginaActual,
      paginaActual + 1,
      paginaActual + 2,
      paginaActual + 3
    ];
  }, [paginaActual, totalPaginas]);

  const paginasMoviles = useMemo(() => {
    const cantidad = Math.min(3, totalPaginas);
    const inicio = Math.max(1, Math.min(paginaActual - 1, totalPaginas - cantidad + 1));
    return Array.from({ length: cantidad }, (_, indice) => inicio + indice);
  }, [paginaActual, totalPaginas]);

  const planesPaginados = useMemo(() => {
    if (elementosPorPagina === 'todos') return planesFiltrados;
    const inicio = (paginaActual - 1) * limite;
    return planesFiltrados.slice(inicio, inicio + limite);
  }, [planesFiltrados, paginaActual, limite, elementosPorPagina]);

  const hayFiltrosActivos = Boolean(
    filtros.texto ||
    (filtros.ofertas && filtros.ofertas.length > 0) ||
    (filtros.asignaturas && filtros.asignaturas.length > 0) ||
    (filtros.grados && filtros.grados.length > 0)
  );

  const handleOfertasChange = (newOfertas) => {
    onFiltrosChange({
      ...filtros,
      ofertas: newOfertas
    });
  };

  const handleAsignaturasChange = (newAsignaturas) => {
    onFiltrosChange({
      ...filtros,
      asignaturas: newAsignaturas
    });
  };

  const handleGradosChange = (newGrados) => {
    onFiltrosChange({
      ...filtros,
      grados: newGrados
    });
  };

  const handleTextoChange = (e) => {
    onFiltrosChange({
      ...filtros,
      texto: e.target.value
    });
  };

  const getBadgeColor = (color) => {
    switch (color) {
      case 'amber':
        return 'bg-orange-100 dark:bg-orange-950/80 text-red-800 dark:text-red-300 border-orange-300 dark:border-orange-800';
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'yellow':
        return 'bg-yellow-50 dark:bg-yellow-950/80 text-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800';
      case 'indigo':
        return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'teal':
        return 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'rose':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'emerald':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8 transition-colors duration-200">
      {/* 1. ENCABEZADO INSTITUCIONAL MAESTRO */}
      <div className="bg-gradient-to-r from-[#003B71] via-[#017EC1] to-[#0267a0] dark:from-[#1a3863] dark:via-[#1e447b] dark:to-[#235091] p-5 sm:p-6 text-white border-b-2 border-amber-500 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2 rounded-lg bg-white/20 text-white shadow backdrop-blur-xs border border-white/20">
              <IconTable className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Catálogo Oficial de Planeamientos
            </h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Inventario normado de la Dirección de Desarrollo Curricular (DDC). Filtre directamente en las cabeceras de columnas y descargue los paquetes ZIP oficiales.
          </p>
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS UNIFICADA (OPCIÓN A: 1 SOLA FILA ULTRA COMPACTA) */}
      <div className="p-3 sm:px-6 sm:py-3 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Izquierda: Buscador de texto libre global */}
        <div className="relative w-full md:w-80 lg:w-96">
          <input
            type="text"
            value={filtros.texto}
            onChange={handleTextoChange}
            placeholder="Buscar por palabra clave, materia o grado..."
            className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition shadow-xs"
          />
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <IconSearch className="w-4 h-4" />
          </div>
          {filtros.texto && (
            <button
              type="button"
              onClick={() => onFiltrosChange({ ...filtros, texto: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
              title="Borrar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Centro / Derecha: Métricas, Indicador de Filtros, Restablecer y Paginado */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <IconFilter className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Mostrando <strong className="text-blue-900 dark:text-blue-400 font-bold">{planesFiltrados.length}</strong> de{' '}
              <strong>{planes.length}</strong> planeamientos
            </span>
            {hayFiltrosActivos && (
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Filtros activos
              </span>
            )}
          </div>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={onResetFiltros}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Limpiar todos los filtros y ver los 197 planeamientos"
            >
              <IconRefresh className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>Restablecer</span>
            </button>
          )}

          {/* Control de elementos por página integrado */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-lg text-xs shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Mostrar:</span>
            <select
              value={elementosPorPagina}
              onChange={(e) => {
                setElementosPorPagina(e.target.value);
                setPaginaActual(1);
              }}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="15" className="bg-white dark:bg-slate-900">15 por pág.</option>
              <option value="20" className="bg-white dark:bg-slate-900">20 por pág.</option>
              <option value="50" className="bg-white dark:bg-slate-900">50 por pág.</option>
              <option value="todos" className="bg-white dark:bg-slate-900">Todos ({planesFiltrados.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. TABLA GENERAL SIN SCROLL HORIZONTAL Y CON FILTROS EN COLUMNAS */}
      {planesFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-slate-50/50 dark:bg-slate-950/30 min-h-[420px] flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <IconSearch className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            No hay documentos que coincidan con los filtros seleccionados
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-3">
            Por favor ajuste los filtros de las columnas o limpie la búsqueda para explorar el catálogo.
          </p>
          <button
            type="button"
            onClick={onResetFiltros}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition cursor-pointer"
          >
            Ver los 197 planeamientos oficiales
          </button>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-collapse table-auto">
            <thead className="bg-slate-100/90 dark:bg-slate-800/80 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                {/* 1. Columna Oferta Educativa con Popover Checkbox Filter */}
                <th scope="col" className="py-2.5 px-3">
                  <ColumnFilter
                    label="Oferta Educativa"
                    options={ofertasDisponibles}
                    selectedValues={filtros.ofertas || []}
                    onChange={handleOfertasChange}
                    align="left"
                  />
                </th>

                {/* 2. Columna Asignatura / Área con Popover Checkbox Filter */}
                <th scope="col" className="py-2.5 px-3">
                  <ColumnFilter
                    label="Asignatura / Área"
                    options={asignaturasDisponibles}
                    selectedValues={filtros.asignaturas || []}
                    onChange={handleAsignaturasChange}
                    align="left"
                  />
                </th>

                {/* 3. Columna Grado / Subárea con Popover Checkbox Filter */}
                <th scope="col" className="py-2.5 px-3">
                  <ColumnFilter
                    label="Grado / Subárea"
                    options={gradosDisponibles}
                    selectedValues={filtros.grados || []}
                    onChange={handleGradosChange}
                    align="left"
                  />
                </th>

                {/* 4. Columna Archivos */}
                <th scope="col" className="py-2.5 px-3 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200">
                  Archivos
                </th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {planesPaginados.map((doc, idx) => {
                const badgeClass = getBadgeColor(doc.ofertaBadgeColor);

                return (
                  <tr
                    key={doc.id}
                    className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-900/40'
                    }`}
                  >
                    {/* Oferta Educativa */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border leading-tight ${badgeClass}`}>
                        {doc.ofertaNombre}
                      </span>
                    </td>

                    {/* Asignatura con icono */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 rounded bg-blue-50 dark:bg-slate-800 border border-blue-200/60 dark:border-slate-700 text-blue-800 dark:text-amber-400 flex-shrink-0">
                          <AsignaturaIcon asignatura={doc.asignatura} className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {doc.asignatura}
                        </span>
                      </div>
                    </td>

                    {/* Grado / Subárea */}
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {doc.grado}
                    </td>

                    {/* Archivos disponibles: descargas individuales y, al final, lote de la misma fila */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {doc.archivos && doc.archivos.length > 0 ? (
                          doc.archivos.map((arch, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => onDownload(doc, arch)}
                              className="group inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/90 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer text-left"
                              title={`Descargar archivo individual: ${arch.nombre} (${arch.tamanoLegible})`}
                            >
                              <span className="font-bold">{arch.tipo}</span>
                              <span className="text-slate-500 dark:text-slate-400 group-hover:text-amber-950 dark:group-hover:text-amber-200">
                                ({arch.tamanoLegible})
                              </span>
                              <IconDownload className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 text-amber-800 dark:text-amber-300" />
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin archivos</span>
                        )}
                        {doc.archivos?.length >= 2 && (
                          <button
                            type="button"
                            onClick={() => onDownloadAll(doc)}
                            disabled={Boolean(downloadingId)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title={`Solicitar la descarga de los ${doc.archivos.length} archivos de ${doc.asignatura}, ${doc.grado}`}
                          >
                            <IconDownload className="w-3 h-3" />
                            {downloadingId === doc.id ? 'Solicitando...' : `Descargar todos (${doc.archivos.length})`}
                          </button>
                        )}
                      </div>
                      {downloadNotice?.id === doc.id && (
                        <p role="status" className="mt-1 text-[11px] text-blue-800 dark:text-blue-300">
                          {downloadNotice.message}
                        </p>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. PAGINACIÓN */}
      {elementosPorPagina !== 'todos' && totalPaginas > 1 && (
        <div className="px-2.5 py-3.5 sm:p-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Página <strong className="text-slate-900 dark:text-white">{paginaActual}</strong> de{' '}
            <strong className="text-slate-900 dark:text-white">{totalPaginas}</strong> ({planesFiltrados.length} planeamientos)
          </div>

          <nav aria-label="Paginación del catálogo" className="flex items-center gap-1 sm:gap-1.5 justify-center whitespace-nowrap sm:whitespace-normal sm:flex-wrap">
            {/* Botón Primero */}
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(1)}
              aria-label="Ir a la primera página"
              className="w-[34px] h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1 inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Ir a la primera página"
            >
              <svg aria-hidden="true" className="w-4 h-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5v14M18 6l-6 6 6 6M11 6l-6 6 6 6" /></svg>
              <span className="hidden sm:inline">« Primero</span>
            </button>

            {/* Botón Anterior */}
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              aria-label="Página anterior"
              className="w-[34px] h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1 inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Página anterior"
            >
              <svg aria-hidden="true" className="w-4 h-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
              <span className="hidden sm:inline">‹ Anterior</span>
            </button>

            <div className="flex items-center gap-1 sm:hidden">
              {paginasMoviles.map((pNum) => (
                <button
                  key={`pag-mobile-${pNum}`}
                  type="button"
                  onClick={() => setPaginaActual(pNum)}
                  aria-label={`Ir a la página ${pNum}`}
                  aria-current={paginaActual === pNum ? 'page' : undefined}
                  className={`w-[34px] h-9 rounded-md font-semibold text-xs transition cursor-pointer ${
                    paginaActual === pNum
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {pNum}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-1">
              {paginasVisibles.map((pNum) => (
                <button
                  key={`pag-btn-${pNum}`}
                  type="button"
                  onClick={() => setPaginaActual(pNum)}
                  aria-label={`Ir a la página ${pNum}`}
                  aria-current={paginaActual === pNum ? 'page' : undefined}
                  className={`w-7 h-7 rounded-md font-semibold text-xs transition cursor-pointer ${
                    paginaActual === pNum
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {pNum}
                </button>
              ))}
            </div>

            {/* Botón Siguiente */}
            <button
              type="button"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              aria-label="Página siguiente"
              className="w-[34px] h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1 inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Página siguiente"
            >
              <svg aria-hidden="true" className="w-4 h-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
              <span className="hidden sm:inline">Siguiente ›</span>
            </button>

            {/* Botón Último */}
            <button
              type="button"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(totalPaginas)}
              aria-label="Ir a la última página"
              className="w-[34px] h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1 inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Ir a la última página"
            >
              <svg aria-hidden="true" className="w-4 h-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5v14M6 6l6 6-6 6M13 6l6 6-6 6" /></svg>
              <span className="hidden sm:inline">Último »</span>
            </button>
          </nav>
        </div>
      )}
    </section>
  );
}
