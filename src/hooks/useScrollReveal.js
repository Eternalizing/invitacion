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
    const elements = document.querySelectorAll(selector);

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
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
            staggerDelay += 90; // Desfase elegante de 90ms entre elementos consecutivos
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
}

