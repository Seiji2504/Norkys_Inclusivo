import { Search, SlidersHorizontal, Mic, Heart, Star, X } from 'lucide-react';

export default function HomeContent({
  productosFiltrados,
  activeCategory,
  searchTerm,
  setSearchTerm,
  isListening,
  handleCategoryChange,
  handleProductClick,
  toggleFavorite,
  favorites,
  startSpeechRecognition,
  showFilters,
  setShowFilters,
  onSortChange, 
  brandColor,
  isLoggedIn,
  userData,
  onAvatarClick
}) {
  return (
    <>
      {/* Header */}
      <header className="pt-8 px-6 pb-4 flex justify-between items-center bg-[#FDFBF7] z-10 shrink-0">
        <div className="flex-1 text-center pl-10">
          <h1 
            className="text-4xl font-bold italic transition-colors duration-500" 
            style={{ fontFamily: 'cursive', color: brandColor }}
          >
            Norky's
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Sabor Inigualable</p>
        </div>
        <div 
          onClick={onAvatarClick}
          style={{ borderColor: brandColor }}
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm border-2 shrink-0 cursor-pointer overflow-hidden transition-colors duration-500"
        >
          {isLoggedIn ? <img src={userData?.foto} className="w-full h-full object-cover" /> : 'US'}
        </div>
      </header>

      {/* Buscador */}
      <div className="px-6 flex gap-3 mb-4 shrink-0">
        <div className={`flex-1 bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 border-2 transition-all ${isListening ? 'border-red-400 ring-4 ring-red-50' : 'border-transparent'}`}>
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={isListening ? "Escuchando..." : "Buscar pollo..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none bg-transparent text-gray-700 font-medium" 
          />
          <Mic 
            onClick={startSpeechRecognition}
            className={`cursor-pointer transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#2E7D32]'}`} 
            size={20} 
          />
        </div>
        <button 
          onClick={() => setShowFilters(true)} 
          style={{ backgroundColor: brandColor }}
          className="p-3 rounded-2xl text-white shadow-lg active:scale-90 transition-colors duration-500 shrink-0"
        >
          <SlidersHorizontal size={24} />
        </button>
      </div>

      {/* Categorías */}
      <div className="px-6 flex gap-3 overflow-x-auto pb-4 no-scrollbar shrink-0">
        {['Todo', 'Combos', 'Complementos', 'Ofertas'].map((cat) => (
          <button 
            key={cat} 
            onClick={() => handleCategoryChange(cat)}
            style={{ 
              backgroundColor: activeCategory === cat ? brandColor : '#ffffff',
              color: activeCategory === cat ? '#ffffff' : '#9ca3af',
              borderColor: activeCategory === cat ? brandColor : '#f3f4f6'
            }}
            className="px-6 py-2 rounded-xl font-bold transition-all shadow-sm border whitespace-nowrap cursor-pointer"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Productos */}
      <div className="scroll-container-norkys px-6 grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar pb-32 items-start content-start">
        {productosFiltrados.map((prod) => (
          <div 
            key={prod.id} 
            onClick={() => handleProductClick(prod)} 
            className="bg-white p-3 rounded-[2.5rem] shadow-sm flex flex-col relative border border-gray-50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-200/60 hover:scale-[1.02] active:-translate-y-1.5 active:shadow-xl active:scale-[1.02] group w-full cursor-pointer h-auto"
          >
            <div className="h-[120px] w-full bg-gray-50 rounded-[2rem] mb-3 overflow-hidden shrink-0">
               <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
            </div>
            
            <div className="min-h-fit flex flex-col flex-grow">
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

            <button 
              onClick={(e) => toggleFavorite(e, prod.id)}
              className="absolute top-5 right-5 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md z-20 border border-gray-100 hover:bg-white"
            >
              <Heart 
                size={14} 
                className={favorites.includes(prod.id) ? "fill-red-500 text-red-500" : "text-gray-300"} 
              />
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Filtros (CONECTADOS A LA FUNCIÓN DE ORDENAR REAL) */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center px-4 pb-10">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 relative">
             <button onClick={() => setShowFilters(false)} className="absolute top-6 right-6 text-gray-400 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
             <h2 className="text-2xl font-bold mb-6 text-gray-800">Ordenar por</h2>
             <div className="space-y-3">
               <button onClick={() => { onSortChange('price-asc'); setShowFilters(false); }} className="w-full text-left p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition-colors">Menos a más precio</button>
               <button onClick={() => { onSortChange('price-desc'); setShowFilters(false); }} className="w-full text-left p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition-colors">Mayor a menor precio</button>
               <button onClick={() => { onSortChange('rating'); setShowFilters(false); }} className="w-full text-left p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition-colors">Mejor Rating ⭐</button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}