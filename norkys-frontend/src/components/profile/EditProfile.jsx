import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, User, Phone, Lock, LogOut, Check } from 'lucide-react';
import { translations } from '../../utils/translations';

export default function EditProfile({ onBack, onProfileUpdate, onLogout, brandColor, idioma }) {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState(''); // Opcional para cambiar clave
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = translations[idioma];

  useEffect(() => {
    fetchProfileData();
  }, []);

  // CARGAMOS LOS DATOS ACTUALES DEL USUARIO DE SUPABASE
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email);

      const { data: profile, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (profile) {
        setNombreCompleto(profile.nombre_completo || '');
        setTelefono(profile.telefono || '');
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ACTUALIZACIÓN MULTI-TABLA EN SUPABASE (Auth + Perfiles)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Actualizar tabla personalizada 'perfiles' en la nube
      const { error: profileError } = await supabase
        .from('perfiles')
        .upsert([
          {
            id: user.id,
            nombre_completo: nombreCompleto,
            telefono: telefono,
            rol: 'cliente'
          }
        ]);

      if (profileError) throw profileError;

      // 2. Si el usuario escribió una nueva contraseña de 6 dígitos, la actualizamos en Auth de Supabase
      if (password) {
        if (password.length < 6) {
          throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");
        }
        const { error: authError } = await supabase.auth.updateUser({ password: password });
        if (authError) throw authError;
      }

      // Notificamos el éxito a App.jsx para que actualice el header en caliente
      onProfileUpdate();
      alert("¡Perfil actualizado con éxito! 🍗");
      onBack(); // Regresa al menú de perfil

    } catch (err) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#FDFBF7] flex items-center justify-center text-gray-400 font-bold animate-pulse">
        Cargando tus datos...
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0 mb-6">
        <button onClick={onBack} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white active:scale-95 transition-all"><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center pr-10 text-xl font-black text-gray-800 tracking-wider uppercase">
          {t.editarPerfil}
        </h2>
      </div>

      {/* Imagen del Perfil */}
      <div className="flex flex-col items-center px-6 mb-6 shrink-0">
        <div className="w-24 h-24 rounded-full border-4 border-[#2E7D32] p-1 shadow-lg bg-[#FDFBF7] overflow-hidden">
          <img 
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${nombreCompleto.replace(/\s+/g, '')}`} 
            alt="Avatar" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSave} className="px-6 space-y-4 flex-1 flex flex-col">
        
        {/* Nombre */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-100 focus-within:border-[#2E7D32] transition-colors">
          <User className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Nombres y Apellidos" 
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            required
            className="w-full outline-none bg-transparent text-gray-700 font-bold text-sm" 
          />
        </div>

        {/* Correo (Lectura únicamente por seguridad) */}
        <div className="bg-gray-100/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 cursor-not-allowed">
          <User className="text-gray-400" size={20} />
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full outline-none bg-transparent text-gray-400 font-bold text-sm cursor-not-allowed" 
          />
        </div>

        {/* Teléfono */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-100 focus-within:border-[#2E7D32] transition-colors">
          <Phone className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Teléfono Celular" 
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            className="w-full outline-none bg-transparent text-gray-700 font-bold text-sm" 
          />
        </div>

        {/* Nueva Contraseña */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border border-gray-100 focus-within:border-[#2E7D32] transition-colors">
          <Lock className="text-gray-400" size={20} />
          <input 
            type="password" 
            placeholder="Nueva contraseña (mínimo 6 caracteres)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full outline-none bg-transparent text-gray-700 font-bold text-sm" 
          />
        </div>

        {/* Botón Guardar */}
        <button 
          type="submit"
          disabled={isSaving}
          style={{ backgroundColor: brandColor }}
          className="w-full text-white py-5 rounded-[2rem] font-black text-md shadow-xl active:scale-95 transition-transform"
        >
          {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>

        {/* Botón de Cerrar Sesión del Mockup */}
        <button 
          type="button"
          onClick={onLogout}
          className="w-full bg-red-50 text-red-500 py-4 rounded-[2rem] font-bold text-sm border border-red-100 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>

      </form>

    </div>
  );
}