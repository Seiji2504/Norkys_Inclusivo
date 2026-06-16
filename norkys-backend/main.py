import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("Falta la variable GEMINI_API_KEY en el archivo .env")

client = genai.Client(api_key=api_key)

app = FastAPI(title="Norky's AI Assistant Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CADA ACCION INDIVIDUAL COMPATIBLE CON TU SISTEMA (Pág 1 a 27)
class SingleAction(BaseModel):
    action: str = Field(
        description="Acción: 'navigate' (abrir pestaña), 'adjust_accessibility' (cambiar visuales), 'filter' (buscador/carta), 'open_product' (detalle plato), 'add_to_cart' (comprar), 'clear_cart' (vaciar bolsa)"
    )
    target: str = Field(
        description="Objetivo de la acción. Si navigate: 'Home', 'User', 'Fav', 'Cart', 'accessibility', 'orders', 'payments', 'addresses', 'notifications', 'faq', 'privacy', 'edit_profile', 'calibration', 'auth'. Si adjust_accessibility: 'textSize', 'contrast', 'dyslexia', 'headCursor'. Si open_product o add_to_cart: Nombre de producto ('Mostrito', 'Medio Brasa', 'Alitas Brasa', 'Norkys Burger'). Si filter: 'category' o 'search'."
    )
    value: str = Field(
        description="Valor. Si target='textSize': 'increase' o 'decrease'. Si target='contrast': 'cycle'. Si target='dyslexia'/'headCursor': 'toggle'. Si target='category': 'Todo', 'Combos', 'Complementos', 'Ofertas'. Si target='search': el texto a buscar. Si add_to_cart: la cantidad (ej. '1')."
    )

# RESPUESTA MULTI-ACCIÓN DEL ASISTENTE
class VoiceResponse(BaseModel):
    actions: list[SingleAction] = Field(
        description="Lista ordenada de acciones que se deben ejecutar en secuencia."
    )
    message: str = Field(
        description="Mensaje amigable en el mismo idioma del usuario (español o inglés) confirmando de forma inmersiva lo que estás haciendo."
    )

class VoiceInput(BaseModel):
    text: str

@app.post("/api/intent", response_model=VoiceResponse)
async def process_voice_intent(user_input: VoiceInput):
    try:
        # Prompt maestro entrenado con el 100% de la arquitectura de tu aplicación
        prompt = f"""
        Analiza el comando de voz del usuario para la pollería inclusiva Norky's.
        Clasifica la intención en una o MÚLTIPLES acciones.
        
        Comando del usuario: "{user_input.text}"

        CATÁLOGO DE PRODUCTOS: 'Mostrito', 'Medio Brasa', 'Alitas Brasa', 'Norkys Burger'
        CATEGORÍAS DE LA CARTA: 'Todo', 'Combos', 'Complementos', 'Ofertas'

        MAPA DE NAVEGACIÓN COMPLETO DE TU SISTEMA (target para action='navigate'):
        - 'Home': Menú principal / Carta
        - 'User': Menú principal de Perfil
        - 'Fav': Historial de Favoritos
        - 'Cart': Carrito de compras / Resumen de pedido
        - 'accessibility': Menú de ajustes de Accesibilidad
        - 'orders': Mis Pedidos (Historial de compras)
        - 'payments': Métodos de pago (Tarjetas guardadas)
        - 'addresses': Direcciones de delivery (Mapa satelital)
        - 'notifications': Notificaciones y Sonidos
        - 'faq': Preguntas Frecuentes (FAQ)
        - 'privacy': Política de Privacidad (Ciberseguridad)
        - 'edit_profile': Formulario de Editar Perfil
        - 'calibration': Calibración de cámara del cursor facial
        - 'auth': Formulario de Iniciar Sesión / Registro

        ACCIONES COMPONENCIALES SOPORTADAS:
        A) 'filter' (Filtrado de comida):
           - "busca hamburguesas" -> [action: 'filter', target: 'search', value: 'Burger']
           - "muestra los complementos" -> [action: 'filter', target: 'category', value: 'Complementos']
        B) 'open_product' (Abrir plato):
           - "quiero ver el mostrito" -> [action: 'open_product', target: 'Mostrito']
        C) 'clear_cart' (Vaciar carrito):
           - "limpia mi carrito" -> [action: 'clear_cart']
        """

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="Eres el asistente de voz inteligente de Pollerías Norky's. Tu objetivo es procesar múltiples acciones de navegación, accesibilidad y adición al carrito para personas con discapacidad en una sola orden. Responde siempre en el mismo idioma que el usuario.",
                response_mime_type="application/json",
                response_schema=VoiceResponse,
            ),
        )

        import json
        return json.loads(response.text)

    except Exception as e:
        print("\n--- ERROR DETECTADO ---")
        print(e)
        print("-----------------------\n")
        raise HTTPException(status_code=500, detail=str(e))