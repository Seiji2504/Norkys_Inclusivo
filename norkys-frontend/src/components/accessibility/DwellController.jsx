import { useState, useEffect, useRef } from 'react';

export default function DwellController({ isActive, cursorPos, brandColor }) {
  const [progress, setProgress] = useState(0); 
  const hoverElementRef = useRef(null);
  const timerRef = useRef(null);
  const startPosRef = useRef(null); 
  const graceTicksRef = useRef(0);  

  useEffect(() => {
    if (!isActive || !cursorPos) {
      resetDwell();
      return;
    }

    // 1. --- SCROLL AUTOMÁTICO POR BORDES DE LA PANTALLA (DWELL SCROLL DEFINITIVO) ---
    // Busca cualquier contenedor activo que tenga nuestra clase personalizada
    const scrollableGrid = document.querySelector('.scroll-container-norkys');
    if (scrollableGrid) {
      // SI EL CURSOR ESTÁ EN EL 18% SUPERIOR DE LA PANTALLA -> DESLIZA ARRIBA
      if (cursorPos.y < window.innerHeight * 0.18) {
        scrollableGrid.scrollBy({ top: -12, behavior: 'auto' });
      }
      // SI ESTÁ EN LA ZONA BAJA (JUSTO POR ENCIMA DE LA BARRA VERDE DE 80PX) -> DESLIZA ABAJO
      else if (cursorPos.y > window.innerHeight * 0.65 && cursorPos.y < window.innerHeight - 85) {
        scrollableGrid.scrollBy({ top: 12, behavior: 'auto' });
      }
    }

    // 2. --- CLIC POR PERMANENCIA CON TOLERANCIA DE TEMBLORES ---
    const el = document.elementFromPoint(cursorPos.x, cursorPos.y);
    const clickable = el?.closest('button, a, .cursor-pointer, [onClick]');

    if (clickable) {
      if (!hoverElementRef.current) {
        hoverElementRef.current = clickable;
        startPosRef.current = { x: cursorPos.x, y: cursorPos.y };
        graceTicksRef.current = 0;
        setProgress(0);
        startDwellTimer(clickable);
      } else {
        const dx = cursorPos.x - startPosRef.current.x;
        const dy = cursorPos.y - startPosRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 35) {
          graceTicksRef.current = 0; 
        } else {
          graceTicksRef.current += 1;
          if (graceTicksRef.current > 4) {
            resetDwell();
          }
        }
      }
    } else {
      if (hoverElementRef.current) {
        graceTicksRef.current += 1;
        if (graceTicksRef.current > 4) {
          resetDwell();
        }
      }
    }

  }, [isActive, cursorPos]);

  const startDwellTimer = (targetElement) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let currentProgress = 0;
    timerRef.current = setInterval(() => {
      currentProgress += 5; 
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(timerRef.current);
        targetElement.click(); 
        resetDwell();
      }
    }, 75);
  };

  const resetDwell = () => {
    setProgress(0);
    hoverElementRef.current = null;
    startPosRef.current = null;
    graceTicksRef.current = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isActive || progress === 0) return null;

  const radius = 22; 
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      style={{ 
        left: `${cursorPos.x}px`, 
        top: `${cursorPos.y}px`,
        transform: 'translate(-50%, -50%)'
      }} 
      className="fixed pointer-events-none z-[10000] transition-all duration-75"
    >
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="rgba(255,255,255,0.4)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={brandColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-75"
        />
      </svg>
    </div>
  );
}