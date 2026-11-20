import React, { useState } from 'react';
import { getEventData } from '../../data/eventData';
import { useTheme } from '../../context/ThemeContext';
import SmoothImage from '../common/SmoothImage';
import SnowFall from '../common/SnowFall';

export default function EnvelopeModal({
  guestName,
  passes = 1,
  isChristmas = false,
  onPress,
  onOpen,
  onOpenStart,
  onOpenComplete,
}) {
  const { isLight } = useTheme();
  const currentEvent = getEventData(isChristmas);

  // Secuencia ágil y fluida de revelación:
  // 'idle' -> 'blurring-envelope' -> 'showing-logo-nemer' -> 'showing-logo-50' -> 'transition-out'
  const [stage, setStage] = useState('idle');

  const handleOpen = () => {
    if (stage !== 'idle') return;

    // Disparar audio de forma síncrona dentro del gesto del usuario (compatible con iOS y Android)
    if (onPress) {
      onPress();
    }

    setStage('blurring-envelope');

    setTimeout(() => {
      setStage('showing-logo-nemer');
    }, 280);

    setTimeout(() => {
      setStage('showing-logo-50');
      if (onOpenStart) {
        onOpenStart();
      }
    }, 850);

    setTimeout(() => {
      setStage('transition-out');
    }, 2200);

    setTimeout(() => {
      if (onOpenComplete) {
        onOpenComplete();
      } else if (onOpen) {
        onOpen();
      }
    }, 2800);
  };

  const handleSkip = () => {
    if (onOpenStart) onOpenStart();
    setStage('transition-out');
    setTimeout(() => {
      if (onOpenComplete) {
        onOpenComplete();
      } else if (onOpen) {
        onOpen();
      }
    }, 450);
  };

  const particles = [
    { top: '15%', left: '20%', size: '5px', duration: '5s', delay: '0s' },
    { top: '25%', left: '75%', size: '6px', duration: '6s', delay: '1s' },
    { top: '70%', left: '15%', size: '4px', duration: '4.5s', delay: '0.5s' },
    { top: '80%', left: '80%', size: '6px', duration: '7s', delay: '2s' },
  ];

  const isEnvelopeVisible = stage === 'idle' || stage === 'blurring-envelope';
  const isLogosVisible = stage === 'showing-logo-nemer' || stage === 'showing-logo-50' || stage === 'transition-out';

  return (
    <div
      className={`fixed inset-0 h-[100dvh] w-screen z-50 flex flex-col items-center justify-center px-4 py-6 select-none overflow-hidden transition-opacity duration-700 ease-out ${
        isLight ? 'bg-[#242320]' : 'bg-[#080808]'
      } ${
        stage === 'transition-out'
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100'
      }`}
    >
      {/* Nieve cayendo suavemente en la invitación navideña */}
      {isChristmas && <SnowFall intensity="medium" />}

      {/* 1. Iluminación ambiental ligera (radial-gradient puro, cero blur GPU en móviles) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isChristmas
            ? 'radial-gradient(circle at 50% 48%, rgba(212, 36, 38, 0.14) 0%, rgba(201, 163, 78, 0.12) 32%, transparent 70%)'
            : isLight
            ? 'radial-gradient(circle at 50% 48%, rgba(221, 185, 103, 0.22) 0%, rgba(112, 96, 68, 0.14) 38%, transparent 72%)'
            : 'radial-gradient(circle at 50% 48%, rgba(201, 163, 78, 0.18) 0%, rgba(81, 67, 42, 0.12) 38%, transparent 72%)',
        }}
      />

      {/* Partículas flotantes */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          className="particle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* 2. Escaparate del Sobre (centrado perfecto en móviles) */}
      {isEnvelopeVisible && (
        <div
          className={`relative flex flex-col items-center justify-center w-full max-w-xl mx-auto transition-all duration-500 ease-out z-20 ${
            stage === 'blurring-envelope'
              ? 'scale-[1.04] opacity-0 pointer-events-none'
              : 'scale-100 opacity-100'
          }`}
        >
          {/* Insignia superior centrada correctamente en una o dos líneas */}
          <div
            className={`mb-4 sm:mb-6 flex items-center justify-center text-center w-full max-w-[92vw] px-2 transition-colors duration-500 ${
              isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
            }`}
          >
            <div className="inline-flex items-center justify-center gap-2 sm:gap-2.5 text-center">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isChristmas
                    ? 'bg-[#FF4D4F] shadow-[0_0_8px_rgba(255,77,79,0.8)]'
                    : isLight
                    ? 'bg-[#DDB967] shadow-[0_0_8px_rgba(221,185,103,0.7)]'
                    : 'bg-[#C9A34E] shadow-[0_0_8px_rgba(201,163,78,0.7)]'
                }`}
              />
              <span className="font-semibold font-montserrat uppercase text-[11px] sm:text-sm tracking-[0.14em] sm:tracking-[0.22em] leading-snug text-center">
                {isChristmas ? '50 Años & Cena Navideña' : 'Invitación de Gala Exclusiva'}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isChristmas
                    ? 'bg-[#FF4D4F] shadow-[0_0_8px_rgba(255,77,79,0.8)]'
                    : isLight
                    ? 'bg-[#DDB967] shadow-[0_0_8px_rgba(221,185,103,0.7)]'
                    : 'bg-[#C9A34E] shadow-[0_0_8px_rgba(201,163,78,0.7)]'
                }`}
              />
            </div>
          </div>

          {/* Sobre (Gala o Carta de Invitación Navideña) */}
          <div
            onClick={handleOpen}
            className="relative w-full aspect-[1024/524] max-w-[580px] mx-auto cursor-pointer group transition-transform duration-300 active:scale-[0.98] sm:hover:scale-[1.02] bg-transparent border-0"
          >
            <SmoothImage
              src={currentEvent.logos.envelopeImage}
              alt={isChristmas ? 'Carta de Invitación Navideña 50 Años' : 'Sobre de Invitación 50 Años'}
              loading="eager"
              className="w-full h-full object-contain filter drop-shadow-[0_14px_30px_rgba(0,0,0,0.85)]"
            />

            {/* Área del Sello Central con Anillo de Energía */}
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center pointer-events-none">
              <div className="absolute w-14 h-14 sm:w-20 sm:h-20 rounded-full animate-pulse-gold pointer-events-none" />
              <div className="hidden sm:block absolute inset-0 rounded-full bg-amber-400/15 blur-md group-hover:bg-amber-300/30 transition-all duration-500" />
            </div>

            {/* NOMBRE DEL INVITADO */}
            <div className="absolute bottom-[9.5%] sm:bottom-[10.5%] inset-x-4 text-center pointer-events-none">
              <span
                className={`font-montserrat font-bold text-[10px] sm:text-base md:text-[17px] tracking-[0.16em] sm:tracking-[0.26em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,1)] truncate block px-2 ${
                  isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                }`}
              >
                {guestName}
              </span>
            </div>
          </div>

          {/* Indicación inferior */}
          <div className="mt-5 sm:mt-6 flex flex-col items-center w-full px-4">
            <span
              onClick={handleOpen}
              className={`text-xs sm:text-sm font-montserrat tracking-wider text-center cursor-pointer transition-colors duration-300 hover:text-amber-300 ${
                isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
              }`}
            >
              Presiona el sello central para acceder
            </span>
          </div>
        </div>
      )}

      {/* 3. REVELACIÓN SECUENCIAL DE LOGOS */}
      {isLogosVisible && (
        <div
          onClick={handleSkip}
          className={`relative z-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-700 ease-out px-4 py-8 max-w-lg w-full text-center ${
            stage === 'transition-out'
              ? 'opacity-0 scale-102 pointer-events-none'
              : 'opacity-100 scale-100'
          }`}
        >
          <div
            className={`relative flex items-center justify-center max-w-[82vw] sm:max-w-md w-full transition-all duration-500 ease-out ${
              stage === 'showing-logo-nemer' || stage === 'showing-logo-50' || stage === 'transition-out'
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-3'
            }`}
          >
            <SmoothImage
              src={currentEvent.logos.mainCompanyLogo}
              alt="Atef Nemer Grupo de Empresas"
              loading="eager"
              className={`max-h-20 sm:max-h-24 w-auto max-w-full object-contain filter ${
                isLight
                  ? 'drop-shadow-[0_4px_20px_rgba(221,185,103,0.45)]'
                  : 'drop-shadow-[0_4px_20px_rgba(201,163,78,0.45)]'
              }`}
            />
          </div>

          <div
            className={`relative flex items-center justify-center mt-6 sm:mt-7 max-w-[68vw] sm:max-w-xs w-full transition-all duration-500 ease-out ${
              stage === 'showing-logo-50' || stage === 'transition-out'
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
            }`}
          >
            <SmoothImage
              src={currentEvent.logos.logo50Anos}
              alt="50 Años de Trayectoria"
              loading="eager"
              className={`max-h-16 sm:max-h-20 w-auto max-w-full object-contain filter ${
                isLight
                  ? 'drop-shadow-[0_4px_18px_rgba(221,185,103,0.55)]'
                  : 'drop-shadow-[0_4px_18px_rgba(201,163,78,0.55)]'
              }`}
            />
          </div>

          <span
            className={`text-[10px] sm:text-xs font-montserrat tracking-widest uppercase mt-8 opacity-70 transition-colors duration-300 ${
              isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
            }`}
          >
            Toca en la pantalla para acceder directamente
          </span>
        </div>
      )}
    </div>
  );
}
