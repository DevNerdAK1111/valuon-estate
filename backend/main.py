import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import calculation, properties, ai

app = FastAPI(title="Valuon Estate Backend API")

# Erlaubte Ursprünge dynamisch aus Umgebungsvariablen lesen
cors_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://valuon-estate.vercel.app")
origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculation.router)
app.include_router(properties.router)
# Hier ist der entscheidende Fix:
app.include_router(ai.router, prefix="/api")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Valuon Estate Backend ist erreichbar."}
