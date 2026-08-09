from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import calculation, properties, ai

app = FastAPI(title="Valuon Estate Backend API")

# Zugriff nur von deinem eigenen Frontend und deiner lokalen Entwicklungsumgebung erlauben
origins = [
    "http://localhost:3000",
    "https://valuon-estate.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculation.router)
app.include_router(properties.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "Valuon Estate Backend ist erreichbar."}
