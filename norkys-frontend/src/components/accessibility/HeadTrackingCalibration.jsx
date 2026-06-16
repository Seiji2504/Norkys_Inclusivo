import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Camera, Check } from 'lucide-react';

export default function HeadTrackingCalibration({ onBack, onCalibrationSuccess, brandColor }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'scanning' | 'success'
  const [countdown, setCountdown] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const activeNoseCoords = useRef([]);

  // Cargar dependencias de Google MediaPipe
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  };

  // ENCENDER CÁMARA AUTOMÁTICAMENTE AL MONTAR EL COMPONENTE
  useEffect(() => {
    startPreviewCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startPreviewCamera = async () => {
    try {
      // 1. Cargar dependencias de Google MediaPipe
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');

      // 2. Encender cámara web
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // 3. Inicializar el renderizado del rostro
        initFaceMesh();
      }
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      alert("Por favor, permite el acceso a la cámara para la vista previa.");
    }
  };

  const initFaceMesh = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');

    const faceMesh = new window.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // === LA LÍNEA MÁGICA: Dibuja tu rostro en vivo como fondo del lienzo ===
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        const landmarks = results.multiFaceLandmarks[0];
        const nose = landmarks[4]; // Punta de la nariz
        
        // Capturar coordenadas de calibración solo en fase de escaneo activo
        // El estado 'scanning-active' se activa al pulsar el botón
        if (activeNoseCoords.current && activeNoseCoords.current.active) {
          activeNoseCoords.current.push({ x: nose.x, y: nose.y });
        }

        // --- FEEDBACK VISUAL DE LOS PUNTOS FACIALES ---
        ctx.fillStyle = brandColor;
        // Nariz
        ctx.beginPath();
        ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Ojos
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        ctx.beginPath();
        ctx.arc(leftEye.x * canvas.width, leftEye.y * canvas.height, 3, 0, 2 * Math.PI);
        ctx.arc(rightEye.x * canvas.width, rightEye.y * canvas.height, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    const camera = new window.Camera(video, {
      onFrame: async () => {
        await faceMesh.send({ image: video });
      },
      width: 320,
      height: 240
    });
    
    camera.start();
    setStatus('preview'); // Estado de vista previa lista
  };

  const triggerCalibrationScan = () => {
    setStatus('scanning');
    activeNoseCoords.current = [];
    activeNoseCoords.current.active = true; // Activa la toma de muestras de la nariz
    startCountdown();
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        activeNoseCoords.current.active = false;
        processCalibration();
      }
    }, 1000);
  };

  const processCalibration = () => {
    setStatus('success');
    const coords = activeNoseCoords.current;
    
    let finalNose = { x: 0.5, y: 0.5 }; // Centro por defecto

    if (coords && coords.length > 0) {
      const sumXReal = coords.reduce((acc, p) => acc + p.x, 0);
      const sumYReal = coords.reduce((acc, p) => acc + p.y, 0);
      finalNose = { x: sumXReal / coords.length, y: sumYReal / coords.length };
    }

    const utterance = new SpeechSynthesisUtterance("Calibración completada con éxito. Sensor de nariz activo.");
    utterance.lang = 'es-PE';
    window.speechSynthesis.speak(utterance);

    setTimeout(() => {
      onCalibrationSuccess(finalNose); // Regresa a accesibilidad con el origen
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0">
        <button onClick={onBack} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white"><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider">CALIBRACIÓN</h2>
      </div>

      {/* Recuadro de Cámara */}
      <div className="px-8 mt-6 flex justify-center shrink-0">
        <div className="w-[320px] h-[320px] bg-gray-100 border-4 border-gray-200 rounded-[3rem] shadow-xl flex items-center justify-center overflow-hidden relative">
          
          {status === 'idle' && (
            <div className="flex flex-col items-center text-gray-400 gap-2">
              <Camera size={48} className="animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-wider">Iniciando cámara...</span>
            </div>
          )}
          
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />
          
          <canvas 
            ref={canvasRef} 
            width={320} 
            height={320} 
            className={`w-full h-full object-cover scale-x-[-1] bg-black/5 ${status === 'idle' ? 'hidden' : 'block'}`}
          />

          {countdown !== null && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-8xl font-black animate-ping">{countdown}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="absolute inset-0 bg-green-700/80 flex flex-col items-center justify-center text-white">
              <div className="w-16 h-16 bg-white text-green-700 rounded-full flex items-center justify-center shadow-lg mb-3"><Check size={32} strokeWidth={4} /></div>
              <span className="font-black text-lg uppercase tracking-wide">¡Calibrado!</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 mt-6 shrink-0 pb-10">
        <div className="bg-white rounded-[2rem] shadow-md border border-gray-50 p-6">
          <h3 className="font-black text-gray-800 text-sm uppercase tracking-wide mb-3">Instrucciones de IA:</h3>
          <ul className="text-xs text-gray-500 font-bold space-y-2 leading-relaxed">
            <li>• Centra tu cabeza en el recuadro guiándote del video.</li>
            <li>• La IA detectará tus ojos y la punta de tu nariz.</li>
            <li>• Presiona el botón para iniciar el escaneo de calibración.</li>
            <li>• Quédate quieto mirando al frente durante la cuenta de 3 segundos.</li>
          </ul>
          
          {status === 'preview' ? (
            <button 
              type="button"
              onClick={triggerCalibrationScan} 
              style={{ backgroundColor: brandColor }} 
              className="w-full text-white font-bold py-4 rounded-2xl shadow-lg mt-6 active:scale-95 transition-transform cursor-pointer"
            >
              INICIAR CALIBRACIÓN
            </button>
          ) : status === 'scanning' ? (
            <div className="text-center text-sm font-bold text-gray-400 mt-8 py-3 animate-pulse">
              Mapeando origen de rostro...
            </div>
          ) : status === 'idle' ? (
            <div className="text-center text-sm font-bold text-gray-400 mt-8 py-3 animate-pulse">
              Encendiendo cámara...
            </div>
          ) : (
            <div className="text-center text-sm font-bold text-gray-400 mt-8 py-3 animate-pulse">
              Redirigiendo...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}