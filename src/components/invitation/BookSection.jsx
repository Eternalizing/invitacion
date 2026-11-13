import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import GlowingCard from '../common/GlowingCard';
import SmoothImage from '../common/SmoothImage';

export default function BookSection() {
  const { isLight } = useTheme();

  // Coordenadas de partículas doradas flotantes
  const particles = [
    { top: '30%', left: '32%', size: '5px', duration: '4s', delay: '0s' },
    { top: '45%', left: '38%', size: '6px', duration: '5s', delay: '1s' },
    { top: '25%', left: '42%', size: '4px', duration: '3.5s', delay: '0.5s' },
    { top: '60%', left: '35%', size: '5px', duration: '4.8s', delay: '1.5s' },
    { top: '40%', left: '60%', size: '4px', duration: '5.2s', delay: '0.8s' },
    { top: '55%', left: '65%', size: '5px', duration: '4.2s', delay: '2s' },
    { top: '70%', left: '48%', size: '6px', duration: '6s', delay: '1.2s' },
    { top: '20%', left: '55%', size: '4px', duration: '4.5s', delay: '1.8s' },
  ];

  return (
    <GlowingCard
      className="reveal my-8 group"
      innerClassName="overflow-hidden"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 320px' }}
    >
      {/* 1. LUZ AMBIENTAL */}
      <div
        className={`absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-[40px] sm:blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000 ${
          isLight
            ? 'bg-gradient-to-tr from-[#DDB967]/25 via-amber-300/15 to-transparent'
            : 'bg-gradient-to-tr from-[#C9A34E]/25 via-yellow-400/20 to-transparent'
        }`}
      />

      {/* 2. PARTÍCULAS DORADAS FLOTANTES */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          className="particle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            background: isLight
              ? 'radial-gradient(circle, #FFF0CD 10%, #DDB967 50%, transparent 80%)'
              : 'radial-gradient(circle, #F0DDA7 10%, #C9A34E 50%, transparent 80%)',
            boxShadow: isLight
              ? '0 0 8px rgba(221, 185, 103, 0.7)'
              : '0 0 8px rgba(201, 163, 78, 0.7)',
          }}
        />
      ))}

      {/* 3. IMAGEN DEL LIBRO - Proporción 16:9 nítida con desvanecimiento suave */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <SmoothImage
          src="/assets/libro-50anos.jpg"
          alt="Libro Conmemorativo 50 Años"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02]"
        />

        {/* Suaves gradientes de fusión superior e inferior */}
        <div
          className={`absolute inset-x-0 top-0 h-16 pointer-events-none ${
            isLight
              ? 'bg-gradient-to-b from-[#33312C] via-[#33312C]/40 to-transparent'
              : 'bg-gradient-to-b from-[#151515] via-[#151515]/40 to-transparent'
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 h-24 pointer-events-none ${
            isLight
              ? 'bg-gradient-to-t from-[#33312C] via-[#33312C]/75 to-transparent'
              : 'bg-gradient-to-t from-[#151515] via-[#151515]/75 to-transparent'
          }`}
        />

        {/* 4. TEXTO DEL LIBRO */}
        <div className="absolute bottom-4 sm:bottom-5 inset-x-4 text-center z-10 pointer-events-none">
          <h3
            className={`font-serif italic text-base sm:text-xl md:text-2xl font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] tracking-wide ${
              isLight ? 'text-[#FFF0CD]' : 'text-[#F0DDA7]'
            }`}
          >
            50 Años de Historia y Trayectoria
          </h3>
        </div>
      </div>
    </GlowingCard>
  );
}
