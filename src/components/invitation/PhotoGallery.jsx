import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Camera, Building2, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotoGallery() {
  const { isLight } = useTheme();
  const [selectedItem, setSelectedItem] = useState(null); // { src, title, index, total }

  // 1. Fotos oficiales de historia y momentos (27 fotos de Recursos/fotos)
  const totalHistory = 27;
  const getHistoryPhoto = (num) => `/assets/recursos-gallery/photo-${num}.jpg`;

  const historyRow1 = Array.from({ length: 9 }, (_, i) => ({
    id: `hist-${i + 1}`,
    index: i + 1,
    total: totalHistory,
    type: 'historia',
    title: '50 Años de Historia',
    src: getHistoryPhoto(i + 1),
  }));
  const historyRow2 = Array.from({ length: 9 }, (_, i) => ({
    id: `hist-${i + 10}`,
    index: i + 10,
    total: totalHistory,
    type: 'historia',
    title: '50 Años de Historia',
    src: getHistoryPhoto(i + 10),
  }));
  const historyRow3 = Array.from({ length: 9 }, (_, i) => ({
    id: `hist-${i + 19}`,
    index: i + 19,
    total: totalHistory,
    type: 'historia',
    title: '50 Años de Historia',
    src: getHistoryPhoto(i + 19),
  }));

  // 2. Fotos oficiales de empresas y concesionarios (28 fotos de Recursos/empresas)
  const totalEmpresas = 28;
  const getEmpresaPhoto = (num) => `/assets/empresas-gallery/empresa-${num}.jpg`;

  const empresasRow1 = Array.from({ length: 9 }, (_, i) => ({
    id: `emp-${i + 1}`,
    index: i + 1,
    total: totalEmpresas,
    type: 'empresa',
    title: 'Nuestras Empresas y Sedes',
    src: getEmpresaPhoto(i + 1),
  }));
  const empresasRow2 = Array.from({ length: 10 }, (_, i) => ({
    id: `emp-${i + 10}`,
    index: i + 10,
    total: totalEmpresas,
    type: 'empresa',
    title: 'Nuestras Empresas y Sedes',
    src: getEmpresaPhoto(i + 10),
  }));
  const empresasRow3 = Array.from({ length: 9 }, (_, i) => ({
    id: `emp-${i + 20}`,
    index: i + 20,
    total: totalEmpresas,
    type: 'empresa',
    title: 'Nuestras Empresas y Sedes',
    src: getEmpresaPhoto(i + 20),
  }));

  // Navegación con teclado en Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItem) return;
      if (e.key === 'Escape') setSelectedItem(null);
      if (e.key === 'ArrowRight') {
        const nextIdx = (selectedItem.index % selectedItem.total) + 1;
        const nextSrc = selectedItem.type === 'historia' ? getHistoryPhoto(nextIdx) : getEmpresaPhoto(nextIdx);
        setSelectedItem((prev) => ({ ...prev, index: nextIdx, src: nextSrc }));
      }
      if (e.key === 'ArrowLeft') {
        const prevIdx = ((selectedItem.index - 2 + selectedItem.total) % selectedItem.total) + 1;
        const prevSrc = selectedItem.type === 'historia' ? getHistoryPhoto(prevIdx) : getEmpresaPhoto(prevIdx);
        setSelectedItem((prev) => ({ ...prev, index: prevIdx, src: prevSrc }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  const cardContainerClass = isLight
    ? 'bg-[#33312C] border border-[#706044] hover:border-[#DDB967] shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_24px_rgba(221,185,103,0.35)]'
    : 'bg-[#151515] border border-[#51432A] hover:border-[#C9A34E] shadow-[0_4px_16px_rgba(0,0,0,0.7)] hover:shadow-[0_8px_24px_rgba(201,163,78,0.3)]';

  const badgeClass = isLight
    ? 'bg-[#33312C]/90 text-[#DDB967] border-[#706044]'
    : 'bg-[#151515]/90 text-[#C9A34E] border-[#51432A]';

  const renderTrack = (items, animClass) => {
    const trackItems = [...items, ...items];

    return (
      <div className="w-full max-w-full overflow-hidden flex select-none hover-pause">
        <div className={`flex shrink-0 gap-3 sm:gap-4.5 ${animClass} pr-3 sm:pr-4.5`}>
          {trackItems.map((item, idx) => (
            <button
              key={`track-a-${item.id}-${idx}`}
              type="button"
              onClick={() => setSelectedItem(item)}
              className={`group relative shrink-0 w-36 sm:w-48 md:w-56 h-28 sm:h-36 md:h-40 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform active:scale-95 ${cardContainerClass}`}
              aria-label={`Ver imagen ${item.index}`}
            >
              <img
                src={item.src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-semibold backdrop-blur-md border ${
                    isLight
                      ? 'bg-[#242320]/85 text-[#FFF0CD] border-[#DDB967]/50'
                      : 'bg-[#080808]/85 text-[#F0DDA7] border-[#C9A34E]/50'
                  }`}
                >
                  Ampliar
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className={`flex shrink-0 gap-3 sm:gap-4.5 ${animClass} pr-3 sm:pr-4.5`} aria-hidden="true">
          {trackItems.map((item, idx) => (
            <button
              key={`track-b-${item.id}-${idx}`}
              type="button"
              tabIndex={-1}
              onClick={() => setSelectedItem(item)}
              className={`group relative shrink-0 w-36 sm:w-48 md:w-56 h-28 sm:h-36 md:h-40 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform active:scale-95 ${cardContainerClass}`}
            >
              <img
                src={item.src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-semibold backdrop-blur-md border ${
                    isLight
                      ? 'bg-[#242320]/85 text-[#FFF0CD] border-[#DDB967]/50'
                      : 'bg-[#080808]/85 text-[#F0DDA7] border-[#C9A34E]/50'
                  }`}
                >
                  Ampliar
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

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

        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`h-[1px] w-12 sm:w-16 ${isLight ? 'bg-[#706044]' : 'bg-[#51432A]'}`} />
          <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
          <div className={`h-[1px] w-12 sm:w-16 ${isLight ? 'bg-[#706044]' : 'bg-[#51432A]'}`} />
        </div>
      </div>

      {/* FILAS DE HISTORIA (Sin bordes opacos oscuros en los laterales, flujo continuo de borde a borde) */}
      <div className="w-full max-w-full overflow-hidden flex flex-col gap-3.5 sm:gap-4.5 py-2 mb-10 sm:mb-14">
        {/* Fila 1: Izquierda (Fotos 1 a 9) */}
        {renderTrack(historyRow1, 'animate-gallery-left-1')}

        {/* Fila 2: Derecha (Fotos 10 a 18) */}
        {renderTrack(historyRow2, 'animate-gallery-right-2')}

        {/* Fila 3: Izquierda (Fotos 19 a 27) */}
        {renderTrack(historyRow3, 'animate-gallery-left-3')}
      </div>

      {/* =========================================================================
          2. SEGUNDA GALERÍA: NUESTRAS EMPRESAS Y CONCESIONARIOS (28 Fotos)
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

        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`h-[1px] w-12 sm:w-16 ${isLight ? 'bg-[#706044]' : 'bg-[#51432A]'}`} />
          <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
          <div className={`h-[1px] w-12 sm:w-16 ${isLight ? 'bg-[#706044]' : 'bg-[#51432A]'}`} />
        </div>
      </div>

      {/* FILAS DE EMPRESAS (Sin bordes opacos laterales, movimiento infinito continuo) */}
      <div className="w-full max-w-full overflow-hidden flex flex-col gap-3.5 sm:gap-4.5 py-2">
        {/* Fila 1: Derecha (Empresas 1 a 9) */}
        {renderTrack(empresasRow1, 'animate-gallery-right-2')}

        {/* Fila 2: Izquierda (Empresas 10 a 19) */}
        {renderTrack(empresasRow2, 'animate-gallery-left-1')}

        {/* Fila 3: Derecha (Empresas 20 a 28) */}
        {renderTrack(empresasRow3, 'animate-gallery-right-2')}
      </div>

      {/* =========================================================================
          LIGHTBOX MODAL UNIFICADO PARA AMBAS GALERÍAS
         ========================================================================= */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(null);
            }}
            className={`absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full border transition-all cursor-pointer ${
              isLight
                ? 'bg-[#33312C] text-[#FAF6ED] border-[#706044] hover:bg-[#403C34]'
                : 'bg-[#151515] text-[#F5F2EA] border-[#51432A] hover:bg-[#202020]'
            }`}
            aria-label="Cerrar vista ampliada"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Botón Foto Anterior */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const prevIdx = ((selectedItem.index - 2 + selectedItem.total) % selectedItem.total) + 1;
              const prevSrc = selectedItem.type === 'historia' ? getHistoryPhoto(prevIdx) : getEmpresaPhoto(prevIdx);
              setSelectedItem((prev) => ({ ...prev, index: prevIdx, src: prevSrc }));
            }}
            className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full border transition-all cursor-pointer ${
              isLight
                ? 'bg-[#33312C]/90 text-[#DDB967] border-[#706044] hover:bg-[#403C34]'
                : 'bg-[#151515]/90 text-[#C9A34E] border-[#51432A] hover:bg-[#202020]'
            }`}
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Botón Foto Siguiente */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const nextIdx = (selectedItem.index % selectedItem.total) + 1;
              const nextSrc = selectedItem.type === 'historia' ? getHistoryPhoto(nextIdx) : getEmpresaPhoto(nextIdx);
              setSelectedItem((prev) => ({ ...prev, index: nextIdx, src: nextSrc }));
            }}
            className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full border transition-all cursor-pointer ${
              isLight
                ? 'bg-[#33312C]/90 text-[#DDB967] border-[#706044] hover:bg-[#403C34]'
                : 'bg-[#151515]/90 text-[#C9A34E] border-[#51432A] hover:bg-[#202020]'
            }`}
            aria-label="Siguiente foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Tarjeta de Foto Ampliada */}
          <div
            className={`relative max-w-3xl max-h-[88vh] rounded-2xl overflow-hidden p-2 sm:p-3 border shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col items-center ${
              isLight ? 'bg-[#33312C] border-[#DDB967]/60' : 'bg-[#151515] border-[#C9A34E]/60'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full overflow-hidden rounded-xl flex items-center justify-center bg-black/40">
              <img
                src={selectedItem.src}
                alt={`${selectedItem.title} - ${selectedItem.index}`}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="w-full pt-3 pb-1 flex items-center justify-between px-2 text-xs">
              <span className={`font-serif italic ${isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'}`}>
                {selectedItem.title}
              </span>
              <span className={`font-mono text-[11px] ${isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'}`}>
                {selectedItem.index} / {selectedItem.total}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
