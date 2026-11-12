import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { isLight, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isLight ? 'Cambiar a Paleta 01: Negro y Oro Clásico' : 'Cambiar a Paleta 02: Grafito y Champán'}
        title={isLight ? 'Cambiar a Paleta 01: Negro y Oro' : 'Cambiar a Paleta 02: Grafito y Champán'}
        className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all duration-500 cursor-pointer backdrop-blur-md active:scale-95 shadow-xl ${
          isLight
            ? 'bg-[#33312C]/90 hover:bg-[#403C34] border-[#706044] text-[#FFF0CD] shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:border-[#DDB967]'
            : 'bg-[#151515]/90 hover:bg-[#202020] border-[#51432A] text-[#F0DDA7] shadow-[0_4px_25px_rgba(0,0,0,0.85)] hover:border-[#C9A34E]'
        }`}
      >
        {/* Glow dinámico sutil */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-500 pointer-events-none ${
            isLight
              ? 'bg-[#DDB967]/15 group-hover:opacity-100 opacity-50'
              : 'bg-[#C9A34E]/10 group-hover:opacity-100 opacity-40'
          }`}
        />

        {/* Ícono de paleta */}
        <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center shrink-0">
          <Palette
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-500 group-hover:rotate-180 filter ${
              isLight
                ? 'text-[#DDB967] drop-shadow-[0_1px_4px_rgba(221,185,103,0.5)]'
                : 'text-[#C9A34E] drop-shadow-[0_1px_4px_rgba(201,163,78,0.5)]'
            }`}
          />
        </div>

        {/* Texto descriptivo del modo */}
        <div className="flex flex-col text-left leading-none font-montserrat">
          <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap">
            {isLight ? 'Negro y Oro' : 'Grafito y Champán'}
          </span>
        </div>

        {/* Punto dorado decorativo */}
        <span
          className={`w-1.5 h-1.5 rounded-full transition-opacity duration-300 ${
            isLight ? 'bg-[#DDB967] shadow-[0_0_6px_rgba(221,185,103,0.7)] opacity-90' : 'bg-[#C9A34E] shadow-[0_0_6px_rgba(201,163,78,0.7)] opacity-80'
          }`}
        />
      </button>
    </div>
  );
}
