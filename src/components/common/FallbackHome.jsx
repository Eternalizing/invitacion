import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { eventData } from '../../data/eventData';
import { SECRET_PORTAL_ID, SECRET_DASHBOARD_ID } from '../../data/guests';
import { KeyRound, ArrowRight, AlertCircle, MessageCircle, Calendar, MapPin, Table } from 'lucide-react';

export default function FallbackHome({ attemptedId = '', onAccessGuest }) {
  const { isLight } = useTheme();
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = inputCode.trim();

    if (!clean) {
      setErrorMessage('Por favor ingrese su código de invitación.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const success = onAccessGuest ? onAccessGuest(clean) : false;

    if (!success) {
      setIsSubmitting(false);
      setErrorMessage(`El código "${clean}" no fue encontrado en la lista de invitados.`);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 font-montserrat relative select-none overflow-x-hidden ${
        isLight
          ? 'bg-[#242320] text-[#FAF6ED] selection:bg-[#DDB967] selection:text-[#211A0E]'
          : 'bg-[#080808] text-[#F5F2EA] selection:bg-[#C9A34E] selection:text-[#17120A]'
      }`}
    >
      {/* Iluminación Ambiental Dorada Cálida */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[500px] rounded-full blur-[110px] pointer-events-none transition-all duration-700 ${
          isLight ? 'bg-[#DDB967]/18' : 'bg-[#C9A34E]/12'
        }`}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[130px] pointer-events-none transition-all duration-700 ${
          isLight ? 'bg-[#706044]/25' : 'bg-[#51432A]/20'
        }`}
      />

      {/* Contenedor Principal Centrado */}
      <div className="w-full max-w-lg flex flex-col items-center text-center relative z-10 py-8">
        {/* 1. Logos Oficiales */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center my-2 max-w-[85vw]">
            <img
              src={eventData.logos.mainCompanyLogo}
              alt="Atef Nemer Grupo de Empresas"
              className="max-h-20 sm:max-h-24 w-auto max-w-full object-contain logo-glow"
            />
          </div>

          <div className="relative my-3 flex items-center justify-center max-w-[65vw]">
            <img
              src={eventData.logos.logo50Anos}
              alt="50 Años de Trayectoria"
              className="max-h-16 sm:max-h-20 w-auto max-w-full object-contain logo-glow"
            />
          </div>
        </div>

        {/* 2. Tarjeta Principal de Información */}
        <div
          className={`w-full rounded-3xl p-6 sm:p-8 text-center my-2 backdrop-blur-md transition-all duration-500 border ${
            isLight
              ? 'bg-[#33312C]/90 border-[#706044] shadow-[0_20px_50px_rgba(0,0,0,0.65)]'
              : 'bg-[#151515]/90 border-[#51432A] shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
          }`}
        >
          <span
            className={`text-xs sm:text-sm tracking-[0.3em] font-bold uppercase block mb-3 ${
              isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
            }`}
          >
            PORTAL OFICIAL DE INVITACIONES
          </span>

          <h1 className="font-serif italic text-2xl sm:text-3xl md:text-4xl font-normal leading-snug mb-3 text-gold-shine">
            Gala 50.º Aniversario
          </h1>

          <div
            className={`w-20 h-[1px] bg-gradient-to-r from-transparent to-transparent mx-auto my-4 ${
              isLight ? 'via-[#DDB967]' : 'via-[#C9A34E]'
            }`}
          />

          {/* Mensaje de estado contextual */}
          {attemptedId && attemptedId !== SECRET_PORTAL_ID ? (
            <div
              className={`flex items-start text-left gap-3 p-3.5 rounded-2xl mb-5 text-xs sm:text-sm leading-relaxed border ${
                isLight
                  ? 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}
            >
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Enlace incompleto o no reconocido</p>
                <p className="opacity-90">
                  El código <span className="font-mono font-bold tracking-wider underline">"{attemptedId}"</span> no se
                  encuentra en el listado de invitados o fue escrito incorrectamente.
                </p>
              </div>
            </div>
          ) : (
            <p
              className={`text-xs sm:text-sm leading-relaxed mb-5 ${
                isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
              }`}
            >
              Portal privado de consulta y verificación de invitaciones. Ingrese el código de acceso exclusivo para
              acceder directamente a la invitación personalizada de gala.
            </p>
          )}

          {/* Formulario para ingresar código manualmente */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3 mt-2">
            <label
              htmlFor="guest-code-input"
              className={`text-[11px] sm:text-xs tracking-[0.2em] uppercase font-bold self-start pl-1 ${
                isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'
              }`}
            >
              Ingrese su Código de Invitado:
            </label>

            <div className="w-full relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none opacity-60">
                <KeyRound className={`w-4 h-4 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
              </div>
              <input
                id="guest-code-input"
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ejemplo: 839214 o su código asignado"
                className={`w-full pl-10 pr-4 py-3.5 rounded-2xl text-xs sm:text-sm font-medium tracking-wider outline-none transition-all duration-300 border ${
                  isLight
                    ? 'bg-[#242320] border-[#706044] text-[#FAF6ED] placeholder-[#706044] focus:border-[#DDB967] focus:ring-1 focus:ring-[#DDB967]'
                    : 'bg-[#080808] border-[#51432A] text-[#F5F2EA] placeholder-[#51432A] focus:border-[#C9A34E] focus:ring-1 focus:ring-[#C9A34E]'
                }`}
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 mt-1 self-start pl-1 flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-gold-shimmer btn-glow-pulse w-full mt-3 py-3.5 px-6 rounded-2xl font-montserrat font-extrabold text-xs sm:text-sm tracking-[0.18em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-98 ${
                isLight
                  ? 'bg-[#DDB967] hover:bg-[#e8c77b] text-[#211A0E] shadow-[0_4px_25px_rgba(221,185,103,0.4)]'
                  : 'bg-[#C9A34E] hover:bg-[#d8b560] text-[#17120A] shadow-[0_4px_25px_rgba(201,163,78,0.4)]'
              }`}
            >
              <span>Acceder a mi Invitación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Datos del Evento en la base */}
          <div
            className={`mt-6 pt-5 border-t flex flex-col sm:flex-row items-center justify-around gap-3 text-xs ${
              isLight ? 'border-[#706044]/40 text-[#C9C2B4]' : 'border-[#51432A]/50 text-[#B8B3A8]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
              <span>Sábado, 28 de Noviembre de 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className={`w-3.5 h-3.5 ${isLight ? 'text-[#DDB967]' : 'text-[#C9A34E]'}`} />
              <span>Eurobuilding • Barinas</span>
            </div>
          </div>
        </div>

        {/* 3. Asistencia / Concierge */}
        <div className="mt-6 flex flex-col items-center text-center px-4">
          <p
            className={`text-xs mb-2 ${
              isLight ? 'text-[#C9C2B4]' : 'text-[#B8B3A8]'
            }`}
          >
            ¿No posee su enlace o necesita confirmar su código de invitación?
          </p>
          <a
            href={eventData.rsvp.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-xs font-semibold tracking-wider transition-colors py-2 px-4 rounded-full border ${
              isLight
                ? 'border-[#706044] text-[#DDB967] hover:bg-[#33312C]'
                : 'border-[#51432A] text-[#C9A34E] hover:bg-[#151515]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Contactar al Comité Organizador ({eventData.rsvp.subtitle})</span>
          </a>

          {/* Enlace al panel de control */}
          <a
            href={`/?id=${SECRET_DASHBOARD_ID}`}
            className={`mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider transition-opacity py-1.5 px-3.5 rounded-full border opacity-75 hover:opacity-100 ${
              isLight
                ? 'border-[#706044] text-[#DDB967] hover:bg-[#33312C]'
                : 'border-[#51432A] text-[#C9A34E] hover:bg-[#151515]'
            }`}
          >
            <Table className="w-3 h-3" />
            <span>Ver Panel y Tabla de Invitaciones</span>
          </a>
        </div>
      </div>
    </div>
  );
}

