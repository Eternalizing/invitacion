import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { eventData } from '../../data/eventData';
import HomeColorCarousel from './HomeColorCarousel';
import SmoothImage from '../common/SmoothImage';

export default function PublicHome() {
  const { isLight } = useTheme();

  // Bloqueo absoluto de scroll y gestos de rebote en teléfonos y navegadores
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';

    const preventScroll = (e) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 w-screen h-screen h-[100dvh] overflow-hidden flex flex-col items-center justify-center select-none touch-none overscroll-none font-montserrat transition-colors duration-700 ${
        isLight ? 'bg-[#242320]' : 'bg-[#080808]'
      }`}
    >
      {/* 1. CARRUSEL INFINITO DE FOTOS EN EL FONDO (A Color, 7 filas distribuidas en el 100% de la pantalla) */}
      <HomeColorCarousel />

      {/* 2. Capa de viñeta oscura para contraste cinematográfico y legibilidad */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-black/75 via-black/45 to-black/85"
      />

      {/* 3. Iluminación ambiental cálida dorada en el centro */}
      <div
        aria-hidden="true"
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] sm:w-[700px] sm:h-[700px] rounded-full blur-[100px] sm:blur-[160px] pointer-events-none z-[2] transition-all duration-700 ${
          isLight ? 'bg-[#DDB967]/22' : 'bg-[#C9A34E]/18'
        }`}
      />

      {/* 4. CONTENIDO PRINCIPAL: ÚNICAMENTE LOS DOS LOGOS CENTRADOS */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-lg w-full animate-fadeIn pointer-events-none">
        {/* Logo 1: Atef Nemer Grupo de Empresas */}
        <div className="relative flex items-center justify-center max-w-[80vw] sm:max-w-md w-full my-2 sm:my-3">
          <SmoothImage
            src={eventData.logos.mainCompanyLogo}
            alt="Atef Nemer Grupo de Empresas"
            loading="eager"
            className="max-h-20 sm:max-h-26 md:max-h-32 w-auto max-w-full object-contain logo-glow filter drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]"
          />
        </div>

        {/* Separación armónica sutil */}
        <div className="h-3 sm:h-5" />

        {/* Logo 2: 50 Años de Trayectoria */}
        <div className="relative flex items-center justify-center max-w-[65vw] sm:max-w-xs w-full my-2 sm:my-3">
          <SmoothImage
            src={eventData.logos.logo50Anos}
            alt="50 Años de Trayectoria"
            loading="eager"
            className="max-h-16 sm:max-h-22 md:max-h-28 w-auto max-w-full object-contain logo-glow filter drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]"
            style={{ animationDelay: '1.5s' }}
          />
        </div>
      </div>
    </div>
  );
}
