import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { IconFilter, IconSearch } from './Icons';

export function ColumnFilter({
  label,
  options = [],
  selectedValues = [],
  onChange,
  align = 'left'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Estado borrador (draft): no altera la tabla hasta que el docente confirme con "Aplicar Filtro"
  const [draftSelected, setDraftSelected] = useState(selectedValues);
  const [position, setPosition] = useState(null);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const deselectRef = useRef(null);
  const popoverId = useId();

  // Al abrir el popover, sincronizamos el borrador con la selección confirmada real
  const handleOpen = () => {
    setDraftSelected(selectedValues);
    setSearchTerm('');
    setIsOpen(true);
  };

  const handleClose = (restoreFocus = false) => {
    setIsOpen(false);
    setSearchTerm('');
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus();
  };

  // Descartar cambios del borrador y cerrar
  const handleCancel = (restoreFocus = true) => {
    setDraftSelected(selectedValues);
    handleClose(restoreFocus);
  };

  // Confirmar y aplicar los cambios del borrador a la tabla
  const handleApply = () => {
    // Si seleccionó todas las opciones, equivale a sin filtro (array vacío)
    if (draftSelected.length === options.length) {
      onChange([]);
    } else {
      onChange(draftSelected);
    }
    handleClose(true);
  };

  // Cerrar al hacer clic fuera o presionar Escape (actúa como Cancelar)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!popoverRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        handleCancel(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedValues]);

  useEffect(() => {
    if (!isOpen) return;
    // El clic sintético de Enter puede devolver el foco al disparador después del commit.
    // Diferirlo un frame deja que termine esa activación nativa antes de enfocar el portal.
    const schedule = window.requestAnimationFrame || window.setTimeout;
    const cancel = window.cancelAnimationFrame || window.clearTimeout;
    const frame = schedule.call(window, () => {
      (searchRef.current || deselectRef.current)?.focus();
    }, 0);
    return () => cancel.call(window, frame);
  }, [isOpen]);

  // El portal evita que el scroll horizontal de la tabla recorte el menú.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const margin = 8;
      const width = Math.min(320, window.innerWidth - margin * 2);
      const menuHeight = popoverRef.current?.offsetHeight || 360;
      const left = Math.max(margin, Math.min(
        align === 'right' ? rect.right - width : rect.left,
        window.innerWidth - width - margin
      ));
      const viewportHeight = Math.max(0, window.innerHeight - margin * 2);
      const below = Math.max(0, window.innerHeight - rect.bottom - margin - 6);
      const above = Math.max(0, rect.top - margin - 6);
      const openAbove = below < Math.min(menuHeight, viewportHeight) && above > below;
      const available = Math.min(viewportHeight, openAbove ? above : below);
      const desiredTop = openAbove ? rect.top - Math.min(menuHeight, available) - 6 : rect.bottom + 6;
      const top = Math.max(margin, Math.min(desiredTop, window.innerHeight - margin - available));
      setPosition({ left, top, width, maxHeight: available });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, align, options.length, searchTerm]);

  // Si selectedValues tiene elementos (y menos que el total), hay filtro activo en la columna
  const isFiltered = selectedValues.length > 0 && selectedValues.length < options.length;

  // Filtrar las opciones por el término de búsqueda interno
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.value.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Manejar toggle de un checkbox dentro del borrador
  const handleToggle = (value) => {
    setDraftSelected((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Marcar todas las opciones en el borrador
  const handleSelectAll = () => {
    setDraftSelected(options.map((o) => o.value));
  };

  // Desmarcar todas las opciones en el borrador
  const handleDeselectAll = () => {
    setDraftSelected([]);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Botón Disparador en la Cabecera de Columna */}
      <button
        type="button"
        ref={triggerRef}
        onClick={isOpen ? () => handleClose() : handleOpen}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
          isFiltered
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
        }`}
        title={`Filtrar por ${label}`}
        aria-label={`Filtrar por ${label}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
      >
        <span>{label}</span>
        <IconFilter className={`w-3.5 h-3.5 ${isFiltered ? 'text-amber-300' : 'text-slate-400 dark:text-slate-400'}`} />
        {isFiltered && (
          <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-extrabold bg-amber-400 text-slate-900 rounded-full">
            {selectedValues.length}
          </span>
        )}
      </button>

      {/* Menú Flotante (Popover con Estado Borrador) */}
      {isOpen && createPortal(
        <div
          id={popoverId}
          ref={popoverRef}
          role="dialog"
          aria-label={`Filtrar por ${label}`}
          className="fixed z-[60] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 text-slate-800 dark:text-slate-100 normal-case overflow-y-auto"
          style={{ ...position, visibility: position ? 'visible' : 'hidden' }}
        >
          {/* Cabecera del Popover */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <IconFilter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Filtrar: {label}
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {draftSelected.length === 0
                ? 'Todas las opciones'
                : `${draftSelected.length} de ${options.length} seleccionadas`}
            </span>
          </div>

          {/* Buscador interno para listas de más de 4 opciones */}
          {options.length > 4 && (
            <div className="relative mb-2">
              <input
                type="text"
                ref={searchRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Buscar en ${label.toLowerCase()}...`}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <IconSearch className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Acciones Rápidas del Borrador */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[11px]">
            <button
              type="button"
              ref={deselectRef}
              onClick={handleDeselectAll}
              className="text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer"
            >
              Desmarcar todas
            </button>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Marcar todas
            </button>
          </div>

          {/* Lista de Checkboxes con Scroll */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                No hay coincidencias para "{searchTerm}"
              </p>
            ) : (
              filteredOptions.map((opt) => {
                const checked = draftSelected.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-xs transition-colors select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggle(opt.value)}
                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                      />
                      <span className={`truncate ${checked ? 'font-semibold text-blue-900 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                        {opt.value}
                      </span>
                    </div>
                    {typeof opt.count === 'number' && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {opt.count}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Pie de Acciones: Cancelar y Aplicar Filtro */}
          <div className="pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleCancel()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs"
            >
              Aplicar Filtro
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
