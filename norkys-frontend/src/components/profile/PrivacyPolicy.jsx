import { ChevronLeft, ShieldAlert, Eye, Camera, Check } from 'lucide-react';

export default function PrivacyPolicy({ onBack, brandColor, idioma }) {
  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0 mb-6">
        <button onClick={onBack} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white active:scale-95 transition-all"><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider uppercase text-sm">
          {idioma === 'en' ? 'PRIVACY POLICY' : 'POLÍTICA DE PRIVACIDAD'}
        </h2>
      </div>

      {/* Contenido Legal Adaptable (Español / Inglés) */}
      <div className="px-6 flex flex-col gap-6 shrink-0 pb-10">
        
        {/* Banner de Compromiso de Privacidad */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm flex items-start gap-4">
          <div className="text-[#2E7D32] shrink-0 mt-1"><ShieldAlert size={28} /></div>
          <div>
            <h3 className="font-black text-gray-800 text-sm mb-1 uppercase tracking-wide">
              {idioma === 'en' ? 'Our Commitment' : 'Nuestro Compromiso'}
            </h3>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              {idioma === 'en' 
                ? 'We protect your data and ensure that our accessibility tools respect your complete privacy.' 
                : 'Protegemos tus datos y nos aseguramos de que nuestras herramientas de accesibilidad respeten tu completa intimidad.'}
            </p>
          </div>
        </div>

        {/* Sección 1: Cámara y Privacidad (Crucial para la tesis) */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 text-[#2E7D32]">
            <Camera size={22} />
            <h4 className="font-black text-gray-800 text-sm uppercase tracking-wide">
              {idioma === 'en' ? 'Camera and Face Tracking' : 'Uso de Cámara y Rostro'}
            </h4>
          </div>
          <p className="text-xs text-gray-500 font-bold leading-relaxed">
            {idioma === 'en' 
              ? 'To activate the head-movement cursor, the application uses your device\'s front camera. We guarantee that all image processing is done locally in your browser. No video, photo, or biometric data is ever sent, stored, or processed on external servers.'
              : 'Para activar el cursor por movimiento de cabeza, la aplicación utiliza la cámara frontal de tu dispositivo. Garantizamos que todo el procesamiento de imagen se realiza de forma local en tu navegador. Ningún video, foto o dato biométrico es enviado, almacenado ni procesado en servidores externos.'}
          </p>
          <div className="flex items-center gap-2 text-green-700 text-xs font-bold bg-green-50 p-3 rounded-2xl">
            <Check size={16} strokeWidth={3} />
            <span>{idioma === 'en' ? '100% local processing' : 'Procesamiento 100% local en tu dispositivo'}</span>
          </div>
        </div>

        {/* Sección 2: Micrófono y Dictado */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 text-[#2E7D32]">
            <Eye size={22} />
            <h4 className="font-black text-gray-800 text-sm uppercase tracking-wide">
              {idioma === 'en' ? 'Microphone and Voice Search' : 'Uso del Micrófono y Voz'}
            </h4>
          </div>
          <p className="text-xs text-gray-500 font-bold leading-relaxed">
            {idioma === 'en' 
              ? 'We use the microphone to convert your voice commands into text search. The browser converts voice to text locally. The text is processed safely to help you navigate, but your raw voice audio is never recorded or saved.'
              : 'Utilizamos el micrófono para convertir tus comandos de voz en texto. El navegador convierte tu voz en texto de manera local. El texto se procesa de forma segura para ayudarte a navegar, pero tu audio de voz crudo nunca es grabado ni guardado.'}
          </p>
        </div>

      </div>

    </div>
  );
}