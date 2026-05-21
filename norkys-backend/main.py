import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Cargar variables de entorno
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

# NUEVA ESTRUCTURA DE RESPUESTA MULTI-ACCIÓN (Structured Output)
class VoiceAction(BaseModel):
    action: str = Field(
        description="Acción a ejecutar. Valores permitidos: 'navigate' (cambiar pestaña), 'adjust_accessibility' (cambiar ajustes visuales), 'add_to_cart' (agregar producto), o 'unknown' (si no se entiende)."
    )
    target: str = Field(
        description="Objetivo de la acción. Si action='navigate': 'Home', 'User', 'Fav', 'Cart', 'accessibility'. Si action='adjust_accessibility': 'textSize', 'contrast', 'dyslexia', 'headCursor'. Si action='add_to_cart': Nombre exacto o aproximado del producto (ej. 'Mostrito', 'Medio Brasa', 'Alitas Brasa', 'Norkys Burger')."
    )
    value: str = Field(
        description="Valor a aplicar. Si es textSize: 'increase' o 'decrease'. Si es contrast: 'cycle'. Si es dyslexia o headCursor: 'toggle'. Si es add_to_cart: Cantidad en texto (ej: '1', '2'). Por defecto: ''."
    )
    message: str = Field(
        description="Mensaje amigable en español latino para leerle de vuelta al usuario por parlantes. Ej: 'Entendido, te subo un nivel de tamaño de letra.'"
    )

class VoiceInput(BaseModel):
    text: str

@app.post("/api/intent", response_model=VoiceAction)
async def process_voice_intent(user_input: VoiceInput):
    try:
        # Prompt mejorado para entrenar a Gemini en las 3 funciones
        prompt = f"""
        Analiza el comando de voz del usuario para la pollería inclusiva Norky's.
        Clasifica la intención en una de las siguientes acciones:

        Comando del usuario: "{user_input.text}"

        1. NAVEGACIÓN (action: 'navigate'):
           - Ir a carta, inicio, combos -> target: 'Home'
           - Ir a perfil, mi cuenta -> target: 'User'
           - Ir a favoritos, ver mis corazones -> target: 'Fav'
           - Ir a bolsa, carrito, pagar -> target: 'Cart'
           - Ir a configuración, accesibilidad -> target: 'accessibility'

        2. AJUSTES VISUALES (action: 'adjust_accessibility'):
           - Agrandar letra, texto más grande -> target: 'textSize', value: 'increase'
           - Achicar letra, texto más pequeño -> target: 'textSize', value: 'decrease'
           - Cambiar contraste, modo daltónico -> target: 'contrast', value: 'cycle'
           - Activar dislexia, fuente amigable -> target: 'dyslexia', value: 'toggle'
           - Activar cursor, mover con la cabeza -> target: 'headCursor', value: 'toggle'

        3. COMPRA (action: 'add_to_cart'):
           - "Agrega un mostrito", "quiero pedir medio pollo", "pon una hamburguesa en mi bolsa"
           -> target: Nombre del producto (debe coincidir semánticamente con: 'Mostrito', 'Medio Brasa', 'Alitas Brasa' o 'Norkys Burger').
           -> value: Cantidad especificada por el usuario (ej: '1', '2'). Si no especifica cantidad, por defecto es '1'.
        """

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="Eres el asistente de voz inteligente de Pollerías Norky's. Tu objetivo es procesar la navegación, accesibilidad y adición al carrito para personas con discapacidad.",
                response_mime_type="application/json",
                response_schema=VoiceAction,
            ),
        )

        import json
        return json.loads(response.text)

    except Exception as e:
        print("\n--- ERROR ---")
        print(e)
        print("--------------\n")
        raise HTTPException(status_code=500, detail=str(e))