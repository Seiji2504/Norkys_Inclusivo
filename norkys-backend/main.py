import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Cargar variables de entorno
load_dotenv()

# Inicializar cliente oficial de Gemini 2026
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("Falta la variable GEMINI_API_KEY en el archivo .env")

client = genai.Client(api_key=api_key)

app = FastAPI(title="Norky's AI Assistant Backend")

# Configurar CORS para permitir que tu React (localhost:5173) se comunique con Python
# Configurar CORS definitivo (Permite TODO para evitar bloqueos locales)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # El comodín "*" permite localhost, 127.0.0.1, celulares, etc.
    allow_credentials=False,  # Obligatorio poner False si usas "*" (no lo necesitamos de todos modos)
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definimos el esquema estricto de respuesta que queremos de Gemini (Structured Output)
class NavigationIntent(BaseModel):
    action: str = Field(description="Acción a realizar. Debe ser 'navigate' si el usuario quiere ir a una sección, o 'unknown' si no se entiende.")
    target: str = Field(description="Pestaña de destino. Valores permitidos: 'Home' (para inicio/carta), 'User' (para perfil), 'Fav' (favoritos), 'Cart' (carrito), 'accessibility' (pestaña accesibilidad).")
    message: str = Field(description="Mensaje corto y amigable en español para leerle de vuelta al usuario. Ej: 'Entendido, te llevo a la carta de pollos.'")

# Modelo de datos que recibirá el endpoint
class VoiceInput(BaseModel):
    text: str

@app.post("/api/intent", response_model=NavigationIntent)
async def process_voice_intent(user_input: VoiceInput):
    try:
        # Prompt del sistema para entrenar a Gemini en su rol
        prompt = f"""
        Analiza el siguiente comando de voz del usuario para una aplicación de pollería Norky's adaptativa.
        Determina a qué sección quiere ir.
        
        Comando del usuario: "{user_input.text}"
        
        Mapea el destino estrictamente a uno de estos valores:
        - Si quiere ir al inicio, menú, pollos, combos o carta -> target: 'Home'
        - Si quiere ir a su perfil, su cuenta o cerrar sesión -> target: 'User'
        - Si quiere ver favoritos o el corazón -> target: 'Fav'
        - Si quiere ir al carrito de compras, bolsa o pagar -> target: 'Cart'
        - Si quiere configurar accesibilidad, letra, contraste o daltonismo -> target: 'accessibility'
        """

        # Llamada a Gemini con validación estructural de Pydantic
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite", # El modelo más rápido y barato para análisis de texto
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="Eres el asistente de voz inteligente de Pollerías Norky's. Tu objetivo es procesar la navegación de usuarios mayores o discapacitados. Responde estrictamente con el JSON validado.",
                response_mime_type="application/json",
                response_schema=NavigationIntent, # Fuerza a Gemini a dar el JSON perfecto
            ),
        )

        # Parsear y devolver la respuesta JSON estructurada directamente al frontend
        import json
        structured_data = json.loads(response.text)
        return structured_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Iniciar servidor local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)