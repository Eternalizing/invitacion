import { useEffect } from 'react';

/**
 * Revelado cinemático de elementos al hacer scroll:
 * - Detección suave con IntersectionObserver.
 * - Desfase en cascada automático (stagger) si varios elementos entran a la vez.
 * - Se observa una sola vez por elemento para máximo rendimiento y fluidez en móviles.
 */
export function useScrollReveal(enabled) {
  useEffect(() => {
    if (!enabled) return;

    const selector = '.reveal:not(.is-visible), .reveal-soft:not(.is-visible), .reveal-scale:not(.is-visible)';

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(selector).forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let staggerDelay = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            // Si varios elementos entran juntos al campo visual, escalonar su aparición
            if (!el.style.transitionDelay && staggerDelay > 0) {
              el.style.transitionDelay = `${staggerDelay}ms`;
            }

            el.classList.add('is-visible');
            observer.unobserve(el);
            staggerDelay += 80; // Desfase elegante de 80ms entre elementos consecutivos
          }
        });
      },
      { threshold: 0.02, rootMargin: '120px 0px 80px 0px' }
    );

    const observeAll = () => {
      document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    };

    observeAll();

    // Re-verificar para elementos que terminen de renderizarse o calcular altura
    const t1 = setTimeout(observeAll, 300);
    const t2 = setTimeout(observeAll, 800);

    // Fallback de seguridad: garantiza que ningún contenido quede oculto en móviles
    const tSafety = setTimeout(() => {
      document.querySelectorAll(selector).forEach((el) => el.classList.add('is-visible'));
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tSafety);
      observer.disconnect();
    };
  }, [enabled]);
}

