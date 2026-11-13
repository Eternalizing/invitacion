import React from 'react';
import { eventData } from '../../data/eventData';
import { useTheme } from '../../context/ThemeContext';
import { Church, GlassWater, Moon, Utensils, Music, Sparkles, PartyPopper, Bell, DoorOpen } from 'lucide-react';

/**
 * CascadeTimeline: Programa de eventos en cascada alternada (zig-zag).
 * Cuenta con una línea dorada central animada con haz de luz continuo y
 * nodos metálicos de gala en cada estación.
 */
export default function CascadeTimeline() {
  const { isLight } = useTheme();

  // Estilos de icono grande y brillante
  const iconBaseClass = `w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 filter transition-transform duration-500 hover:scale-110 animate-icon-fadeIn ${
    isLight
      ? 'text-[#DDB967] drop-shadow-[0_4px_14px_rgba(221,185,103,0.45)]'
      : 'text-[#C9A34E] drop-shadow-[0_4px_14px_rgba(201,163,78,0.45)]'
  }`;

  // Resolutor de iconos grandes de alta resolución
  const renderItineraryIcon = (iconType) => {
    switch (iconType) {
      case 'church':
        return <Church className={iconBaseClass} strokeWidth={1.25} />;

      case 'glass':
      case 'toast':
        // Dos copas de champaña brindando con destello (como en la referencia)
        return (
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconBaseClass}
          >
            {/* Copa izquierda inclinada */}
            <g transform="rotate(10 24 32)">
              <path d="M18 10h12v12a6 6 0 0 1-6 6 6 6 0 0 1-6-6V10z" />
              <path d="M24 28v16" />
              <path d="M18 44h12" />
              <path d="M19 17h10" strokeWidth="1" strokeDasharray="1.5 2" opacity="0.6" />
            </g>
            {/* Copa derecha inclinada */}
            <g transform="rotate(-10 40 32)">
              <path d="M34 10h12v12a6 6 0 0 1-6 6 6 6 0 0 1-6-6V10z" />
              <path d="M40 28v16" />
              <path d="M34 44h12" />
              <path d="M35 17h10" strokeWidth="1" strokeDasharray="1.5 2" opacity="0.6" />
            </g>
            {/* Destellos de brindis central */}
            <path d="M32 4v5" strokeWidth="1.8" />
            <path d="M29.5 6.5h5" strokeWidth="1.8" />
            <circle cx="26" cy="3" r="0.9" fill="currentColor" />
            <circle cx="38" cy="3" r="0.9" fill="currentColor" />
          </svg>
        );

      case 'moon':
        return <Moon className={iconBaseClass} strokeWidth={1.25} />;

      case 'utensils':
      case 'cena':
        return <Utensils className={iconBaseClass} strokeWidth={1.25} />;

      case 'music':
      case 'fiesta':
        return <PartyPopper className={iconBaseClass} strokeWidth={1.25} />;

      case 'bell':
        return <Bell className={iconBaseClass} strokeWidth={1.25} />;

      case 'door':
        return <DoorOpen className={iconBaseClass} strokeWidth={1.25} />;

      case 'sparkles':
      default:
        return <Sparkles className={iconBaseClass} strokeWidth={1.25} />;
    }
  };

  const itinerary = eventData.itinerary || [];

  return (
    <div className="relative w-full max-w-md mx-auto py-4 select-none">
      {/* =========================================================================
          LÍNEA DORADA CENTRAL CON HAZ DE LUZ CONTINUO
         ========================================================================= */}
      <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-[2px] pointer-events-none z-0">
        {/* 1. Línea base metálica estática */}
        <div
          className={`w-full h-full transition-colors duration-500 ${
            isLight
              ? 'bg-gradient-to-b from-[#DDB967]/30 via-[#DDB967]/80 to-[#DDB967]/30'
              : 'bg-gradient-to-b from-[#C9A34E]/30 via-[#C9A34E]/80 to-[#C9A34E]/30'
          }`}
        />

        {/* 2. Haz de luz animado continuo que desciende por la línea */}
        <div
          className="absolute left-0 w-[2px] h-32 sm:h-44 rounded-full animate-vertical-beam pointer-events-none z-10"
          style={{
            background: isLight
              ? 'linear-gradient(to bottom, transparent 0%, rgba(221,185,103,0.4) 20%, #FFF0CD 60%, #FFFFFF 75%, #FFF0CD 88%, transparent 100%)'
              : 'linear-gradient(to bottom, transparent 0%, rgba(201,163,78,0.4) 20%, #F0DDA7 60%, #FFFFFF 75%, #F0DDA7 88%, transparent 100%)',
          }}
        />

        {/* 3. Halo difuminado que acompaña al haz de luz */}
        <div
          className="absolute -left-[3px] w-[8px] h-32 sm:h-44 rounded-full blur-[3px] opacity-75 animate-vertical-beam pointer-events-none z-0"
          style={{
            background: isLight
              ? 'linear-gradient(to bottom, transparent 0%, #FFF0CD 50%, #DDB967 80%, transparent 100%)'
              : 'linear-gradient(to bottom, transparent 0%, #F0DDA7 50%, #C9A34E 80%, transparent 100%)',
          }}
        />
      </div>

      {/* =========================================================================
          FILAS EN CASCADA ALTERNADA (ZIG-ZAG)
         ========================================================================= */}
      <div className="flex flex-col space-y-6 sm:space-y-8 relative z-10">
        {itinerary.map((item, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div
              key={idx}
              className="relative grid grid-cols-2 items-center min-h-[96px] sm:min-h-[118px]"
            >
              {/* ---------------------------------------------------------------
                  LADO IZQUIERDO (COLUMNA 1)
                 --------------------------------------------------------------- */}
              <div className="pr-4 sm:pr-7 md:pr-8 flex items-center justify-end">
                {isEven ? (
                  // Si es fila par: ÍCONO a la izquierda
                  <div className="flex items-center justify-end">
                    {renderItineraryIcon(item.icon)}
                  </div>
                ) : (
                  // Si es fila impar: TEXTO a la izquierda (alineado a la derecha)
                  <div className="flex flex-col items-end text-right">
                    <span
                      className={`text-xs sm:text-sm font-montserrat font-bold tracking-[0.2em] uppercase block mb-1 ${
                        isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
                      }`}
                    >
                      {item.time}
                    </span>
                    <h3
                      className={`font-serif italic text-base sm:text-lg md:text-xl font-normal leading-snug ${
                        isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.details && item.details.length > 0 && (
                      <div className="mt-1">
                        {item.details.map((d, dIdx) => (
                          <p
                            key={dIdx}
                            className={`text-[11px] sm:text-xs font-light leading-relaxed ${
                              isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
                            }`}
                          >
                            {d}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ---------------------------------------------------------------
                  NODO METÁLICO CENTRAL EN LA LÍNEA (ROMBO DE GALA)
                 --------------------------------------------------------------- */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-md ${
                    isLight
                      ? 'bg-[#33312C] border-[#DDB967] shadow-[0_0_12px_rgba(221,185,103,0.5)]'
                      : 'bg-[#151515] border-[#C9A34E] shadow-[0_0_12px_rgba(201,163,78,0.5)]'
                  }`}
                >
                  <div
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rotate-45 rounded-[1px] transition-colors duration-500 ${
                      isLight
                        ? 'bg-gradient-to-tr from-[#DDB967] via-[#FFF0CD] to-white shadow-[0_0_6px_rgba(255,240,205,0.9)]'
                        : 'bg-gradient-to-tr from-[#C9A34E] via-[#F0DDA7] to-white shadow-[0_0_6px_rgba(240,221,167,0.9)]'
                    }`}
                  />
                </div>
              </div>

              {/* ---------------------------------------------------------------
                  LADO DERECHO (COLUMNA 2)
                 --------------------------------------------------------------- */}
              <div className="pl-4 sm:pl-7 md:pl-8 flex items-center justify-start">
                {isEven ? (
                  // Si es fila par: TEXTO a la derecha (alineado a la izquierda)
                  <div className="flex flex-col items-start text-left">
                    <span
                      className={`text-xs sm:text-sm font-montserrat font-bold tracking-[0.2em] uppercase block mb-1 ${
                        isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
                      }`}
                    >
                      {item.time}
                    </span>
                    <h3
                      className={`font-serif italic text-base sm:text-lg md:text-xl font-normal leading-snug ${
                        isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.details && item.details.length > 0 && (
                      <div className="mt-1">
                        {item.details.map((d, dIdx) => (
                          <p
                            key={dIdx}
                            className={`text-[11px] sm:text-xs font-light leading-relaxed ${
                              isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
                            }`}
                          >
                            {d}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Si es fila impar: ÍCONO a la derecha
                  <div className="flex items-center justify-start">
                    {renderItineraryIcon(item.icon)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

