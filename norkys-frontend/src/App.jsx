import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Mic, Heart, Home, ShoppingCart, User, Star, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import ProductDetail from './components/ProductDetail';
import Profile from './components/Profile';
import Accessibility from './components/Accessibility';
import Auth from './components/Auth'; // <-- IMPORTAMOS EL COMPONENTE AUTH

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  
  const [activeTab, setActiveTab] = useState('Home');
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [profileScreen, setProfileScreen] = useState('menu'); // 'menu' | 'accessibility' | 'auth'

  const [accessibility, setAccessibility] = useState({
    textSize: 1,
    contrast: 1,
    dyslexia: false,
    lineSpacing: 1,
    headCursor: false
  });

  // --- ESTADOS DE AUTENTICACIÓN REAL ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Empieza falso
  const [userData, setUserData] = useState(null);

  // Escuchar cambios de sesión de Supabase Auth
  useEffect(() => {
    // 1. Revisar si ya hay sesión al abrir la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    // 2. Escuchar cambios de inicio/cierre de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthChange = async (session) => {
    if (session?.user) {
      setIsLoggedIn(true);
      try {
        // CORRECCIÓN: Traemos los perfiles sin usar .single() para evitar el error 406
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id);

        if (error) throw error;

        // Si por alguna razón el perfil no existe en la tabla personalizada (como te pasó con mathias@test.com)
        if (!data || data.length === 0) {
          const fallbackName = session.user.email.split('@')[0];
          
          // Creamos datos temporales para que React no se ponga en blanco
          setUserData({
            nombre_completo: fallbackName,
            email: session.user.email,
            foto: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + fallbackName
          });

          // Insertamos la fila faltante en caliente usando upsert (evita colisiones asíncronas)
          await supabase.from('perfiles').upsert([
            {
              id: session.user.id,
              nombre_completo: fallbackName,
              telefono: '',
              rol: 'cliente'
            }
          ]);
        } else {
          // Si el perfil sí existe (comportamiento normal)
          const profile = data[0];
          setUserData({
            nombre_completo: profile.nombre_completo,
            email: session.user.email,
            foto: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + profile.nombre_completo.replace(/\s+/g, '')
          });
        }
      } catch (err) {
        console.error("Error cargando perfil:", err.message);
      }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleTabChange('Home');
  };

  // --- EFECTOS DE ACCESIBILIDAD ---
  const brandColor = accessibility.contrast === 2 
    ? '#000000' 
    : accessibility.contrast === 3 
      ? '#5c531d' 
      : accessibility.contrast === 4
        ? '#008080' 
        : '#2E7D32'; 

  useEffect(() => {
    const fontSizes = { 1: '16px', 2: '18px', 3: '20px', 4: '22px' };
    document.documentElement.style.fontSize = fontSizes[accessibility.textSize];

    const body = document.body;
    if (accessibility.dyslexia) {
      body.style.fontFamily = '"Comic Neue", "Comic Sans MS", cursive, sans-serif';
      body.classList.add('tracking-wide');
    } else {
      body.style.fontFamily = '';
      body.classList.remove('tracking-wide');
    }

    const lineSpacings = { 1: '1.5', 2: '1.8', 3: '2.2' };
    body.style.lineHeight = lineSpacings[accessibility.lineSpacing];

  }, [accessibility]);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) throw error;
      setProductos(data);
      setProductosFiltrados(data);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  useEffect(() => {
    const results = productos.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setProductosFiltrados(results);
  }, [searchTerm, productos]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (cat === 'Todo') {
      setProductosFiltrados(productos);
    } else {
      const catMap = { 'Combos': 2, 'Complementos': 3, 'Ofertas': 4 };
      setProductosFiltrados(productos.filter(p => p.categoria_id === catMap[cat]));
    }
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation(); 
    setFavorites(prev => prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador no compatible");
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-PE';
    recognition.start();
    setIsListening(true);
    recognition.onresult = (event) => {
      setSearchTerm(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
  };

  const handleProductClick = (prod) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setSelectedProduct(prod);
      });
    } else {
      setSelectedProduct(prod);
    }
  };
  
  const handleBackToHome = () => {
    const transition = () => {
      setSelectedProduct(null);
      setActiveTab('Home');
      setProfileScreen('menu');
    };

    if (document.startViewTransition) {
      document.startViewTransition(transition);
    } else {
      transition();
    }
  };

  const handleTabChange = (tabName) => {
    const change = () => {
      setSelectedProduct(null);
      setProfileScreen('menu');
      setActiveTab(tabName);
    };

    if (document.startViewTransition) {
      document.startViewTransition(change);
    } else {
      change();
    }
  };

  const handleProfileNavigation = (optionId) => {
    const transition = () => {
      if (optionId === 'accesibilidad') {
        setProfileScreen('accessibility');
      } else {
        alert(`Abriendo: ${optionId}`);
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(transition);
    } else {
      transition();
    }
  };

  // NAVEGACIÓN SEMÁNTICA POR VOZ (CON BUG SOLUCIONADO)
  const handleGlobalVoiceAssistant = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador no compatible");

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-PE';
    recognition.start();
    setIsGlobalListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsGlobalListening(false);
      
      try {
        const response = await fetch('http://127.0.0.1:8000/api/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcript }),
        });

        if (!response.ok) throw new Error("Error en el backend");
        const data = await response.json();

        if (data.action === 'navigate') {
          if (data.target === 'accessibility') {
            // FIX DEL BUG: Entra a accesibilidad directo
            setSelectedProduct(null);
            setActiveTab('User');
            setProfileScreen('accessibility');
          } else {
            handleTabChange(data.target);
          }
          
          const utterance = new SpeechSynthesisUtterance(data.message);
          utterance.lang = 'es-PE';
          window.speechSynthesis.speak(utterance);
        } else {
          alert("No entendí.");
        }

      } catch (err) {
        console.error("Error:", err);
      }
    };

    recognition.onerror = () => setIsGlobalListening(false);
    recognition.onend = () => setIsGlobalListening(false);
  };

  const [isGlobalListening, setIsGlobalListening] = useState(false);

  const renderBottomNav = () => (
    <div 
      style={{ backgroundColor: brandColor }}
      className="fixed bottom-0 w-full max-w-[450px] rounded-t-[40px] h-[80px] flex justify-between items-center px-10 z-[60] shadow-2xl left-1/2 -translate-x-1/2 transition-colors duration-500"
    >
      <Home className={`cursor-pointer transition-all ${activeTab === 'Home' ? 'text-white scale-110 font-bold' : 'text-white/40'}`} size={24} onClick={() => handleTabChange('Home')}/>
      <Heart className={`cursor-pointer transition-all ${activeTab === 'Fav' ? 'text-white scale-110' : 'text-white/40'}`} size={24} onClick={() => handleTabChange('Fav')}/>
      <div className="w-12"></div>
      <ShoppingCart className={`cursor-pointer transition-all ${activeTab === 'Cart' ? 'text-white scale-110' : 'text-white/40'}`} size={24} onClick={() => handleTabChange('Cart')}/>
      <User className={`cursor-pointer transition-all ${activeTab === 'User' ? 'text-white scale-110' : 'text-white/40'}`} size={24} onClick={() => handleTabChange('User')}/>

      <div className="absolute left-1/2 -translate-x-1/2 -top-8">
        <button 
          onClick={handleGlobalVoiceAssistant}
          style={{ 
            backgroundColor: isGlobalListening ? '#ef4444' : brandColor,
            borderColor: '#FDFBF7', 
            width: '76px', 
            height: '76px' 
          }}
          className={`rounded-full flex items-center justify-center border-[8px] shadow-xl active:scale-90 transition-all duration-500 ${isGlobalListening ? 'animate-pulse' : ''}`}
        >
          <Mic className="text-white" size={32} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] w-full max-w-[450px] mx-auto relative pb-[100px] shadow-2xl overflow-hidden flex flex-col transition-all">
      
      {selectedProduct ? (
        <ProductDetail 
          producto={selectedProduct} 
          onBack={handleBackToHome} 
        />
      ) : (
        <>
          {activeTab === 'Home' && (
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
                  onClick={() => handleTabChange('User')}
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
                    className={`cursor-pointer transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} 
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
                    className="px-6 py-2 rounded-xl font-bold transition-all shadow-sm border whitespace-nowrap"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid de Productos */}
              <div className="px-6 grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar pb-32 items-start content-start">
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

              {/* Modal de Filtros */}
              {showFilters && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center px-4 pb-10">
                  <div className="bg-white w-full max-w-md rounded-[3rem] p-8 relative">
                     <button onClick={() => setShowFilters(false)} className="absolute top-6 right-6 text-gray-400 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                     <h2 className="text-2xl font-bold mb-6 text-gray-800">Ordenar por</h2>
                     <div className="space-y-3">
                       <button onClick={() => { setShowFilters(false); }} className="w-full text-left p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32] transition-colors">Menos a más precio</button>
                       <button onClick={() => { setShowFilters(false); }} className="w-full text-left p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32]">Mayor a menor precio</button>
                       <button onClick={() => { setShowFilters(false); }} className="w-full text-left p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32]">Mejor Rating ⭐</button>
                     </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'User' && (
            <>
              {profileScreen === 'menu' && (
                /* ================= PERFIL: MENÚ DE OPCIONES ================= */
                <Profile 
                  isLoggedIn={isLoggedIn}
                  user={userData}
                  onLogin={() => setProfileScreen('auth')} // <-- ABRE LA PANTALLA DE LOGIN
                  onLogout={handleLogout} // <-- LLAMA AL SIGN OUT REAL DE SUPABASE
                  onBack={handleBackToHome}
                  onNavigate={handleProfileNavigation}
                />
              )}
              
              {profileScreen === 'accessibility' && (
                /* ================= PERFIL: PESTAÑA ACCESIBILIDAD ================= */
                <Accessibility 
                  settings={accessibility}
                  onChange={setAccessibility}
                  onBack={() => setProfileScreen('menu')}
                  brandColor={brandColor}
                />
              )}

              {profileScreen === 'auth' && (
                /* ================= PERFIL: PESTAÑA LOGIN/SIGNUP (NUEVO) ================= */
                <Auth 
                  onBack={() => setProfileScreen('menu')}
                  onAuthSuccess={() => setProfileScreen('menu')} // Redirige al perfil al loguearse con éxito
                />
              )}
            </>
          )}

          {activeTab === 'Fav' && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Heart size={48} className="mb-2" />
              <p className="font-bold">Aquí verás tus favoritos</p>
            </div>
          )}

          {activeTab === 'Cart' && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={48} className="mb-2" />
              <p className="font-bold">Tu carrito está vacío</p>
            </div>
          )}
        </>
      )}

      {renderBottomNav()}
    </div>
  );
}