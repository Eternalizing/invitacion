import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import EnvelopeModal from './components/envelope/EnvelopeModal';
import Countdown, { FloatingCountdown } from './components/invitation/Countdown';
import BackgroundCarousel from './components/invitation/BackgroundCarousel';
import BookSection from './components/invitation/BookSection';
import PhotoGallery from './components/invitation/PhotoGallery';
import ConfirmationDialog from './components/invitation/ConfirmationDialog';
import CascadeTimeline from './components/invitation/CascadeTimeline';
import GlowingCard from './components/common/GlowingCard';
import SmoothImage from './components/common/SmoothImage';
import SnowFall from './components/common/SnowFall';
import FallbackHome from './components/common/FallbackHome';
import PublicHome from './components/home/PublicHome';
import AdminDashboard from './components/admin/AdminDashboard';
import confetti from 'canvas-confetti';
import {
  getGuestStatus,
  confirmGuest,
  declineGuest,
  GUEST_STATUS,
} from './services/guestStatusService';
import { useGuest } from './hooks/useGuest';
import { useScrollReveal } from './hooks/useScrollReveal';
import { getEventData } from './data/eventData';
import { MapPin, Mail, CheckCircle2, XCircle, Ticket, Loader2, Sparkles } from 'lucide-react';

function InvitationContent({
  guest,
  guestName = 'Invitado Especial',
  passes = 1,
  isChristmas = false,
}) {
  const { isLight } = useTheme();
  const currentEvent = getEventData(isChristmas);
  const [isOpen, setIsOpen] = useState(false);
  const [isEnvelopeMounted, setIsEnvelopeMounted] = useState(true);
  const [showStickyCountdown, setShowStickyCountdown] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const inPageCountdownRef = useRef(null);

  const [attendanceStatus, setAttendanceStatus] = useState(() =>
    guest?.id ? getGuestStatus(guest.id) : GUEST_STATUS.PENDING
  );

  useEffect(() => {
    if (guest?.id) {
      setAttendanceStatus(getGuestStatus(guest.id));
    }
  }, [guest]);

  const handleConfirm = async () => {
    if (!guest?.id || isConfirming) return;
    setIsConfirming(true);

    // Dispara guardado local instantáneo + sincronización en segundo plano sin bloquear más de 650 ms
    const syncPromise = confirmGuest(guest.id);
    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 600)),
      Promise.race([syncPromise, new Promise((resolve) => setTimeout(resolve, 750))]),
    ]);

    setIsConfirming(false);
    setAttendanceStatus(GUEST_STATUS.CONFIRMED);
    setIsConfirmDialogOpen(true);
    try {
      confetti({
        particleCount: 95,
        spread: 78,
        origin: { y: 0.65 },
        colors: isChristmas
          ? ['#D42426', '#FFFFFF', '#DDB967', '#16A34A', '#FFF0CD']
          : ['#DDB967', '#C9A34E', '#FFF0CD', '#F0DDA7', '#FFFFFF'],
      });
    } catch {
      // Ignorar si falla confetti
    }
  };

  const handleDecline = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!guest?.id || isDeclining) return;
    setIsDeclining(true);

    const syncPromise = declineGuest(guest.id);
    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 450)),
      Promise.race([syncPromise, new Promise((resolve) => setTimeout(resolve, 600))]),
    ]);

    setIsDeclining(false);
    setAttendanceStatus(GUEST_STATUS.DECLINED);
  };

  useScrollReveal(isOpen && !isEnvelopeMounted);

  useEffect(() => {
    if (isEnvelopeMounted) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const preventScroll = (e) => {
        e.preventDefault();
      };

      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.touchAction = '';
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      window.scrollTo(0, 0);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isEnvelopeMounted]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (!inPageCountdownRef.current) return;
      const rect = inPageCountdownRef.current.getBoundingClientRect();

      if (rect.bottom < 20) {
        setShowStickyCountdown(true);
      } else {
        setShowStickyCountdown(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  return (
    <div
      className={`flex flex-col items-center font-montserrat relative transition-colors duration-700 ${
        isLight
          ? 'bg-[#242320] text-[#FAF6ED] selection:bg-[#DDB967] selection:text-[#211A0E]'
          : 'bg-[#080808] text-[#F5F2EA] selection:bg-[#C9A34E] selection:text-[#17120A]'
      } ${isEnvelopeMounted ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'}`}
    >
      {/* Nieve cayendo suavemente en modo Navidad */}
      {isChristmas && <SnowFall intensity="medium" />}

      {/* 0. CARRUSEL INFINITO DE FOTOS EN EL FONDO (Navideñas o Históricas) */}
      <BackgroundCarousel isChristmas={isChristmas} />

      {/* 1. Modal Carta con Sello Central */}
      {isEnvelopeMounted && (
        <EnvelopeModal
          guestName={guestName}
          passes={passes}
          isChristmas={isChristmas}
          onOpenStart={() => setIsOpen(true)}
          onOpenComplete={() => setIsEnvelopeMounted(false)}
          onOpen={() => {
            setIsOpen(true);
            setIsEnvelopeMounted(false);
          }}
        />
      )}

      {/* 2. CONTADOR FLOTANTE CENTRADO SUPERIOR */}
      <FloatingCountdown
        isChristmas={isChristmas}
        isVisible={isOpen && !isEnvelopeMounted && showStickyCountdown}
      />

      {/* Diálogo de Confirmación de Asistencia */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        guestName={guestName}
        passes={passes}
        isChristmas={isChristmas}
      />

      {/* 3. Landing Page de Invitación */}
      <main
        className={`w-full flex flex-col items-center text-center transition-all duration-1000 relative z-10 pt-12 pb-24 sm:pb-28 overflow-x-hidden ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Iluminación Ambiental */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[450px] rounded-full blur-[70px] sm:blur-[150px] pointer-events-none transition-all duration-700 ${
            isChristmas
              ? 'bg-[#D42426]/15'
              : isLight
              ? 'bg-[#DDB967]/15'
              : 'bg-[#C9A34E]/10'
          }`}
        />
        <div
          className={`absolute top-1/4 right-0 w-80 h-80 rounded-full blur-[60px] sm:blur-[130px] pointer-events-none transition-all duration-700 ${
            isChristmas
              ? 'bg-[#C9A34E]/12'
              : isLight
              ? 'bg-[#DDB967]/10'
              : 'bg-[#C9A34E]/8'
          }`}
        />
        <div
          className={`absolute top-1/2 -left-20 w-96 h-96 rounded-full blur-[65px] sm:blur-[140px] pointer-events-none transition-all duration-700 ${
            isChristmas
              ? 'bg-emerald-900/20'
              : isLight
              ? 'bg-[#706044]/25'
              : 'bg-[#51432A]/20'
          }`}
        />

        {/* Contenedor Principal Centrado */}
        <div className="w-full max-w-lg px-5 flex flex-col items-center text-center z-10">
          {/* Header: Logos Oficiales */}
          <header className="reveal-soft flex flex-col items-center mb-6 z-10 w-full">
            <div className="relative flex items-center justify-center my-2 max-w-[85vw]">
              <SmoothImage
                src={currentEvent.logos.mainCompanyLogo}
                alt="Atef Nemer Grupo de Empresas"
                loading="eager"
                className="max-h-20 sm:max-h-24 w-auto max-w-full object-contain logo-glow"
              />
            </div>

            <div className="relative my-3 flex items-center justify-center max-w-[70vw]">
              <SmoothImage
                src={currentEvent.logos.logo50Anos}
                alt="50 Años de Trayectoria"
                loading="eager"
                className="max-h-16 sm:max-h-20 w-auto max-w-full object-contain logo-glow"
                style={{ animationDelay: '2s' }}
              />
            </div>
          </header>

          {/* Card 1: INVITACIÓN PERSONAL */}
          <GlowingCard
            isChristmas={isChristmas}
            className="reveal my-6"
            innerClassName="p-7 sm:p-10 text-center"
          >
            <span
              className={`text-xs sm:text-sm tracking-[0.28em] font-bold uppercase block mb-4 ${
                isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
              }`}
            >
              {currentEvent.invitationText.header}
            </span>

            {/* NOMBRE DEL INVITADO */}
            <div className="relative inline-block max-w-full px-3">
              <span className="twinkle" style={{ top: '8%', left: '2%', animationDelay: '0s' }} />
              <span className="twinkle" style={{ top: '18%', right: '4%', animationDelay: '0.9s' }} />
              <span className="twinkle" style={{ bottom: '12%', left: '12%', animationDelay: '1.7s' }} />
              <span className="twinkle" style={{ bottom: '4%', right: '14%', animationDelay: '2.3s' }} />
              <h2 className="font-guest text-3xl sm:text-4xl md:text-5xl font-semibold tracking-wide leading-tight my-4 break-words py-1 px-1 text-gold-shine gold-glow-pulse">
                {guestName}
              </h2>
            </div>

            {/* Badge de Pases */}
            <div className="flex items-center justify-center my-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm transition-all ${
                  isLight
                    ? 'bg-[#242320]/80 border-[#DDB967]/50 text-[#FFF0CD]'
                    : 'bg-[#080808]/80 border-[#C9A34E]/50 text-[#F0DDA7]'
                }`}
              >
                <Ticket className={`w-3.5 h-3.5 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
                <span className="text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase font-montserrat">
                  {Number(passes) === 1 ? '1 PASE' : `${passes} PASES`}
                </span>
              </div>
            </div>

            {/* Línea divisoria dorada */}
            <div
              className={`gold-line-shimmer w-24 h-[1px] bg-gradient-to-r from-transparent to-transparent mx-auto my-5 ${
                isLight ? 'via-[#DDB967]' : 'via-[#C9A34E]'
              }`}
            />

            {/* Lema especial si es Navidad */}
            {currentEvent.invitationText.tagline && (
              <p
                className={`font-serif italic text-base sm:text-lg font-medium leading-snug mb-3 ${
                  isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                }`}
              >
                {currentEvent.invitationText.tagline}
              </p>
            )}

            {/* Texto principal */}
            <p
              className={`text-sm sm:text-base leading-relaxed mb-3 ${
                isLight ? 'text-[#FAF6ED] font-normal' : 'text-[#F5F2EA] font-normal'
              }`}
            >
              {currentEvent.invitationText.honorText}
            </p>

            {/* Texto secundario */}
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isLight ? 'text-[#C9C2B4] font-normal' : 'text-[#B8B3A8] font-normal'
              }`}
            >
              {currentEvent.invitationText.subText}
            </p>
          </GlowingCard>

          {/* Bloque de Fecha */}
          <section className="reveal my-8 text-center z-10 w-full flex flex-col items-center">
            <span
              className={`text-xs sm:text-sm tracking-[0.38em] uppercase font-bold block mb-2 ${
                isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
              }`}
            >
              {currentEvent.date.dayOfWeek}
            </span>

            <span className="font-serif text-6xl sm:text-7xl font-normal block my-2 leading-none px-2 text-gold-shine gold-glow-pulse">
              {currentEvent.date.dayNumber}
            </span>

            <span
              className={`text-xs sm:text-sm tracking-[0.24em] sm:tracking-[0.3em] [word-spacing:0.35em] uppercase font-medium block mt-3.5 sm:mt-4 mb-7 sm:mb-8 ${
                isLight ? 'text-[#FAF6ED]' : 'text-[#F5F2EA]'
              }`}
            >
              {currentEvent.date.monthYear}
            </span>

            <button
              type="button"
              disabled={isConfirming}
              onClick={() => {
                if (attendanceStatus === GUEST_STATUS.CONFIRMED) {
                  setIsConfirmDialogOpen(true);
                } else {
                  handleConfirm();
                }
              }}
              className={`btn-gold-shimmer btn-glow-pulse inline-flex items-center justify-center gap-2.5 w-auto min-w-[240px] sm:min-w-[280px] max-w-[90vw] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-montserrat font-extrabold text-[11px] sm:text-xs md:text-sm tracking-[0.16em] sm:tracking-[0.18em] uppercase active:scale-95 transition-all cursor-pointer whitespace-nowrap select-none ${
                isConfirming
                  ? 'bg-gradient-to-r from-[#DDB967] via-[#FFF0CD] to-[#C9A34E] text-[#17120A] shadow-[0_0_35px_rgba(221,185,103,0.75)] border border-white/60 scale-[0.99]'
                  : attendanceStatus === GUEST_STATUS.CONFIRMED
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_6px_25px_rgba(16,185,129,0.4)] border border-emerald-400/50'
                  : isLight
                  ? 'bg-[#DDB967] hover:bg-[#e8c77b] text-[#211A0E] shadow-[0_6px_25px_rgba(221,185,103,0.4)] hover:shadow-[0_8px_35px_rgba(221,185,103,0.6)] border border-[#FFF0CD]/40'
                  : 'bg-[#C9A34E] hover:bg-[#d8b560] text-[#17120A] shadow-[0_6px_25px_rgba(201,163,78,0.4)] hover:shadow-[0_8px_35px_rgba(201,163,78,0.6)] border border-[#F0DDA7]/40'
              }`}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#17120A]" />
                  <span>PROCESANDO CONFIRMACIÓN...</span>
                  <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0 text-[#17120A]" />
                </>
              ) : (
                <span>
                  {attendanceStatus === GUEST_STATUS.CONFIRMED
                    ? '✓ ASISTENCIA CONFIRMADA'
                    : Number(passes) === 1
                    ? 'CONFIRMAR ASISTENCIA'
                    : `CONFIRMAR ASISTENCIA (${passes} PASES)`}
                </span>
              )}
            </button>
          </section>

          {/* CONTEO REGRESIVO (Estilo Caramelo Rojo y Blanco si es Navidad) */}
          <div ref={inPageCountdownRef} className="reveal w-full">
            <Countdown isChristmas={isChristmas} />
          </div>

          {/* Título del Programa */}
          <h2 className="reveal-soft font-serif italic text-2xl sm:text-3xl font-normal mt-12 mb-6 z-10 px-2 text-gold-shine">
            {currentEvent.itineraryTitle}
          </h2>

          {/* Card: Programa del Evento en Cascada */}
          <GlowingCard
            isChristmas={isChristmas}
            className="reveal my-6"
            innerClassName="p-5 sm:p-8 text-center"
          >
            <span
              className={`text-xs sm:text-sm tracking-[0.3em] font-bold uppercase block mb-6 ${
                isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
              }`}
            >
              {currentEvent.itineraryHeader}
            </span>

            <CascadeTimeline
              itinerary={currentEvent.itinerary}
              isChristmas={isChristmas}
            />
          </GlowingCard>

          {/* Card: Lugar */}
          <GlowingCard
            isChristmas={isChristmas}
            className="reveal my-6"
            innerClassName="p-7 sm:p-10 text-center"
          >
            <MapPin
              className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto mb-3 filter ${
                isLight
                  ? 'text-[#DDB967] drop-shadow-[0_2px_8px_rgba(221,185,103,0.45)]'
                  : 'text-[#C9A34E] drop-shadow-[0_2px_8px_rgba(201,163,78,0.45)]'
              }`}
            />

            <span
              className={`text-xs sm:text-sm tracking-[0.35em] font-bold uppercase block mb-3 ${
                isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
              }`}
            >
              {currentEvent.location.header}
            </span>

            <h3
              className={`font-serif italic text-xl sm:text-2xl font-normal mb-2 ${
                isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
              }`}
            >
              {currentEvent.location.venue}
            </h3>

            <p
              className={`text-xs sm:text-sm mb-6 font-light ${
                isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
              }`}
            >
              {currentEvent.location.city}
            </p>

            <a
              href={currentEvent.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 w-auto min-w-[200px] sm:min-w-[240px] max-w-[85vw] px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border text-[11px] sm:text-xs md:text-sm tracking-[0.18em] uppercase font-montserrat font-bold transition-all active:scale-95 cursor-pointer my-1 whitespace-nowrap select-none ${
                isLight
                  ? 'border-[#706044] hover:border-[#DDB967] bg-[#33312C] hover:bg-[#403C34] text-[#FFF0CD] hover:text-[#FAF6ED] shadow-[0_4px_15px_rgba(0,0,0,0.6)]'
                  : 'border-[#51432A] hover:border-[#C9A34E] bg-[#151515] hover:bg-[#202020] text-[#F0DDA7] hover:text-[#F5F2EA] shadow-[0_4px_15px_rgba(0,0,0,0.7)]'
              }`}
            >
              <span>CÓMO LLEGAR</span>
              <span className="text-xs shrink-0">↗</span>
            </a>
          </GlowingCard>

          {/* Card: Código de Vestimenta */}
          <GlowingCard
            isChristmas={isChristmas}
            className="reveal my-6"
            innerClassName="p-7 sm:p-10 text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className={`w-9 h-9 sm:w-10 sm:h-10 filter mb-3 ${
                  isLight
                    ? 'text-[#DDB967] drop-shadow-[0_2px_8px_rgba(221,185,103,0.45)]'
                    : 'text-[#C9A34E] drop-shadow-[0_2px_8px_rgba(201,163,78,0.45)]'
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.5 7.5l8 4.2-8 4.2c-.6.3-1-.1-1-.7V8.2c0-.6.4-1 1-.7z" />
                <path d="M21.5 7.5l-8 4.2 8 4.2c.6.3 1-.1 1-.7V8.2c0-.6-.4-1-1-.7z" />
                <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" />
              </svg>

              <span
                className={`text-xs sm:text-sm tracking-[0.35em] font-bold uppercase block mb-2.5 ${
                  isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
                }`}
              >
                {currentEvent.dressCode.header}
              </span>

              <p
                className={`font-serif italic text-2xl sm:text-3xl my-1 ${
                  isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                }`}
              >
                {currentEvent.dressCode.style}
              </p>
            </div>
          </GlowingCard>

          {/* 4. Agradecimiento */}
          <section className="reveal-soft mt-10 mb-4 w-full flex flex-col items-center text-center z-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-snug mb-2 px-2 text-gold-shine">
              {currentEvent.rsvp.title}
            </h2>

            <a
              href={currentEvent.rsvp.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs sm:text-sm font-montserrat tracking-wider block mb-2 font-medium transition-colors cursor-pointer ${
                isLight
                  ? 'text-[#DDB967] hover:text-[#FFF0CD]'
                  : 'text-[#C9A34E] hover:text-[#F0DDA7]'
              }`}
            >
              {currentEvent.rsvp.subtitle}
            </a>
          </section>

          {/* 5. SECCIÓN DEL LIBRO CONMEMORATIVO */}
          <BookSection />

          {/* 6. Confirmación de Asistencia */}
          <section className="reveal mt-8 mb-6 w-full flex flex-col items-center text-center z-10 px-4">
            {attendanceStatus === GUEST_STATUS.CONFIRMED && (
              <GlowingCard
                as="div"
                isChristmas={isChristmas}
                className="max-w-md animate-fadeIn"
                innerClassName={`p-6 sm:p-8 flex flex-col items-center text-center ${
                  isLight ? 'bg-emerald-950/30' : 'bg-emerald-950/40'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm tracking-[0.22em] uppercase font-bold text-emerald-400 block mb-2">
                  ✓ ASISTENCIA CONFIRMADA
                </span>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed text-[#FAF6ED] text-center mb-1">
                  ¡Muchas gracias, <strong className="text-gold-shine font-guest font-semibold text-base">{guestName}</strong>!
                </p>
                <p className="text-xs opacity-75 text-center">
                  Su asistencia ({Number(passes) === 1 ? '1 PASE' : `${passes} PASES`}) ha sido registrada en la lista oficial
                  {isChristmas ? ' de los 50 años y Cena Navideña.' : ' de la gala.'}
                </p>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="text-[11px] underline opacity-50 hover:opacity-100 transition-opacity mt-4 cursor-pointer text-[#C9C2B4]"
                >
                  Cambiar respuesta si no podré asistir
                </button>
              </GlowingCard>
            )}

            {attendanceStatus === GUEST_STATUS.DECLINED && (
              <GlowingCard
                as="div"
                isChristmas={isChristmas}
                className="max-w-md animate-fadeIn"
                innerClassName={`p-6 sm:p-8 flex flex-col items-center text-center ${
                  isLight ? 'bg-rose-950/30' : 'bg-rose-950/40'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-3">
                  <XCircle className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm tracking-[0.22em] uppercase font-bold text-rose-400 block mb-2">
                  RESPUESTA REGISTRADA
                </span>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed text-[#FAF6ED] text-center mb-3">
                  Hemos registrado que no podrá asistir. Lamentamos no contar con su grata presencia en esta conmemoración.
                </p>
                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={handleConfirm}
                  className="btn-gold-shimmer inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#17120A] bg-[#C9A34E] active:scale-95 transition-all cursor-pointer shadow-lg"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#17120A]" />
                      <span>Procesando Confirmación...</span>
                    </>
                  ) : (
                    <span>Deseo cambiar y Confirmar Asistencia</span>
                  )}
                </button>
              </GlowingCard>
            )}

            {attendanceStatus === GUEST_STATUS.PENDING && (
              <>
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 border ${
                    isLight
                      ? 'bg-[#242320]/60 border-[#706044]/60 text-[#DDB967]'
                      : 'bg-[#080808]/60 border-[#51432A]/60 text-[#C9A34E]'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span className="font-bold tracking-wider">
                    {Number(passes) === 1 ? '1 PASE' : `${passes} PASES`}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={handleConfirm}
                  className={`btn-gold-shimmer btn-glow-pulse inline-flex items-center justify-center gap-2.5 w-auto min-w-[250px] sm:min-w-[300px] max-w-[90vw] px-6 sm:px-9 py-3.5 sm:py-4 rounded-full font-montserrat font-extrabold text-[11px] sm:text-xs md:text-sm tracking-[0.16em] sm:tracking-[0.18em] uppercase active:scale-95 transition-all cursor-pointer whitespace-nowrap select-none ${
                    isConfirming
                      ? 'bg-gradient-to-r from-[#DDB967] via-[#FFF0CD] to-[#C9A34E] text-[#17120A] shadow-[0_0_40px_rgba(221,185,103,0.8)] border border-white/60 scale-[0.99]'
                      : isLight
                      ? 'bg-[#DDB967] hover:bg-[#e8c77b] text-[#211A0E] shadow-[0_6px_30px_rgba(221,185,103,0.45)] hover:shadow-[0_8px_40px_rgba(221,185,103,0.7)] border border-[#FFF0CD]/40'
                      : 'bg-[#C9A34E] hover:bg-[#d8b560] text-[#17120A] shadow-[0_6px_30px_rgba(201,163,78,0.45)] hover:shadow-[0_8px_40px_rgba(201,163,78,0.7)] border border-[#F0DDA7]/40'
                  }`}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#17120A]" />
                      <span>PROCESANDO CONFIRMACIÓN...</span>
                      <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0 text-[#17120A]" />
                    </>
                  ) : (
                    <span>
                      {Number(passes) === 1
                        ? 'CONFIRMAR MI ASISTENCIA'
                        : `CONFIRMAR ASISTENCIA (${passes} PASES)`}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isDeclining || isConfirming}
                  onClick={handleDecline}
                  className={`inline-flex items-center gap-1.5 text-xs sm:text-sm underline underline-offset-4 mt-5 transition-colors cursor-pointer py-1.5 px-3 ${
                    isLight
                      ? 'text-[#C9C2B4] hover:text-[#FAF6ED]'
                      : 'text-[#B8B3A8] hover:text-[#F5F2EA]'
                  }`}
                >
                  {isDeclining ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Registrando respuesta...</span>
                    </>
                  ) : (
                    <span>No podré asistir</span>
                  )}
                </button>
              </>
            )}
          </section>
        </div>

        {/* 7. Galería de Fotos Conmemorativa */}
        <PhotoGallery isReady={isOpen} />

        {/* Opción para volver a ver el sobre */}
        <div className="reveal-soft w-full max-w-lg px-5 flex flex-col items-center my-10 z-10">
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsOpen(false);
              setIsEnvelopeMounted(true);
            }}
            className={`inline-flex items-center gap-2 text-xs transition-colors cursor-pointer py-2 px-4 rounded-full border transition-all ${
              isLight
                ? 'bg-[#33312C] hover:bg-[#403C34] border border-[#706044] text-[#C9C2B4] hover:text-[#FFF0CD]'
                : 'bg-[#151515] hover:bg-[#202020] border border-[#51432A] text-[#B8B3A8] hover:text-[#F0DDA7]'
            }`}
          >
            <Mail className={`w-3.5 h-3.5 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
            <span>Volver a ver el sobre</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const {
    guest,
    guestName,
    passes,
    isValid,
    isChristmas,
    isSecretPortal,
    isAdminDashboard,
    adminKey,
    attemptedId,
    isLoading,
    selectGuestById,
  } = useGuest();

  return (
    <ThemeProvider>
      {isLoading ? (
        <div className="min-h-screen w-full bg-[#080808]" />
      ) : isAdminDashboard ? (
        <AdminDashboard adminKey={adminKey} />
      ) : isValid && guest ? (
        <InvitationContent
          guest={guest}
          guestName={guestName}
          passes={passes}
          isChristmas={isChristmas}
        />
      ) : isSecretPortal ? (
        <FallbackHome
          attemptedId={attemptedId}
          isSecretPortal={isSecretPortal}
          onAccessGuest={selectGuestById}
        />
      ) : (
        <PublicHome />
      )}
    </ThemeProvider>
  );
}
