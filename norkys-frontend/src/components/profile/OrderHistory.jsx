import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { translations } from '../../utils/translations';
import OrderDetail from './OrderDetail'; // <-- IMPORTADO

export default function OrderHistory({ onBack, isLoggedIn, brandColor, idioma }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState(null); // <-- Pedido activo a detallar

  const t = translations[idioma];

  useEffect(() => {
    if (isLoggedIn) {
      fetchPedidosReales();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchPedidosReales = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // CORREGIDO: Ya traemos de manera explícita la cantidad, el precio unitario y las salsas de la BD
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          detalle_pedidos (
            id,
            producto_id,
            cantidad,
            precio_unitario,
            salsas_seleccionadas,
            productos (
              nombre,
              imagen_url
            )
          )
        `)
        .eq('usuario_id', user.id)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (err) {
      console.error("Error cargando pedidos reales:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (estado) => {
    const config = {
      'En Preparación': { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', icon: Clock },
      'En Camino': { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500', icon: Clock },
      'Entregado': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', icon: CheckCircle2 },
      'Cancelado': { bg: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500', icon: XCircle }
    };

    const s = config[estado] || config['En Preparación'];
    const labelTranslated = idioma === 'en' 
      ? (estado === 'En Preparación' ? 'Preparing' : estado === 'En Camino' ? 'On the way' : estado === 'Entregado' ? 'Delivered' : 'Cancelled')
      : estado;

    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold shrink-0 ${s.bg}`}>
        <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
        <span>{labelTranslated}</span>
      </div>
    );
  };

    if (selectedOrder) {
        return (
        <OrderDetail 
            pedido={selectedOrder}
            onBack={() => setSelectedOrder(null)} // Regresa a la lista
            brandColor={brandColor}
            idioma={idioma}
        />
        );
    }

  return (
    <div className="scroll-container-norkys flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0 mb-6">
        <button 
          onClick={onBack}
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white active:scale-95 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider">
          {t.pedidos.toUpperCase()}
        </h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 py-20 font-bold animate-pulse">
          Cargando tu historial...
        </div>
      ) : pedidos.length === 0 ? (
        /* VISTA DE HISTORIAL VACÍO */
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
          <span className="text-5xl mb-3">🍗</span>
          <p className="font-bold text-center">No tienes pedidos anteriores</p>
          <p className="text-xs text-gray-400 text-center mt-1">¡Tus compras en la app aparecerán registradas aquí!</p>
        </div>
      ) : (
        /* LISTADO DE COMPRAS REALES */
        <div className="px-6 flex flex-col gap-4">
          {pedidos.map((ped) => {
            const date = new Date(ped.creado_en);
            const formattedDate = date.toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-PE', {
              day: 'numeric', month: 'long', year: 'numeric'
            });

            // Extraemos la foto real del primer producto comprado en este pedido mediante el Join de Supabase
            const firstItemImg = ped.detalle_pedidos?.[0]?.productos?.imagen_url;

            return (
              <div 
                key={ped.id}
                className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center justify-between gap-4 transition-all hover:scale-[1.01] hover:shadow-md"
              >
                {/* Foto del Pollo real comprado */}
                <img 
                  src={firstItemImg || 'https://vgy.me/f9bDSW.png'} 
                  alt="Pollo Comprado" 
                  className="w-16 h-16 object-cover rounded-2xl bg-gray-50 shrink-0 border border-gray-100" 
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-800 text-sm truncate">
                    {idioma === 'en' ? 'Order' : 'Pedido'} #{ped.id}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-bold mt-0.5">{formattedDate}</p>
                  
                  <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] mt-1.5">
                    <CreditCard size={12} className="text-[#2E7D32]" />
                    <span>{ped.metodo_pago} (S/ {ped.total.toFixed(2)})</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {renderStatusBadge(ped.estado_pedido)}
                  <button 
                        onClick={() => setSelectedOrder(ped)} // <-- CONECTADO EL CLIC
                        style={{ backgroundColor: brandColor }}
                        className="px-4 py-1.5 rounded-full text-white text-[10px] font-black shadow-sm active:scale-95 transition-transform cursor-pointer"
                    >
                        {idioma === 'en' ? 'Details' : 'Ver Detalles'}
                    </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}