import React from 'react';

export default function VoiceAssistantOverlay({ brandColor }) {
  return (
    <div className="absolute inset-0 bg-[#FDFBF7] z-50 flex flex-col items-center justify-center pb-24 animate-in fade-in slide-in-from-bottom duration-300">
      
      {/* Estilos CSS en línea para la animación de la onda de audio nativa */}
      <style>{`
        @keyframes audioWave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.2); }
        }
        .wave-bar {
          animation: audioWave 1.2s ease-in-out infinite;
          transform-origin: center;
        }
        .wave-bar-1 { animation-delay: 0.1s; }
        .wave-bar-2 { animation-delay: 0.3s; }
        .wave-bar-3 { animation-delay: 0.6s; }
        .wave-bar-4 { animation-delay: 0.2s; }
        .wave-bar-5 { animation-delay: 0.4s; }
      `}</style>

      {/* Logo de Norky's */}
      <div className="text-center mb-8 shrink-0">
        <h1 
          className="text-5xl font-bold italic transition-colors duration-500" 
          style={{ fontFamily: 'cursive', color: brandColor }}
        >
          Norky's
        </h1>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mt-1">Sabor Inigualable</p>
      </div>

      {/* Mascota del Pollo (Mockup Pág 27) */}
      <div className="w-56 h-56 rounded-full bg-orange-100/50 border-4 border-orange-200 shadow-xl flex items-center justify-center overflow-hidden mb-10 shrink-0">
        <img 
          src="https://vgy.me/f9bDSW.png" // Ilustración amigable del pollo Norky's
          alt="Norkys Mascot" 
          className="w-40 h-40 object-contain"
        />
      </div>

      {/* Texto de estado */}
      <h2 className="text-3xl font-black text-gray-800 mb-6 tracking-wide animate-pulse">
        Escuchando...
      </h2>

      {/* Onda de Audio Animada en PX Fijos para evitar deformaciones (Mockup Pág 27) */}
      <div className="flex items-end justify-center gap-2 h-16 w-48 shrink-0">
        <span style={{ backgroundColor: brandColor, width: '6px', height: '24px' }} className="wave-bar wave-bar-1 rounded-full" />
        <span style={{ backgroundColor: brandColor, width: '6px', height: '48px' }} className="wave-bar wave-bar-2 rounded-full" />
        <span style={{ backgroundColor: brandColor, width: '6px', height: '16px' }} className="wave-bar wave-bar-3 rounded-full" />
        <span style={{ backgroundColor: brandColor, width: '6px', height: '36px' }} className="wave-bar wave-bar-4 rounded-full" />
        <span style={{ backgroundColor: brandColor, width: '6px', height: '12px' }} className="wave-bar wave-bar-5 rounded-full" />
      </div>

    </div>
  );
}