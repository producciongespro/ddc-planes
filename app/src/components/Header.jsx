import React from 'react';
import { IconSun, IconMoon, IconInfo } from './Icons';
import appVersion from '../data/version.json';

export function Header({ darkMode, onToggleTheme, onOpenAbout }) {
  return (
    <header className="relative w-full bg-[#017EC1] shadow-md border-b-2 border-amber-500 transition-colors">
      <div className="w-full px-2 sm:px-4 lg:px-8 grid grid-cols-3 items-center gap-1 sm:gap-3 min-h-[76px] py-2">
        {/* Banner oficial institucional del MEP */}
        <div className="flex items-center shrink-0">
          <img
            src="/assets/images/header.jpg"
            alt="Ministerio de Educación Pública · Gobierno de Costa Rica"
            className="w-12 sm:w-auto h-auto sm:h-14 lg:h-18 object-contain block select-none"
          />
        </div>

        <div className="relative group min-w-0 justify-self-center text-center text-white">
          <h1 tabIndex="0" aria-describedby="header-description" className="text-[10px] leading-tight sm:text-sm lg:text-lg font-black tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 rounded">
            {appVersion.heroTitulo || 'Repositorio de Planeamientos Curriculares'}
          </h1>
          <span id="header-description" role="tooltip" className="hidden group-hover:block group-focus-within:block absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 w-56 sm:w-80 lg:w-96 rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed font-normal text-white shadow-xl border border-amber-400/60 normal-case">
            {appVersion.heroSubtitulo || 'Catálogo Nacional Normado de planeamientos educativos aprobados por el Consejo Superior de Educación para la educación pública costarricense.'}
          </span>
        </div>

        {/* Controles institucionales */}
        <div className="flex items-center justify-self-end gap-1 sm:gap-2 lg:gap-3 flex-shrink-0 z-10">
          {/* Modo Claro / Oscuro */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs border border-white/30 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? (
              <>
                <IconSun className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-semibold text-white hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <IconMoon className="w-4 h-4 text-white" />
                <span className="text-xs font-semibold text-white hidden sm:inline">Oscuro</span>
              </>
            )}
          </button>

          {/* Acerca de */}
          <button
            onClick={onOpenAbout}
            type="button"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs border border-white/30 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Conocer más acerca del Repositorio Curricular Digital y la DDC"
            aria-label="Acerca del Repositorio Curricular Digital"
          >
            <IconInfo className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-semibold text-white hidden sm:inline">Acerca de</span>
          </button>

          {/* Botón Califícame con imagen oficial y enlace externo temporal */}
          <a
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            title="¡Califícanos! Tu opinión es importante"
            className="inline-flex items-center transition-transform hover:scale-105 active:scale-95 drop-shadow-sm ml-0.5"
          >
            <img
              src="/assets/images/calificame_fullcolor2.png"
              alt="¡Califícame!"
            className="w-7 sm:w-auto h-auto sm:h-11 md:h-12 object-contain block select-none"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
