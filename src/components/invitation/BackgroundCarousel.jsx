import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function BackgroundCarousel() {
  const { isLight } = useTheme();

  // Las 27 fotos históricas oficiales completas
  const getPhoto = (num) => `/assets/bg-photos/photo-${num}.jpg`;

  // Distribución balanceada de las 27 fotos en 4 filas para asegurar que TODAS se visualicen
  const row1 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(getPhoto);
  const row2 = [10, 11, 12, 13, 14, 15, 16, 17, 18].map(getPhoto);
  const row3 = [19, 20, 21, 22, 23, 24, 25, 26, 27].map(getPhoto);
  const row4 = [1, 4, 7, 10, 13, 16, 19, 22, 25].map(getPhoto);

  const cardStyle = isLight
    ? 'bg-[#33312C] border border-[#706044] shadow-2xl'
    : 'bg-[#151515] border border-[#51432A] shadow-2xl';

  const imgFilter = isLight
    ? 'filter grayscale contrast-110 sepia-[0.15] brightness-95'
    : 'filter grayscale contrast-115 brightness-90';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none flex flex-col justify-between py-2 sm:py-4 opacity-[0.24] sm:opacity-[0.28]"
    >
      {/* Fila 1: Movimiento infinito y continuo hacia la izquierda (Fotos 1 a 9) */}
      <div className="w-full overflow-hidden flex select-none">
        <div className="flex shrink-0 gap-3.5 sm:gap-6 animate-marquee-left-fast pr-3.5 sm:pr-6">
          {row1.map((src, idx) => (
            <div
              key={`r1-a-${idx}`}
              className={`w-36 sm:w-52 md:w-60 h-24 sm:h-36 md:h-40 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3.5 sm:gap-6 animate-marquee-left-fast pr-3.5 sm:pr-6" aria-hidden="true">
          {row1.map((src, idx) => (
            <div
              key={`r1-b-${idx}`}
              className={`w-36 sm:w-52 md:w-60 h-24 sm:h-36 md:h-40 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Fila 2: Movimiento infinito y continuo hacia la derecha (Fotos 10 a 18) */}
      <div className="w-full overflow-hidden flex select-none">
        <div className="flex shrink-0 gap-3.5 sm:gap-6 animate-marquee-right-fast pr-3.5 sm:pr-6">
          {row2.map((src, idx) => (
            <div
              key={`r2-a-${idx}`}
              className={`w-40 sm:w-56 md:w-64 h-28 sm:h-38 md:h-44 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3.5 sm:gap-6 animate-marquee-right-fast pr-3.5 sm:pr-6" aria-hidden="true">
          {row2.map((src, idx) => (
            <div
              key={`r2-b-${idx}`}
              className={`w-40 sm:w-56 md:w-64 h-28 sm:h-38 md:h-44 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Fila 3: Movimiento infinito y continuo hacia la izquierda (Fotos 19 a 27) */}
      <div className="w-full overflow-hidden flex select-none">
        <div className="flex shrink-0 gap-3.5 sm:gap-6 animate-marquee-left-mid pr-3.5 sm:pr-6">
          {row3.map((src, idx) => (
            <div
              key={`r3-a-${idx}`}
              className={`w-36 sm:w-52 md:w-60 h-24 sm:h-36 md:h-40 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3.5 sm:gap-6 animate-marquee-left-mid pr-3.5 sm:pr-6" aria-hidden="true">
          {row3.map((src, idx) => (
            <div
              key={`r3-b-${idx}`}
              className={`w-36 sm:w-52 md:w-60 h-24 sm:h-36 md:h-40 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Fila 4: Movimiento infinito y continuo hacia la derecha */}
      <div className="w-full overflow-hidden flex select-none">
        <div className="flex shrink-0 gap-3.5 sm:gap-6 animate-marquee-right-mid pr-3.5 sm:pr-6">
          {row4.map((src, idx) => (
            <div
              key={`r4-a-${idx}`}
              className={`w-40 sm:w-56 md:w-64 h-28 sm:h-38 md:h-44 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3.5 sm:gap-6 animate-marquee-right-mid pr-3.5 sm:pr-6" aria-hidden="true">
          {row4.map((src, idx) => (
            <div
              key={`r4-b-${idx}`}
              className={`w-40 sm:w-56 md:w-64 h-28 sm:h-38 md:h-44 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Máscara de viñeta radial adaptativa al fondo */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: isLight
            ? 'radial-gradient(circle at center, rgba(36,35,32,0.3) 0%, rgba(36,35,32,0.85) 75%, #242320 100%)'
            : 'radial-gradient(circle at center, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.85) 75%, #080808 100%)',
        }}
      />
    </div>
  );
}
