import React from 'react';

export default function WaxSeal({ onClick, isOpening }) {
  return (
    <button
      onClick={onClick}
      disabled={isOpening}
      type="button"
      aria-label="Abrir carta de invitación oficial"
      className={`relative z-30 flex items-center justify-center outline-none select-none transition-all duration-500 cursor-pointer ${
        isOpening ? 'scale-125 opacity-0 pointer-events-none' : 'hover:scale-105 active:scale-95 animate-seal-pulse'
      }`}
    >
      {/* Outer Glow */}
      <div className="absolute -inset-2 rounded-full bg-amber-400/30 blur-md pointer-events-none" />

      {/* Wax Seal Circle - Solid Lacre with 3D bevel */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full lacre-seal flex items-center justify-center p-1.5 border-2 border-red-950 shadow-2xl">
        {/* Inner gold border */}
        <div className="w-full h-full rounded-full border border-amber-300/50 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#8a1226] via-[#600b1a] to-[#3a060d] shadow-inner">
          
          {/* Subtle wax reflection */}
          <div className="absolute top-1 left-2 w-7 h-3 rounded-full bg-white/20 blur-[1px] transform -rotate-45 pointer-events-none" />

          {/* Central 50 Años Emblem con carga suave */}
          <img
            src="/assets/icono50anos-opt.png"
            alt="50 Años Nemer"
            loading="eager"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none brightness-110 animate-fadeIn"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          <span className="font-nemer text-[10px] text-amber-200 tracking-wider font-bold drop-shadow mt-[-2px] pointer-events-none">
            NEMER
          </span>
        </div>
      </div>
    </button>
  );
}
