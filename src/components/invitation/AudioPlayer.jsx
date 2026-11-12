import React, { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio autoplay blocked by browser policy:", err);
      });
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3"
      />

      {/* SOLID COLOR BUTTON */}
      <button
        onClick={togglePlay}
        type="button"
        aria-label="Reproducir o pausar música de fondo"
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-2xl transition-all cursor-pointer ${
          isPlaying
            ? 'bg-[#d4af37] text-stone-950 font-black border-2 border-[#fff0a8] shadow-[0_4px_18px_rgba(212,175,55,0.5)]'
            : 'bg-[#1b1d28] text-stone-300 font-bold border border-stone-700 hover:bg-[#252837]'
        }`}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 text-stone-950 stroke-[2.5] animate-pulse shrink-0" />
            <span className="text-xs font-montserrat tracking-wide whitespace-nowrap">Música ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="text-xs font-montserrat tracking-wide whitespace-nowrap">Música OFF</span>
          </>
        )}
      </button>
    </div>
  );
}
