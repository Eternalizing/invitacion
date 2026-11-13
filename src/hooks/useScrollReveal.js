import { useEffect } from 'react';

// Revela suavemente los elementos con la clase "reveal" al entrar en pantalla.
// Se observa una sola vez por elemento para no consumir recursos en móviles.
export function useScrollReveal(enabled) {
  useEffect(() => {
    if (!enabled) return;

    const elements = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
}

