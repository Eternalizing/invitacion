import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import SmoothImage from '../common/SmoothImage';

export default function BackgroundCarousel({ isChristmas = false }) {
  const { isLight } = useTheme();

  // Selección de fotos: Mezcla equilibrada de Navidad + Empresas para empleados, o las 27 fotos históricas de Gala
  const getGalaPhoto = (num) => `/assets/bg-photos/photo-${num}.jpg`;
  const getNavidadPhoto = (num) => `/assets/navidad/photo-${((num - 1) % 10) + 1}.jpg`;
  const getEmpresaPhoto = (num) => `/assets/carousel-opt/empresa-${num}.jpg`;

  const row1 = isChristmas
    ? [
        getNavidadPhoto(1),
        getEmpresaPhoto(1),
        getNavidadPhoto(2),
        getNavidadPhoto(3),
        getEmpresaPhoto(2),
        getNavidadPhoto(4),
        getEmpresaPhoto(3),
        getNavidadPhoto(5),
        getEmpresaPhoto(4),
      ]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9].map(getGalaPhoto);

  const row2 = isChristmas
    ? [
        getEmpresaPhoto(5),
        getNavidadPhoto(6),
        getNavidadPhoto(7),
        getEmpresaPhoto(6),
        getNavidadPhoto(8),
        getEmpresaPhoto(7),
        getNavidadPhoto(9),
        getNavidadPhoto(10),
        getEmpresaPhoto(8),
      ]
    : [10, 11, 12, 13, 14, 15, 16, 17, 18].map(getGalaPhoto);

  const row3 = isChristmas
    ? [
        getNavidadPhoto(3),
        getEmpresaPhoto(9),
        getNavidadPhoto(7),
        getEmpresaPhoto(10),
        getNavidadPhoto(1),
        getNavidadPhoto(9),
        getEmpresaPhoto(11),
        getNavidadPhoto(5),
        getEmpresaPhoto(12),
      ]
    : [19, 20, 21, 22, 23, 24, 25, 26, 27].map(getGalaPhoto);

  const row4 = isChristmas
    ? [
        getEmpresaPhoto(13),
        getNavidadPhoto(10),
        getNavidadPhoto(2),
        getEmpresaPhoto(14),
        getNavidadPhoto(6),
        getEmpresaPhoto(15),
        getNavidadPhoto(4),
        getNavidadPhoto(8),
        getEmpresaPhoto(16),
      ]
    : [1, 4, 7, 10, 13, 16, 19, 22, 25].map(getGalaPhoto);

  const cardStyle = isChristmas
    ? 'bg-[#170c0c] border border-[#C9A34E]/45 shadow-2xl'
    : isLight
    ? 'bg-[#33312C] border border-[#706044] shadow-2xl'
    : 'bg-[#151515] border border-[#51432A] shadow-2xl';

  const imgFilter = isChristmas
    ? 'filter saturate-[0.85] contrast-105 opacity-70'
    : isLight
    ? 'filter grayscale contrast-105 opacity-60'
    : 'filter grayscale contrast-110 opacity-55';

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none flex flex-col justify-between py-2 sm:py-4 ${
        isChristmas ? 'opacity-[0.30] sm:opacity-[0.34]' : 'opacity-[0.24] sm:opacity-[0.28]'
      }`}
    >
      {/* Fila 1 */}
      <div className="w-full overflow-hidden flex select-none">
        <div className="flex shrink-0 gap-3 sm:gap-6 animate-marquee-left-fast pr-3 sm:pr-6">
          {row1.map((src, idx) => (
            <div
              key={`r1-a-${idx}`}
              className={`w-32 sm:w-52 md:w-60 h-20 sm:h-36 md:h-40 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <SmoothImage src={src} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3 sm:gap-6 animate-marquee-left-fast pr-3 sm:pr-6" aria-hidden="true">
          {row1.map((src, idx) => (
            <div
              key={`r1-b-${idx}`}
              className={`w-32 sm:w-52 md:w-60 h-20 sm:h-36 md:h-40 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <SmoothImage src={src} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Fila 2 */}
      <div className="w-full overflow-hidden flex select-none">
        <div className="flex shrink-0 gap-3 sm:gap-6 animate-marquee-right-fast pr-3 sm:pr-6">
          {row2.map((src, idx) => (
            <div
              key={`r2-a-${idx}`}
              className={`w-36 sm:w-56 md:w-64 h-24 sm:h-38 md:h-44 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <SmoothImage src={src} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3 sm:gap-6 animate-marquee-right-fast pr-3 sm:pr-6" aria-hidden="true">
          {row2.map((src, idx) => (
            <div
              key={`r2-b-${idx}`}
              className={`w-36 sm:w-56 md:w-64 h-24 sm:h-38 md:h-44 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <SmoothImage src={src} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Fila 3 */}
      <div className="w-full overflow-hidden flex select-none">
        <div className="flex shrink-0 gap-3 sm:gap-6 animate-marquee-left-mid pr-3 sm:pr-6">
          {row3.map((src, idx) => (
            <div
              key={`r3-a-${idx}`}
              className={`w-32 sm:w-52 md:w-60 h-20 sm:h-36 md:h-40 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <SmoothImage src={src} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3 sm:gap-6 animate-marquee-left-mid pr-3 sm:pr-6" aria-hidden="true">
          {row3.map((src, idx) => (
            <div
              key={`r3-b-${idx}`}
              className={`w-32 sm:w-52 md:w-60 h-20 sm:h-36 md:h-40 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <SmoothImage src={src} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Fila 4 */}
      <div className="w-full overflow-hidden flex select-none">
        <div className="flex shrink-0 gap-3 sm:gap-6 animate-marquee-right-mid pr-3 sm:pr-6">
          {row4.map((src, idx) => (
            <div
              key={`r4-a-${idx}`}
              className={`w-36 sm:w-56 md:w-64 h-24 sm:h-38 md:h-44 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <SmoothImage src={src} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3 sm:gap-6 animate-marquee-right-mid pr-3 sm:pr-6" aria-hidden="true">
          {row4.map((src, idx) => (
            <div
              key={`r4-b-${idx}`}
              className={`w-36 sm:w-56 md:w-64 h-24 sm:h-38 md:h-44 shrink-0 rounded-xl overflow-hidden transition-colors duration-500 ${cardStyle}`}
            >
              <SmoothImage src={src} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${imgFilter}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Máscara de viñeta radial adaptativa al fondo */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: isLight
            ? 'radial-gradient(circle at center, rgba(36,35,32,0.28) 0%, rgba(36,35,32,0.82) 75%, #242320 100%)'
            : 'radial-gradient(circle at center, rgba(8,8,8,0.28) 0%, rgba(8,8,8,0.84) 75%, #080808 100%)',
        }}
      />
    </div>
  );
}
