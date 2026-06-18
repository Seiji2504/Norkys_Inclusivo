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

# CADA ACCION INDIVIDUAL COMPATIBLE
class SingleAction(BaseModel):
    action: str = Field(
        description="Acción. Valores permitidos: 'navigate', 'adjust_accessibility', 'filter', 'open_product', 'add_to_cart', 'remove_from_cart', 'clear_cart', 'add_to_favorites', 'remove_from_favorites', 'sort', 'select_payment_method', 'open_order_details'"
    )
    target: str = Field(
        description="Objetivo de la acción. Si navigate: 'Home', 'User', 'Fav', 'Cart', 'accessibility', 'orders', 'payments', 'addresses', 'notifications', 'faq', 'privacy', 'edit_profile', 'calibration', 'auth'. Si adjust_accessibility: 'textSize', 'contrast', 'dyslexia', 'headCursor'. Si open_product, add_to_cart, remove_from_cart, add_to_favorites, remove_from_favorites: Nombre del producto. Si sort: 'price-asc', 'price-desc', 'rating'. Si select_payment_method: 'efectivo', 'tarjeta'. Si open_order_details: ID numérico del pedido (ej. '1234')."
    )
    value: str = Field(
        description="Valor. Si target='textSize': 'increase' o 'decrease'. Si target='category': 'Todo', 'Combos', 'Complementos', 'Ofertas'. Si add_to_cart: la cantidad (ej. '1'). En los demás casos: ''."
    )

class VoiceResponse(BaseModel):
    actions: list[SingleAction] = Field(
        description="Lista ordenada de acciones que se deben ejecutar en secuencia."
    )
    message: str = Field(
        description="Mensaje amigable de confirmación en el mismo idioma del usuario."
    )

class VoiceInput(BaseModel):
    text: str

@app.post("/api/intent", response_model=VoiceResponse)
async def process_voice_intent(user_input: VoiceInput):
    try:
        prompt = f"""
        Analiza el comando de voz del usuario para la pollería inclusiva Norky's.
        Clasifica la intención en una o MÚLTIPLES acciones.
        
        Comando del usuario: "{user_input.text}"

        CATÁLOGO DE PRODUCTOS: 'Mostrito', 'Medio Brasa', 'Alitas Brasa', 'Norkys Burger'
        CATEGORÍAS DE LA CARTA: 'Todo', 'Combos', 'Complementos', 'Ofertas'

        MAPA DE NAVEGACIÓN COMPLETO (target para action='navigate'):
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

        ACCIONES COMPONENCIALES ADICIONALES:
        A) 'remove_from_cart' (Quitar 1 producto de la bolsa):
           - "quitar el mostrito de mi carrito", "elimina la hamburguesa" -> [action: 'remove_from_cart', target: 'Mostrito' o 'Norkys Burger']
        B) 'add_to_favorites' y 'remove_from_favorites':
           - "agrega el mostrito a mis favoritos" -> [action: 'add_to_favorites', target: 'Mostrito']
           - "quita las alitas de favoritos" -> [action: 'remove_from_favorites', target: 'Alitas Brasa']
        C) 'sort' (Ordenar productos):
           - "ordena por mejor puntuación", "ordena por rating" -> [action: 'sort', target: 'rating']
           - "pon de menor a mayor precio" -> [action: 'sort', target: 'price-asc']
        D) 'select_payment_method' (Cambiar método de pago en el carrito):
           - "quiero pagar con tarjeta", "pon el método de pago en pos" -> [action: 'select_payment_method', target: 'tarjeta']
           - "voy a pagar en efectivo" -> [action: 'select_payment_method', target: 'efectivo']
        E) 'open_order_details' (Ver detalles de un pedido específico):
           - "ver detalles del pedido 1234", "abre el pedido 1233" -> [action: 'open_order_details', target: '1234' o '1233']
        """

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="Eres el asistente de voz inteligente de Pollerías Norky's. Responde siempre en el mismo idioma que el usuario de forma asíncrona.",
                response_mime_type="application/json",
                response_schema=VoiceResponse,
            ),
        )

        import json
        return json.loads(response.text)

    except Exception as e:
        print("\n--- ERROR ---")
        print(e)
        print("--------------\n")
        raise HTTPException(status_code=500, detail=str(e))