import React, { useState } from 'react';
import { eventData } from '../../data/eventData';
import { MessageCircle, CheckCircle, XCircle } from 'lucide-react';

export default function RsvpSection({ guestName, defaultPasses }) {
  const [attending, setAttending] = useState('yes'); // 'yes' or 'no'
  const [confirmedPasses, setConfirmedPasses] = useState(defaultPasses || 1);
  const [customMessage, setCustomMessage] = useState('');

  const handleWhatsAppSend = () => {
    const isAttending = attending === 'yes';
    const textLines = [
      `*Confirmación de Asistencia - 50 Años de Nemer* 🎉`,
      `👤 *Invitado de Honor:* ${guestName}`,
      isAttending 
        ? `✅ *Estado:* ¡Será un gran honor acompañar a Nemer en su 50 Aniversario!` 
        : `❌ *Estado:* Lamentablemente no podré asistir, pero le deseo un maravilloso festejo.`,
    ];

    if (isAttending) {
      textLines.push(`🎟 *Pases confirmados:* ${confirmedPasses}`);
    }

    if (customMessage.trim()) {
      textLines.push(`💬 *Mensaje personal:* ${customMessage.trim()}`);
    }

    const encoded = encodeURI(textLines.join('\n'));
    const url = `https://wa.me/${eventData.rsvp.whatsappNumber}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-14 px-4 max-w-xl mx-auto text-center">
      <div className="p-6 sm:p-9 rounded-3xl bg-[#14151e] border-2 border-amber-400/40 shadow-2xl relative overflow-hidden">
        
        <span className="text-xs uppercase tracking-wider text-amber-400 font-nemer whitespace-nowrap">
          Confirmación de Asistencia
        </span>
        <h2 className="font-nemer text-2xl sm:text-3xl text-stone-100 font-bold tracking-wide mt-1 mb-2">
          ¿Nos acompañas en esta gran noche?
        </h2>
        <p className="text-stone-300 text-xs sm:text-sm font-montserrat mb-7">
          Por favor confirma antes del <strong className="text-amber-300">{eventData.rsvp.deadline}</strong>.
        </p>

        {/* SOLID COLOR ATTENDANCE BUTTONS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {/* YES BUTTON */}
          <button
            type="button"
            onClick={() => setAttending('yes')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              attending === 'yes'
                ? 'bg-[#d4af37] text-stone-950 font-black border-2 border-[#fff0a8] shadow-[0_4px_20px_rgba(212,175,55,0.45)]'
                : 'bg-[#1e202d] text-stone-300 font-bold border border-stone-700 hover:bg-[#282a3b]'
            }`}
          >
            <CheckCircle className={`w-6 h-6 ${attending === 'yes' ? 'text-stone-950 stroke-[2.5]' : 'text-stone-400'}`} />
            <span className="text-xs sm:text-sm font-nemer tracking-wide whitespace-nowrap">
              Sí, asistiré
            </span>
          </button>

          {/* NO BUTTON */}
          <button
            type="button"
            onClick={() => setAttending('no')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              attending === 'no'
                ? 'bg-[#dc2626] text-white font-black border-2 border-red-300 shadow-[0_4px_20px_rgba(220,38,38,0.45)]'
                : 'bg-[#1e202d] text-stone-300 font-bold border border-stone-700 hover:bg-[#282a3b]'
            }`}
          >
            <XCircle className={`w-6 h-6 ${attending === 'no' ? 'text-white stroke-[2.5]' : 'text-stone-400'}`} />
            <span className="text-xs sm:text-sm font-nemer tracking-wide whitespace-nowrap">
              No podré asistir
            </span>
          </button>
        </div>

        {/* Passes selector (if attending) */}
        {attending === 'yes' && defaultPasses > 1 && (
          <div className="mb-5 text-left bg-black/60 p-3.5 rounded-2xl border border-stone-800 font-montserrat">
            <label className="text-xs text-stone-300 block mb-1.5 font-medium whitespace-nowrap">
              Confirmar número de asistentes (Máx. {defaultPasses} pases):
            </label>
            <select
              value={confirmedPasses}
              onChange={(e) => setConfirmedPasses(Number(e.target.value))}
              className="w-full bg-[#181a24] border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            >
              {Array.from({ length: defaultPasses }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Persona' : 'Personas'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dedication textarea */}
        <div className="mb-6 text-left font-montserrat">
          <label className="text-xs text-stone-300 block mb-1.5 font-medium">
            Dedicatoria o felicitación para Nemer (opcional):
          </label>
          <textarea
            rows="2"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="¡Muchas felicidades Nemer por tus 50 años! Ahí estaremos..."
            className="w-full bg-black/60 border border-stone-800 rounded-2xl p-3 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400 placeholder:text-stone-600"
          />
        </div>

        {/* SOLID WHATSAPP GREEN BUTTON */}
        <button
          onClick={handleWhatsAppSend}
          className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-stone-950 font-montserrat font-black text-sm sm:text-base tracking-wide shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_10px_30px_rgba(37,211,102,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-[#86efac]"
        >
          <MessageCircle className="w-5 h-5 text-stone-950 stroke-[2.5] shrink-0" />
          <span className="whitespace-nowrap uppercase tracking-wider">
            Confirmar Asistencia vía WhatsApp
          </span>
        </button>
      </div>
    </section>
  );
}
