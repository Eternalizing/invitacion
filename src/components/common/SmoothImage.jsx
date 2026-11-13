import React, { useState, useRef, useEffect } from 'react';

/**
 * SmoothImage: Componente de imagen con desvanecimiento suave (fade-in)
 * Evita el parpadeo brusco (flash/flicker) al cargar imágenes y fotos.
 * Detecta automáticamente si la imagen ya está en la memoria caché del navegador.
 */
export default function SmoothImage({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  ...props
}) {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Si la imagen ya fue cargada por el navegador o viene de la caché:
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onLoad={(e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
      }}
      className={`transition-all duration-700 ease-out will-change-[opacity,filter,transform] ${
        isLoaded ? 'opacity-100 filter-none scale-100' : 'opacity-0 blur-[3px] scale-[0.98]'
      } ${className}`}
      {...props}
    />
  );
}

