import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeft, Mail, Lock, User, Phone, Check } from 'lucide-react';

export default function Auth({ onBack, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre Login y Registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validación rápida antes de enviar a Supabase
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // ---- REGISTRO EN SUPABASE ----
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData?.user) {
          // CORRECCIÓN: Cambiamos .insert por .upsert para evitar errores 409 Conflict
          const { error: profileError } = await supabase
            .from('perfiles')
            .upsert([
              {
                id: authData.user.id,
                nombre_completo: fullName,
                telefono: phone,
                rol: 'cliente'
              }
            ]);

          if (profileError) throw profileError;
        }

      } else {
        // ---- INICIO DE SESIÓN EN SUPABASE ----
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;
      }

      onAuthSuccess(); // Notifica el éxito a App.jsx

    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error en la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Botón Atrás */}
      <div className="absolute top-8 left-6 z-20">
        <button 
          onClick={onBack} 
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 hover:bg-white active:scale-95 transition-all border border-gray-100"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="px-8 mt-24 flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#2E7D32] italic mb-2" style={{ fontFamily: 'cursive' }}>
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isSignUp ? 'Regístrate para guardar tus pedidos' : '¡Qué bueno verte de vuelta en Norky\'s!'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-500 border border-red-100 p-4 rounded-2xl text-sm font-bold mb-6">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              {/* Campo Nombre Completo (Solo registro) */}
              <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-100 focus-within:border-[#2E7D32] transition-colors">
                <User className="text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Nombre Completo" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full outline-none bg-transparent text-gray-700 font-medium" 
                />
              </div>

              {/* Campo Teléfono (Solo registro) */}
              <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-100 focus-within:border-[#2E7D32] transition-colors">
                <Phone className="text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Teléfono Celular" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full outline-none bg-transparent text-gray-700 font-medium" 
                />
              </div>
            </>
          )}

          {/* Campo Correo */}
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-100 focus-within:border-[#2E7D32] transition-colors">
            <Mail className="text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full outline-none bg-transparent text-gray-700 font-medium" 
            />
          </div>

          {/* Campo Contraseña */}
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-100 focus-within:border-[#2E7D32] transition-colors">
            <Lock className="text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full outline-none bg-transparent text-gray-700 font-medium" 
            />
          </div>

          {/* Botón de Envío */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#2E7D32] text-white py-4 rounded-2xl font-black text-md shadow-lg active:scale-95 transition-all hover:bg-[#1b5e20] flex items-center justify-center gap-2"
          >
            {isLoading ? 'Procesando...' : isSignUp ? 'REGISTRARME' : 'INGRESAR'}
          </button>
        </form>

        {/* Cambiar de Modo (Login / Registro) */}
        <div className="text-center mt-6">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-sm font-bold text-[#2E7D32] hover:underline"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>

      </div>

    </div>
  );
}