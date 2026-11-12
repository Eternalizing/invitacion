import React from 'react';
import { eventData } from '../../data/eventData';
import { MapPin, Navigation, Clock, Info } from 'lucide-react';

export default function LocationMap() {
  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-wider text-amber-400 font-nemer whitespace-nowrap">
          Ubicación & Cita
        </span>
        <h2 className="font-nemer text-2xl sm:text-3xl text-stone-100 font-bold tracking-wide mt-1">
          Lugar de la Celebración
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {eventData.locations.map((loc, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-[#14151e] border border-amber-400/30 shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Type and time badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#1e202d] border border-amber-400/40 text-amber-300 text-xs font-nemer tracking-wide whitespace-nowrap">
                  {loc.type}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-stone-300 font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-stone-800 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {loc.time}
                </span>
              </div>

              {/* Venue Name */}
              <h3 className="font-nemer text-xl sm:text-2xl font-bold text-stone-100 mb-2">
                {loc.place}
              </h3>

              {/* Address */}
              <p className="text-stone-300 text-xs sm:text-sm flex items-start gap-2 mb-4 font-montserrat">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{loc.address}</span>
              </p>

              {/* Note */}
              {loc.note && (
                <div className="flex items-start gap-2 text-xs text-amber-300/90 bg-[#1c1e2b] p-3 rounded-xl border border-amber-500/20 mb-6 font-montserrat">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{loc.note}</span>
                </div>
              )}
            </div>

            {/* SOLID COLOR BUTTON - High contrast gold */}
            <a
              href={loc.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#e5c04c] text-stone-950 text-sm font-montserrat font-bold transition-all duration-200 shadow-[0_4px_15px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] active:scale-[0.98] border border-[#ffec99] cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-stone-950 font-bold shrink-0" />
              <span className="whitespace-nowrap uppercase tracking-wider text-xs sm:text-sm font-black">
                Abrir en Google Maps
              </span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
