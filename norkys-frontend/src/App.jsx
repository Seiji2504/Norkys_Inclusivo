import { useState, useEffect, useRef } from 'react'; // <-- IMPORTADO useRef
import { supabase } from './supabaseClient';
import HomeContent from './components/home/HomeContent';
import ProductDetail from './components/product/ProductDetail';
import Profile from './components/profile/ProfileMenu';
import Accessibility from './components/accessibility/Accessibility';
import Auth from './components/Auth';
import Favorites from './components/Favorites';
import Cart from './components/cart/Cart';
import VoiceAssistantOverlay from './components/accessibility/VoiceAssistantOverlay'; 
import HeadTrackingCalibration from './components/accessibility/HeadTrackingCalibration';
import HeadCursorTracker from './components/accessibility/HeadCursorTracker'; 
import DwellController from './components/accessibility/DwellController'; // <-- IMPORTADO
import { translations } from './utils/translations'; // <-- IMPORTADO
import OrderHistory from './components/profile/OrderHistory'; // <-- IMPORTADO
import SavedAddresses from './components/profile/SavedAddresses'; // <-- IMPORTADO
import SavedPayments from './components/profile/SavedPayments';   // <-- IMPORTADO
import Faq from './components/profile/Faq';                      // <-- IMPORTADO
import PrivacyPolicy from './components/profile/PrivacyPolicy';   // <-- IMPORTADO
import EditProfile from './components/profile/EditProfile';                 // <-- IMPORTADO
import NotificationSettings from './components/profile/NotificationSettings'; // <-- IMPORTADO
import { Home, Heart, ShoppingCart, User, Mic, ChevronUp, ChevronDown } from 'lucide-react'; // <-- IMPORTADOS NUEVOS ICONOS

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('efectivo');

  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Guarda las coordenadas de origen {x, y} de la calibración del rostro
  const [calibrationData, setCalibrationData] = useState({ x: 20, y: 15 }); // Por defecto al centro

  const [activeTab, setActiveTab] = useState('Home');
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [profileScreen, setProfileScreen] = useState('menu');
  const [sortBy, setSortBy] = useState('normal'); 
  const [cart, setCart] = useState([]);

  const [language, setLanguage] = useState('es'); // Idioma global: 'es' | 'en'

  // CONFIGURACIÓN DE ACCESIBILIDAD GLOBAL
  const [accessibility, setAccessibility] = useState({
    textSize: 1, contrast: 1, dyslexia: false, lineSpacing: 1, headCursor: false
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // --- FUNCIÓN DE FEEDBACK SONORO Y VIBRACIÓN (Web Audio API & Vibration API) ---
  const playInteractionFeedback = () => {
    // Leemos la configuración actual del localStorage del celular
    const saved = localStorage.getItem('norkys-notifications');
    const settings = saved ? JSON.parse(saved) : { vibracion: true, sonidos: true };

    // 1. Vibración Física (Nativo en celulares Android/Chrome)
    if (settings.vibracion && navigator.vibrate) {
      navigator.vibrate(40); // Zumbido háptico de 40ms
    }

    // 2. Sintetizador de Sonidos (Web Audio API - Sin archivos de audio externos)
    if (settings.sonidos) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // Tono limpio en 600Hz
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // Volumen suave

        oscillator.start();
        // Se apaga de forma exponencial en 50ms para simular un "clic" corto y agradable
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.05);
        oscillator.stop(audioCtx.currentTime + 0.05);
      } catch (e) {
        console.error("Web Audio API no soportado:", e);
      }
    }
  };

  // Solicitar permiso de notificaciones push de forma silenciosa al abrir la app
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Escuchar cambios de sesión de Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { handleAuthChange(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { handleAuthChange(session); });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuthChange = async (session) => {
    if (session?.user) {
      setIsLoggedIn(true);
      try {
        const { data, error } = await supabase.from('perfiles').select('*').eq('id', session.user.id);
        if (error) throw error;
        if (!data || data.length === 0) {
          const fallbackName = session.user.email.split('@')[0];
          setUserData({ nombre_completo: fallbackName, email: session.user.email, foto: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + fallbackName });
          await supabase.from('perfiles').upsert([{ id: session.user.id, nombre_completo: fallbackName, telefono: '', rol: 'cliente' }]);
        } else {
          const profile = data[0];
          setUserData({ nombre_completo: profile.nombre_completo, email: session.user.email, foto: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + profile.nombre_completo.replace(/\s+/g, '') });
        }
        fetchFavorites(session.user.id);
      } catch (err) { console.error(err.message); }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
      setFavorites([]);
    }
  };

  const fetchFavorites = async (userId) => {
    const { data } = await supabase.from('favoritos').select('producto_id').eq('usuario_id', userId);
    if (data) setFavorites(data.map(f => f.producto_id));
  };

  const handleScrollStep = (direction) => {
    const scrollable = document.querySelector('.scroll-container-norkys');
    if (scrollable) {
      // direction: -1 para subir, 1 para bajar. Desliza 220px suavemente.
      scrollable.scrollBy({ top: direction * 220, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    playInteractionFeedback(); // <-- AGREGAR ESTA LÍNEA
    await supabase.auth.signOut();
    handleTabChange('Home');
  };

  // AGREGAR AL CARRITO
  const handleAddToCart = (orderItem) => {
    playInteractionFeedback(); // <-- DISPARADO AUDIO/VIBRACIÓN
    setCart(prev => {
      const exists = prev.find(item => item.producto.id === orderItem.producto.id);
      if (exists) {
        return prev.map(item => item.producto.id === orderItem.producto.id ? { ...item, cantidad: item.cantidad + orderItem.cantidad } : item);
      }
      return [...prev, orderItem];
    });
  };

  // --- SINCRONIZACIÓN DE FAVORITOS (CORREGIDO) ---
  const toggleFavorite = async (e, id) => {
    e.stopPropagation();
    playInteractionFeedback(); // <-- DISPARADO AUDIO/VIBRACIÓN

    // Bloqueo de accesibilidad: Sólo usuarios logueados
    if (!isLoggedIn) {
      alert("Inicia sesión para guardar tus favoritos de pollos 🍗");
      handleTabChange('User'); // Te redirige al login
      return;
    }

    const isFav = favorites.includes(id);

    // 1. Actualización optimista instantánea en pantalla (CORREGIDO 'favId')
    setFavorites(prev => isFav ? prev.filter(favId => favId !== id) : [...prev, id]);

    // 2. Sincronización en caliente en Supabase
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      if (isFav) {
        // Eliminar de favoritos en Supabase
        await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', session.user.id)
          .eq('producto_id', id);
      } else {
        // Insertar en favoritos en Supabase
        await supabase
          .from('favoritos')
          .upsert([{ usuario_id: session.user.id, producto_id: id }]);
      }
    } catch (err) {
      console.error("Error sincronizando favorito:", err.message);
    }
  };

  const handleCategoryChange = (cat) => {
    playInteractionFeedback(); // <-- DISPARADO AUDIO/VIBRACIÓN
    setActiveCategory(cat);
  };

  // Filtros unificados de búsqueda, categoría y ordenamiento
  useEffect(() => {
    let results = [...productos];

    if (activeCategory !== 'Todo') {
      const catMap = { 'Combos': 2, 'Complementos': 3, 'Ofertas': 4 };
      results = results.filter(p => p.categoria_id === catMap[activeCategory]);
    }

    if (searchTerm) {
      results = results.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (sortBy === 'price-asc') {
      results.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === 'price-desc') {
      results.sort((a, b) => b.precio - a.precio);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }

    setProductosFiltrados(results);
  }, [searchTerm, activeCategory, sortBy, productos]);

  const startSpeechRecognition = () => {
    playInteractionFeedback(); // <-- DISPARADO AUDIO/VIBRACIÓN
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

  const brandColor = accessibility.contrast === 2 ? '#000000' : accessibility.contrast === 3 ? '#5c531d' : accessibility.contrast === 4 ? '#008080' : '#2E7D32'; 

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

  useEffect(() => { fetchProductos(); }, []);

  const fetchProductos = async () => {
    const { data } = await supabase.from('productos').select('*');
    if (data) { setProductos(data); setProductosFiltrados(data); }
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleProductClick = (prod) => {
    playInteractionFeedback(); // <-- DISPARADO AUDIO/VIBRACIÓN
    if (document.startViewTransition) { document.startViewTransition(() => setSelectedProduct(prod)); }
    else { setSelectedProduct(prod); }
  };
  
  const handleBackToHome = () => {
    playInteractionFeedback(); // <-- DISPARADO AUDIO/VIBRACIÓN
    const transition = () => { setSelectedProduct(null); setActiveTab('Home'); setProfileScreen('menu'); };
    if (document.startViewTransition) { document.startViewTransition(transition); }
    else { transition(); }
  };

  const handleTabChange = (tabName) => {
    playInteractionFeedback(); // <-- DISPARADO AUDIO/VIBRACIÓN
    const change = () => {
      // CORRECCIÓN: Si cambia de pestaña por clic manual en el navbar, apagamos la IA de forma segura
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
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
    playInteractionFeedback(); // <-- DISPARADO AUDIO/VIBRACIÓN
    const transition = () => {
      if (optionId === 'accesibilidad') {
        setProfileScreen('accessibility');
      } else if (optionId === 'pedidos') {
        if (!isLoggedIn) { alert("Inicia sesión para poder ver tu historial de pedidos 🍗"); setProfileScreen('auth'); }
        else { setProfileScreen('orders'); }
      } else if (optionId === 'pago') {
        if (!isLoggedIn) { alert("Inicia sesión para ver tus métodos de pago 🍗"); setProfileScreen('auth'); }
        else { setProfileScreen('payments'); }
      } else if (optionId === 'direccion') {
        if (!isLoggedIn) { alert("Inicia sesión para ver tus direcciones de delivery 🍗"); setProfileScreen('auth'); }
        else { setProfileScreen('addresses'); }
      } else if (optionId === 'faq') {
        setProfileScreen('faq');
      } else if (optionId === 'privacidad') {
        setProfileScreen('privacy');
      } 
      // --- NUEVAS RUTAS CONECTADAS DE HOY ---
      else if (optionId === 'edit_profile') {
        setProfileScreen('edit_profile');
      } else if (optionId === 'notificaciones') {
        setProfileScreen('notifications');
      } else {
        alert(`Abriendo: ${optionId}`);
      }
    };

    if (document.startViewTransition) { document.startViewTransition(transition); }
    else { transition(); }
  };

  // NUEVA FUNCIÓN: Recarga el perfil de forma asíncrona y segura
  const reloadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleAuthChange(session);
      }
    } catch (err) {
      console.error("Error al recargar perfil:", err.message);
    }
  };

  const [isGlobalListening, setIsGlobalListening] = useState(false);
  const recognitionRef = useRef(null); // <-- Referencia para controlar el micrófono activo
  
  // --- ASISTENTE DE VOZ GLOBAL INTELIGENTE (MULTI-ACCIÓN Y MULTILINGÜE COMPLETO) ---
  const handleGlobalVoiceAssistant = () => {
    playInteractionFeedback();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador no compatible");

    // CORRECCIÓN: Si el usuario pulsa el micrófono mientras ya está escuchando, actúa como un interruptor de apagado
    if (isGlobalListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort(); // Detiene y libera el micrófono de inmediato
      }
      setIsGlobalListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-PE';
    recognitionRef.current = recognition; // Guardamos la referencia activa para poder controlarla

    recognition.start();
    setIsGlobalListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsGlobalListening(false);
      try {
        const response = await fetch('https://norkys-backend.onrender.com/api/intent', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ text: transcript }) 
        });
        
        if (!response.ok) throw new Error("Error en el backend");
        const data = await response.json();

        // EJECUTAMOS EL BUCLE DE ACCIONES SECUENCIALES DETECTADAS POR GEMINI (Multitarea)
        if (data.actions && data.actions.length > 0) {
          data.actions.forEach(act => {
            
            // 1. ACCIÓN: NAVEGAR A CUALQUIERA DE LAS 14 PANTALLAS DEL SISTEMA
            if (act.action === 'navigate') {
              setSelectedProduct(null); // Cerramos el plato si estaba abierto

              if (act.target === 'accessibility') {
                setActiveTab('User');
                setProfileScreen('accessibility');
              } else if (act.target === 'orders') {
                setActiveTab('User');
                setProfileScreen('orders');
              } else if (act.target === 'payments') {
                setActiveTab('User');
                setProfileScreen('payments');
              } else if (act.target === 'addresses') {
                setActiveTab('User');
                setProfileScreen('addresses');
              } else if (act.target === 'notifications') {
                setActiveTab('User');
                setProfileScreen('notifications');
              } else if (act.target === 'faq') {
                setActiveTab('User');
                setProfileScreen('faq');
              } else if (act.target === 'privacy') {
                setActiveTab('User');
                setProfileScreen('privacy');
              } else if (act.target === 'edit_profile') {
                setActiveTab('User');
                setProfileScreen('edit_profile');
              } else if (act.target === 'calibration') {
                setActiveTab('User');
                setProfileScreen('calibration');
              } else if (act.target === 'auth') {
                setActiveTab('User');
                setProfileScreen('auth');
              } else {
                handleTabChange(act.target); // Home, Fav, Cart
              }
            } 
            
            // 2. ACCIÓN: AJUSTES VISUALES (ACCESIBILIDAD)
            else if (act.action === 'adjust_accessibility') {
              setAccessibility(prev => {
                let next = { ...prev };
                if (act.target === 'textSize') {
                  next.textSize = act.value === 'increase' ? Math.min(4, prev.textSize + 1) : Math.max(1, prev.textSize - 1);
                } else if (act.target === 'contrast') {
                  next.contrast = prev.contrast === 4 ? 1 : prev.contrast + 1;
                } else if (act.target === 'dyslexia') {
                  next.dyslexia = !prev.dyslexia;
                } else if (act.target === 'headCursor') {
                  next.headCursor = !prev.headCursor;
                }
                return next;
              });
            } 
            
            // 3. ACCIÓN: FILTRAR PLATOS DE LA CARTA
            else if (act.action === 'filter') {
              if (act.target === 'category') {
                handleCategoryChange(act.value);
              } else if (act.target === 'search') {
                setSearchTerm(act.value);
              }
            }

            // 4. ACCIÓN: ABRIR UN PLATO ESPECÍFICO (Ir a Detalle)
            else if (act.action === 'open_product') {
              const matchedProd = productos.find(p => 
                p.nombre.toLowerCase().includes(act.target.toLowerCase())
              );
              if (matchedProd) {
                handleProductClick(matchedProd);
              }
            }

            // 5. ACCIÓN: AGREGAR AL CARRITO POR VOZ
            else if (act.action === 'add_to_cart') {
              if (!isLoggedIn) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance("Necesitas iniciar sesión para usar el carrito. Te llevo al perfil."));
                handleTabChange('User');
                setProfileScreen('auth');
                return;
              }

              const matchedProd = productos.find(p => 
                p.nombre.toLowerCase().includes(act.target.toLowerCase())
              );

              if (matchedProd) {
                handleAddToCart({
                  producto: matchedProd,
                  cantidad: parseInt(act.value) || 1,
                  complements: [],
                  aditivos: []
                });
              }
            }

            // 6. ACCIÓN: VACIAR EL CARRITO EN CALIENTE
            else if (act.action === 'clear_cart') {
              setCart([]);
            }

          });
        }

        // El sintetizador te habla de vuelta en el idioma correcto (Español o Inglés)
        const utterance = new SpeechSynthesisUtterance(data.message);
        utterance.lang = language === 'en' ? 'en-US' : 'es-PE'; 
        window.speechSynthesis.speak(utterance);

      } catch (err) { 
        console.error("Error en la IA:", err); 
        alert("El asistente de voz tuvo un problema. Asegúrate de tener encendido tu backend en Python. xd");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsGlobalListening(false);
    };

    recognition.onend = () => {
      setIsGlobalListening(false);
      recognitionRef.current = null;
    };
  };

  // BARRA DE NAVEGACIÓN BLINDADA (CON DIVS REALES CLIQUEABLES POR CABEZA)
  const renderBottomNav = () => (
    <div 
      style={{ backgroundColor: brandColor, height: '80px', paddingLeft: '40px', paddingRight: '40px' }}
      className="fixed bottom-0 w-full max-w-[450px] rounded-t-[40px] flex justify-between items-center px-10 z-[60] shadow-2xl left-1/2 -translate-x-1/2 transition-colors duration-500"
    >
      {/* Botón Home */}
      <div 
        onClick={() => handleTabChange('Home')}
        className="p-2 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
      >
        <Home className={`transition-all ${activeTab === 'Home' ? 'text-white scale-110 font-bold' : 'text-white/40'}`} size={24} />
      </div>

      {/* Botón Favoritos */}
      <div 
        onClick={() => handleTabChange('Fav')}
        className="p-2 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
      >
        <Heart className={`transition-all ${activeTab === 'Fav' ? 'text-white scale-110 font-bold' : 'text-white/40'}`} size={24} />
      </div>

      {/* Espacio para micrófono flotante */}
      <div style={{ width: '48px' }}></div> 

      {/* Botón Carrito */}
      <div 
        onClick={() => handleTabChange('Cart')}
        className="p-2 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
      >
        <ShoppingCart className={`transition-all ${activeTab === 'Cart' ? 'text-white scale-110 font-bold' : 'text-white/40'}`} size={24} />
      </div>

      {/* Botón Perfil */}
      <div 
        onClick={() => handleTabChange('User')}
        className="p-2 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
      >
        <User className={`cursor-pointer transition-all ${activeTab === 'User' ? 'text-white scale-110 font-bold' : 'text-white/40'}`} size={24} />
      </div>

      {/* Botón central del micrófono */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-32px' }}>
        <button 
          onClick={handleGlobalVoiceAssistant} 
          style={{ backgroundColor: isGlobalListening ? '#ef4444' : brandColor, borderColor: '#FDFBF7', width: '76px', height: '76px' }} 
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
          onAddToCart={handleAddToCart}
          isLoggedIn={isLoggedIn}
          onNavigateToAuth={() => {
            setSelectedProduct(null);
            setActiveTab('User');
            setProfileScreen('auth');
          }}
        />
      ) : (
        <>
          {activeTab === 'Home' && (
            <HomeContent 
              productosFiltrados={productosFiltrados}
              activeCategory={activeCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isListening={isListening}
              handleCategoryChange={handleCategoryChange}
              handleProductClick={handleProductClick}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
              startSpeechRecognition={startSpeechRecognition}
              showFilters={showFilters}       
              setShowFilters={setShowFilters} 
              onSortChange={setSortBy} 
              brandColor={brandColor}
              isLoggedIn={isLoggedIn}
              userData={userData}
              onAvatarClick={() => handleTabChange('User')}
            />
          )}

          {activeTab === 'User' && (
            <>
              {profileScreen === 'menu' ? (
                <Profile 
                  isLoggedIn={isLoggedIn} 
                  user={userData} 
                  onLogin={() => setProfileScreen('auth')} 
                  onLogout={handleLogout} 
                  onBack={handleBackToHome} 
                  onNavigate={handleProfileNavigation} 
                />
              ) : profileScreen === 'accessibility' ? (
                <Accessibility 
                  settings={accessibility} 
                  onChange={setAccessibility} 
                  onBack={() => setProfileScreen('menu')} 
                  brandColor={brandColor}
                  onNavigateToCalibration={() => setProfileScreen('calibration')}
                  idioma={language}      // <-- ENVIADO IDIOMA GLOBAL
                  setIdioma={setLanguage} // <-- ENVIADO CONFIGURADOR GLOBAL
                />
              ) : profileScreen === 'orders' ? (
                /* ================= PERFIL: PESTAÑA HISTORIAL PEDIDOS (NUEVO) ================= */
                <OrderHistory 
                  isLoggedIn={isLoggedIn}
                  onBack={() => setProfileScreen('menu')}
                  brandColor={brandColor}
                  idioma={language}
                />
              ) : profileScreen === 'addresses' ? (
                /* ================= PERFIL: PESTAÑA DIRECCIONES CON MAPA (NUEVO) ================= */
                <SavedAddresses 
                  isLoggedIn={isLoggedIn} 
                  onBack={() => setProfileScreen('menu')} 
                  brandColor={brandColor} 
                  idioma={language} 
                />
              ) : profileScreen === 'payments' ? (
                /* ================= PERFIL: PESTAÑA METODOS DE PAGO (NUEVO) ================= */
                <SavedPayments 
                  onBack={() => setProfileScreen('menu')} 
                  brandColor={brandColor} 
                  idioma={language} 
                  defaultPayment={defaultPaymentMethod} // <-- PREFERENCIA ACTUAL
                  onDefaultPaymentChange={setDefaultPaymentMethod} // <-- CONFIGURADOR GLOBAL
                />
              ) : profileScreen === 'faq' ? (
                /* ================= PERFIL: PESTAÑA PREGUNTAS FRECUENTES (NUEVO) ================= */
                <Faq 
                  onBack={() => setProfileScreen('menu')} 
                  brandColor={brandColor} 
                  idioma={language} 
                />
              ) : profileScreen === 'privacy' ? (
                /* ================= PERFIL: PESTAÑA POLITICA DE PRIVACIDAD (NUEVO) ================= */
                <PrivacyPolicy 
                  onBack={() => setProfileScreen('menu')} 
                  brandColor={brandColor} 
                  idioma={language} 
                />
              ) : profileScreen === 'edit_profile' ? (
                /* ================= PERFIL: PESTAÑA EDITAR PERFIL REAL (NUEVO) ================= */
                <EditProfile 
                  onBack={() => setProfileScreen('menu')}
                  onProfileUpdate={reloadProfile} // <-- CORREGIDO: Ahora llama a la función asíncrona segura
                  onLogout={handleLogout}
                  brandColor={brandColor}
                  idioma={language}
                />
              ) : profileScreen === 'notifications' ? (
                <NotificationSettings onBack={() => setProfileScreen('menu')} brandColor={brandColor} idioma={language} />
              ) : profileScreen === 'calibration' ? (
                /* ================= PERFIL: PESTAÑA CALIBRACIÓN CÁMARA (CORREGIDO Y AGREGADO) ================= */
                <HeadTrackingCalibration 
                  brandColor={brandColor}
                  onBack={() => setProfileScreen('accessibility')}
                  onCalibrationSuccess={(coords) => {
                    setCalibrationData(coords);
                    setAccessibility(prev => ({ ...prev, headCursor: true }));
                    setProfileScreen('accessibility');
                  }}
                />
              ) : (
                <Auth 
                  onBack={() => setProfileScreen('menu')} 
                  onAuthSuccess={() => setProfileScreen('menu')} 
                />
              )}
            </>
          )}

          {activeTab === 'Fav' && (
            <Favorites productos={productos} favorites={favorites} onProductClick={handleProductClick} onToggleFavorite={toggleFavorite} brandColor={brandColor} />
          )}

          {activeTab === 'Cart' && (
            <Cart 
              cart={cart}
              onRemoveItem={(id) => setCart(prev => prev.filter(item => item.producto.id !== id))}
              onClearCart={() => setCart([])}
              onBackToHome={handleBackToHome}
              brandColor={brandColor}
              defaultPayment={defaultPaymentMethod}
              idioma={language} // <-- CONECTADA LA PROP DEL IDIOMA GLOBAL
            />
          )}
        </>
      )}

      {/* ================= PANTALLA DE ESCUCHANDO IA (NUEVO) ================= */}
      {isGlobalListening && (
        <VoiceAssistantOverlay brandColor={brandColor} />
      )}

      {/* ================= CURSOR DE CABEZA FLOTANTE ================= */}
      {accessibility.headCursor && (
        <div 
          style={{ 
            left: `${cursorPos.x}px`, 
            top: `${cursorPos.y}px`,
            width: '28px',
            height: '28px',
            borderColor: brandColor
          }}
          className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full border-4 bg-white/20 backdrop-blur-sm pointer-events-none z-[9999] shadow-xl transition-all duration-75 animate-pulse"
        />
      )}

      {/* ================= BOTONES DE SCROLL INCLUSIVOS DE COSTADO (NUEVO) ================= */}
      {accessibility.headCursor && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 animate-in fade-in duration-300">
          {/* Flecha Arriba */}
          <div 
            onClick={() => handleScrollStep(-1)}
            style={{ borderColor: brandColor }}
            className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border-2 text-gray-800 hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <ChevronUp size={20} style={{ color: brandColor }} strokeWidth={3} />
          </div>
          {/* Flecha Abajo */}
          <div 
            onClick={() => handleScrollStep(1)}
            style={{ borderColor: brandColor }}
            className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border-2 text-gray-800 hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <ChevronDown size={20} style={{ color: brandColor }} strokeWidth={3} />
          </div>
        </div>
      )}

      {/* ================= CONTROLADOR INTELIGENTE DE ACCIONES ================= */}
      <DwellController 
        isActive={accessibility.headCursor}
        cursorPos={cursorPos}
        brandColor={brandColor}
      />

      {/* Componente silencioso que procesa la cámara */}
      <HeadCursorTracker 
        isActive={accessibility.headCursor} 
        calibrationData={calibrationData} 
        onUpdateCursor={setCursorPos} 
      />

      {renderBottomNav()}
    </div>
  );
}