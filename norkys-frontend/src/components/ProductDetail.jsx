import { useState, useEffect } from 'react';
import { ChevronLeft, Star, Minus, Plus, Check } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Conectamos a tu BD

export default function ProductDetail({ producto, onBack }) {
  const [subView, setSubView] = useState('detail'); // 'detail' | 'addons'
  const [cantidad, setCantidad] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Estados para adicionales traídos de Supabase
  const [complementos, setComplementos] = useState([]);
  const [aditivos, setAditivos] = useState([]);
  const [selectedComps, setSelectedComps] = useState([]);
  const [selectedAds, setSelectedAds] = useState([]);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      // Traemos los complementos (categoría_id = 3 en tu BD)
      const { data: compData } = await supabase
        .from('productos')
        .select('*')
        .eq('categoria_id', 3);
      setComplementos(compData || []);

      // Traemos los aditivos (Mayonesa, Ketchup, etc.)
      const { data: adData } = await supabase
        .from('aditivos')
        .select('*');
      setAditivos(adData || []);
    } catch (err) {
      console.error('Error cargando aditivos:', err);
    }
  };

  const handleOrderClick = () => {
    if (subView === 'detail') {
      // Si está en detalle, pasa a la pestaña de aditivos
      setSubView('addons');
    } else {
      // Si ya está en aditivos, agrega al carrito y vuelve al home con animación
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onBack(); // Te manda al Home
      }, 2000);
    }
  };

  // Popularidad dinámica según el rating
  const ratingScale = producto.rating ? parseFloat(producto.rating) : 5.0;
  const popularityPercent = Math.min(100, Math.max(10, (ratingScale / 5) * 100));

  // Simulación de imágenes para aditivos (como no tienen en la BD por ahora)
  const getAditivoImg = (nombre) => {
    const imgs = {
      'Mayonesa': 'https://vgy.me/gI44gO.png',
      'Ketchup': 'https://vgy.me/pX8rD0.png',
      'Mostaza': 'https://vgy.me/Yc3VjD.png',
      'Vinagreta': 'https://vgy.me/XG0FkE.png'
    };
    return imgs[nombre] || 'https://vgy.me/gI44gO.png';
  };

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-24 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Toast de Éxito Flotante */}
      {showSuccessToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-[#2E7D32] text-white px-6 py-4 rounded-full shadow-2xl z-[100] flex items-center gap-3 animate-bounce">
          <div className="bg-white text-[#2E7D32] p-1 rounded-full"><Check size={16} strokeWidth={3} /></div>
          <span className="font-bold">¡Pollo agregado al carrito!</span>
        </div>
      )}

      {/* Botón de Atrás */}
      <div className="absolute top-8 left-6 z-20">
        <button 
          onClick={subView === 'addons' ? () => setSubView('detail') : onBack} 
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 hover:bg-white active:scale-95 transition-all border border-gray-100"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Imagen del Producto - RECTANGULAR Y GRANDE */}
      <div className="h-72 w-full flex items-center justify-center px-6 mt-16 shrink-0 bg-[#FDFBF7]">
        <img 
          src={producto.imagen_url} 
          alt={producto.nombre} 
          className="w-full h-full object-cover rounded-[2rem] shadow-md transition-transform duration-500 hover:scale-105" 
        />
      </div>

      {/* Info del Producto */}
      <div className="px-8 mt-4 relative z-10 flex-1 flex flex-col">
        <h2 className="text-3xl font-black text-gray-800 mb-1 leading-tight">
          {producto.nombre}
        </h2>
        
        {/* Rating e Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-xl border border-orange-100">
            <Star className="text-orange-400 fill-orange-400" size={16} />
            <span className="font-bold text-orange-700 text-sm">{producto.rating}</span>
          </div>
          <span className="text-gray-400 font-bold text-sm">26 mins</span>
        </div>

        {/* CONTENIDO CONDICIONAL SEGÚN LA SUB-VISTA */}
        {subView === 'detail' ? (
          /* ================= SUB-VISTA: DETALLE ORIGINAL ================= */
          <div className="flex flex-col flex-1">
            <p className="text-gray-500 leading-relaxed text-[14px] mb-6 h-28 overflow-y-auto no-scrollbar shrink-0">
              {producto.descripcion_completa || producto.descripcion}
            </p>

            {/* Popularidad y Cantidad */}
            <div className="flex justify-between items-center mb-8 gap-6 shrink-0 mt-auto">
              {/* Popularidad Dinámica */}
              <div className="flex-1">
                <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Popularidad</p>
                <div className="relative w-full h-2.5 bg-gray-200/70 rounded-full">
                   <div 
                     className="absolute top-0 left-0 h-full bg-[#2E7D32] rounded-full transition-all duration-1000"
                     style={{ width: `${popularityPercent}%` }}
                   />
                   <div 
                     className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-[#2E7D32] rounded-full shadow-md transition-all duration-1000"
                     style={{ left: `calc(${popularityPercent}% - 8px)` }}
                   />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold">
                   <span className="text-gray-400 uppercase">Poca</span>
                   <span className="text-[#2E7D32] uppercase font-black">Mucha</span>
                </div>
              </div>

              {/* Cantidad */}
              <div className="flex flex-col items-center shrink-0">
                <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Cantidad</p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-lg font-black text-gray-800 w-4 text-center">{cantidad}</span>
                  <button 
                    onClick={() => setCantidad(cantidad + 1)}
                    className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= SUB-VISTA: PESTAÑA DE ADITIVOS (NUEVO) ================= */
          <div className="flex flex-col flex-1 animate-in fade-in duration-300">
            
            {/* Sección Complementos */}
            <div className="mb-4">
              <h3 className="text-sm font-black text-gray-800 mb-2 uppercase tracking-wide">Complementos</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {complementos.map((comp) => {
                  const isSelected = selectedComps.includes(comp.id);
                  return (
                    <div 
                      key={comp.id}
                      onClick={() => setSelectedComps(prev => isSelected ? prev.filter(id => id !== comp.id) : [...prev, comp.id])}
                      className={`w-24 bg-white rounded-2xl shadow-sm border p-2 flex flex-col items-center relative cursor-pointer shrink-0 transition-all ${isSelected ? 'border-[#2E7D32] scale-95 ring-2 ring-green-100' : 'border-gray-100'}`}
                    >
                      <img src={comp.imagen_url} alt={comp.nombre} className="w-12 h-12 object-cover rounded-xl mb-6" />
                      <div className={`absolute bottom-0 left-0 right-0 text-[9px] font-bold py-1 px-2 rounded-b-2xl flex justify-between items-center transition-colors ${isSelected ? 'bg-[#2E7D32] text-white' : 'bg-[#3E3432] text-white'}`}>
                        <span className="truncate w-14">{comp.nombre}</span>
                        <div className={`p-0.5 rounded-full ${isSelected ? 'bg-white text-[#2E7D32]' : 'bg-green-600 text-white'}`}>
                          <Plus size={8} strokeWidth={4} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección Aditivos */}
            <div className="mb-6">
              <h3 className="text-sm font-black text-gray-800 mb-2 uppercase tracking-wide">Aditivos</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {aditivos.map((ad) => {
                  const isSelected = selectedAds.includes(ad.id);
                  return (
                    <div 
                      key={ad.id}
                      onClick={() => setSelectedAds(prev => isSelected ? prev.filter(id => id !== ad.id) : [...prev, ad.id])}
                      className={`w-24 bg-white rounded-2xl shadow-sm border p-2 flex flex-col items-center relative cursor-pointer shrink-0 transition-all ${isSelected ? 'border-[#2E7D32] scale-95 ring-2 ring-green-100' : 'border-gray-100'}`}
                    >
                      <img src={getAditivoImg(ad.nombre)} alt={ad.nombre} className="w-12 h-12 object-contain mb-6" />
                      <div className={`absolute bottom-0 left-0 right-0 text-[9px] font-bold py-1 px-2 rounded-b-2xl flex justify-between items-center transition-colors ${isSelected ? 'bg-[#2E7D32] text-white' : 'bg-[#3E3432] text-white'}`}>
                        <span className="truncate w-14">{ad.nombre}</span>
                        <div className={`p-0.5 rounded-full ${isSelected ? 'bg-white text-[#2E7D32]' : 'bg-green-600 text-white'}`}>
                          <Plus size={8} strokeWidth={4} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Footer Común: Precio y Botón */}
        <div className="flex items-center gap-3 mt-auto shrink-0 pb-6">
          <div className="flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total</span>
            <div className="bg-[#FDFBF7] text-[#2E7D32] font-black text-2xl">
              S/ {(producto.precio * cantidad).toFixed(2)}
            </div>
          </div>
          <button 
            onClick={handleOrderClick}
            className="flex-1 bg-[#2E7D32] text-white py-5 rounded-[2rem] font-black text-md shadow-xl tracking-wider active:scale-95 transition-transform hover:bg-[#1b5e20] flex items-center justify-center gap-2"
          >
            {subView === 'detail' ? 'ORDENA AHORA' : 'AGREGAR AL CARRITO'}
          </button>
        </div>

      </div>
    </div>
  );
}