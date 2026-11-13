import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import EnvelopeModal from './components/envelope/EnvelopeModal';
import Countdown, { FloatingCountdown } from './components/invitation/Countdown';
import BackgroundCarousel from './components/invitation/BackgroundCarousel';
import BookSection from './components/invitation/BookSection';
import PhotoGallery from './components/invitation/PhotoGallery';
import ConfirmationDialog from './components/invitation/ConfirmationDialog';
import GlowingCard from './components/common/GlowingCard';
import SmoothImage from './components/common/SmoothImage';
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
import { eventData } from './data/eventData';
import { MapPin, Mail, Church, GlassWater, Moon, CheckCircle2, XCircle, Ticket } from 'lucide-react';

function InvitationContent({ guest, guestName = 'Invitado Especial', passes = 1 }) {
  const { isLight } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnvelopeMounted, setIsEnvelopeMounted] = useState(true);
  const [showStickyCountdown, setShowStickyCountdown] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const inPageCountdownRef = useRef(null);

  // Estado de confirmación de asistencia del invitado
  const [attendanceStatus, setAttendanceStatus] = useState(() =>
    guest?.id ? getGuestStatus(guest.id) : GUEST_STATUS.PENDING
  );

  useEffect(() => {
    if (guest?.id) {
      setAttendanceStatus(getGuestStatus(guest.id));
    }
  }, [guest]);

  const handleConfirm = async () => {
    if (!guest?.id) return;
    await confirmGuest(guest.id);
    setAttendanceStatus(GUEST_STATUS.CONFIRMED);
    setIsConfirmDialogOpen(true);
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#DDB967', '#C9A34E', '#FFF0CD', '#F0DDA7', '#FFFFFF'],
      });
    } catch {
      // Ignorar si falla confetti
    }
  };

  const handleDecline = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!guest?.id) return;
    await declineGuest(guest.id);
    setAttendanceStatus(GUEST_STATUS.DECLINED);
  };

  // Revelado suave de secciones al hacer scroll (una vez abierta la invitación)
  useScrollReveal(isOpen && !isEnvelopeMounted);

  // Bloquear absolutamente el scroll mientras la carta o la secuencia de logos esté en pantalla
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

  // El contador flotante aparece ÚNICAMENTE cuando el usuario sobrepasa el contador principal
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (!inPageCountdownRef.current) return;
      const rect = inPageCountdownRef.current.getBoundingClientRect();

      // Solo mostrar cuando el contador de la página ya salió completamente por arriba (rect.bottom < 20)
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

  // Helper para renderizar iconos del programa con el dorado principal de cada paleta y desvanecimiento suave
  const getProgramIcon = (iconType) => {
    const iconClass = `w-8 h-8 sm:w-9 sm:h-9 filter mb-3 animate-icon-fadeIn transition-all duration-500 ${
      isLight
        ? 'text-[#DDB967] drop-shadow-[0_2px_8px_rgba(221,185,103,0.45)]'
        : 'text-[#C9A34E] drop-shadow-[0_2px_8px_rgba(201,163,78,0.45)]'
    }`;

    switch (iconType) {
      case 'church':
        return <Church className={iconClass} />;
      case 'glass':
        return <GlassWater className={iconClass} />;
      case 'moon':
        return <Moon className={iconClass} />;
      default:
        return (
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center mb-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLight ? 'bg-[#DDB967] shadow-[0_0_8px_rgba(221,185,103,0.6)]' : 'bg-[#C9A34E] shadow-[0_0_8px_rgba(201,163,78,0.6)]'
              }`}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={`flex flex-col items-center font-montserrat relative transition-colors duration-700 ${
        isLight
          ? 'bg-[#242320] text-[#FAF6ED] selection:bg-[#DDB967] selection:text-[#211A0E]'
          : 'bg-[#080808] text-[#F5F2EA] selection:bg-[#C9A34E] selection:text-[#17120A]'
      } ${isEnvelopeMounted ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'}`}
    >
      {/* 0. CARRUSEL INFINITO DE FOTOS EN EL FONDO */}
      <BackgroundCarousel />

      {/* 1. Modal Carta con Sello Central (Visible al inicio) */}
      {isEnvelopeMounted && (
        <EnvelopeModal
          guestName={guestName}
          passes={passes}
          onOpenStart={() => setIsOpen(true)}
          onOpenComplete={() => setIsEnvelopeMounted(false)}
          onOpen={() => {
            setIsOpen(true);
            setIsEnvelopeMounted(false);
          }}
        />
      )}

      {/* 2. CONTADOR FLOTANTE CENTRADO SUPERIOR (Aparece al hacer scroll) */}
      <FloatingCountdown isVisible={isOpen && !isEnvelopeMounted && showStickyCountdown} />

      {/* Diálogo de Confirmación de Asistencia */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        guestName={guestName}
        passes={passes}
      />

      {/* 3. Landing Page de Invitación */}
      <main
        className={`w-full flex flex-col items-center text-center transition-all duration-1000 relative z-10 pt-12 pb-24 sm:pb-28 overflow-x-hidden ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Iluminación Ambiental Optimizada para Móviles */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[450px] rounded-full blur-[70px] sm:blur-[150px] pointer-events-none transition-all duration-700 ${
            isLight ? 'bg-[#DDB967]/15' : 'bg-[#C9A34E]/10'
          }`}
        />
        <div
          className={`absolute top-1/4 right-0 w-80 h-80 rounded-full blur-[60px] sm:blur-[130px] pointer-events-none transition-all duration-700 ${
            isLight ? 'bg-[#DDB967]/10' : 'bg-[#C9A34E]/8'
          }`}
        />
        <div
          className={`absolute top-1/2 -left-20 w-96 h-96 rounded-full blur-[65px] sm:blur-[140px] pointer-events-none transition-all duration-700 ${
            isLight ? 'bg-[#706044]/25' : 'bg-[#51432A]/20'
          }`}
        />

        {/* Contenedor Principal Centrado para Textos, Programa y RSVP */}
        <div className="w-full max-w-lg px-5 flex flex-col items-center text-center z-10">
          {/* Header: Logo Oficial Atef Nemer Grupo de Empresas */}
          <header className="reveal-soft flex flex-col items-center mb-6 z-10 w-full">
          <div className="relative flex items-center justify-center my-2 max-w-[85vw]">
            <SmoothImage
              src={eventData.logos.mainCompanyLogo}
              alt="Atef Nemer Grupo de Empresas"
              loading="eager"
              className="max-h-20 sm:max-h-24 w-auto max-w-full object-contain logo-glow"
            />
          </div>

          {/* Logo Oficial 50 Años */}
          <div className="relative my-3 flex items-center justify-center max-w-[70vw]">
            <SmoothImage
              src={eventData.logos.logo50Anos}
              alt="50 Años de Trayectoria"
              loading="eager"
              className="max-h-16 sm:max-h-20 w-auto max-w-full object-contain logo-glow"
              style={{ animationDelay: '2s' }}
            />
          </div>
        </header>

        {/* Card 1: INVITACIÓN PERSONAL (Borde dorado con haz de luz continuo) */}
        <GlowingCard className="reveal my-6" innerClassName="p-7 sm:p-10 text-center">
          <span
            className={`text-xs sm:text-sm tracking-[0.3em] font-bold uppercase block mb-4 ${
              isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
            }`}
          >
            {eventData.invitationText.header}
          </span>

          {/* NOMBRE DEL INVITADO: Dorado metálico con brillo animado y destellos */}
          <div className="relative inline-block max-w-full px-3">
            <span className="twinkle" style={{ top: '8%', left: '2%', animationDelay: '0s' }} />
            <span className="twinkle" style={{ top: '18%', right: '4%', animationDelay: '0.9s' }} />
            <span className="twinkle" style={{ bottom: '12%', left: '12%', animationDelay: '1.7s' }} />
            <span className="twinkle" style={{ bottom: '4%', right: '14%', animationDelay: '2.3s' }} />
            <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl font-normal leading-tight my-4 break-words py-1 px-1 text-gold-shine gold-glow-pulse">
              {guestName}
            </h2>
          </div>

          {/* Badge Distintivo de Pases Asignados */}
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

          {/* Fina línea divisoria dorada con destello */}
          <div
            className={`gold-line-shimmer w-24 h-[1px] bg-gradient-to-r from-transparent to-transparent mx-auto my-5 ${
              isLight ? 'via-[#DDB967]' : 'via-[#C9A34E]'
            }`}
          />

          {/* Texto principal: #FAF6ED (Paleta 02) o #F5F2EA (Paleta 01) */}
          <p
            className={`text-sm sm:text-base leading-relaxed mb-2.5 ${
              isLight ? 'text-[#FAF6ED] font-normal' : 'text-[#F5F2EA] font-normal'
            }`}
          >
            {eventData.invitationText.honorText}
          </p>

          {/* Texto secundario: #C9C2B4 (Paleta 02) o #B8B3A8 (Paleta 01) */}
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isLight ? 'text-[#C9C2B4] font-normal' : 'text-[#B8B3A8] font-normal'
            }`}
          >
            {eventData.invitationText.subText}
          </p>
        </GlowingCard>

        {/* Bloque de Fecha */}
        <section className="reveal my-8 text-center z-10 w-full flex flex-col items-center">
          <span
            className={`text-xs sm:text-sm tracking-[0.38em] uppercase font-bold block mb-2 ${
              isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
            }`}
          >
            {eventData.date.dayOfWeek}
          </span>

          {/* Día en dorado metálico brillante */}
          <span className="font-serif text-6xl sm:text-7xl font-normal block my-2 leading-none px-2 text-gold-shine gold-glow-pulse">
            {eventData.date.dayNumber}
          </span>

          <span
            className={`text-xs sm:text-sm tracking-[0.24em] sm:tracking-[0.3em] [word-spacing:0.35em] uppercase font-medium block mt-3.5 sm:mt-4 mb-7 sm:mb-8 ${
              isLight ? 'text-[#FAF6ED]' : 'text-[#F5F2EA]'
            }`}
          >
            {eventData.date.monthYear}
          </span>

          {/* Botón de Confirmación bajo la fecha: sincronizado con el sistema de confirmación */}
          <button
            type="button"
            onClick={() => {
              if (attendanceStatus === GUEST_STATUS.CONFIRMED) {
                setIsConfirmDialogOpen(true);
              } else {
                handleConfirm();
              }
            }}
            className={`btn-gold-shimmer btn-glow-pulse inline-flex items-center justify-center w-auto min-w-[240px] sm:min-w-[280px] max-w-[90vw] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-montserrat font-extrabold text-[11px] sm:text-xs md:text-sm tracking-[0.16em] sm:tracking-[0.18em] uppercase active:scale-95 transition-all cursor-pointer whitespace-nowrap select-none ${
              attendanceStatus === GUEST_STATUS.CONFIRMED
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_6px_25px_rgba(16,185,129,0.4)] border border-emerald-400/50'
                : isLight
                ? 'bg-[#DDB967] hover:bg-[#e8c77b] text-[#211A0E] shadow-[0_6px_25px_rgba(221,185,103,0.4)] hover:shadow-[0_8px_35px_rgba(221,185,103,0.6)] border border-[#FFF0CD]/40'
                : 'bg-[#C9A34E] hover:bg-[#d8b560] text-[#17120A] shadow-[0_6px_25px_rgba(201,163,78,0.4)] hover:shadow-[0_8px_35px_rgba(201,163,78,0.6)] border border-[#F0DDA7]/40'
            }`}
          >
            <span>
              {attendanceStatus === GUEST_STATUS.CONFIRMED
                ? '✓ ASISTENCIA CONFIRMADA'
                : Number(passes) === 1
                ? 'CONFIRMAR ASISTENCIA'
                : `CONFIRMAR ASISTENCIA (${passes} PASES)`}
            </span>
          </button>
        </section>

        {/* CONTEO REGRESIVO */}
        <div ref={inPageCountdownRef} className="reveal w-full">
          <Countdown />
        </div>

        {/* Section: Una noche para recordar (Título en #FFF0CD o #F0DDA7) */}
        <h2 className="reveal-soft font-serif italic text-2xl sm:text-3xl font-normal mt-12 mb-6 z-10 px-2 text-gold-shine">
          {eventData.itineraryTitle}
        </h2>

        {/* Card: Programa del Evento (Borde dorado con haz de luz continuo) */}
        <GlowingCard className="reveal my-6" innerClassName="p-7 sm:p-10 text-center">
          <span
            className={`text-xs sm:text-sm tracking-[0.3em] font-bold uppercase block mb-7 ${
              isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
            }`}
          >
            {eventData.itineraryHeader}
          </span>

          {eventData.itinerary.map((item, idx) => (
            <div key={idx}>
              <div className="py-4 flex flex-col items-center">
                {/* Ícono de cada etapa */}
                {getProgramIcon(item.icon)}

                <span
                  className={`text-base sm:text-lg font-bold block font-montserrat tracking-wider mb-1.5 ${
                    isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
                  }`}
                >
                  {item.time}
                </span>

                <h3
                  className={`font-serif italic text-lg sm:text-xl font-normal mb-2 ${
                    isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
                  }`}
                >
                  {item.title}
                </h3>

                {item.details.map((detail, dIdx) => (
                  <p
                    key={dIdx}
                    className={`text-xs sm:text-sm mt-1 font-light leading-relaxed ${
                      isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
                    }`}
                  >
                    {detail}
                  </p>
                ))}
              </div>

              {idx < eventData.itinerary.length - 1 && (
                <div
                  className={`w-2/3 mx-auto border-t my-6 ${
                    isLight ? 'border-[#706044]' : 'border-[#51432A]'
                  }`}
                />
              )}
            </div>
          ))}
        </GlowingCard>

        {/* Card: Lugar & Código de Vestimenta (Borde dorado con haz de luz continuo) */}
        <GlowingCard className="reveal my-6" innerClassName="p-7 sm:p-10 text-center">
          {/* MapPin */}
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
            {eventData.location.header}
          </span>

          <h3
            className={`font-serif italic text-xl sm:text-2xl font-normal mb-2 ${
              isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
            }`}
          >
            {eventData.location.venue}
          </h3>

          <p
            className={`text-xs sm:text-sm mb-6 font-light ${
              isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
            }`}
          >
            {eventData.location.city}
          </p>

          {/* Cómo llegar Button */}
          <a
            href={eventData.location.mapsUrl}
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

          {/* Divider */}
          <div
            className={`w-2/3 mx-auto border-t my-8 ${
              isLight ? 'border-[#706044]' : 'border-[#51432A]'
            }`}
          />

          {/* Dress code */}
          <div className="flex flex-col items-center">
            {/* Ícono pajarita cóctel */}
            <svg
              className={`w-8 h-8 sm:w-9 sm:h-9 filter mb-3 ${
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
              className={`text-[11px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.28em] font-bold uppercase block mb-1.5 whitespace-nowrap ${
                isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
              }`}
            >
              {eventData.dressCode.header}
            </span>

            <p
              className={`font-serif italic text-2xl sm:text-3xl mt-1 ${
                isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
              }`}
            >
              {eventData.dressCode.style}
            </p>
          </div>
        </GlowingCard>

        {/* 4. Agradecimiento: Gracias por ser parte de nuestra historia */}
        <section className="reveal-soft mt-10 mb-4 w-full flex flex-col items-center text-center z-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-snug mb-2 px-2 text-gold-shine">
            {eventData.rsvp.title}
          </h2>

          <a
            href={eventData.rsvp.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs sm:text-sm font-montserrat tracking-wider block mb-2 font-medium transition-colors cursor-pointer ${
              isLight
                ? 'text-[#DDB967] hover:text-[#FFF0CD]'
                : 'text-[#C9A34E] hover:text-[#F0DDA7]'
            }`}
          >
            {eventData.rsvp.subtitle}
          </a>
        </section>

        {/* 5. SECCIÓN DEL LIBRO CONMEMORATIVO OCULTO */}
        <BookSection />

        {/* 6. Confirmación de Asistencia (Abajo del libro oculto) */}
        <section className="reveal mt-8 mb-6 w-full flex flex-col items-center text-center z-10 px-4">
          {/* Caso 1: Asistencia ya confirmada */}
          {attendanceStatus === GUEST_STATUS.CONFIRMED && (
            <GlowingCard
              as="div"
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
                ¡Muchas gracias, <strong className="text-gold-shine font-serif italic text-base">{guestName}</strong>!
              </p>
              <p className="text-xs opacity-75 text-center">
                Su asistencia ({Number(passes) === 1 ? '1 PASE' : `${passes} PASES`}) ha sido registrada en la lista oficial de la gala.
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

          {/* Caso 2: Declinó la asistencia */}
          {attendanceStatus === GUEST_STATUS.DECLINED && (
            <GlowingCard
              as="div"
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
                onClick={handleConfirm}
                className="btn-gold-shimmer px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#17120A] bg-[#C9A34E] active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Deseo cambiar y Confirmar Asistencia
              </button>
            </GlowingCard>
          )}

          {/* Caso 3: Estado Pendiente (Por defecto) */}
          {attendanceStatus === GUEST_STATUS.PENDING && (
            <>
              {/* Indicador elegante de pases incluidos */}
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

              {/* Botón Principal Dorado para Confirmar */}
              <button
                type="button"
                onClick={handleConfirm}
                className={`btn-gold-shimmer btn-glow-pulse inline-flex items-center justify-center w-auto min-w-[250px] sm:min-w-[300px] max-w-[90vw] px-6 sm:px-9 py-3.5 sm:py-4 rounded-full font-montserrat font-extrabold text-[11px] sm:text-xs md:text-sm tracking-[0.16em] sm:tracking-[0.18em] uppercase active:scale-95 transition-all cursor-pointer whitespace-nowrap select-none ${
                  isLight
                    ? 'bg-[#DDB967] hover:bg-[#e8c77b] text-[#211A0E] shadow-[0_6px_30px_rgba(221,185,103,0.45)] hover:shadow-[0_8px_40px_rgba(221,185,103,0.7)] border border-[#FFF0CD]/40'
                    : 'bg-[#C9A34E] hover:bg-[#d8b560] text-[#17120A] shadow-[0_6px_30px_rgba(201,163,78,0.45)] hover:shadow-[0_8px_40px_rgba(201,163,78,0.7)] border border-[#F0DDA7]/40'
                }`}
              >
                <span>
                  {Number(passes) === 1
                    ? 'CONFIRMAR MI ASISTENCIA'
                    : `CONFIRMAR ASISTENCIA (${passes} PASES)`}
                </span>
              </button>

              {/* Enlace secundario: No podré asistir */}
              <button
                type="button"
                onClick={handleDecline}
                className={`text-xs sm:text-sm underline underline-offset-4 mt-5 transition-colors cursor-pointer py-1.5 px-3 ${
                  isLight
                    ? 'text-[#C9C2B4] hover:text-[#FAF6ED]'
                    : 'text-[#B8B3A8] hover:text-[#F5F2EA]'
                }`}
              >
                No podré asistir
              </button>
            </>
          )}
        </section>
      </div>

      {/* 7. Galería de Fotos Conmemorativa (Ancho total nativo, sin overflow ni desajustes) */}
      <PhotoGallery isReady={isOpen} />

      {/* Opción para volver a ver el sobre (Centrado) */}
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
    isSecretPortal,
    isAdminDashboard,
    attemptedId,
    selectGuestById,
  } = useGuest();

  return (
    <ThemeProvider>
      {isAdminDashboard ? (
        <AdminDashboard />
      ) : isValid && guest ? (
        <InvitationContent guest={guest} guestName={guestName} passes={passes} />
      ) : isSecretPortal ? (
        <FallbackHome attemptedId={attemptedId} onAccessGuest={selectGuestById} />
      ) : (
        <PublicHome />
      )}
    </ThemeProvider>
  );
}
