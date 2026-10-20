import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { GeneralTable } from '../components/GeneralTable';

const mockPlanes = Array.from({ length: 45 }, (_, i) => ({
  id: `DDC-2027-${String(i + 1).padStart(3, '0')}`,
  ofertaCodigo: i < 15 ? 'PRIMARIA' : (i < 30 ? 'SECUNDARIA' : 'PREESCOLAR'),
  ofertaNombre: i < 15 ? 'I y II Ciclos (Primaria)' : (i < 30 ? 'III Ciclo y Diversificada (Secundaria)' : 'Educación Preescolar'),
  ofertaBadgeColor: i < 15 ? 'emerald' : (i < 30 ? 'blue' : 'amber'),
  asignatura: i % 2 === 0 ? 'Educación Musical' : 'Matemática',
  grado: `${(i % 6) + 1}° Año`,
  rutaRelativa: `ruta/${i}`,
  archivos: [
    { nombre: `Plan_${i}.zip`, tipo: 'ZIP', ruta: `/plan_${i}.zip`, tamanoBytes: 1024, tamanoLegible: '1.0 KB' }
  ],
  archivoPrincipal: `Plan_${i}.zip`,
  rutaDescarga: `/plan_${i}.zip`,
  vigencia: '2027'
}));

describe('Suite 2: GeneralTable (Paginación Matemática y Filtros)', () => {
  const defaultFiltros = {
    ofertas: [],
    asignaturas: [],
    grados: [],
    texto: ''
  };

  it('TEST-07 & TEST-08: Paginador inicia en página 1 con « Primero y ‹ Anterior deshabilitados', () => {
    render(
      <GeneralTable
        planes={mockPlanes}
        filtros={defaultFiltros}
        onDownload={vi.fn()}
        onFiltrosChange={vi.fn()}
        onResetFiltros={vi.fn()}
      />
    );

    const primeroBtn = screen.getByTitle('Ir a la primera página');
    const anteriorBtn = screen.getByTitle('Página anterior');
    const siguienteBtn = screen.getByTitle('Página siguiente');
    const ultimoBtn = screen.getByTitle('Ir a la última página');

    expect(primeroBtn).toBeDisabled();
    expect(anteriorBtn).toBeDisabled();
    expect(siguienteBtn).not.toBeDisabled();
    expect(ultimoBtn).not.toBeDisabled();
  });

  it('TEST-09: En la última página, Siguiente › y Último » se deshabilitan', () => {
    render(
      <GeneralTable
        planes={mockPlanes}
        filtros={defaultFiltros}
        onDownload={vi.fn()}
        onFiltrosChange={vi.fn()}
        onResetFiltros={vi.fn()}
      />
    );

    const ultimoBtn = screen.getByTitle('Ir a la última página');
    fireEvent.click(ultimoBtn);

    const siguienteBtn = screen.getByTitle('Página siguiente');
    expect(siguienteBtn).toBeDisabled();
    expect(ultimoBtn).toBeDisabled();
  });

  it('TEST-10: Paginador numérico no genera números duplicados jamás', () => {
    render(
      <GeneralTable
        planes={mockPlanes}
        filtros={defaultFiltros}
        onDownload={vi.fn()}
        onFiltrosChange={vi.fn()}
        onResetFiltros={vi.fn()}
      />
    );

    // Con 45 registros a 20 por página hay 3 páginas (1, 2, 3)
    const pageButtons = screen.getAllByRole('button', { name: /^Ir a la página [0-9]+$/ });
    const groups = new Set(pageButtons.map((button) => button.parentElement));
    groups.forEach((group) => {
      const numbers = Array.from(group.querySelectorAll('button'), (button) => button.textContent);
      expect(numbers).toEqual([...new Set(numbers)]);
    });
  });

  it('TEST-13: Buscador predictivo libre dispara onFiltrosChange con texto ingresado', () => {
    const handleFiltrosChange = vi.fn();
    render(
      <GeneralTable
        planes={mockPlanes}
        filtros={defaultFiltros}
        onDownload={vi.fn()}
        onFiltrosChange={handleFiltrosChange}
        onResetFiltros={vi.fn()}
      />
    );

    const inputBuscador = screen.getByPlaceholderText(/Buscar por palabra clave, materia o grado/i);
    fireEvent.change(inputBuscador, { target: { value: 'Musical' } });

    expect(handleFiltrosChange).toHaveBeenCalledWith({
      ...defaultFiltros,
      texto: 'Musical'
    });
  });

  it('ordena las opciones de grado por progresión académica y deja las subáreas al final', () => {
    const grados = [
      'Décimo Año (10°)', 'Noveno Año (9°)', 'Grupo Heterogéneo',
      'Segundo Año (2°)', 'Transición', 'Undécimo Año (11°)',
      'Octavo Año (8°)', 'Materno Infantil (Interactivo I)',
      'Escuelas Unidocentes (Multigrado 1° a 6°)', 'Primer Año (1°)',
      'Sétimo Año (7°)', 'Interactivo II', 'Documento Rector',
      'Duodécimo Año (12°)'
    ];
    const planes = grados.map((grado, index) => ({
      ...mockPlanes[0],
      id: `grado-${index}`,
      grado
    }));
    render(<GeneralTable planes={planes} filtros={defaultFiltros} onDownload={vi.fn()} onFiltrosChange={vi.fn()} onResetFiltros={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Filtrar por Grado / Subárea' }));
    const dialog = screen.getByRole('dialog', { name: 'Filtrar por Grado / Subárea' });
    const opciones = within(dialog).getAllByRole('checkbox').map((checkbox) =>
      checkbox.closest('label').querySelector('span').textContent
    );
    expect(opciones).toEqual([
      'Materno Infantil (Interactivo I)', 'Interactivo II', 'Transición',
      'Grupo Heterogéneo', 'Primer Año (1°)', 'Segundo Año (2°)',
      'Sétimo Año (7°)', 'Octavo Año (8°)', 'Noveno Año (9°)',
      'Décimo Año (10°)', 'Undécimo Año (11°)', 'Duodécimo Año (12°)',
      'Documento Rector', 'Escuelas Unidocentes (Multigrado 1° a 6°)'
    ]);
  });

  it.each(['s1', 'S2'])('encuentra el registro por el archivo %s y conserva ambos chips', (texto) => {
    const planeamiento = {
      ...mockPlanes[0],
      asignatura: 'Español',
      grado: 'Octavo Año (8°)',
      archivoPrincipal: 'plan-espanol-octavo-s1.zip',
      archivos: [
        { nombre: 'plan-espanol-octavo-s1.zip', tipo: 'ZIP', ruta: '/s1.zip', tamanoLegible: '1 KB' },
        { nombre: 'plan-espanol-octavo-s2.zip', tipo: 'ZIP', ruta: '/s2.zip', tamanoLegible: '1 KB' }
      ]
    };
    render(<GeneralTable planes={[planeamiento]} filtros={{ ...defaultFiltros, texto }} onDownload={vi.fn()} onFiltrosChange={vi.fn()} onResetFiltros={vi.fn()} />);

    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getAllByTitle(/Descargar archivo individual:/i)).toHaveLength(2);
  });

  it('tolera un registro sin archivos al buscar por asignatura', () => {
    render(<GeneralTable planes={[{ ...mockPlanes[0], archivos: null, archivoPrincipal: '' }]} filtros={{ ...defaultFiltros, texto: 'Musical' }} onDownload={vi.fn()} onFiltrosChange={vi.fn()} onResetFiltros={vi.fn()} />);
    expect(screen.getByText('Sin archivos')).toBeInTheDocument();
  });

  it('ofrece descargar todos al final de los chips solo para filas con varios archivos y sin altura vacía', () => {
    const archivos = [1, 2, 3].map((n) => ({ nombre: `plan-${n}.zip`, tipo: 'ZIP', ruta: `/plan-${n}.zip`, tamanoLegible: '1 KB' }));
    const docMultiple = { ...mockPlanes[0], archivos };
    const docUnico = { ...mockPlanes[1] };
    const onDownloadAll = vi.fn();
    const { container } = render(<GeneralTable planes={[docMultiple, docUnico]} filtros={defaultFiltros} onDownload={vi.fn()} onDownloadAll={onDownloadAll} onFiltrosChange={vi.fn()} onResetFiltros={vi.fn()} />);

    const fila = screen.getByText(docMultiple.asignatura).closest('tr');
    const controles = Array.from(fila.querySelectorAll('td:last-child button'));
    expect(controles).toHaveLength(4);
    expect(controles.slice(0, 3).every((button) => button.title.startsWith('Descargar archivo individual:'))).toBe(true);
    expect(controles[3]).toHaveTextContent('Descargar todos (3)');
    expect(screen.getAllByRole('button', { name: 'Descargar todos (3)' })).toHaveLength(1);
    fireEvent.click(controles[3]);
    expect(onDownloadAll).toHaveBeenCalledWith(docMultiple);
    expect(container.querySelector('.overflow-x-auto')).not.toHaveClass('min-h-[480px]', 'pb-32');
  });

  it('mantiene accesible el filtro al abrirlo desde una tabla compacta', async () => {
    const { container } = render(<GeneralTable planes={mockPlanes.slice(0, 1)} filtros={defaultFiltros} onDownload={vi.fn()} onFiltrosChange={vi.fn()} onResetFiltros={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Filtrar por Oferta Educativa' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Filtrar por Oferta Educativa' });
    expect(container.contains(dialog)).toBe(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Desmarcar todas' })).toHaveFocus());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Filtrar por Oferta Educativa' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Filtro' }));
    expect(trigger).toHaveFocus();
  });

  it('TEST-17: La tabla tiene cuatro columnas y el chip descarga el archivo seleccionado', () => {
    const downloadMock = vi.fn();
    render(
      <GeneralTable
        planes={mockPlanes.slice(0, 5)}
        filtros={defaultFiltros}
        onDownload={downloadMock}
        onFiltrosChange={vi.fn()}
        onResetFiltros={vi.fn()}
      />
    );

    expect(screen.getAllByRole('columnheader')).toHaveLength(4);
    expect(screen.queryByRole('columnheader', { name: 'Descargas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Acción' })).not.toBeInTheDocument();
    const downloadButtons = screen.getAllByTitle(/Descargar archivo individual:/i);
    fireEvent.click(downloadButtons[0]);
    expect(downloadMock).toHaveBeenCalledTimes(1);
    expect(downloadMock).toHaveBeenCalledWith(mockPlanes[0], mockPlanes[0].archivos[0]);
  });
});
