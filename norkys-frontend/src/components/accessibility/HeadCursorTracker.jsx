import { useEffect, useRef } from 'react';

export default function HeadCursorTracker({ isActive, calibrationData, onUpdateCursor }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Filtro de paso bajo para limpiar el ruido del sensor de la cámara
  const smoothNoseRef = useRef(null);

  useEffect(() => {
    if (!isActive || !calibrationData) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      smoothNoseRef.current = null;
      return;
    }

    const initTracker = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 160, height: 120, facingMode: 'user' } 
        });
        streamRef.current = stream;
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        videoRef.current = video;

        let currentX = window.innerWidth / 2;
        let currentY = window.innerHeight / 2;

        const faceMesh = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results) => {
          if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            const nose = results.multiFaceLandmarks[0][4]; // Punta de la nariz (Landmark 4)

            // 1. --- FILTRO DIGITAL DE PASO BAJO (EMA) SOBRE EL SENSOR DE LA CÁMARA ---
            // Absorbe el 90% del ruido de estática de la webcam antes de calcular nada
            if (!smoothNoseRef.current) {
              smoothNoseRef.current = { x: nose.x, y: nose.y };
            } else {
              smoothNoseRef.current.x = smoothNoseRef.current.x + (nose.x - smoothNoseRef.current.x) * 0.10;
              smoothNoseRef.current.y = smoothNoseRef.current.y + (nose.y - smoothNoseRef.current.y) * 0.10;
            }

            // 2. CÁLCULO DE DESVÍO CON LA SEÑAL YA LIMPIA Y PURIFICADA
            const dx = smoothNoseRef.current.x - calibrationData.x;
            const dy = smoothNoseRef.current.y - calibrationData.y;

            // 3. FACTORES DE ESCALA (Sensibilidad cómoda)
            const sensitivityX = 6.0; 
            const sensitivityY = 8.0; 

            // 4. MAPEO ABSOLUTO DIRECTO (Ya no tiembla porque la señal de origen está limpia)
            const targetX = (window.innerWidth / 2) - (dx * window.innerWidth * sensitivityX);
            const targetY = (window.innerHeight / 2) + (dy * window.innerHeight * sensitivityY);

            // 5. INTERPOLACIÓN DE SALIDA MÁS RÁPIDA (Evita retrasos o lag de movimiento)
            currentX = currentX + (targetX - currentX) * 0.35;
            currentY = currentY + (targetY - currentY) * 0.35;

            // Restringimos los límites físicos de la pantalla
            currentX = Math.max(0, Math.min(window.innerWidth, currentX));
            currentY = Math.max(0, Math.min(window.innerHeight, currentY));

            onUpdateCursor({ x: currentX, y: currentY });
          }
        });

        const camera = new window.Camera(video, {
          onFrame: async () => {
            await faceMesh.send({ image: video });
          },
          width: 160,
          height: 120
        });

        camera.start();

      } catch (err) {
        console.error("Error en el tracker de MediaPipe:", err);
      }
    };

    initTracker();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, calibrationData, onUpdateCursor]);

  return null;
}