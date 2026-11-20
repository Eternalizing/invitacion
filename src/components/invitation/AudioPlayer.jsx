import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = forwardRef(function AudioPlayer(
  { src = '/assets/musica-gala.mp3', isChristmas = false, showButton = true },
  ref
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const userSilencedRef = useRef(false);
  const hasStartedRef = useRef(false);

  const targetVolume = isChristmas ? 0.4 : 0.6;

  const startPlayback = () => {
    const audio = audioRef.current;
    if (!audio || userSilencedRef.current) return;

    audio.muted = false;
    audio.volume = targetVolume;
    audio.loop = true;

    if (!audio.paused) {
      hasStartedRef.current = true;
      setIsPlaying(true);
      setIsMuted(false);
      return;
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          hasStartedRef.current = true;
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    } else {
      hasStartedRef.current = true;
      setIsPlaying(true);
      setIsMuted(false);
    }
  };

  useImperativeHandle(ref, () => ({
    start: startPlayback,
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = targetVolume;
    audio.loop = true;

    const onPlay = () => {
      hasStartedRef.current = true;
      setIsPlaying(true);
    };
    const onPause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // Pausar si la pestaña se oculta y reanudar al volver (si ya había iniciado y no fue silenciada)
    const handleVisibility = () => {
      if (!audioRef.current) return;
      if (document.hidden) {
        audioRef.current.pause();
      } else if (hasStartedRef.current && !userSilencedRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      document.removeEventListener('visibilitychange', handleVisibility);
      audio.pause();
    };
  }, [src, targetVolume]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused && !isMuted) {
      userSilencedRef.current = true;
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
    } else {
      userSilencedRef.current = false;
      startPlayback();
    }
  };

  const soundEnabled = !isMuted;

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] select-none transition-all duration-500 ${
        showButton ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
      }`}
      aria-hidden={!showButton}
    >
      <audio ref={audioRef} loop playsInline preload="auto" src={src} />

      <button
        onClick={toggleMute}
        type="button"
        tabIndex={showButton ? 0 : -1}
        aria-label={
          soundEnabled
            ? isChristmas
              ? 'Silenciar música navideña'
              : 'Silenciar música de gala'
            : isChristmas
            ? 'Activar música navideña'
            : 'Activar música de gala'
        }
        title={soundEnabled ? 'Silenciar música' : 'Activar música'}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.65)] transition-all duration-300 active:scale-90 cursor-pointer border ${
          soundEnabled
            ? isChristmas
              ? 'bg-gradient-to-br from-[#D42426] via-[#B91C1C] to-[#7F1D1D] text-white border-[#FFF0CD]/70 shadow-[0_6px_22px_rgba(212,36,38,0.5)]'
              : 'bg-gradient-to-br from-[#F0DDA7] via-[#C9A34E] to-[#9E7B2F] text-[#17120A] border-[#FFF0CD]/80 shadow-[0_6px_22px_rgba(201,163,78,0.5)]'
            : 'bg-[#18181B]/95 text-[#C9C2B4] border-[#51432A] hover:border-[#DDB967] hover:text-[#FFF0CD]'
        }`}
      >
        {soundEnabled ? (
          <Volume2 className={`w-5 h-5 shrink-0 ${isPlaying ? 'animate-pulse' : ''}`} />
        ) : (
          <VolumeX className="w-5 h-5 shrink-0" />
        )}
      </button>
    </div>
  );
});

export default AudioPlayer;
