import { useState } from 'react';
import { ChevronLeft, Type, Contrast, Baseline, RefreshCw } from 'lucide-react';

export default function Accessibility({ settings, onChange, onBack, brandColor }) {
  const [idioma, setIdioma] = useState('es');

  // Helper con medidas fijas en PX para evitar que las barras se deformen
  const renderSegments = (levels, current) => {
    return (
      <div className="flex gap-1 shrink-0">
        {Array.from({ length: levels }).map((_, i) => {
          const isActive = i < current;
          return (
            <div
              key={i}
              style={{ width: '28px', height: '8px' }} // Medida fija en px
              className={`rounded-sm transition-all ${isActive ? 'bg-[#3E3432]' : 'bg-gray-200'}`}
            />
          );
        })}
      </div>
    );
  };

  const cycleTextSize = () => {
    onChange({ ...settings, textSize: settings.textSize === 4 ? 1 : settings.textSize + 1 });
  };

  const cycleContrast = () => {
    onChange({ ...settings, contrast: settings.contrast === 4 ? 1 : settings.contrast + 1 });
  };

  const toggleDyslexia = () => {
    onChange({ ...settings, dyslexia: !settings.dyslexia });
  };

  const cycleLineSpacing = () => {
    onChange({ ...settings, lineSpacing: settings.lineSpacing === 3 ? 1 : settings.lineSpacing + 1 });
  };

  const handleReset = (e) => {
    e.stopPropagation();
    onChange({
      textSize: 1,
      contrast: 1,
      dyslexia: false,
      lineSpacing: 1,
      headCursor: false
    });
    setIdioma('es');
  };

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0">
        <button 
          onClick={onBack}
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 hover:bg-white active:scale-95 transition-all border border-gray-100"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider">
          ACCESIBILIDAD
        </h2>
      </div>

      {/* Idioma */}
      <div className="px-6 mt-6 shrink-0">
        <h3 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">Idioma:</h3>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          
          <button onClick={() => setIdioma('es')} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-gray-400 bg-gray-100 p-2 rounded-lg">ES</span>
              <span className="font-bold text-gray-700">Español</span>
            </div>
            {idioma === 'es' && (
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">✓</div>
            )}
          </button>

          <div className="h-[1px] bg-gray-100 w-full" />

          <button onClick={() => setIdioma('en')} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-gray-400 bg-gray-100 p-2 rounded-lg">EN</span>
              <span className="font-bold text-gray-700">Inglés</span>
            </div>
            {idioma === 'en' && (
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">✓</div>
            )}
          </button>
        </div>
      </div>

      {/* Preferencias */}
      <div className="px-6 mt-6 shrink-0">
        <h3 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">Preferencias (Presiona la fila):</h3>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          
          {/* Fila Tamaño de Texto */}
          <div 
            onClick={cycleTextSize}
            className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-xl px-2 active:scale-[0.98] transition-all gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-700"><Type size={22} strokeWidth={2.5} /></div>
              <span className="font-bold text-gray-700 text-[15px]">Tamaño de Texto</span>
            </div>
            {renderSegments(4, settings.textSize)}
          </div>

          <div className="h-[1px] bg-gray-100 w-full" />

          {/* Fila Contrastes */}
          <div 
            onClick={cycleContrast}
            className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-xl px-2 active:scale-[0.98] transition-all gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-700"><Contrast size={22} strokeWidth={2.5} /></div>
              <span className="font-bold text-gray-700 text-[15px]">Contrastes / Daltonismo</span>
            </div>
            {renderSegments(4, settings.contrast)}
          </div>

          <div className="h-[1px] bg-gray-100 w-full" />

          {/* Fila Dislexia Amigable */}
          <div 
            onClick={toggleDyslexia}
            className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-xl px-2 active:scale-[0.98] transition-all gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="font-black text-gray-700 text-lg leading-none tracking-tighter w-6">AZ</span>
              <span className="font-bold text-gray-700 text-[15px]">Dislexia Amigable</span>
            </div>
            {renderSegments(2, settings.dyslexia ? 2 : 1)}
          </div>

          <div className="h-[1px] bg-gray-100 w-full" />

          {/* Fila Interlineado */}
          <div 
            onClick={cycleLineSpacing}
            className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-xl px-2 active:scale-[0.98] transition-all gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-700"><Baseline size={22} strokeWidth={2.5} /></div>
              <span className="font-bold text-gray-700 text-[15px]">Interlineado</span>
            </div>
            {renderSegments(3, settings.lineSpacing)}
          </div>

        </div>
      </div>

      {/* Botón Restablecer */}
      <div className="flex justify-center mt-6 shrink-0">
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 bg-white rounded-full px-8 py-3.5 shadow-md border border-gray-100 font-bold text-gray-700 active:scale-95 transition-transform"
        >
          <RefreshCw size={18} className="text-gray-500" />
          Restablecer
        </button>
      </div>

      {/* Switch Cabeza Blindado en PX */}
      <div className="px-6 mt-6 shrink-0 pb-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <p className="font-bold text-gray-700 leading-tight pr-6">
            Cursor con movimiento de cabeza
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onChange({ ...settings, headCursor: !settings.headCursor });
            }}
            style={{ 
              backgroundColor: settings.headCursor ? brandColor : '#d1d5db',
              width: '56px', // Blindado en PX
              height: '32px'  // Blindado en PX
            }}
            className="rounded-full p-1 transition-colors duration-300 flex justify-start shrink-0 cursor-pointer"
          >
            <div 
              style={{ width: '24px', height: '24px' }} // Blindado en PX
              className={`bg-white rounded-full shadow-md transition-all ${settings.headCursor ? 'translate-x-6' : 'translate-x-0'}`} 
            />
          </button>
        </div>
      </div>

    </div>
  );
}