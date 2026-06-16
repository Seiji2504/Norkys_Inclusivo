import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Trash2, X, MapPin, ShoppingCart } from 'lucide-react'; // <-- IMPORTADO ShoppingCart DE LUCIDE
import { supabase } from '../../supabaseClient';
import { translations } from '../../utils/translations'; 

export default function Cart({ cart, onRemoveItem, onClearCart, onBackToHome, brandColor, defaultPayment, idioma }) {
  const t = translations[idioma]; 

  const [paymentMethod, setPaymentMethod] = useState(defaultPayment || 'efectivo');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [direcciones, setDirecciones] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  const impuestos = subtotal > 0 ? 0.30 : 0.00; 
  const costoEnvio = subtotal > 0 ? 1.50 : 0.00; 
  const total = subtotal > 0 ? subtotal + impuestos + costoEnvio : 0;

  useEffect(() => {
    fetchDireccionesCarrito();
  }, []);

  const fetchDireccionesCarrito = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('direcciones')
          .select('*')
          .eq('id_usuario', user.id); // Ajustado a tu estructura
        
        setDirecciones(data || []);
        if (data && data.length > 0) {
          setSelectedAddressId(data[0].id); 
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayNow = async () => {
    if (cart.length === 0) return alert(t.cartVacio);
    
    if (direcciones.length === 0) {
      alert(idioma === 'en' ? "Please add a delivery address in your profile before checking out 🏡" : "Por favor, agrega una dirección de delivery en tu perfil antes de ordenar 🏡");
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([
          {
            usuario_id: user.id,
            direccion_id: selectedAddressId, 
            metodo_pago: paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta (POS)',
            estado_pedido: 'En Preparación',
            subtotal: subtotal,
            impuestos: impuestos,
            costo_envio: costoEnvio,
            total: total
          }
        ])
        .select();

      if (pedidoError) throw pedidoError;

      const nuevoPedidoId = pedidoData[0].id;

      const detalles = cart.map(item => ({
        pedido_id: nuevoPedidoId,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        salsas_seleccionadas: item.aditivos ? item.aditivos.join(', ') : ''
      }));

      const { error: detallesError } = await supabase
        .from('detalle_pedidos')
        .insert(detalles);

      if (detallesError) throw detallesError;

      // Lanzar notificación push
      const notifSaved = localStorage.getItem('norkys-notifications');
      const notifSettings = notifSaved ? JSON.parse(notifSaved) : { pedidos: true };

      if (notifSettings.pedidos && "Notification" in window && Notification.permission === "granted") {
        new Notification("🍗 Norky's Inclusivo", {
          body: idioma === 'en' ? `Your order #${nuevoPedidoId} is on the way!` : `¡Tu pedido #${nuevoPedidoId} ya está en camino!`,
          icon: 'https://vgy.me/f9bDSW.png'
        });
      }

      setShowSuccess(true);

    } catch (err) {
      console.error("Error al procesar compra:", err.message);
      alert("Hubo un problema al guardar tu compra en el servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onClearCart(); 
    onBackToHome(); 
  };

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 animate-in fade-in scroll-container-norkys">
        {/* CORREGIDO: Usamos el ícono oficial de Lucide de forma nativa */}
        <ShoppingCart size={48} className="mb-2 text-gray-300 animate-pulse" />
        <p className="font-bold text-center">{t.cartVacio}</p>
        <p className="text-xs text-gray-400 text-center mt-1">{t.cartVacioSub}</p>
      </div>
    );
  }

  return (
    <div className="scroll-container-norkys flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in fade-in">
      
      <div className="pt-8 px-6 mb-4 shrink-0">
        <h2 className="text-2xl font-black text-gray-800 tracking-wider text-center uppercase">{t.cartTitulo}</h2>
      </div>

      <div className="px-6 flex flex-col gap-3 shrink-0 max-h-52 overflow-y-auto no-scrollbar mb-4">
        {cart.map((item) => (
          <div key={item.producto.id} className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
            <div className="flex items-center gap-3">
              <img src={item.producto.imagen_url} alt={item.producto.nombre} className="w-12 h-12 object-cover rounded-xl" />
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{item.producto.nombre}</h4>
                <p className="text-xs text-gray-400">{idioma === 'en' ? 'Qty' : 'Cantidad'}: {item.cantidad}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-black text-gray-700 text-sm">S/ {(item.producto.precio * item.cantidad).toFixed(2)}</span>
              <button onClick={() => onRemoveItem(item.producto.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 shrink-0 mb-4">
        <h3 className="text-xs font-black text-gray-400 mb-2 uppercase tracking-wide">
          {idioma === 'en' ? 'Send to:' : 'Enviar a:'}
        </h3>
        {direcciones.length === 0 ? (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-[11px] font-bold text-red-500">
            {idioma === 'en' 
              ? '⚠️ You do not have saved delivery addresses. Go to your Profile to add one before paying.' 
              : '⚠️ No tienes direcciones de delivery guardadas. Ve a tu Perfil para agregar una antes de pagar.'}
          </div>
        ) : (
          <div className="relative">
            <select 
              value={selectedAddressId || ''} 
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 font-bold text-gray-700 text-xs outline-none cursor-pointer appearance-none pl-10"
            >
              {direcciones.map(dir => (
                <option key={dir.id} value={dir.id}>
                  {dir.titulo} - {dir.direccion_exacta}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E7D32]"><MapPin size={16} /></div>
          </div>
        )}
      </div>

      <div className="px-6 shrink-0 mb-4">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 flex flex-col gap-3">
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>{t.cartOrden}</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>{t.cartImpuestos}</span>
            <span>S/ {impuestos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>{t.cartEnvio}</span>
            <span>S/ {costoEnvio.toFixed(2)}</span>
          </div>
          <div className="h-[1px] bg-gray-100 w-full my-1" />
          <div className="flex justify-between text-gray-800 font-black text-lg">
            <span>{t.cartTotal}</span>
            <span style={{ color: brandColor }}>S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="px-6 shrink-0 mb-6">
        <h3 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">{t.cartMetodo}</h3>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 flex flex-col gap-4">
          <button onClick={() => setPaymentMethod('efectivo')} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#2E7D32]"><span className="text-lg font-bold">💵</span></div>
              <div className="text-left">
                <span className="font-bold text-gray-700 block text-sm">{idioma === 'en' ? 'Cash' : 'Efectivo'}</span>
                <span className="text-[10px] text-gray-400 font-bold">
                  {idioma === 'en' ? 'Pay the delivery driver in cash' : 'Paga al motorizado en efectivo'}
                </span>
              </div>
            </div>
            {paymentMethod === 'efectivo' && <div style={{ backgroundColor: brandColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
          </button>
          <div className="h-[1px] bg-gray-100 w-full" />
          <button onClick={() => setPaymentMethod('tarjeta')} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700"><CreditCard size={20} /></div>
              <div className="text-left">
                <span className="font-bold text-gray-700 block text-sm">{idioma === 'en' ? 'Card (POS)' : 'Tarjeta (POS)'}</span>
                <span className="text-[10px] text-gray-400 font-bold">
                  {idioma === 'en' ? 'The delivery driver will carry the POS reader' : 'El motorizado llevará el lector POS'}
                </span>
              </div>
            </div>
            {paymentMethod === 'tarjeta' && <div style={{ backgroundColor: brandColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
          </button>
        </div>
      </div>

      <div className="px-6 mt-auto shrink-0 pb-6 flex items-center gap-3">
        <div className="flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t.cartTotal}</span>
          <div style={{ color: brandColor }} className="font-black text-2xl transition-colors">
            S/ {total.toFixed(2)}
          </div>
        </div>
        <button 
          onClick={handlePayNow}
          disabled={isProcessing || direcciones.length === 0}
          style={{ backgroundColor: brandColor }}
          className="flex-1 text-white py-5 rounded-[2rem] font-black text-md shadow-xl tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 cursor-pointer"
        >
          {isProcessing ? t.procesando : t.cartPagar}
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#2E7D32]">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-3">{t.cartExito}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
              {t.cartExitoSub}
            </p>
            <button onClick={handleCloseSuccess} style={{ backgroundColor: brandColor }} className="w-full text-white py-4 rounded-full font-black text-md shadow-lg active:scale-95 transition-all cursor-pointer">{t.cartRegresar}</button>
          </div>
        </div>
      )}

    </div>
  );
}