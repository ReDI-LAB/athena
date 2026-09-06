from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, AsyncSessionLocal
import app.models
from app.seed import seed_initial_data  # <-- Neu importieren
from app.routes.estimations import router as estimations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Erstellt die 3 Tabellen automatisch beim Start in der Datenbank
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # 2. Initiale Benchmark-Daten einspielen
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
    yield


app = FastAPI(title="Repair Platform API", lifespan=lifespan)

# CORS-Einstellung für das Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router einbinden
app.include_router(estimations_router)