import { Heart, Star } from 'lucide-react';

export default function Favorites({ productos, favorites, onProductClick, onToggleFavorite, brandColor }) {
  // Filtramos la lista de productos de Supabase para quedarnos solo con los favoritos
  const favoritosDelUsuario = productos.filter(p => favorites.includes(p.id));

  if (favoritosDelUsuario.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 animate-in fade-in duration-300">
        <Heart size={48} className="mb-2 text-gray-300" />
        <p className="font-bold text-center">Aún no tienes pollos favoritos</p>
        <p className="text-xs text-gray-400 text-center mt-1">¡Presiona el corazón de los productos que más te gusten!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FDFBF7] flex flex-col overflow-y-auto no-scrollbar pb-32 animate-in fade-in duration-300">
      
      {/* Título de la pestaña */}
      <div className="pt-8 px-6 shrink-0 mb-6">
        <h2 className="text-2xl font-black text-gray-800 tracking-wider text-center uppercase">
          Mis Favoritos 🍗
        </h2>
      </div>

      {/* Grid de Favoritos */}
      <div className="scroll-container-norkys px-6 grid grid-cols-2 gap-4 items-start content-start">
        {favoritosDelUsuario.map((prod) => (
          <div 
            key={prod.id} 
            onClick={() => onProductClick(prod)} 
            className="bg-white p-3 rounded-[2.5rem] shadow-sm flex flex-col relative border border-gray-50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-200/60 hover:scale-[1.02] active:-translate-y-1.5 active:shadow-xl active:scale-[1.02] group w-full cursor-pointer"
          >
            <div className="h-32 w-full bg-gray-50 rounded-[2rem] mb-3 overflow-hidden shrink-0">
               <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
            </div>
            
            <div className="min-h-[60px] flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 text-[13px] leading-tight px-1">{prod.nombre}</h3>
                <p className="text-[10px] text-gray-400 leading-tight mt-1 px-1">{prod.descripcion}</p>
            </div>
            
            <div className="flex justify-between items-center mt-3 px-1 pt-2 border-t border-gray-50 shrink-0">
              <span style={{ color: brandColor }} className="font-black text-sm transition-colors duration-500">S/ {prod.precio.toFixed(2)}</span>
              <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                <Star className="text-orange-400" size={10} fill="currentColor" />
                <span className="text-[10px] font-bold text-orange-700">{prod.rating}</span>
              </div>
            </div>

            {/* Corazón Rojo Fijo */}
            <button 
              onClick={(e) => onToggleFavorite(e, prod.id)}
              className="absolute top-5 right-5 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md z-20 border border-gray-100"
            >
              <Heart size={14} className="fill-red-500 text-red-500" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}