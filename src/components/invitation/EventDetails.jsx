import React, { useState } from 'react';
import { eventData } from '../../data/eventData';
import { Shirt, Gift, Copy, Check } from 'lucide-react';

export default function EventDetails() {
  const [copied, setCopied] = useState(false);

  const handleCopyClabe = () => {
    if (eventData.gifts?.bankTransfer?.clabe) {
      navigator.clipboard.writeText(eventData.gifts.bankTransfer.clabe);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
      {/* Dress Code Card */}
      <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-400/30 shadow-xl flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow">
            <Shirt className="w-5 h-5" />
          </div>
          <span className="text-xs font-nemer uppercase tracking-wider text-amber-400 whitespace-nowrap">
            Código de Vestimenta
          </span>
          <h3 className="font-nemer text-xl sm:text-2xl font-bold text-stone-100 mt-1 mb-2">
            {eventData.dressCode.title}
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-5 font-montserrat">
            {eventData.dressCode.description}
          </p>
        </div>

        {/* Suggested Palette */}
        <div>
          <span className="text-[11px] text-stone-400 uppercase tracking-wider font-montserrat block mb-2 font-medium">
            {eventData.dressCode.paletteDescription}
          </span>
          <div className="flex items-center gap-2.5">
            {eventData.dressCode.colors.map((color, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-full shadow border-2 border-stone-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={`Tono sugerido ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gifts / Detail Card */}
      <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-400/30 shadow-xl flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-xs font-nemer uppercase tracking-wider text-amber-400 whitespace-nowrap">
            Muestra de Cariño
          </span>
          <h3 className="font-nemer text-xl sm:text-2xl font-bold text-stone-100 mt-1 mb-2">
            {eventData.gifts.title}
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-5 font-montserrat">
            {eventData.gifts.message}
          </p>
        </div>

        {/* Bank Account Info Box */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-stone-800 text-xs sm:text-sm font-montserrat">
          <div className="flex justify-between items-center mb-1">
            <span className="text-stone-400 text-xs">Banco:</span>
            <span className="font-bold text-stone-200">{eventData.gifts.bankTransfer.bank}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-stone-400 text-xs">Beneficiario:</span>
            <span className="font-bold text-stone-200">{eventData.gifts.bankTransfer.beneficiary}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-800 gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-stone-400">Cuenta CLABE:</span>
              <span className="font-mono text-amber-300 text-xs sm:text-sm font-bold truncate">
                {eventData.gifts.bankTransfer.clabe}
              </span>
            </div>

            {/* SOLID COLOR BUTTON - Gold or Success Green */}
            <button
              onClick={handleCopyClabe}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition-all shadow-md cursor-pointer ${
                copied
                  ? 'bg-[#16a34a] text-white'
                  : 'bg-[#d4af37] hover:bg-[#e5c04c] text-stone-950 border border-[#ffec99]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  <span className="whitespace-nowrap">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-950 font-bold" />
                  <span className="whitespace-nowrap">Copiar CLABE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
