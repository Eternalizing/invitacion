import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { eventData } from '../../data/eventData';
import { CheckCircle2, Calendar, MapPin, Ticket, X, CalendarPlus } from 'lucide-react';
import GlowingCard from '../common/GlowingCard';

export default function ConfirmationDialog({ isOpen, onClose, guestName, passes = 1 }) {
  const { isLight } = useTheme();

  // Cerrar con tecla Escape y bloquear scroll mientras el diálogo esté activo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Enlace para agendar en Google Calendar
  const googleCalendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' +
    encodeURIComponent('Gala 50.º Aniversario — Atef Nemer Grupo de Empresas') +
    '&dates=20261128T213000Z/20261129T040000Z' +
    '&details=' +
    encodeURIComponent(
      `Invitación confirmada para ${guestName} (${Number(passes) === 1 ? '1 PASE' : `${passes} PASES`}). Gala Conmemorativa 50 Años.`
    ) +
    '&location=' +
    encodeURIComponent('Centro de Convenciones Eurobuilding, Barinas, Venezuela');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn"
    >
      {/* Fondo oscuro desenfocado (Backdrop) */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Contenedor del Diálogo con borde dorado animado */}
      <GlowingCard
        as="div"
        className="max-w-lg shadow-2xl relative z-10"
        innerClassName="p-6 sm:p-8 text-center"
      >
        {/* Botón de cierre (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 p-2 rounded-full opacity-60 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icono de Verificación con Resplandor Dorado */}
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
            <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
        </div>

        {/* Título Principal */}
        <h3
          id="confirm-dialog-title"
          className="font-serif italic text-2xl sm:text-3xl font-normal leading-snug mb-1 text-gold-shine"
        >
          ¡Asistencia Confirmada!
        </h3>

        <div
          className={`w-16 h-[1px] bg-gradient-to-r from-transparent to-transparent mx-auto my-3 ${
            isLight ? 'via-[#DDB967]' : 'via-[#C9A34E]'
          }`}
        />

        {/* Mensaje Personalizado */}
        <p className="text-xs sm:text-sm leading-relaxed mb-4 opacity-90">
          Estimado(a) <strong className="text-gold-shine font-semibold">{guestName}</strong>, es un honor confirmar
          su grata presencia en nuestra celebración de gala.
        </p>

        {/* Tarjeta de Resumen del Evento y Pase */}
        <div
          className={`rounded-2xl p-4 my-4 text-left border text-xs sm:text-sm space-y-2.5 ${
            isLight
              ? 'bg-[#242320]/70 border-[#706044]/60'
              : 'bg-[#080808]/70 border-[#51432A]/60'
          }`}
        >
          {/* Pases asignados */}
          <div className="flex items-center gap-2.5">
            <Ticket className={`w-4 h-4 shrink-0 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
            <span className="font-bold tracking-wider uppercase">
              {Number(passes) === 1 ? '1 PASE' : `${passes} PASES`}
            </span>
          </div>

          {/* Fecha y hora */}
          <div className="flex items-center gap-2.5 opacity-90">
            <Calendar className={`w-4 h-4 shrink-0 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
            <span>Sábado, 28 de Noviembre de 2026 • 5:30 p. m.</span>
          </div>

          {/* Lugar */}
          <div className="flex items-center gap-2.5 opacity-90">
            <MapPin className={`w-4 h-4 shrink-0 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
            <span>Centro de Convenciones Eurobuilding • Barinas</span>
          </div>
        </div>

        {/* Nota de puntualidad y agradecimiento */}
        <p className="text-[11px] sm:text-xs opacity-70 leading-relaxed mb-6">
          Le recomendamos llegar con puntualidad para la Misa de Acción de Gracias previa a la recepción.
        </p>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`btn-gold-shimmer w-full sm:w-auto px-8 py-3 rounded-full font-montserrat font-bold text-xs tracking-widest uppercase cursor-pointer transition-all active:scale-95 ${
              isLight
                ? 'bg-[#DDB967] hover:bg-[#e8c77b] text-[#211A0E] shadow-[0_4px_20px_rgba(221,185,103,0.4)]'
                : 'bg-[#C9A34E] hover:bg-[#d8b560] text-[#17120A] shadow-[0_4px_20px_rgba(201,163,78,0.4)]'
            }`}
          >
            Entendido
          </button>

          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-full text-xs font-semibold tracking-wider border transition-colors cursor-pointer ${
              isLight
                ? 'border-[#706044] text-[#FAF6ED] hover:bg-white/5'
                : 'border-[#51432A] text-[#F5F2EA] hover:bg-white/5'
            }`}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Agendar en Calendario</span>
          </a>
        </div>
      </GlowingCard>
    </div>
  );
}

