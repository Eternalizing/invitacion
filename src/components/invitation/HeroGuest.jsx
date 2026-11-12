import React from 'react';
import { Users, Calendar, Clock } from 'lucide-react';
import { eventData } from '../../data/eventData';

export default function HeroGuest({ guestName, passes }) {
  return (
    <header className="relative flex flex-col items-center justify-center text-center px-4 pt-12 pb-16 overflow-hidden">
      {/* Golden Aura Backgrounds */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Emblem / 50 Años Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1c1d28] border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs tracking-wider uppercase font-nemer mb-5 shadow-md whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] shrink-0" />
        <span>Celebración de Medio Siglo</span>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] shrink-0" />
      </div>

      {/* Official Golden Logo from Recursos - Well Scaled */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-400/15 blur-xl rounded-full scale-90 pointer-events-none" />
        <img
          src={eventData.logos.mainLogo}
          alt="Nemer 50 Años"
          className="relative h-20 sm:h-28 md:h-32 w-auto object-contain filter drop-shadow-[0_6px_16px_rgba(212,175,55,0.35)]"
          onError={(e) => {
            e.currentTarget.src = eventData.logos.emblem50;
          }}
        />
      </div>

      {/* Tagline - Balanced scaling to avoid ugly wraps */}
      <h2 className="font-nemer text-base sm:text-xl text-stone-200 tracking-wider font-bold uppercase max-w-lg px-2 mt-1">
        {eventData.tagline}
      </h2>

      <p className="max-w-md text-stone-400 text-xs sm:text-sm font-montserrat font-light italic mt-2.5 mb-7 px-4 leading-relaxed">
        "{eventData.subtitle}"
      </p>

      {/* GUEST NAME CARD - ROBUST & UN-DEFORMABLE */}
      <div className="relative w-full max-w-xl mx-auto my-2 px-5 py-7 sm:px-8 sm:py-8 rounded-3xl bg-[#14151e] border-2 border-amber-400/40 shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
        
        {/* Floating Top Pill */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#d4af37] text-stone-950 text-[11px] uppercase tracking-widest font-nemer font-black shadow-md whitespace-nowrap">
          Invitado de Honor
        </div>

        <p className="text-[11px] sm:text-xs font-nemer tracking-wider text-amber-300 uppercase mb-2 whitespace-nowrap">
          Tengo el placer de invitar a:
        </p>

        {/* Large Guest Name with safe text wrapping & font scaling */}
        <h1 className="font-nemer text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide py-1 leading-snug gold-text-metallic filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] break-words">
          {guestName}
        </h1>

        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-3" />

        {/* Passes Badge - Never wraps */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1d1f2b] border border-amber-500/30 text-stone-200 text-xs font-montserrat shadow-inner whitespace-nowrap">
          <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium">
            {passes > 1 ? `Pase reservado para ${passes} personas` : 'Pase personal (1 persona)'}
          </span>
        </div>
      </div>

      {/* Date & Time Highlights - Pills with whitespace-nowrap */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-stone-200 text-xs sm:text-sm font-montserrat">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171822] border border-stone-800 shadow whitespace-nowrap">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-nemer font-bold tracking-wider text-amber-200">
            {eventData.dateFormatted.fullDate}
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171822] border border-stone-800 shadow whitespace-nowrap">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-mono text-amber-300 font-medium">
            {eventData.dateFormatted.time}
          </span>
        </div>
      </div>

      {/* Scroll Down Hint */}
      <div className="mt-10 flex flex-col items-center text-stone-500 text-xs font-montserrat">
        <span className="whitespace-nowrap">Detalles de la recepción</span>
        <span className="text-amber-400 mt-1 animate-bounce">↓</span>
      </div>
    </header>
  );
}
