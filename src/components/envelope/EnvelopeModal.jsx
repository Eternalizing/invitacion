import React, { useState } from 'react';
import { eventData } from '../../data/eventData';
import { useTheme } from '../../context/ThemeContext';
import SmoothImage from '../common/SmoothImage';

export default function EnvelopeModal({ guestName, passes = 1, onOpen, onOpenStart, onOpenComplete }) {
  const { isLight } = useTheme();

  // Secuencia elegante de revelación de logos:
  // 'idle' -> 'blurring-envelope' -> 'showing-logo-nemer' -> 'showing-logo-50' -> 'transition-out'
  const [stage, setStage] = useState('idle');

  const handleOpen = () => {
    if (stage !== 'idle') return;

    // 1. Desenfocar el sobre suavemente (0ms)
    setStage('blurring-envelope');

    // 2. Mostrar primer logo: Atef Nemer Grupo de Empresas (400ms)
    setTimeout(() => {
      setStage('showing-logo-nemer');
    }, 400);

    // 3. Mostrar segundo logo: 50 Años (1200ms)
    setTimeout(() => {
      setStage('showing-logo-50');
      if (onOpenStart) {
        onOpenStart();
      }
    }, 1200);

    // 4. Iniciar fundido cinematográfico hacia la invitación (3200ms)
    setTimeout(() => {
      setStage('transition-out');
    }, 3200);

    // 5. Finalizar y desmontar el modal tras el fundido suave (4200ms)
    setTimeout(() => {
      if (onOpenComplete) {
        onOpenComplete();
      } else if (onOpen) {
        onOpen();
      }
    }, 4200);
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
    }, 600);
  };

  // Partículas ambientales de polvo dorado
  const particles = [
    { top: '15%', left: '20%', size: '5px', duration: '5s', delay: '0s' },
    { top: '25%', left: '75%', size: '6px', duration: '6s', delay: '1s' },
    { top: '70%', left: '15%', size: '4px', duration: '4.5s', delay: '0.5s' },
    { top: '80%', left: '80%', size: '6px', duration: '7s', delay: '2s' },
    { top: '45%', left: '10%', size: '4px', duration: '5.5s', delay: '1.5s' },
    { top: '35%', left: '88%', size: '5px', duration: '6.5s', delay: '0.8s' },
  ];

  const isEnvelopeVisible = stage === 'idle' || stage === 'blurring-envelope';
  const isLogosVisible = stage === 'showing-logo-nemer' || stage === 'showing-logo-50' || stage === 'transition-out';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 select-none overflow-hidden transition-all duration-1000 ease-out ${
        isLight ? 'bg-[#242320]' : 'bg-[#080808]'
      } ${
        stage === 'transition-out'
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100'
      }`}
    >
      {/* 1. Iluminación ambiental cálida */}
      <div
        className={`absolute w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isLight
            ? 'bg-gradient-to-tr from-[#DDB967]/25 via-[#706044]/18 to-transparent'
            : 'bg-gradient-to-tr from-[#C9A34E]/20 via-[#51432A]/15 to-transparent'
        }`}
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

      {/* 2. Capa de transición pura de desenfoque (blur) */}
      <div
        className={`fixed inset-0 z-30 pointer-events-none transition-all duration-700 ease-out ${
          stage === 'blurring-envelope'
            ? 'backdrop-blur-3xl bg-black/60 opacity-100'
            : 'backdrop-blur-none bg-transparent opacity-0'
        }`}
      />

      {/* 3. Escaparate del Sobre de Gala (Solo visible al inicio) */}
      {isEnvelopeVisible && (
        <div
          className={`relative flex flex-col items-center justify-center w-full max-w-xl transition-all duration-700 ease-out z-20 ${
            stage === 'blurring-envelope'
              ? 'scale-[1.05] opacity-0 blur-2xl pointer-events-none'
              : 'scale-100 opacity-100 blur-0'
          }`}
        >
          {/* Insignia superior flotante (sin fondo ni bordes) */}
          <div
            className={`mb-4 sm:mb-6 inline-flex items-center gap-2.5 px-2 py-1 text-xs sm:text-sm tracking-[0.22em] uppercase font-montserrat transition-colors duration-500 bg-transparent border-0 ${
              isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLight ? 'bg-[#DDB967] shadow-[0_0_8px_rgba(221,185,103,0.7)]' : 'bg-[#C9A34E] shadow-[0_0_8px_rgba(201,163,78,0.7)]'
              }`}
            />
            <span className="font-semibold">Invitación de Gala Exclusiva</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLight ? 'bg-[#DDB967] shadow-[0_0_8px_rgba(221,185,103,0.7)]' : 'bg-[#C9A34E] shadow-[0_0_8px_rgba(201,163,78,0.7)]'
              }`}
            />
          </div>

          {/* Sobre de Gala (sin fondo de tarjeta ni bordes externos) */}
          <div
            onClick={handleOpen}
            className="relative w-full aspect-[1024/524] max-w-[580px] cursor-pointer group transition-all duration-500 hover:scale-[1.025] bg-transparent border-0"
          >
            {/* Imagen de alta fidelidad del sobre con silueta natural y carga suave */}
            <SmoothImage
              src={eventData.logos.envelopeImage}
              alt="Sobre de Invitación 50 Años"
              loading="eager"
              className="w-full h-full object-contain filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)] transition-transform duration-700 group-hover:scale-[1.01]"
            />

            {/* Área del Sello Central con Anillo de Energía */}
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center pointer-events-none">
              <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full animate-pulse-gold pointer-events-none" />
              <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-lg group-hover:bg-amber-300/35 group-hover:scale-125 transition-all duration-500" />
              <div
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-100 blur-[0.5px] opacity-90 animate-ping"
                style={{ animationDuration: '3.5s' }}
              />
            </div>

            {/* NOMBRE DEL INVITADO */}
            <div className="absolute bottom-[10%] sm:bottom-[10.5%] inset-x-4 text-center pointer-events-none">
              <span
                className={`font-montserrat font-bold text-xs sm:text-base md:text-[17px] tracking-[0.28em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,1)] truncate block px-2 ${
                  isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                }`}
              >
                {guestName}
              </span>
            </div>

            {/* Reflejo de luz diagonal al interactuar */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>

          {/* Indicación inferior sutil */}
          <div className="mt-5 sm:mt-6 flex flex-col items-center w-full px-4">
            <span
              onClick={handleOpen}
              className={`text-xs sm:text-sm font-montserrat tracking-wider text-center cursor-pointer transition-colors duration-500 hover:text-amber-300 ${
                isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
              }`}
            >
              Presiona el sello central para acceder
            </span>
          </div>
        </div>
      )}

      {/* 4. REVELACIÓN CINEMÁTICA SECUENCIAL DE LOGOS */}
      {isLogosVisible && (
        <div
          onClick={handleSkip}
          className={`relative z-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-1000 ease-out px-4 py-8 max-w-lg w-full text-center ${
            stage === 'transition-out'
              ? 'opacity-0 scale-102 pointer-events-none'
              : 'opacity-100 scale-100'
          }`}
        >
          {/* 1. PRIMER LOGO: ATEF NEMER GRUPO DE EMPRESAS */}
          <div
            className={`relative flex items-center justify-center max-w-[85vw] sm:max-w-md w-full transition-all duration-700 ease-out ${
              stage === 'showing-logo-nemer' || stage === 'showing-logo-50' || stage === 'transition-out'
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
            <SmoothImage
              src={eventData.logos.mainCompanyLogo}
              alt="Atef Nemer Grupo de Empresas"
              loading="eager"
              className={`max-h-20 sm:max-h-24 md:max-h-28 w-auto max-w-full object-contain filter ${
                isLight
                  ? 'drop-shadow-[0_4px_24px_rgba(221,185,103,0.45)]'
                  : 'drop-shadow-[0_4px_24px_rgba(201,163,78,0.45)]'
              }`}
            />
          </div>

          {/* 2. SEGUNDO LOGO: 50 AÑOS */}
          <div
            className={`relative flex items-center justify-center mt-6 sm:mt-8 max-w-[70vw] sm:max-w-xs w-full transition-all duration-700 ease-out ${
              stage === 'showing-logo-50' || stage === 'transition-out'
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-6 pointer-events-none'
            }`}
          >
            <SmoothImage
              src={eventData.logos.logo50Anos}
              alt="50 Años de Trayectoria"
              loading="eager"
              className={`max-h-16 sm:max-h-20 md:max-h-24 w-auto max-w-full object-contain filter ${
                isLight
                  ? 'drop-shadow-[0_4px_20px_rgba(221,185,103,0.55)]'
                  : 'drop-shadow-[0_4px_20px_rgba(201,163,78,0.55)]'
              }`}
            />
          </div>

          {/* Indicador discreto para acceder o saltar */}
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
