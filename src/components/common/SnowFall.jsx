import React, { useEffect, useRef } from 'react';

/**
 * SnowFall: Efecto de nieve cayendo suavemente en Canvas a 60 FPS.
 * Incluye copos blancos cristalinos en distintas capas de profundidad y sutiles destellos dorados.
 */
export default function SnowFall({ className = '', intensity = 'medium' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const count =
      intensity === 'dense'
        ? isMobile
          ? 70
          : 130
        : intensity === 'light'
        ? isMobile
          ? 35
          : 60
        : isMobile
        ? 55
        : 100;

    function createFlake(w, h, randomY = false) {
      const isGold = Math.random() < 0.08;
      const radius = isGold ? Math.random() * 1.8 + 1.0 : Math.random() * 2.8 + 0.9;
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -10 - Math.random() * 25,
        radius,
        speed: (radius / 2.8) * 0.75 + 0.4,
        windDrift: Math.random() * 0.4 - 0.15,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.018 + 0.008,
        opacity: Math.random() * 0.55 + 0.35,
        isGold,
      };
    }

    const flakes = Array.from({ length: count }, () => createFlake(width, height, true));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.swayAngle += f.swaySpeed;
        f.x += Math.sin(f.swayAngle) * 0.65 + f.windDrift;
        f.y += f.speed;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);

        if (f.isGold) {
          ctx.fillStyle = `rgba(255, 224, 130, ${f.opacity})`;
          ctx.shadowColor = 'rgba(221, 185, 103, 0.6)';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
          ctx.shadowBlur = f.radius > 2 ? 5 : 2;
        }

        ctx.fill();

        if (f.y > height + 12 || f.x < -20 || f.x > width + 20) {
          flakes[i] = createFlake(width, height, false);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 15 }}
    />
  );
}
