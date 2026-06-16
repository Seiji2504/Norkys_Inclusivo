import React from 'react';
import { ChevronLeft, CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { translations } from '../../utils/translations';

export default function OrderDetail({ pedido, onBack, brandColor, idioma }) {
  const t = translations[idioma];

  // LOGICA DE DATOS MOCK DE RESPALDO (Por si el pedido no tiene productos reales en Supabase)
  const getMockDetails = (id) => {
    const mockDetailsMap = {
      1234: [
        {
          id: 1,
          cantidad: 1,
          precio_unitario: 94.90,
          salsas_seleccionadas: 'Mayonesa, Ají Norkys, Vinagreta',
          productos: {
            nombre: 'Combinado Familiar',
            imagen_url: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8dd?auto=format&fit=crop&w=150&q=80'
          }
        }
      ],
      1233: [
        {
          id: 2,
          cantidad: 1,
          precio_unitario: 28.50,
          salsas_seleccionadas: 'Ketchup, Vinagreta',
          productos: {
            nombre: 'Mostrito',
            imagen_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=150&q=80'
          }
        }
      ],
      1232: [
        {
          id: 3,
          cantidad: 1,
          precio_unitario: 15.90,
          salsas_seleccionadas: 'Mostaza',
          productos: {
            nombre: 'Norkys Burger',
            imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'
          }
        }
      ]
    };
    return mockDetailsMap[id] || [];
  };

  // Traemos los detalles reales de Supabase, o los mock de respaldo si es un pedido del PDF
  const items = pedido.detalle_pedidos && pedido.detalle_pedidos.length > 0 
    ? pedido.detalle_pedidos 
    : getMockDetails(pedido.id);

  const date = new Date(pedido.creado_en);
  const formattedDate = date.toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-PE', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const renderStatus = (estado) => {
    const config = {
      'En Preparación': { text: 'En Preparación', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
      'En Camino': { text: 'En Camino', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Clock },
      'Entregado': { text: 'Entregado', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
      'Cancelado': { text: 'Cancelado', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: XCircle }
    };
    const s = config[estado] || config['En Preparación'];
    const Icon = s.icon;

    const textTranslated = idioma === 'en'
      ? (estado === 'En Preparación' ? 'Preparing' : estado === 'En Camino' ? 'On the way' : estado === 'Entregado' ? 'Delivered' : 'Cancelled')
      : s.text;

    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold text-xs ${s.color}`}>
        <Icon size={16} />
        <span>{textTranslated}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0 mb-6">
        <button 
          onClick={onBack}
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white active:scale-95 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center pr-10 text-xl font-black text-gray-800 tracking-wider uppercase">
          {idioma === 'en' ? 'ORDER DETAILS' : 'DETALLE DEL PEDIDO'}
        </h2>
      </div>

      {/* Info General del Pedido */}
      <div className="px-6 shrink-0 mb-6">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-black text-gray-800 text-lg">
              {idioma === 'en' ? 'Order' : 'Pedido'} #{pedido.id}
            </span>
            {renderStatus(pedido.estado_pedido)}
          </div>
          <p className="text-xs text-gray-400 font-bold mt-1">{formattedDate}</p>
          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs mt-2">
            <CreditCard size={14} className="text-[#2E7D32]" />
            <span>{idioma === 'en' ? 'Payment Method' : 'Pago'}: {pedido.metodo_pago}</span>
          </div>
        </div>
      </div>

      {/* Lista de Platos Comprados */}
      <div className="px-6 shrink-0 mb-6">
        <h3 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">
          {idioma === 'en' ? 'Products' : 'Productos'}
        </h3>
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            // CORRECCIÓN DE SEGURIDAD CONTRA STRINGS O UNDEFINED
            const precioUnitario = parseFloat(item.precio_unitario) || 0;
            const cantidad = parseInt(item.cantidad) || 1;
            const totalItem = precioUnitario * cantidad;

            return (
              <div key={item.id} className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-50 flex items-center gap-4">
                <img 
                  src={item.productos?.imagen_url || 'https://vgy.me/f9bDSW.png'} 
                  alt={item.productos?.nombre} 
                  className="w-16 h-16 object-cover rounded-2xl bg-gray-50 border border-gray-100 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm leading-snug">{item.productos?.nombre}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {idioma === 'en' ? 'Qty' : 'Cantidad'}: {cantidad} x S/ {precioUnitario.toFixed(2)}
                  </p>
                  {item.salsas_seleccionadas && (
                    <p className="text-[10px] text-gray-500 font-bold mt-2 bg-orange-50/50 px-2 py-1 rounded-lg border border-orange-100/50 line-clamp-1">
                      🥫 {item.salsas_seleccionadas}
                    </p>
                  )}
                </div>
                <span className="font-black text-gray-800 text-sm shrink-0">
                  S/ {totalItem.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desglose de Totales Reales */}
      <div className="px-6 shrink-0 pb-10">
        <h3 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">
          {idioma === 'en' ? 'Totals' : 'Totales'}
        </h3>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 flex flex-col gap-3">
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>{t.cartOrden}</span>
            <span>S/ {parseFloat(pedido.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>{t.cartImpuestos}</span>
            <span>S/ {parseFloat(pedido.impuestos).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>{t.cartEnvio}</span>
            <span>S/ {parseFloat(pedido.costo_envio).toFixed(2)}</span>
          </div>
          <div className="h-[1px] bg-gray-100 w-full my-1" />
          <div className="flex justify-between text-gray-800 font-black text-lg">
            <span>{t.cartTotal}</span>
            <span style={{ color: brandColor }}>S/ {parseFloat(pedido.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}