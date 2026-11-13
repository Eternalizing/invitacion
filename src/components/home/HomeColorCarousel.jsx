import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function HomeColorCarousel() {
  const { isLight } = useTheme();

  // Fotos de empresas (1 a 28) y recursos (1 a 27) optimizadas y a color
  const getEmpresa = (num) => `/assets/carousel-opt/empresa-${num}.jpg`;
  const getPhoto = (num) => `/assets/carousel-opt/photo-${num}.jpg`;

  // 7 Filas variadas con imágenes que ocupan el 100% del alto de la pantalla sin cortes ni scroll
  const rows = [
    // Fila 1
    [
      getEmpresa(1), getPhoto(2), getEmpresa(3), getPhoto(4), getEmpresa(5),
      getPhoto(6), getEmpresa(7), getPhoto(8), getEmpresa(9), getPhoto(10),
      getEmpresa(11), getPhoto(12), getEmpresa(13), getPhoto(14),
    ],
    // Fila 2
    [
      getPhoto(15), getEmpresa(16), getPhoto(17), getEmpresa(18), getPhoto(19),
      getEmpresa(20), getPhoto(21), getEmpresa(22), getPhoto(23), getEmpresa(24),
      getPhoto(25), getEmpresa(26), getPhoto(27), getEmpresa(28),
    ],
    // Fila 3
    [
      getEmpresa(2), getPhoto(1), getEmpresa(6), getPhoto(5), getEmpresa(10),
      getPhoto(9), getEmpresa(14), getPhoto(13), getEmpresa(18), getPhoto(17),
      getEmpresa(22), getPhoto(21), getEmpresa(26), getPhoto(25),
    ],
    // Fila 4
    [
      getPhoto(3), getEmpresa(4), getPhoto(7), getEmpresa(8), getPhoto(11),
      getEmpresa(12), getPhoto(15), getEmpresa(16), getPhoto(19), getEmpresa(20),
      getPhoto(23), getEmpresa(24), getPhoto(27), getEmpresa(28),
    ],
    // Fila 5
    [
      getEmpresa(15), getPhoto(14), getEmpresa(17), getPhoto(16), getEmpresa(19),
      getPhoto(18), getEmpresa(21), getPhoto(20), getEmpresa(23), getPhoto(22),
      getEmpresa(25), getPhoto(24), getEmpresa(27), getPhoto(26),
    ],
    // Fila 6
    [
      getPhoto(2), getEmpresa(1), getPhoto(6), getEmpresa(5), getPhoto(10),
      getEmpresa(9), getPhoto(14), getEmpresa(13), getPhoto(18), getEmpresa(17),
      getPhoto(22), getEmpresa(21), getPhoto(26), getEmpresa(25),
    ],
    // Fila 7
    [
      getEmpresa(28), getPhoto(27), getEmpresa(24), getPhoto(23), getEmpresa(20),
      getPhoto(19), getEmpresa(16), getPhoto(15), getEmpresa(12), getPhoto(11),
      getEmpresa(8), getPhoto(7), getEmpresa(4), getPhoto(3),
    ],
  ];

  // Velocidades y sentidos alternados para dinamismo cinematográfico
  const animations = [
    'animate-marquee-left-fast',
    'animate-marquee-right-fast',
    'animate-marquee-left-mid',
    'animate-marquee-right-mid',
    'animate-marquee-left-fast',
    'animate-marquee-right-fast',
    'animate-marquee-left-mid',
  ];

  const cardStyle = isLight
    ? 'bg-[#33312C]/70 border border-[#706044]/35 shadow-md'
    : 'bg-[#151515]/70 border border-[#51432A]/35 shadow-lg';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full h-[100dvh] pointer-events-none z-0 overflow-hidden select-none flex flex-col justify-between py-1 opacity-[0.38] sm:opacity-[0.44] transition-opacity duration-700"
    >
      {rows.map((rowImages, rIdx) => {
        const animClass = animations[rIdx % animations.length];
        // Duplicamos el bloque para garantizar una longitud ininterrumpida que supera con creces cualquier resolución
        const blockImages = [...rowImages, ...rowImages];

        return (
          <div
            key={`row-${rIdx}`}
            className="w-full flex-1 min-h-0 overflow-hidden flex items-center select-none"
          >
            {/* Bloque A (Carga inmediata sin lazy-load para evitar pantallas negras en bucles continuos) */}
            <div className={`flex shrink-0 h-full items-center gap-2 sm:gap-3 ${animClass} pr-2 sm:pr-3`}>
              {blockImages.map((src, idx) => (
                <div
                  key={`r${rIdx}-a-${idx}`}
                  className={`h-[88%] aspect-[16/10] shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${cardStyle}`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover saturate-[1.12] contrast-[1.06]"
                  />
                </div>
              ))}
            </div>

            {/* Bloque B gemelo para empalme 100% perfecto e infinito */}
            <div className={`flex shrink-0 h-full items-center gap-2 sm:gap-3 ${animClass} pr-2 sm:pr-3`} aria-hidden="true">
              {blockImages.map((src, idx) => (
                <div
                  key={`r${rIdx}-b-${idx}`}
                  className={`h-[88%] aspect-[16/10] shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${cardStyle}`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover saturate-[1.12] contrast-[1.06]"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
