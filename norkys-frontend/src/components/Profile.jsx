import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Accessibility, 
  CreditCard, 
  MapPin, 
  Bell, 
  HelpCircle, 
  Lock, 
  LogOut 
} from 'lucide-react';

// <-- AGREGAMOS "onNavigate" a las propiedades del componente
export default function Profile({ isLoggedIn, user, onLogin, onLogout, onBack, onNavigate }) {
  
  const menuOptions = [
    { id: 'pedidos', label: 'Mis Pedidos', icon: FileText },
    { id: 'accesibilidad', label: 'Accesibilidad', icon: Accessibility },
    { id: 'pago', label: 'Método de pago', icon: CreditCard },
    { id: 'direccion', label: 'Dirección', icon: MapPin },
    { id: 'notificaciones', label: 'Notificaciones y Sonidos', icon: Bell },
    { id: 'faq', label: 'Preguntas Frecuentes', icon: HelpCircle },
    { id: 'privacidad', label: 'Política de Privacidad', icon: Lock },
  ];

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      
      {/* Cabecera del Perfil */}
      <div className="pt-8 px-6 flex items-center shrink-0">
        <button 
          onClick={onBack}
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 hover:bg-white active:scale-95 transition-all border border-gray-100"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider">
          PERFIL
        </h2>
      </div>

      {/* Tarjeta de Información de Usuario */}
      <div className="flex flex-col items-center px-6 mt-6 shrink-0">
        {/* Foto de Perfil con Anillo Verde */}
        <div className="w-32 h-32 rounded-full border-4 border-[#2E7D32] p-1 shadow-xl shrink-0 bg-[#FDFBF7] overflow-hidden">
          <img 
            /* CORREGIDO: Agregamos la validación extra 'user &&' */
            src={isLoggedIn && user && user.foto ? user.foto : "https://ui-avatars.com/api/?name=Guest+User&background=0D8ABC&color=fff&size=128"} 
            alt="Avatar" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* Nombres y Correo (Logueado vs Invitado) */}
        <h3 className="text-xl font-black text-gray-800 mt-4 text-center">
          {/* CORREGIDO: Validamos que exista 'user' antes de leer para evitar pantallas blancas */}
          {isLoggedIn ? (user?.nombre_completo || 'Cargando...') : 'Usuario Invitado'}
        </h3>
        <p className="text-gray-400 text-sm mt-1 text-center font-medium">
          {isLoggedIn ? (user?.email || 'Cargando...') : 'Inicia sesión para guardar tus pedidos'}
        </p>

        <button 
          onClick={isLoggedIn ? () => alert("Editar perfil en desarrollo...") : onLogin}
          className="mt-6 bg-[#2E7D32] text-white font-bold px-12 py-3 rounded-full shadow-lg hover:bg-[#1b5e20] active:scale-95 transition-transform shrink-0"
        >
          {isLoggedIn ? 'Editar Perfil' : 'Iniciar Sesión'}
        </button>
      </div>

      {/* Menú de Opciones */}
      <div className="px-6 mt-8 shrink-0 pb-10">
        <div className="bg-white rounded-[2.5rem] shadow-md border border-gray-50 p-6 flex flex-col gap-1">
          {menuOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <div key={opt.id}>
                <button 
                  /* <-- CAMBIADO: Ahora llama a la función onNavigate de React */
                  onClick={() => onNavigate(opt.id)}
                  className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-xl transition-colors active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-[#2E7D32]">
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <span className="font-bold text-gray-700 text-[15px]">{opt.label}</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
                {i < menuOptions.length - 1 && (
                  <div className="h-[1px] bg-gray-100 w-full" />
                )}
              </div>
            );
          })}

          {/* Opción Dinámica: Cerrar Sesión */}
          {isLoggedIn && (
            <>
              <div className="h-[1px] bg-gray-100 w-full" />
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-between py-4 px-2 hover:bg-red-50 rounded-xl transition-colors active:scale-[0.98] group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-red-500">
                    <LogOut size={22} strokeWidth={2.2} />
                  </div>
                  <span className="font-bold text-red-500 text-[15px]">Cerrar Sesión</span>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-red-400" />
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}