import React, { useState, useEffect } from 'react';
import { fetchPlanesCatalog } from './data/planes2027Data';
import { Header } from './components/Header';
import { GeneralTable } from './components/GeneralTable';
import { Footer } from './components/Footer';
import { AboutModal } from './components/AboutModal';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  // Estado principal del catálogo de 197 planeamientos cargado asíncronamente
  const [planes, setPlanes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Carga asíncrona desacoplada del catálogo curricular oficial desde /data/ddc-planeamientos.json
  const cargarCatalogo = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const inicio = Date.now();
      const data = await fetchPlanesCatalog();
      const restante = Math.max(0, 4000 - (Date.now() - inicio));
      if (restante > 0 && import.meta.env.MODE !== 'test') {
        await new Promise((resolve) => setTimeout(resolve, restante));
      }
      setPlanes(data);
    } catch (err) {
      console.error('Error al cargar catálogo curricular:', err);
      setLoadError(err.message || 'No fue posible conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  // Estado unificado de filtros
  const [filtros, setFiltros] = useState({
    texto: '',
    ofertas: [],
    asignaturas: [],
    grados: []
  });

  // Modales institucionales
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Estado del tema Claro / Oscuro con persistencia en localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('mep-theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Aplicar clase 'dark' a <html> y persistir preferencia de tema
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      try {
        localStorage.setItem('mep-theme', 'dark');
      } catch (e) {
        console.error(e);
      }
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('mep-theme', 'light');
      } catch (e) {
        console.error(e);
      }
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // Disparador unitario de descarga segura en el navegador
  const triggerBrowserDownload = (ruta, nombre) => {
    if (!ruta) return;
    const link = document.createElement('a');
    link.href = ruta;
    link.download = nombre || 'planeamiento.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cada chip descarga únicamente el archivo seleccionado.
  const handleDownload = (_doc, fileObj) => {
    if (fileObj) triggerBrowserDownload(fileObj.ruta, fileObj.nombre);
  };

  // Limpiar todos los filtros activos
  const handleResetFiltros = () => {
    setFiltros({
      texto: '',
      ofertas: [],
      asignaturas: [],
      grados: []
    });
  };

  // 0. PANTALLA DE CARGA (SPLASH SCREEN) O ERROR DE RED
  if (isLoading || loadError) {
    return (
      <SplashScreen
        error={loadError}
        onRetry={cargarCatalogo}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-hidden">
      {/* 0. WCAG 2.4.1: Enlace accesible de salto al contenido principal (Skip Link) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-blue-700 focus:text-white focus:font-bold focus:text-xs focus:rounded-xl focus:shadow-2xl focus:ring-4 focus:ring-amber-400 focus:outline-none transition-all"
      >
        Saltar al catálogo de planeamientos
      </a>

      {/* 1. SECCIÓN: ENCABEZADO (Siempre fijo arriba) */}
      <div className="flex-shrink-0 z-20 shadow-md">
        <Header
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
          onOpenAbout={() => setIsAboutModalOpen(true)}
        />
      </div>

      {/* 2. SECCIÓN: CONTENIDO PRINCIPAL (Única área con scroll vertical fluido) */}
      <div className="flex-1 overflow-y-auto min-h-0 focus:outline-none">
        <main id="main-content" tabIndex="-1" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
          {/* Catálogo oficial con filtros y tabla */}
          <GeneralTable
            planes={planes}
            onDownload={handleDownload}
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onResetFiltros={handleResetFiltros}
          />

        </main>
      </div>

      {/* 3. SECCIÓN: PIE DE PÁGINA (Siempre fijo abajo con animación DDC) */}
      <div className="flex-shrink-0 z-20 shadow-lg">
        <Footer />
      </div>

      {/* MODAL INSTITUCIONAL "ACERCA DE LA DDC Y EL REPOSITORIO" */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}
