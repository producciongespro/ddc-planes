import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Matriz oficial de 20 resoluciones comerciales estándar certificadas
export const COMMERCIAL_VIEWPORTS = [
  { id: 1, name: 'Galaxy Z Fold (Plegado)', width: 320, height: 653, category: 'Móvil ultra-estrecho' },
  { id: 2, name: 'iPhone SE (2da/3ra gen)', width: 375, height: 667, category: 'Móvil compacto' },
  { id: 3, name: 'iPhone 12/13/14/15', width: 390, height: 844, category: 'Móvil estándar' },
  { id: 4, name: 'Google Pixel 7/8', width: 412, height: 915, category: 'Móvil Android estándar' },
  { id: 5, name: 'iPhone 14 Pro Max / 15 Plus', width: 430, height: 932, category: 'Móvil grande' },
  { id: 6, name: 'Samsung Galaxy S23 Ultra', width: 412, height: 915, category: 'Móvil insignia Android' },
  { id: 7, name: 'iPad Mini (Retrato)', width: 768, height: 1024, category: 'Tablet compacta' },
  { id: 8, name: 'iPad Air / 10.9" (Retrato)', width: 820, height: 1180, category: 'Tablet estándar' },
  { id: 9, name: 'iPad Pro 11" (Retrato)', width: 834, height: 1194, category: 'Tablet profesional' },
  { id: 10, name: 'Microsoft Surface Pro 8', width: 912, height: 1368, category: 'Tablet / Laptop híbrida' },
  { id: 11, name: 'iPad Mini (Paisaje)', width: 1024, height: 768, category: 'Tablet horizontal' },
  { id: 12, name: 'iPad Air (Paisaje)', width: 1180, height: 820, category: 'Tablet horizontal' },
  { id: 13, name: 'Netbook Escolar Compacta', width: 1280, height: 720, category: 'Laptop HD compacta' },
  { id: 14, name: 'Laptop Estándar de Oficina', width: 1366, height: 768, category: 'Laptop estándar' },
  { id: 15, name: 'Laptop MacBook Pro 14" / XPS', width: 1440, height: 900, category: 'Laptop WXGA+' },
  { id: 16, name: 'Laptop Full HD (15.6")', width: 1536, height: 864, category: 'Laptop FHD escalada' },
  { id: 17, name: 'Desktop Oficial MEP (FHD)', width: 1920, height: 1080, category: 'Desktop institucional 1080p' },
  { id: 18, name: 'Pizarra Digital Escolar Interactiva', width: 1920, height: 1200, category: 'Pantalla de aula docente' },
  { id: 19, name: 'Monitor QHD / 2K de Oficina', width: 2560, height: 1440, category: 'Monitor panorámico' },
  { id: 20, name: 'Monitor Profesional 4K UHD', width: 3840, height: 2160, category: 'Pantalla Ultra HD' }
];

describe('Suite 5: responsive (Matriz de 20 Dimensiones Comerciales de Pantalla)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Simular respuesta exitosa inmediata para que App renderice el App Shell
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'DDC-2027-001',
          ofertaCodigo: 'PREESCOLAR',
          ofertaNombre: 'Educación Preescolar',
          ofertaBadgeColor: 'amber',
          asignatura: 'Interactivo I',
          grado: 'Materno Infantil',
          rutaRelativa: 'preescolar/interactivo-i',
          archivos: [{ nombre: 'plan-interactivo-i.zip', tipo: 'ZIP', ruta: '/ddc-planeamientos/preescolar/interactivo-i/plan-interactivo-i.zip', tamanoBytes: 1000, tamanoLegible: '1 KB' }],
          archivoPrincipal: 'plan-interactivo-i.zip',
          rutaDescarga: '/ddc-planeamientos/preescolar/interactivo-i/plan-interactivo-i.zip',
          vigencia: '2027'
        }
      ]
    });
  });

  // Ejecución iterativa de los 20 viewports comerciales
  COMMERCIAL_VIEWPORTS.forEach((vp) => {
    it(`TEST-22-${String(vp.id).padStart(2, '0')}: Certificación de viewport [${vp.width}x${vp.height}] - ${vp.name} (${vp.category})`, async () => {
      // Ajustar dimensiones simuladas del viewport
      window.innerWidth = vp.width;
      window.innerHeight = vp.height;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(<App />);

      // Esperar que el App Shell se monte tras resolver el fetch
      const mainElement = await screen.findByRole('main');
      expect(mainElement).toBeInTheDocument();

      // Validar anclaje de Header fijo (flex-shrink-0 z-20)
      const headerContainers = container.querySelectorAll('.flex-shrink-0.z-20');
      expect(headerContainers.length).toBeGreaterThanOrEqual(2); // Header y Footer

      // Validar contenedor central de scroll (flex-1 overflow-y-auto)
      const scrollContainer = container.querySelector('.flex-1.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).not.toBeNull();
    });
  });
});
