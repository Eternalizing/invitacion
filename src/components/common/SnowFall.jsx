import React, { useEffect, useRef } from 'react';

/**
 * SnowFall: Efecto de nieve cayendo a 60 FPS fluidos en móviles y escritorio.
 * Sin shadowBlur en Canvas (que ralentiza GPUs móviles), usando halos suaves dibujados directo.
 */
export default function SnowFall({ className = '', intensity = 'medium' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const isMobile = width < 768;
    const count =
      intensity === 'dense'
        ? isMobile
          ? 48
          : 105
        : intensity === 'light'
        ? isMobile
          ? 24
          : 50
        : isMobile
        ? 36
        : 80;

    function createFlake(w, h, randomY = false) {
      const isGold = Math.random() < 0.08;
      const radius = isGold ? Math.random() * 1.6 + 1.0 : Math.random() * 2.4 + 0.9;
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -10 - Math.random() * 20,
        radius,
        speed: (radius / 2.4) * 38 + 22, // px por segundo (consistente en 60Hz y 120Hz)
        windDrift: Math.random() * 14 - 4,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 1.1 + 0.5,
        opacity: Math.random() * 0.5 + 0.35,
        isGold,
      };
    }

    const flakes = Array.from({ length: count }, () => createFlake(width, height, true));

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.swayAngle += f.swaySpeed * dt;
        f.x += (Math.sin(f.swayAngle) * 18 + f.windDrift) * dt;
        f.y += f.speed * dt;

        // Halo suave opcional sin shadowBlur (0 penalización en GPU móvil)
        if (f.radius > 2.0 || f.isGold) {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * 1.85, 0, Math.PI * 2);
          ctx.fillStyle = f.isGold
            ? `rgba(221, 185, 103, ${f.opacity * 0.22})`
            : `rgba(255, 255, 255, ${f.opacity * 0.16})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = f.isGold
          ? `rgba(255, 224, 130, ${f.opacity})`
          : `rgba(255, 255, 255, ${f.opacity})`;
        ctx.fill();

        if (f.y > height + 12 || f.x < -20 || f.x > width + 20) {
          flakes[i] = createFlake(width, height, false);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
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
