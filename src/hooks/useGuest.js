import { useState, useEffect } from 'react';

/**
 * Hook para extraer el nombre del invitado desde la URL.
 * Ejemplos:
 *   ?to=Martha+Villamizar
 *   ?invitado=Dra.+Martha+Villamizar
 *   ?nombre=Martha+Villamizar
 */
export function useGuest() {
  const [guestName, setGuestName] = useState('Martha Villamizar');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawName = params.get('to') || params.get('invitado') || params.get('nombre') || params.get('guest');

    if (rawName) {
      setGuestName(decodeURIComponent(rawName.replace(/\+/g, ' ')));
    }
  }, []);

  return guestName;
}
