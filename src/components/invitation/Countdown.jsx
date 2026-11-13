import React, { useState, useEffect } from 'react';
import { eventData } from '../../data/eventData';
import { Clock, Church, GlassWater, Sparkles, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import GlowingCard from '../common/GlowingCard';

/**
 * Calcula las partes numéricas de tiempo (Días, Horas, Minutos, Segundos)
 */
function calcTimeParts(diffMs) {
  const diff = Math.max(0, diffMs);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    timeBlocks: [
      { label: 'DÍAS', value: days },
      { label: 'HORAS', value: hours },
      { label: 'MINUTOS', value: minutes },
      { label: 'SEGUNDOS', value: seconds },
    ],
  };
}

/**
 * Calcula la etapa activa del evento en base a la línea de tiempo.
 * Soporta simulación mediante parámetro en la URL (?stage=misa, ?stage=proximamente, ?stage=recepcion, ?stage=fin).
 */
function calculateTimelineState() {
  let now = Date.now();

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const simStage = params.get('stage') || params.get('etapa') || params.get('sim');
    if (simStage) {
      const lower = simStage.toLowerCase();
      if (lower === 'misa' || lower === 'proximamente' || lower === 'recepcion-previa') {
        // Simula estar durante la Misa de 1 hora y 30 min (5:30 p. m. a 7:00 p. m.), previa a la recepción (ej. 6:15 p. m.)
        now = new Date('2026-11-28T18:15:00').getTime();
      } else if (lower === 'recepcion' || lower === 'fiesta') {
        // Simula estar durante la Recepción (ej. 7:30 p. m.)
        now = new Date('2026-11-28T19:30:00').getTime();
      } else if (lower === 'conclusion' || lower === 'fin' || lower === 'gracias') {
        // Simula estar pasada la medianoche (12:15 a. m. del 29)
        now = new Date('2026-11-29T00:15:00').getTime();
      }
    }
  }

  const tMisa = new Date(eventData.scheduleTimestamps?.misa || eventData.eventTimestamp || '2026-11-28T17:30:00').getTime();
  const tRecepcion = new Date(eventData.scheduleTimestamps?.recepcion || '2026-11-28T19:00:00').getTime();
  const tConclusion = new Date(eventData.scheduleTimestamps?.conclusion || '2026-11-29T00:00:00').getTime();

  // 1. Etapa de Conclusión: A partir de las 12:00 a. m. (medianoche)
  if (now >= tConclusion) {
    return {
      stage: 'CONCLUSION',
      title: 'GRACIAS POR ASISTIR',
      floatingLabel: 'GRACIAS POR ASISTIR',
      subtitle: 'Gala Conmemorativa 50.º Aniversario',
      iconType: 'sparkles',
      isFinished: true,
      timeBlocks: [],
    };
  }

  // 2. Etapa de Recepción: Desde las 7:00 p. m. hasta las 12:00 a. m. -> Cuenta regresiva hacia la conclusión
  if (now >= tRecepcion) {
    const diff = tConclusion - now;
    return {
      stage: 'RECEPCION',
      title: 'RECEPCIÓN DE GALA',
      floatingLabel: 'RECEPCIÓN',
      subtitle: 'Tiempo restante para la Conclusión',
      iconType: 'glass',
      isFinished: false,
      ...calcTimeParts(diff),
    };
  }

  // 3. Etapa Misa (1 hora y 30 min: 5:30 p. m. a 7:00 p. m.) hasta la Recepción: "PRÓXIMAMENTE RECEPCIÓN"
  if (now >= tMisa) {
    const diff = tRecepcion - now;
    return {
      stage: 'PROXIMAMENTE_RECEPCION',
      title: 'PRÓXIMAMENTE RECEPCIÓN',
      floatingLabel: 'PRÓX. RECEPCIÓN',
      subtitle: 'Misa de Acción de Gracias (5:30 p. m.) • Tiempo restante para la Recepción',
      iconType: 'glass',
      isFinished: false,
      ...calcTimeParts(diff),
    };
  }

  // 4. Etapa Pre-Evento: Antes de las 5:30 p. m. -> Cuenta regresiva hacia la misa
  const diff = tMisa - now;
  return {
    stage: 'PRE_EVENT',
    title: 'CUENTA REGRESIVA',
    floatingLabel: 'FALTAN',
    subtitle: 'Para el inicio de la gala (Misa 5:30 p. m.)',
    iconType: 'clock',
    isFinished: false,
    ...calcTimeParts(diff),
  };
}

/**
 * Hook para mantener sincronizado el estado dinámico del cronómetro y etapas
 */
export function useEventTimeline() {
  const [timeline, setTimeline] = useState(() => calculateTimelineState());

  useEffect(() => {
    const update = () => {
      setTimeline(calculateTimelineState());
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeline;
}

// Helper para renderizar el icono de la etapa correspondiente con desvanecimiento suave
function renderTimelineIcon(iconType, iconClass) {
  const animatedClass = `${iconClass} animate-icon-fadeIn transition-all duration-500`;
  switch (iconType) {
    case 'church':
      return <Church key="church" className={animatedClass} />;
    case 'glass':
      return <GlassWater key="glass" className={animatedClass} />;
    case 'sparkles':
      return <Sparkles key="sparkles" className={animatedClass} />;
    case 'moon':
      return <Moon key="moon" className={animatedClass} />;
    case 'clock':
    default:
      return <Clock key="clock" className={animatedClass} />;
  }
}

// 1. Componente del Contador dentro de la página (Dinámico por programa)
export default function Countdown() {
  const timeline = useEventTimeline();
  const { isLight } = useTheme();

  const iconClass = `w-5 h-5 shrink-0 filter ${
    isLight
      ? 'text-[#DDB967] drop-shadow-[0_2px_6px_rgba(221,185,103,0.4)]'
      : 'text-[#C9A34E] drop-shadow-[0_2px_6px_rgba(201,163,78,0.4)]'
  }`;

  return (
    <GlowingCard
      className="w-full my-4"
      innerClassName="p-5 sm:p-6 text-center"
    >
      {/* Título e Ícono dinámicos según el programa activo */}
      <div
        className={`inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.25em] font-bold mb-1.5 ${
          isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
        }`}
      >
        {renderTimelineIcon(timeline.iconType, iconClass)}
        <span>{timeline.title}</span>
      </div>

      {/* Subtítulo informativo */}
      <p
        className={`text-[11px] sm:text-xs tracking-wider mb-4 font-medium ${
          isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
        }`}
      >
        {timeline.subtitle}
      </p>

      {/* Si ya concluyó el evento, muestra mensaje de agradecimiento */}
      {timeline.isFinished ? (
        <div className="flex flex-col items-center py-4 px-3 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#C9A34E] mb-3 shadow-[0_0_25px_rgba(201,163,78,0.3)]">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-serif italic text-2xl sm:text-3xl font-normal leading-snug mb-2 text-gold-shine">
            ¡Gracias por Asistir!
          </h3>
          <p
            className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${
              isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
            }`}
          >
            Cinco décadas de trayectoria, visión y liderazgo compartidas con cada uno de ustedes. Ha sido un honor
            contar con su grata compañía en esta noche conmemorativa.
          </p>
        </div>
      ) : (
        /* Bloques numéricos de cuenta regresiva hacia el siguiente programa */
        <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto">
          {timeline.timeBlocks.map((block, idx) => (
            <div
              key={idx}
              className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center transition-colors duration-500 ${
                isLight
                  ? 'bg-[#242320] border border-[#706044] shadow-inner'
                  : 'bg-[#080808] border border-[#51432A] shadow-inner'
              }`}
            >
              <span
                className={`font-serif text-2xl sm:text-3xl font-bold ${
                  isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                }`}
              >
                {String(block.value).padStart(2, '0')}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-montserrat tracking-widest mt-0.5 ${
                  isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
                }`}
              >
                {block.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlowingCard>
  );
}

// 2. Componente del Contador FLOTANTE (Dinámico por programa)
export function FloatingCountdown({ isVisible = true, position = 'top', className = '' }) {
  const timeline = useEventTimeline();
  const { isLight } = useTheme();

  const blocks = [
    { label: 'DÍAS', value: timeline.days },
    { label: 'HRS', value: timeline.hours },
    { label: 'MIN', value: timeline.minutes },
    { label: 'SEG', value: timeline.seconds },
  ];

  const posClasses =
    position === 'bottom'
      ? `bottom-4 sm:bottom-6 ${
          isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
        }`
      : `top-3 sm:top-5 ${
          isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-8 pointer-events-none'
        }`;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out select-none ${posClasses} ${className}`}
    >
      <div
        className={`inline-flex items-center gap-2.5 sm:gap-4 px-4 py-2 sm:px-6 sm:py-3 rounded-full border-2 transition-all duration-500 backdrop-blur-md ${
          isLight
            ? 'bg-[#33312C]/95 border-[#706044] shadow-[0_12px_35px_rgba(0,0,0,0.7)]'
            : 'bg-[#151515]/95 border-[#51432A] shadow-[0_12px_35px_rgba(0,0,0,0.9)]'
        }`}
      >
        {/* Si concluyó el evento */}
        {timeline.isFinished ? (
          <div
            className={`flex items-center gap-2 px-2 py-0.5 ${
              isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
            }`}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[11px] sm:text-xs font-montserrat font-extrabold tracking-widest uppercase whitespace-nowrap">
              ¡GRACIAS POR ASISTIR!
            </span>
          </div>
        ) : (
          <>
            {/* Label con ícono dinámico de la etapa */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 border-r pr-2.5 sm:pr-4 ${
                isLight ? 'border-[#706044]' : 'border-[#51432A]'
              }`}
            >
              {renderTimelineIcon(
                timeline.iconType,
                `w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`
              )}
              <span
                className={`text-[10px] sm:text-xs font-montserrat font-extrabold tracking-widest uppercase whitespace-nowrap ${
                  isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
                }`}
              >
                {timeline.floatingLabel}
              </span>
            </div>

            {/* Números de cuenta regresiva */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {blocks.map((b, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center min-w-[22px] sm:min-w-[32px]">
                    <span
                      className={`font-serif font-bold text-base sm:text-2xl leading-none tracking-tight ${
                        isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                      }`}
                    >
                      {String(b.value || 0).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[7px] sm:text-[9px] font-montserrat font-bold uppercase tracking-wider mt-0.5 ${
                        isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
                      }`}
                    >
                      {b.label}
                    </span>
                  </div>

                  {idx < blocks.length - 1 && (
                    <span
                      className={`font-bold text-xs sm:text-base -mt-2.5 self-center ${
                        isLight ? 'text-[#DDB967]/70' : 'text-[#C9A34E]/70'
                      }`}
                    >
                      :
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
