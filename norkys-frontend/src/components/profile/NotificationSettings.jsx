import { useState, useEffect } from 'react';
import { ChevronLeft, Bell, BellOff, Volume2, VolumeX, Eye } from 'lucide-react';
import { translations } from '../../utils/translations';

export default function NotificationSettings({ onBack, brandColor, idioma }) {
  const t = translations[idioma];

  // 1. CARGAMOS LAS PREFERENCIAS DESDE LOCALSTORAGE DE FORMA PERSISTENTE
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('norkys-notifications');
    return saved ? JSON.parse(saved) : {
      pedidos: true,
      ofertas: false,
      vibracion: true,
      sonidos: true
    };
  });

  // Guardar en el teléfono cada vez que el usuario cambie un Switch
  useEffect(() => {
    localStorage.setItem('norkys-notifications', JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSwitch = (key) => {
    const isActive = settings[key];
    return (
      <button 
        onClick={() => toggleSetting(key)}
        style={{ 
          backgroundColor: isActive ? brandColor : '#d1d5db',
          width: '56px',
          height: '32px'
        }}
        className="rounded-full p-1 transition-colors duration-300 flex justify-start shrink-0 cursor-pointer"
      >
        <div 
          style={{ width: '24px', height: '24px' }}
          className={`bg-white rounded-full shadow-md transition-all ${isActive ? 'translate-x-6' : 'translate-x-0'}`} 
        />
      </button>
    );
  };

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0 mb-6">
        <button onClick={onBack} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white"><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider uppercase text-sm">
          {t.notificaciones.toUpperCase()}
        </h2>
      </div>

      <div className="px-6 flex flex-col gap-6 shrink-0 pb-10">
        
        {/* Bloque 1: Notificaciones */}
        <div>
          <h3 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">Notificaciones</h3>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            
            {/* Pedidos */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-[#2E7D32]"><Bell size={22} /></div>
                <div className="text-left pr-4">
                  <span className="font-bold text-gray-700 block text-sm">Notificaciones de pedidos</span>
                  <span className="text-[10px] text-gray-400 font-bold leading-none">Recibe alertas sobre el estado de tu pollo brasa</span>
                </div>
              </div>
              {renderSwitch('pedidos')}
            </div>

            <div className="h-[1px] bg-gray-100 w-full" />

            {/* Ofertas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-orange-500"><BellOff size={22} /></div>
                <div className="text-left pr-4">
                  <span className="font-bold text-gray-700 block text-sm">Notificaciones de ofertas</span>
                  <span className="text-[10px] text-gray-400 font-bold leading-none">Sé el primero en enterarte de los cupones y descuentos</span>
                </div>
              </div>
              {renderSwitch('ofertas')}
            </div>

          </div>
        </div>

        {/* Bloque 2: Sonidos */}
        <div>
          <h3 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">Sonidos e Interacciones</h3>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            
            {/* Vibración */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-blue-600"><Eye size={22} /></div>
                <div className="text-left pr-4">
                  <span className="font-bold text-gray-700 block text-sm">Vibración</span>
                  <span className="text-[10px] text-gray-400 font-bold leading-none">Feedback físico háptico al usar el cursor facial o la voz</span>
                </div>
              </div>
              {renderSwitch('vibracion')}
            </div>

            <div className="h-[1px] bg-gray-100 w-full" />

            {/* Sonidos */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-indigo-600"><Volume2 size={22} /></div>
                <div className="text-left pr-4">
                  <span className="font-bold text-gray-700 block text-sm">Sonidos de la app</span>
                  <span className="text-[10px] text-gray-400 font-bold leading-none">Activa efectos sonoros al pulsar los botones</span>
                </div>
              </div>
              {renderSwitch('sonidos')}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}