import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * GlowingCard: Contenedor con borde dorado y haz de luz continuo e infinito (Border Beam).
 * Un resplandor dorado metálico recorre el perímetro de la tarjeta en un bucle continuo de 360°,
 * respetando las esquinas redondeadas y el fondo del tema.
 */
const GlowingCard = forwardRef(function GlowingCard(
  {
    children,
    className = '',
    innerClassName = '',
    as: Component = 'section',
    glowDuration = '4.5s',
    showAmbientGlow = true,
    ...props
  },
  ref
) {
  const { isLight } = useTheme();

  return (
    <Component
      ref={ref}
      className={`relative w-full rounded-3xl p-[1.5px] overflow-hidden transition-all duration-500 z-10 ${className}`}
      {...props}
    >
      {/* 1. Halo difuminado ambiental exterior que acompaña al haz de luz */}
      {showAmbientGlow && (
        <div
          className="absolute top-1/2 left-1/2 w-[260%] min-w-[700px] aspect-square animate-border-beam pointer-events-none blur-md opacity-60 z-0 select-none"
          style={{
            background: isLight
              ? 'conic-gradient(from 0deg, transparent 0deg, transparent 65deg, rgba(221,185,103,0.3) 80deg, #FFF0CD 98deg, #FFFFFF 104deg, #DDB967 114deg, rgba(221,185,103,0.3) 126deg, transparent 140deg, transparent 360deg)'
              : 'conic-gradient(from 0deg, transparent 0deg, transparent 65deg, rgba(201,163,78,0.3) 80deg, #F0DDA7 98deg, #FFFFFF 104deg, #C9A34E 114deg, rgba(201,163,78,0.3) 126deg, transparent 140deg, transparent 360deg)',
            animationDuration: glowDuration,
          }}
        />
      )}

      {/* 2. Haz de luz dorado nítido que recorre el perímetro continuamente */}
      <div
        className="absolute top-1/2 left-1/2 w-[260%] min-w-[700px] aspect-square animate-border-beam pointer-events-none z-0 select-none"
        style={{
          background: isLight
            ? 'conic-gradient(from 0deg, transparent 0deg, transparent 65deg, rgba(221,185,103,0.35) 80deg, #FFF0CD 98deg, #FFFFFF 104deg, #DDB967 112deg, rgba(221,185,103,0.35) 124deg, transparent 138deg, transparent 360deg)'
            : 'conic-gradient(from 0deg, transparent 0deg, transparent 65deg, rgba(201,163,78,0.35) 80deg, #F0DDA7 98deg, #FFFFFF 104deg, #C9A34E 112deg, rgba(201,163,78,0.35) 124deg, transparent 138deg, transparent 360deg)',
          animationDuration: glowDuration,
        }}
      />

      {/* 3. Marco metálico estático base sutil para cuando el haz pasa por otro extremo */}
      <div
        className={`absolute inset-0 rounded-3xl border pointer-events-none z-10 transition-colors duration-500 ${
          isLight ? 'border-[#706044]/65' : 'border-[#51432A]/75'
        }`}
      />

      {/* 4. Cuerpo interior de la tarjeta: enmascara el centro y aloja el contenido con su fondo y sombra */}
      <div
        className={`relative w-full h-full rounded-[calc(1.5rem-1.5px)] backdrop-blur-md z-10 transition-all duration-500 ${
          isLight
            ? 'bg-[#33312C] shadow-[0_15px_40px_rgba(0,0,0,0.65)]'
            : 'bg-[#151515] shadow-[0_15px_40px_rgba(0,0,0,0.85)]'
        } ${innerClassName}`}
      >
        {children}
      </div>
    </Component>
  );
});

export default GlowingCard;

