import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Verificar si viene por parámetro explícito de URL (?theme=grafito o ?theme=negro)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme') || params.get('tema');
      if (urlTheme === 'claro' || urlTheme === 'light' || urlTheme === 'grafito' || urlTheme === 'champan') return 'light';
      if (urlTheme === 'oscuro' || urlTheme === 'dark' || urlTheme === 'negro') return 'dark';
    }

    // Por defecto siempre Paleta 01: Negro y Oro Clásico
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (theme === 'light') {
      // Paleta 02: Grafito y Champán
      root.classList.remove('theme-dark');
      root.classList.add('theme-light');
      document.body.style.backgroundColor = '#242320';
      document.body.style.color = '#FAF6ED';
    } else {
      // Paleta 01: Negro y Oro Clásico
      root.classList.remove('theme-light');
      root.classList.add('theme-dark');
      document.body.style.backgroundColor = '#080808';
      document.body.style.color = '#F5F2EA';
    }

    try {
      localStorage.setItem('nemer_invitacion_theme', theme);
    } catch (e) {
      // Ignorar si cookies/storage restringidos
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isLight = theme === 'light';

  return (
    <ThemeContext.Provider value={{ theme, isLight, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
