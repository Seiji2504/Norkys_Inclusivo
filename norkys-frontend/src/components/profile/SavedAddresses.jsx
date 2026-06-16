import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, Plus, MapPin, Check, Map, Trash2 } from 'lucide-react';

export default function SavedAddresses({ onBack, isLoggedIn, brandColor, idioma }) {
  const [view, setView] = useState('list'); 
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [titulo, setTitulo] = useState('Mi casa');
  const [direccionExacta, setDireccionExacta] = useState('');
  const [referencia, setReferencia] = useState('');
  const [saving, setSaving] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn && view === 'list') {
      fetchDirecciones();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, view]);

  const fetchDirecciones = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('direcciones')
        .select('*')
        .eq('usuario_id', user.id);

      if (error) throw error;
      setDirecciones(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ELIMINAR DIRECCIÓN DE SUPABASE EN CALIENTE (NUEVO)
  const handleDeleteAddress = async (e, id) => {
    e.stopPropagation(); // Evita que interfiera con otros clics
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar esta dirección de delivery? 🏡");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('direcciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Recargar la lista después de eliminar
      fetchDirecciones();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const loadLeaflet = () => {
    return new Promise((resolve) => {
      if (window.L) return resolve();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const initMap = async () => {
    await loadLeaflet();
    const defaultLat = -12.046374;
    const defaultLng = -77.042793;

    if (!mapRef.current) {
      const map = window.L.map('leaflet-map', { zoomControl: false }).setView([defaultLat, defaultLng], 14);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      const marker = window.L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            const cleanAddress = data.display_name.split(',').slice(0, 3).join(',');
            setDireccionExacta(cleanAddress);
          }
        } catch (e) {
          console.error(e);
        }
      });

      mapRef.current = map;
      markerRef.current = marker;
    }
  };

  useEffect(() => {
    if (view === 'add') {
      setTimeout(() => { initMap(); }, 500);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [view]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!direccionExacta) return alert("Por favor, selecciona una ubicación en el mapa.");
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('direcciones')
        .insert([{ usuario_id: user.id, titulo, direccion_exacta: direccionExacta, referencia }]);

      if (error) throw error;
      setView('list'); 
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="scroll-container-norkys flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      <div className="pt-8 px-6 flex items-center shrink-0 mb-6">
        <button onClick={view === 'add' ? () => setView('list') : onBack} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white"><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider uppercase">{view === 'add' ? 'NUEVA DIRECCIÓN' : 'MIS DIRECCIONES'}</h2>
      </div>

      {view === 'list' ? (
        <>
          <div className="px-6 shrink-0 mb-6">
            <button onClick={() => setView('add')} className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer">
              <span className="font-bold text-gray-700 text-sm">Agregar dirección</span>
              <div className="bg-green-600 p-1.5 rounded-full text-white"><Plus size={16} strokeWidth={3} /></div>
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 py-10 font-bold animate-pulse">Cargando direcciones...</div>
          ) : direcciones.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <Map size={48} className="mb-2 text-gray-300 animate-pulse" />
              <p className="font-bold text-center">No tienes direcciones guardadas</p>
              <p className="text-xs text-gray-400 text-center mt-1">¡Agrega una dirección para pedir tu delivery!</p>
            </div>
          ) : (
            <div className="px-6 flex flex-col gap-4">
              {direcciones.map((dir, i) => (
                <div key={dir.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-[#2E7D32] bg-green-50 p-3 rounded-2xl shrink-0"><MapPin size={22} /></div>
                    <div className="min-w-0">
                      <h4 className="font-black text-gray-800 text-sm truncate">{dir.titulo}</h4>
                      <p className="text-xs text-gray-400 font-bold mt-1 leading-tight truncate">{dir.direccion_exacta}</p>
                    </div>
                  </div>
                  
                  {/* Botones de control (Checkmark o Eliminar) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => handleDeleteAddress(e, dir.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                    {i === 0 && <div style={{ backgroundColor: brandColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSaveAddress} className="px-6 flex-1 flex flex-col">
          <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">Arrastra el pin para ubicar tu casa:</p>
          <div id="leaflet-map" className="h-56 w-full rounded-[2.5rem] shadow-md border border-gray-100 shrink-0 z-10" />
          <div className="space-y-4 mt-4 flex-1">
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-50">
              <span className="text-xs font-black text-gray-400 uppercase w-14 shrink-0">Título</span>
              <input type="text" placeholder="Ej: Mi casa..." value={titulo} onChange={(e) => setTitulo(e.target.value)} required className="w-full outline-none bg-transparent text-gray-700 font-bold text-sm" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-start gap-3 border border-gray-50">
              <span className="text-xs font-black text-gray-400 uppercase w-14 shrink-0 mt-1">Dirección</span>
              <textarea placeholder="Mueve el pin de arriba para rellenar..." value={direccionExacta} onChange={(e) => setDireccionExacta(e.target.value)} required rows={2} className="w-full outline-none bg-transparent text-gray-700 font-bold text-sm leading-tight resize-none" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-50">
              <span className="text-xs font-black text-gray-400 uppercase w-14 shrink-0">Ref</span>
              <input type="text" placeholder="Ej: Puerta verde..." value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full outline-none bg-transparent text-gray-700 font-bold text-sm" />
            </div>
          </div>
          <button type="submit" disabled={saving} style={{ backgroundColor: brandColor }} className="w-full text-white py-5 rounded-[2rem] font-black text-md shadow-xl mt-6 active:scale-95 transition-transform">{saving ? 'GUARDANDO...' : 'GUARDAR DIRECCIÓN'}</button>
        </form>
      )}

    </div>
  );
}