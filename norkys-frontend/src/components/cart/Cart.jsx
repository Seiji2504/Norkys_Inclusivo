import { useState } from 'react';
import { CreditCard, CheckCircle2, Trash2, X } from 'lucide-react';
import { supabase } from '../../supabaseClient'; // Conectado a la base de datos

export default function Cart({ cart, onRemoveItem, onClearCart, onBackToHome, brandColor, defaultPayment }) {
  const [paymentMethod, setPaymentMethod] = useState(defaultPayment || 'efectivo');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  const impuestos = subtotal > 0 ? 0.30 : 0.00; 
  const costoEnvio = subtotal > 0 ? 1.50 : 0.00; 
  const total = subtotal > 0 ? subtotal + impuestos + costoEnvio : 0;

  // REGISTRAR COMPRA REAL EN SUPABASE + LANZAR NOTIFICACIÓN PUSH REAL DEL SISTEMA
  const handlePayNow = async () => {
    if (cart.length === 0) return alert("Tu carrito está vacío 🍗");
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Inicia sesión para poder procesar tu pedido.");
        return;
      }

      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([
          {
            usuario_id: user.id,
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

      // --- LANZAR NOTIFICACIÓN PUSH REAL DE WINDOWS/ANDROID/MACOS ---
      const notifSaved = localStorage.getItem('norkys-notifications');
      const notifSettings = notifSaved ? JSON.parse(notifSaved) : { pedidos: true };

      if (notifSettings.pedidos && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("🍗 Norky's Inclusivo", {
            body: `¡Tu pedido #${nuevoPedidoId} ya está en preparación! Llegará en 15-30 minutos.`,
            icon: 'https://vgy.me/f9bDSW.png'
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("🍗 Norky's Inclusivo", {
                body: `¡Tu pedido #${nuevoPedidoId} ya está en preparación! Llegará en 15-30 minutos.`,
                icon: 'https://vgy.me/f9bDSW.png'
              });
            }
          });
        }
      }

      // Si todo sale bien, abre el modal de éxito (Pág 12)
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
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 animate-in fade-in">
        <ShoppingCartIcon size={48} className="mb-2 text-gray-300" />
        <p className="font-bold text-center">Tu carrito de compras está vacío</p>
        <p className="text-xs text-gray-400 text-center mt-1">¡Ve a la carta y ordena un delicioso pollo!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in fade-in">
      
      <div className="pt-8 px-6 mb-4 shrink-0">
        <h2 className="text-2xl font-black text-gray-800 tracking-wider text-center uppercase">Resumen del Pedido</h2>
      </div>

      <div className="px-6 flex flex-col gap-3 shrink-0 max-h-56 overflow-y-auto no-scrollbar mb-4">
        {cart.map((item) => (
          <div key={item.producto.id} className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
            <div className="flex items-center gap-3">
              <img src={item.producto.imagen_url} alt={item.producto.nombre} className="w-12 h-12 object-cover rounded-xl animate-in" />
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{item.producto.nombre}</h4>
                <p className="text-xs text-gray-400">Cantidad: {item.cantidad}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-black text-gray-700 text-sm">S/ {(item.producto.precio * item.cantidad).toFixed(2)}</span>
              <button onClick={() => onRemoveItem(item.producto.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 shrink-0 mb-4">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 flex flex-col gap-3">
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>Orden</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>Impuestos</span>
            <span>S/ {impuestos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 font-bold text-sm">
            <span>Gastos de Envío</span>
            <span>S/ {costoEnvio.toFixed(2)}</span>
          </div>
          <div className="h-[1px] bg-gray-100 w-full my-1" />
          <div className="flex justify-between text-gray-800 font-black text-lg">
            <span>Total</span>
            <span style={{ color: brandColor }}>S/ {total.toFixed(2)}</span>
          </div>
          <p className="text-center text-xs text-gray-400 font-bold mt-2">Tiempo estimado de delivery: 15 - 30mins</p>
        </div>
      </div>

      <div className="px-6 shrink-0 mb-6">
        <h3 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">Métodos de Pago (Contra entrega):</h3>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 flex flex-col gap-4">
          
          <button onClick={() => setPaymentMethod('efectivo')} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#2E7D32]"><span className="text-lg font-bold">💵</span></div>
              <div className="text-left">
                <span className="font-bold text-gray-700 block text-sm">Efectivo</span>
                <span className="text-[10px] text-gray-400 font-bold">Paga al motorizado en efectivo</span>
              </div>
            </div>
            {paymentMethod === 'efectivo' && <div style={{ backgroundColor: brandColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
          </button>

          <div className="h-[1px] bg-gray-100 w-full" />

          <button onClick={() => setPaymentMethod('tarjeta')} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700"><CreditCard size={20} /></div>
              <div className="text-left">
                <span className="font-bold text-gray-700 block text-sm">Tarjeta (POS)</span>
                <span className="text-[10px] text-gray-400 font-bold">El motorizado llevará el lector POS</span>
              </div>
            </div>
            {paymentMethod === 'tarjeta' && <div style={{ backgroundColor: brandColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
          </button>
        </div>
      </div>

      <div className="px-6 mt-auto shrink-0 pb-6 flex items-center gap-3">
        <div className="flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total</span>
          <div style={{ color: brandColor }} className="font-black text-2xl transition-colors">
            S/ {total.toFixed(2)}
          </div>
        </div>
        <button 
          onClick={handlePayNow}
          disabled={isProcessing}
          style={{ backgroundColor: brandColor }}
          className="flex-1 text-white py-5 rounded-[2rem] font-black text-md shadow-xl tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {isProcessing ? 'PROCESANDO...' : 'PAGUE AHORA'}
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#2E7D32]">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-3">¡ Éxito !</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
              Tu pago se realizó con éxito.<br/>
              Se ha enviado un recibo de esta compra a tu correo electrónico.
            </p>
            <button 
              onClick={handleCloseSuccess}
              style={{ backgroundColor: brandColor }}
              className="w-full text-white py-4 rounded-full font-black text-md shadow-lg active:scale-95 transition-all"
            >
              Regresar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function ShoppingCartIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}