import React from 'react';
import { eventData } from '../../data/eventData';
import { Sparkles, Film, GlassWater, Utensils, Music, Moon } from 'lucide-react';

export default function Itinerary() {
  const getIcon = (type) => {
    switch (type) {
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'film':
        return <Film className="w-4 h-4 text-amber-400" />;
      case 'glass':
        return <GlassWater className="w-4 h-4 text-amber-400" />;
      case 'utensils':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'music':
        return <Music className="w-4 h-4 text-amber-400" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <section className="py-12 px-4 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-wider text-amber-400 font-nemer whitespace-nowrap">
          Cronograma
        </span>
        <h2 className="font-nemer text-2xl sm:text-3xl text-stone-100 font-bold tracking-wide mt-1">
          Itinerario de la Noche
        </h2>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-400/40 space-y-5 ml-4 sm:ml-6">
        {eventData.itinerary.map((item, idx) => (
          <div key={idx} className="relative">
            {/* Timeline bullet node */}
            <div className="absolute -left-[33px] sm:-left-[41px] top-1.5 w-7 h-7 rounded-full bg-[#101118] border-2 border-amber-400 flex items-center justify-center shadow-md">
              {getIcon(item.icon)}
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#14151e] border border-stone-800 shadow-md">
              <span className="inline-block px-2 py-0.5 rounded bg-black/50 border border-amber-400/30 text-[11px] font-mono text-amber-300 font-semibold tracking-wider whitespace-nowrap mb-1">
                {item.time} hrs
              </span>
              <h3 className="font-nemer text-base sm:text-lg text-stone-100 font-bold">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
