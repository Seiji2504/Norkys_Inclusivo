import { useState } from 'react';
import { ChevronLeft, ChevronDown, HelpCircle } from 'lucide-react';

export default function Faq({ onBack, brandColor, idioma }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Contenido de las FAQs (Español / Inglés)
  const faqs = idioma === 'en' ? [
    {
      q: "¿How does the voice assistant work?",
      a: "Press the big green microphone button at the bottom of the screen. Wait for the 'Listening...' screen and speak naturally. For example, you can say: 'Take me to my profile' or 'Add a mostrito to my cart'."
    },
    {
      q: "¿What is the head-movement cursor?",
      a: "It is an accessibility tool designed for people with motor disabilities. By calibrating your webcam, you can move a floating pointer on the screen simply by tilting your head slightly."
    },
    {
      q: "¿How do I pay for my chicken?",
      a: "To ensure your financial privacy, we only accept cash or POS card reader on delivery. You will pay the delivery driver directly when you receive your order."
    },
    {
      q: "¿Where do you deliver?",
      a: "Currently, our coverage covers metropolitan Lima, Peru. You can register your exact location in the 'My Addresses' section using our interactive map."
    }
  ] : [
    {
      q: "¿Cómo funciona el asistente de voz?",
      a: "Presiona el micrófono verde grande de la barra inferior. Espera a que aparezca la pantalla de 'Escuchando...' y habla con naturalidad. Por ejemplo: 'Llévame a mi perfil' o 'Agrega un mostrito al carrito'."
    },
    {
      q: "¿Qué es el cursor con movimiento de cabeza?",
      a: "Es una herramienta de accesibilidad para personas con discapacidad motriz. Al calibrar tu cámara web, podrás desplazar un puntero flotante por la pantalla simplemente inclinando tu cabeza de forma suave."
    },
    {
      q: "¿Cómo realizo el pago de mi pedido?",
      a: "Para proteger tu privacidad financiera, solo aceptamos pagos contra entrega (Efectivo o Tarjeta POS). Le pagarás directamente al motorizado al recibir tu pollo caliente en la puerta de tu casa."
    },
    {
      q: "¿Cuáles son las zonas de reparto?",
      a: "Por el momento, nuestra zona de delivery cubre Lima Metropolitana. Puedes registrar tu ubicación exacta en la sección de 'Mis Direcciones' usando nuestro mapa satelital interactivo."
    }
  ];

  return (
    <div className="flex-1 bg-[#FDFBF7] relative pb-28 flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
      
      {/* Cabecera */}
      <div className="pt-8 px-6 flex items-center shrink-0 mb-6">
        <button onClick={onBack} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-800 border border-gray-100 hover:bg-white active:scale-95 transition-all"><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center pr-10 text-2xl font-black text-gray-800 tracking-wider uppercase">
          {idioma === 'en' ? 'FAQs' : 'PREGUNTAS FRECUENTES'}
        </h2>
      </div>

      {/* Lista de Acordeones Interactivos */}
      <div className="px-6 flex flex-col gap-4 shrink-0 pb-10">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div 
              key={i}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden transition-all duration-300"
            >
              {/* Pregunta */}
              <button 
                onClick={() => toggleFaq(i)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#2E7D32] shrink-0"><HelpCircle size={20} /></div>
                  <span className="text-[14px] leading-tight">{faq.q}</span>
                </div>
                <ChevronDown 
                  size={18} 
                  className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                />
              </button>

              {/* Respuesta Desplegable */}
              {isOpen && (
                <div className="px-6 pb-6 pt-2 text-xs text-gray-500 font-bold leading-relaxed border-t border-gray-50 animate-in slide-in-from-top-4 duration-300">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}