from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, AsyncSessionLocal
import app.models
from app.seed import seed_initial_data  # <-- Neu importieren
from app.routes.estimations import router as estimations_router
from app.routes import estimations

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.scraper.run_all import main as run_scraper_job
from app.scraper.sync_benchmarks import sync_all_benchmarks


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

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. DB-Tabellen sicherstellen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Benchmarks direkt aus den CSV-Dateien in Postgres einlesen
    await sync_all_benchmarks()

    # 3. Wöchentlicher Lauf für den Scraper
    scheduler.add_job(
        run_scraper_job, 
        CronTrigger(day_of_week="tue", hour=3, minute=0),
        id="weekly_scraper_job",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(title="Athena Repair Backend", lifespan=lifespan)
app.include_router(estimations.router)