import { ChevronLeft, CreditCard, ShieldCheck } from 'lucide-react';

export default function SavedPayments({ onBack, brandColor, defaultPayment, onDefaultPaymentChange }) {
  
  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0 mb-6">
        <button onClick={onBack} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white active:scale-95 transition-all"><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider uppercase">MÉTODOS DE PAGO</h2>
      </div>

      <p className="px-6 text-xs text-gray-400 font-bold mb-4 uppercase tracking-wide">Selecciona tu método predeterminado para tus pedidos:</p>

      {/* Tus dos opciones fijas contra entrega (Pág 24 de tu mockup adaptada) */}
      <div className="px-6 shrink-0 mb-8">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          
          {/* Opción 1: Efectivo */}
          <button onClick={() => onDefaultPaymentChange('efectivo')} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#2E7D32] text-xl font-bold">💵</div>
              <div className="text-left">
                <span className="font-black text-gray-700 block text-sm">Efectivo</span>
                <span className="text-[10px] text-gray-400 font-bold">Pagarás al motorizado en efectivo</span>
              </div>
            </div>
            {defaultPayment === 'efectivo' ? (
              <div style={{ backgroundColor: brandColor }} className="px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider">
                Predeterminado
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-gray-200" />
            )}
          </button>

          <div className="h-[1px] bg-gray-100 w-full" />

          {/* Opción 2: Tarjeta POS */}
          <button onClick={() => onDefaultPaymentChange('tarjeta')} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700"><CreditCard size={24} /></div>
              <div className="text-left">
                <span className="font-black text-gray-700 block text-sm">Tarjeta (POS)</span>
                <span className="text-[10px] text-gray-400 font-bold">El motorizado llevará el lector POS</span>
              </div>
            </div>
            {defaultPayment === 'tarjeta' ? (
              <div style={{ backgroundColor: brandColor }} className="px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider">
                Predeterminado
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-gray-200" />
            )}
          </button>

        </div>
      </div>

      <div className="px-6 mt-auto shrink-0 pb-10">
        <div className="bg-[#E8F5E9] border border-green-100 p-6 rounded-[2rem] flex items-start gap-4">
          <div className="text-[#2E7D32] shrink-0 mt-1"><ShieldCheck size={28} /></div>
          <div className="text-xs text-green-800 leading-relaxed">
            <p className="font-black mb-1 uppercase tracking-wide">Compromiso de Seguridad</p>
            <p className="font-semibold">
              El método que selecciones aquí se aplicará automáticamente por defecto en tu Carrito de Compras para ahorrarte pasos, pero podrás cambiarlo en caliente antes de finalizar cada pedido si lo deseas [10].
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}