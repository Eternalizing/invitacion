import React, { useState, useEffect } from 'react';
import { getEventData } from '../../data/eventData';
import { Clock, Church, GlassWater, Sparkles, Moon, Utensils } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import GlowingCard from '../common/GlowingCard';

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

function calculateTimelineState(isChristmas = false) {
  let now = Date.now();
  const activeData = getEventData(isChristmas);

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const simStage = params.get('stage') || params.get('etapa') || params.get('sim');
    if (simStage) {
      const lower = simStage.toLowerCase();
      if (lower === 'misa' || lower === 'proximamente' || lower === 'recepcion-previa') {
        now = new Date('2026-11-28T18:15:00').getTime();
      } else if (lower === 'recepcion' || lower === 'fiesta') {
        now = new Date('2026-11-28T19:30:00').getTime();
      } else if (lower === 'cena') {
        now = new Date('2026-11-28T21:30:00').getTime();
      } else if (lower === 'conclusion' || lower === 'fin' || lower === 'gracias') {
        now = new Date('2026-11-29T00:15:00').getTime();
      }
    }
  }

  const tMisa = new Date(activeData.scheduleTimestamps?.misa || '2026-11-28T17:30:00').getTime();
  const tRecepcion = new Date(activeData.scheduleTimestamps?.recepcion || '2026-11-28T19:00:00').getTime();
  const tCena = new Date(activeData.scheduleTimestamps?.cena || '2026-11-28T21:00:00').getTime();
  const tConclusion = new Date(activeData.scheduleTimestamps?.conclusion || '2026-11-29T00:00:00').getTime();

  // 1. Etapa de Conclusión (12:00 a. m.)
  if (now >= tConclusion) {
    return {
      stage: 'CONCLUSION',
      title: 'GRACIAS POR ASISTIR',
      floatingLabel: 'GRACIAS POR ASISTIR',
      subtitle: isChristmas
        ? '50.º Aniversario & Tradicional Cena Navideña'
        : 'Gala Conmemorativa 50.º Aniversario',
      iconType: 'sparkles',
      isFinished: true,
      timeBlocks: [],
    };
  }

  // 2. Etapa de Cena Navideña (9:00 p. m. a 12:00 a. m. para Empleados)
  if (isChristmas && now >= tCena) {
    const diff = tConclusion - now;
    return {
      stage: 'CENA_NAVIDENA',
      title: 'CENA NAVIDEÑA EN CURSO',
      floatingLabel: 'CENA NAVIDEÑA',
      subtitle: 'Tiempo restante para la Conclusión (12:00 a. m.)',
      iconType: 'cena',
      isFinished: false,
      ...calcTimeParts(diff),
    };
  }

  // 3. Etapa de Recepción (7:00 p. m.)
  if (now >= tRecepcion) {
    if (isChristmas) {
      const diff = tCena - now;
      return {
        stage: 'PROXIMAMENTE_CENA',
        title: 'PRÓXIMAMENTE CENA NAVIDEÑA',
        floatingLabel: 'PRÓX. CENA 9 PM',
        subtitle: 'Recepción en curso • Tiempo restante para la Cena Navideña (9:00 p. m.)',
        iconType: 'cena',
        isFinished: false,
        ...calcTimeParts(diff),
      };
    }
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

  // 4. Etapa Misa (5:30 p. m. a 7:00 p. m.)
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

  // 5. Etapa Pre-Evento (Antes de las 5:30 p. m.)
  const diff = tMisa - now;
  return {
    stage: 'PRE_EVENT',
    title: 'CUENTA REGRESIVA',
    floatingLabel: 'FALTAN',
    subtitle: isChristmas
      ? 'Primer evento (Misa 5:30 p. m.) • Cena Navideña 9:00 p. m.'
      : 'Primer evento (Misa 5:30 p. m.)',
    iconType: 'clock',
    isFinished: false,
    ...calcTimeParts(diff),
  };
}

export function useEventTimeline(isChristmas = false) {
  const [timeline, setTimeline] = useState(() => calculateTimelineState(isChristmas));

  useEffect(() => {
    const update = () => {
      setTimeline(calculateTimelineState(isChristmas));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isChristmas]);

  return timeline;
}

function renderTimelineIcon(iconType, iconClass) {
  const animatedClass = `${iconClass} animate-icon-fadeIn transition-all duration-500`;
  switch (iconType) {
    case 'church':
      return <Church key="church" className={animatedClass} />;
    case 'glass':
      return <GlassWater key="glass" className={animatedClass} />;
    case 'cena':
      return <Utensils key="cena" className={animatedClass} />;
    case 'sparkles':
      return <Sparkles key="sparkles" className={animatedClass} />;
    case 'moon':
      return <Moon key="moon" className={animatedClass} />;
    case 'clock':
    default:
      return <Clock key="clock" className={animatedClass} />;
  }
}

const candyStripeStyle = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #D42426 0px, #D42426 10px, #FFFFFF 10px, #FFFFFF 20px, #991B1B 20px, #991B1B 30px, #FFF1F2 30px, #FFF1F2 40px)',
  backgroundSize: '56.57px 56.57px',
};

// 1. Componente del Contador dentro de la página
export default function Countdown({ isChristmas = false }) {
  const timeline = useEventTimeline(isChristmas);
  const { isLight } = useTheme();

  const iconClass = `w-5 h-5 shrink-0 filter ${
    isChristmas
      ? 'text-[#FF4D4F] drop-shadow-[0_2px_8px_rgba(212,36,38,0.55)]'
      : isLight
      ? 'text-[#DDB967] drop-shadow-[0_2px_6px_rgba(221,185,103,0.4)]'
      : 'text-[#C9A34E] drop-shadow-[0_2px_6px_rgba(201,163,78,0.4)]'
  }`;

  return (
    <GlowingCard
      className="w-full my-4"
      isChristmas={isChristmas}
      variant={isChristmas ? 'candy' : 'default'}
      innerClassName={`p-5 sm:p-6 text-center ${
        isChristmas ? 'bg-gradient-to-b from-[#1F0A0C]/95 via-[#150809]/95 to-[#1A090B]/95' : ''
      }`}
    >
      {/* Título e Ícono dinámicos */}
      <div
        className={`inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.25em] font-bold mb-1.5 ${
          isChristmas ? 'text-[#FFE4E6]' : isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
        }`}
      >
        {renderTimelineIcon(timeline.iconType, iconClass)}
        <span>{timeline.title}</span>
      </div>

      {/* Subtítulo informativo */}
      <p
        className={`text-[11px] sm:text-xs tracking-wider mb-4 font-medium ${
          isChristmas ? 'text-[#FECDD3]/90' : isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
        }`}
      >
        {timeline.subtitle}
      </p>

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
        /* Bloques numéricos de cuenta regresiva (con estilo caramelo rojo y blanco si es Navidad) */
        <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto">
          {timeline.timeBlocks.map((block, idx) =>
            isChristmas ? (
              <div
                key={idx}
                className="relative p-[2.5px] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(212,36,38,0.3)] sm:animate-candy-stripe"
                style={candyStripeStyle}
              >
                <div className="bg-[#180709] rounded-[calc(1rem-2.5px)] p-2 sm:p-3 flex flex-col items-center justify-center h-full shadow-inner">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(255,77,79,0.65)]">
                    {String(block.value).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-montserrat font-bold tracking-widest mt-0.5 text-[#FDA4AF]">
                    {block.label}
                  </span>
                </div>
              </div>
            ) : (
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
            )
          )}
        </div>
      )}
    </GlowingCard>
  );
}

// 2. Componente del Contador FLOTANTE (Dinámico por programa)
export function FloatingCountdown({
  isChristmas = false,
  isVisible = true,
  position = 'top',
  className = '',
}) {
  const timeline = useEventTimeline(isChristmas);
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
        className={`rounded-full ${
          isChristmas
            ? 'p-[2.5px] shadow-[0_8px_24px_rgba(212,36,38,0.4)] sm:animate-candy-stripe'
            : ''
        }`}
        style={isChristmas ? candyStripeStyle : undefined}
      >
        <div
          className={`inline-flex items-center gap-2.5 sm:gap-4 px-4 py-2 sm:px-6 sm:py-3 rounded-full transition-all duration-500 ${
            isChristmas
              ? 'bg-[#180709] text-white'
              : isLight
              ? 'bg-[#33312C]/95 border-2 border-[#706044] shadow-[0_12px_35px_rgba(0,0,0,0.7)]'
              : 'bg-[#151515]/95 border-2 border-[#51432A] shadow-[0_12px_35px_rgba(0,0,0,0.9)]'
          }`}
        >
          {timeline.isFinished ? (
            <div
              className={`flex items-center gap-2 px-2 py-0.5 ${
                isChristmas ? 'text-[#FFE4E6]' : isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
              }`}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[11px] sm:text-xs font-montserrat font-extrabold tracking-widest uppercase whitespace-nowrap">
                ¡GRACIAS POR ASISTIR!
              </span>
            </div>
          ) : (
            <>
              <div
                className={`flex items-center gap-1.5 sm:gap-2 border-r pr-2.5 sm:pr-4 ${
                  isChristmas ? 'border-rose-500/40' : isLight ? 'border-[#706044]' : 'border-[#51432A]'
                }`}
              >
                {renderTimelineIcon(
                  timeline.iconType,
                  `w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${
                    isChristmas ? 'text-[#FF4D4F]' : isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
                  }`
                )}
                <span
                  className={`text-[10px] sm:text-xs font-montserrat font-extrabold tracking-widest uppercase whitespace-nowrap ${
                    isChristmas ? 'text-[#FFE4E6]' : isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
                  }`}
                >
                  {timeline.floatingLabel}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3">
                {blocks.map((b, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center min-w-[22px] sm:min-w-[32px]">
                      <span
                        className={`font-serif font-bold text-base sm:text-2xl leading-none tracking-tight ${
                          isChristmas ? 'text-white' : isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                        }`}
                      >
                        {String(b.value || 0).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[7px] sm:text-[9px] font-montserrat font-bold uppercase tracking-wider mt-0.5 ${
                          isChristmas ? 'text-[#FDA4AF]' : isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
                        }`}
                      >
                        {b.label}
                      </span>
                    </div>

                    {idx < blocks.length - 1 && (
                      <span
                        className={`font-bold text-xs sm:text-base -mt-2.5 self-center ${
                          isChristmas ? 'text-[#FF4D4F]' : isLight ? 'text-[#DDB967]/70' : 'text-[#C9A34E]/70'
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
    </div>
  );
}
