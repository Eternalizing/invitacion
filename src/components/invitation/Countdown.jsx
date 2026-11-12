import React, { useState, useEffect } from 'react';
import { eventData } from '../../data/eventData';
import { Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Hook compartido para mantener el conteo sincronizado
export function useCountdown(targetIso) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
  });

  useEffect(() => {
    const targetDate = new Date(targetIso).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isFinished: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return timeLeft;
}

// 1. Componente del Contador dentro de la página
export default function Countdown() {
  const timeLeft = useCountdown(eventData.eventTimestamp);
  const { isLight } = useTheme();

  const timeBlocks = [
    { label: 'DÍAS', value: timeLeft.days },
    { label: 'HORAS', value: timeLeft.hours },
    { label: 'MINUTOS', value: timeLeft.minutes },
    { label: 'SEGUNDOS', value: timeLeft.seconds },
  ];

  return (
    <section
      className={`w-full rounded-3xl p-5 sm:p-6 text-center my-4 transition-all duration-500 z-10 backdrop-blur-md ${
        isLight
          ? 'bg-[#33312C] border border-[#706044] shadow-[0_15px_40px_rgba(0,0,0,0.6)]'
          : 'bg-[#151515] border border-[#51432A] shadow-[0_15px_40px_rgba(0,0,0,0.85)]'
      }`}
    >
      <div
        className={`inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold mb-3 ${
          isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
        }`}
      >
        <Clock
          className={`w-5 h-5 shrink-0 filter ${
            isLight
              ? 'text-[#DDB967] drop-shadow-[0_2px_6px_rgba(221,185,103,0.4)]'
              : 'text-[#C9A34E] drop-shadow-[0_2px_6px_rgba(201,163,78,0.4)]'
          }`}
        />
        <span>CUENTA REGRESIVA</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto">
        {timeBlocks.map((block, idx) => (
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
    </section>
  );
}

// 2. Componente del Contador FLOTANTE
export function FloatingCountdown({ isVisible }) {
  const timeLeft = useCountdown(eventData.eventTimestamp);
  const { isLight } = useTheme();

  const blocks = [
    { label: 'DÍAS', value: timeLeft.days },
    { label: 'HRS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEG', value: timeLeft.seconds },
  ];

  return (
    <div
      className={`fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-5.5rem)] sm:max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out pointer-events-none select-none ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-8 pointer-events-none'
      }`}
    >
      <div
        className={`inline-flex items-center gap-2.5 sm:gap-5 px-4 py-2 sm:px-7 sm:py-3 rounded-full border-2 transition-all duration-500 backdrop-blur-md ${
          isLight
            ? 'bg-[#33312C]/95 border-[#706044] shadow-[0_12px_35px_rgba(0,0,0,0.7)]'
            : 'bg-[#151515]/95 border-[#51432A] shadow-[0_12px_35px_rgba(0,0,0,0.9)]'
        }`}
      >
        {/* Label con ícono de reloj */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 border-r pr-2.5 sm:pr-4 ${
            isLight ? 'border-[#706044]' : 'border-[#51432A]'
          }`}
        >
          <Clock
            className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${
              isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
            }`}
          />
          <span
            className={`text-[11px] sm:text-sm font-montserrat font-extrabold tracking-widest uppercase whitespace-nowrap ${
              isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
            }`}
          >
            FALTAN
          </span>
        </div>

        {/* Números grandes y bien alineados */}
        <div className="flex items-center gap-1.5 sm:gap-3.5">
          {blocks.map((b, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center min-w-[24px] sm:min-w-[34px]">
                <span
                  className={`font-serif font-bold text-lg sm:text-2xl md:text-[26px] leading-none tracking-tight ${
                    isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                  }`}
                >
                  {String(b.value).padStart(2, '0')}
                </span>
                <span
                  className={`text-[8px] sm:text-[10px] font-montserrat font-bold uppercase tracking-wider mt-1 ${
                    isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
                  }`}
                >
                  {b.label}
                </span>
              </div>

              {idx < blocks.length - 1 && (
                <span
                  className={`font-bold text-sm sm:text-lg -mt-3.5 self-center ${
                    isLight ? 'text-[#DDB967]/70' : 'text-[#C9A34E]/70'
                  }`}
                >
                  :
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
