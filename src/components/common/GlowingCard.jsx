import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Decoración navideña de esquina (Ramas de pino, hojas de acebo, bayas rojas y esferas doradas)
 */
function ChristmasCornerOrnament({ position = 'left' }) {
  const isRight = position === 'right';
  return (
    <div
      aria-hidden="true"
      className={`absolute -top-3 ${
        isRight ? '-right-1 sm:-right-2 scale-x-[-1]' : '-left-1 sm:-left-2'
      } w-16 h-14 sm:w-24 sm:h-20 pointer-events-none z-30 select-none sm:drop-shadow-[0_4px_10px_rgba(0,0,0,0.75)]`}
    >
      <svg viewBox="0 0 110 85" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M14 26C32 16 58 14 92 20" stroke="#1B5E3A" strokeWidth="3.2" strokeLinecap="round" />
        <path
          d="M16 25C25 10 38 8 52 14M28 21C40 8 56 8 70 15M44 19C58 9 74 10 88 18"
          stroke="#237A4B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M14 28C10 44 10 60 15 76" stroke="#1B5E3A" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M15 32C6 42 5 54 11 66M15 44C7 54 8 66 15 75"
          stroke="#237A4B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M22 23C36 13 54 13 74 19M15 34C9 46 9 58 14 70"
          stroke="#DDB967"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path d="M20 22C28 14 38 15 44 22C37 26 29 27 20 22Z" fill="#155D36" stroke="#DDB967" strokeWidth="0.9" />
        <path d="M18 24C12 32 13 42 20 48C24 41 25 32 18 24Z" fill="#1B6E41" stroke="#DDB967" strokeWidth="0.9" />
        <path d="M28 26L40 42C43 46 38 51 34 47" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M28 26L40 42C43 46 38 51 34 47"
          stroke="#D42426"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="3.5 3.5"
        />
        <circle cx="19" cy="22" r="5" fill="#D42426" />
        <circle cx="17.5" cy="20.5" r="1.5" fill="#FFD1D1" />
        <circle cx="26" cy="18" r="4.2" fill="#B91C1C" />
        <circle cx="24.8" cy="16.8" r="1.2" fill="#FFD1D1" />
        <circle cx="15" cy="29" r="4.4" fill="#E11D48" />
        <circle cx="13.8" cy="27.8" r="1.3" fill="#FFD1D1" />
        <circle cx="25" cy="27" r="4.2" fill="#DDB967" />
        <circle cx="23.7" cy="25.7" r="1.3" fill="#FFF8E1" />
        <path d="M54 11L55.5 15.5L60 17L55.5 18.5L54 23L52.5 18.5L48 17L52.5 15.5L54 11Z" fill="#FFF0CD" />
      </svg>
    </div>
  );
}

/**
 * GlowingCard: Optimizada para 60 FPS en teléfonos móviles (sin backdrop-blur sobre fondos opacos ni blur rotatorio pesado).
 */
const GlowingCard = forwardRef(function GlowingCard(
  {
    children,
    className = '',
    innerClassName = '',
    as: Component = 'section',
    glowDuration = '4.5s',
    showAmbientGlow = true,
    isChristmas = false,
    variant = 'default',
    ...props
  },
  ref
) {
  const { isLight } = useTheme();
  const isCandy = variant === 'candy';

  return (
    <Component ref={ref} className={`relative w-full rounded-3xl ${className}`} {...props}>
      {isChristmas && (
        <>
          <ChristmasCornerOrnament position="left" />
          <ChristmasCornerOrnament position="right" />
        </>
      )}

      <div
        className={`relative w-full h-full rounded-3xl ${
          isCandy ? 'p-[3px]' : 'p-[1.5px]'
        } overflow-hidden transition-colors duration-500 z-10`}
      >
        {isCandy ? (
          <>
            <div
              className="absolute inset-0 pointer-events-none z-0 sm:animate-candy-stripe"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #D42426 0px, #D42426 14px, #FFFFFF 14px, #FFFFFF 28px, #991B1B 28px, #991B1B 42px, #FFF1F2 42px, #FFF1F2 56px)',
                backgroundSize: '79.2px 79.2px',
              }}
            />
            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_10px_rgba(212,36,38,0.5)] pointer-events-none z-10" />
          </>
        ) : (
          <>
            {/* Halo difuminado ambiental solo en pantallas >= sm para mantener 60 FPS en móviles */}
            {showAmbientGlow && (
              <div
                className="hidden sm:block absolute top-1/2 left-1/2 w-[240%] min-w-[680px] aspect-square animate-border-beam pointer-events-none blur-md opacity-55 z-0 select-none"
                style={{
                  background: isChristmas
                    ? 'conic-gradient(from 0deg, transparent 0deg, transparent 55deg, rgba(212,36,38,0.45) 75deg, #FF4D4F 90deg, #FFFFFF 100deg, #FFF0CD 110deg, #DDB967 122deg, rgba(221,185,103,0.35) 135deg, transparent 150deg, transparent 360deg)'
                    : isLight
                    ? 'conic-gradient(from 0deg, transparent 0deg, transparent 65deg, rgba(221,185,103,0.3) 80deg, #FFF0CD 98deg, #FFFFFF 104deg, #DDB967 114deg, rgba(221,185,103,0.3) 126deg, transparent 140deg, transparent 360deg)'
                    : 'conic-gradient(from 0deg, transparent 0deg, transparent 65deg, rgba(201,163,78,0.3) 80deg, #F0DDA7 98deg, #FFFFFF 104deg, #C9A34E 114deg, rgba(201,163,78,0.3) 126deg, transparent 140deg, transparent 360deg)',
                  animationDuration: glowDuration,
                }}
              />
            )}

            {/* Haz de luz giratorio acelerado por GPU */}
            <div
              className="absolute top-1/2 left-1/2 w-[220%] min-w-[440px] sm:min-w-[680px] aspect-square animate-border-beam pointer-events-none z-0 select-none"
              style={{
                background: isChristmas
                  ? 'conic-gradient(from 0deg, transparent 0deg, transparent 55deg, rgba(212,36,38,0.5) 75deg, #FF4D4F 90deg, #FFFFFF 100deg, #FFF0CD 110deg, #DDB967 122deg, rgba(221,185,103,0.4) 135deg, transparent 150deg, transparent 360deg)'
                  : isLight
                  ? 'conic-gradient(from 0deg, transparent 0deg, transparent 65deg, rgba(221,185,103,0.35) 80deg, #FFF0CD 98deg, #FFFFFF 104deg, #DDB967 112deg, rgba(221,185,103,0.35) 124deg, transparent 138deg, transparent 360deg)'
                  : 'conic-gradient(from 0deg, transparent 0deg, transparent 65deg, rgba(201,163,78,0.35) 80deg, #F0DDA7 98deg, #FFFFFF 104deg, #C9A34E 112deg, rgba(201,163,78,0.35) 124deg, transparent 138deg, transparent 360deg)',
                animationDuration: glowDuration,
              }}
            />

            <div
              className={`absolute inset-0 rounded-3xl border pointer-events-none z-10 transition-colors duration-500 ${
                isLight ? 'border-[#706044]/65' : 'border-[#51432A]/75'
              }`}
            />
          </>
        )}

        {/* Cuerpo sólido sin backdrop-blur innecesario para máxima fluidez en móvil */}
        <div
          className={`relative w-full h-full rounded-[calc(1.5rem-2px)] z-10 transition-colors duration-500 ${
            isLight
              ? 'bg-[#33312C] shadow-[0_12px_30px_rgba(0,0,0,0.6)]'
              : 'bg-[#151515] shadow-[0_12px_30px_rgba(0,0,0,0.8)]'
          } ${innerClassName}`}
        >
          {children}
        </div>
      </div>
    </Component>
  );
});

export default GlowingCard;
