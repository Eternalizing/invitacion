import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Camera, Building2 } from 'lucide-react';

function GalleryRow({ items, direction = 'left', speed = 0.65, cardContainerClass, isReady = true }) {
  const containerRef = useRef(null);
  const isInteractingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const resumeTimeoutRef = useRef(null);
  const singleWidthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Triplicamos los ítems para garantizar desplazamiento infinito óptimo con menor uso de memoria
  const triItems = [...items, ...items, ...items];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateMetrics = () => {
      if (el && el.scrollWidth) {
        const single = el.scrollWidth / 3;
        singleWidthRef.current = single;
        if (el.scrollLeft === 0 && single > 0) {
          el.scrollLeft = single;
        }
      }
    };

    updateMetrics();

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics();
    });

    const inner = el.firstElementChild;
    if (inner) {
      resizeObserver.observe(inner);
    }

    const handleGlobalMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        setIsDragging(false);
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = setTimeout(() => {
          isInteractingRef.current = false;
        }, 1200);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);

    // Bucle de auto-desplazamiento continuo cuando está listo y el usuario no está arrastrando
    let animationFrameId;
    const step = direction === 'left' ? speed : -speed;

    const animate = () => {
      if (el && isReady && !isInteractingRef.current && !isHoveredRef.current && singleWidthRef.current > 0) {
        el.scrollLeft += step;
        const single = singleWidthRef.current;
        if (el.scrollLeft >= single * 2.2) {
          el.scrollLeft -= single;
        } else if (el.scrollLeft <= single * 0.4) {
          el.scrollLeft += single;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    if (isReady) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [direction, speed, isReady]);

  // Manejador de scroll para el bucle infinito mientras el usuario interactúa
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !singleWidthRef.current || singleWidthRef.current <= 0) return;
    const single = singleWidthRef.current;
    if (el.scrollLeft >= single * 2.5) {
      el.scrollLeft -= single;
    } else if (el.scrollLeft <= single * 0.1) {
      el.scrollLeft += single;
    }
  };

  // Manejo táctil para teléfonos
  const handleTouchStart = () => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleTouchEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 1200);
  };

  // Manejo de ratón para computadoras (Arrastrar con clic)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    isInteractingRef.current = true;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = containerRef.current.scrollLeft;
    setIsDragging(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current || !containerRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - startXRef.current) * 1.3;
    containerRef.current.scrollLeft = startScrollLeftRef.current - walk;
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={`w-full max-w-full overflow-x-auto overflow-y-hidden flex select-none no-scrollbar ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex shrink-0 gap-3 sm:gap-4.5 pr-3 sm:pr-4.5 py-1">
        {triItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className={`relative shrink-0 w-36 sm:w-48 md:w-56 h-28 sm:h-36 md:h-40 rounded-xl sm:rounded-2xl overflow-hidden select-none transition-all duration-300 transform ${cardContainerClass}`}
          >
            <img
              src={item.src}
              alt=""
              loading={idx < 4 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PhotoGallery({ isReady = true }) {
  const { isLight } = useTheme();

  // 1. Fotos oficiales de historia y momentos (27 fotos de Recursos/fotos)
  const getHistoryPhoto = (num) => `/assets/recursos-gallery/photo-${num}.jpg`;

  const historyRow1 = Array.from({ length: 9 }, (_, i) => ({
    id: `hist-${i + 1}`,
    index: i + 1,
    src: getHistoryPhoto(i + 1),
  }));
  const historyRow2 = Array.from({ length: 9 }, (_, i) => ({
    id: `hist-${i + 10}`,
    index: i + 10,
    src: getHistoryPhoto(i + 10),
  }));
  const historyRow3 = Array.from({ length: 9 }, (_, i) => ({
    id: `hist-${i + 19}`,
    index: i + 19,
    src: getHistoryPhoto(i + 19),
  }));

  // 2. Fotos oficiales de proyectos (28 fotos de empresas, centros comerciales, residencias, conjuntos y edificios)
  const getEmpresaPhoto = (num) => `/assets/empresas-gallery/empresa-${num}.jpg`;

  const empresasRow1 = Array.from({ length: 9 }, (_, i) => ({
    id: `emp-${i + 1}`,
    index: i + 1,
    src: getEmpresaPhoto(i + 1),
  }));
  const empresasRow2 = Array.from({ length: 10 }, (_, i) => ({
    id: `emp-${i + 10}`,
    index: i + 10,
    src: getEmpresaPhoto(i + 10),
  }));
  const empresasRow3 = Array.from({ length: 9 }, (_, i) => ({
    id: `emp-${i + 20}`,
    index: i + 20,
    src: getEmpresaPhoto(i + 20),
  }));

  const cardContainerClass = isLight
    ? 'bg-[#33312C] border border-[#706044] hover:border-[#DDB967] shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_24px_rgba(221,185,103,0.35)]'
    : 'bg-[#151515] border border-[#51432A] hover:border-[#C9A34E] shadow-[0_4px_16px_rgba(0,0,0,0.7)] hover:shadow-[0_8px_24px_rgba(201,163,78,0.3)]';

  const badgeClass = isLight
    ? 'bg-[#33312C]/90 text-[#DDB967] border-[#706044]'
    : 'bg-[#151515]/90 text-[#C9A34E] border-[#51432A]';

  return (
    <section className="w-full max-w-full my-12 sm:my-16 flex flex-col items-center z-10 relative overflow-hidden">
      {/* =========================================================================
          1. PRIMERA GALERÍA: 50 AÑOS DE HISTORIA (27 Fotos oficiales)
         ========================================================================= */}
      <div className="w-full max-w-lg px-5 flex flex-col items-center text-center mb-6 sm:mb-8">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] sm:text-xs tracking-[0.22em] uppercase font-bold mb-3 shadow-md backdrop-blur-md transition-colors duration-500 ${badgeClass}`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>GALERÍA DE MOMENTOS</span>
        </div>

        <h2
          className={`font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-wide mb-2 transition-colors duration-500 ${
            isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
          }`}
        >
          50 Años de Historia
        </h2>

        <p
          className={`text-xs sm:text-sm font-montserrat max-w-md leading-relaxed transition-colors duration-500 ${
            isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
          }`}
        >
          Un recorrido visual por los momentos, personas y grandes logros que han marcado nuestro medio siglo de trayectoria.
        </p>

        <div className="flex items-center justify-center gap-2.5 mt-4">
          <div className={`h-[1px] w-12 sm:w-16 ${isLight ? 'bg-[#706044]' : 'bg-[#51432A]'}`} />
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              isLight ? 'bg-[#DDB967] shadow-[0_0_8px_rgba(221,185,103,0.7)]' : 'bg-[#C9A34E] shadow-[0_0_8px_rgba(201,163,78,0.7)]'
            }`}
          />
          <div className={`h-[1px] w-12 sm:w-16 ${isLight ? 'bg-[#706044]' : 'bg-[#51432A]'}`} />
        </div>
      </div>

      {/* FILAS DE HISTORIA CON DESPLAZAMIENTO TÁCTIL Y RATÓN */}
      <div className="w-full max-w-full overflow-hidden flex flex-col gap-3.5 sm:gap-4.5 py-2 mb-10 sm:mb-14">
        {/* Fila 1: Izquierda (Fotos 1 a 9) */}
        <GalleryRow items={historyRow1} direction="left" speed={0.65} cardContainerClass={cardContainerClass} isReady={isReady} />

        {/* Fila 2: Derecha (Fotos 10 a 18) */}
        <GalleryRow items={historyRow2} direction="right" speed={0.55} cardContainerClass={cardContainerClass} isReady={isReady} />

        {/* Fila 3: Izquierda (Fotos 19 a 27) */}
        <GalleryRow items={historyRow3} direction="left" speed={0.6} cardContainerClass={cardContainerClass} isReady={isReady} />
      </div>

      {/* =========================================================================
          2. SEGUNDA GALERÍA: NUESTRAS SEDES Y EMPRESAS (28 Fotos)
         ========================================================================= */}
      <div className="w-full max-w-lg px-5 flex flex-col items-center text-center mb-6 sm:mb-8">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] sm:text-xs tracking-[0.22em] uppercase font-bold mb-3 shadow-md backdrop-blur-md transition-colors duration-500 ${badgeClass}`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>EMPRESAS DEL GRUPO</span>
        </div>

        <h2
          className={`font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-wide mb-2 transition-colors duration-500 ${
            isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
          }`}
        >
          Nuestras Sedes y Empresas
        </h2>

        <p
          className={`text-xs sm:text-sm font-montserrat max-w-md leading-relaxed transition-colors duration-500 ${
            isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
          }`}
        >
          Infraestructura de vanguardia, concesionarios oficiales y centros de operaciones que impulsan el liderazgo de Atef Nemer Grupo de Empresas.
        </p>

        <div className="flex items-center justify-center gap-2.5 mt-4">
          <div className={`h-[1px] w-12 sm:w-16 ${isLight ? 'bg-[#706044]' : 'bg-[#51432A]'}`} />
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              isLight ? 'bg-[#DDB967] shadow-[0_0_8px_rgba(221,185,103,0.7)]' : 'bg-[#C9A34E] shadow-[0_0_8px_rgba(201,163,78,0.7)]'
            }`}
          />
          <div className={`h-[1px] w-12 sm:w-16 ${isLight ? 'bg-[#706044]' : 'bg-[#51432A]'}`} />
        </div>
      </div>

      {/* FILAS DE PROYECTOS CON DESPLAZAMIENTO TÁCTIL Y RATÓN */}
      <div className="w-full max-w-full overflow-hidden flex flex-col gap-3.5 sm:gap-4.5 py-2">
        {/* Fila 1: Derecha (Fotos 1 a 9) */}
        <GalleryRow items={empresasRow1} direction="right" speed={0.55} cardContainerClass={cardContainerClass} isReady={isReady} />

        {/* Fila 2: Izquierda (Fotos 10 a 19) */}
        <GalleryRow items={empresasRow2} direction="left" speed={0.65} cardContainerClass={cardContainerClass} isReady={isReady} />

        {/* Fila 3: Derecha (Fotos 20 a 28) */}
        <GalleryRow items={empresasRow3} direction="right" speed={0.6} cardContainerClass={cardContainerClass} isReady={isReady} />
      </div>
    </section>
  );
}
