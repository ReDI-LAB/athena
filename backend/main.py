import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import engine, Base
import app.models
from app.routes import estimations
from app.scraper.run_all import main as run_scraper_job
from app.scraper.sync_benchmarks import sync_all_benchmarks


# Wrapper mit vollständigem Error-Logging für den Scraper
async def safe_scraper_job():
    print("[SCRAPER JOB] Starte Ausführung...")
    try:
        await run_scraper_job()
        print("[SCRAPER JOB] Erfolgreich beendet und Daten geschrieben!")
    except Exception as e:
        print(f"[SCRAPER JOB FEHLER] Exception abgefangen: {e}")
        traceback.print_exc()


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. DB-Tabellen sicherstellen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Benchmarks direkt aus CSV synchronisieren
    try:
        await sync_all_benchmarks()
        print("[INIT] Benchmarks erfolgreich synchronisiert.")
    except Exception as e:
        print(f"[INIT FEHLER] Benchmark-Sync fehlgeschlagen: {e}")
        traceback.print_exc()

    # 3. Scraper-Job beim Scheduler registrieren (safe_scraper_job statt run_scraper_job)
    scheduler.add_job(
        safe_scraper_job,
        CronTrigger(day_of_week="sun", hour=20, minute=35, timezone="UTC"),
        id="weekly_scraper_job",
        replace_existing=True,
    )
    scheduler.start()
    print("[SCHEDULER] Scheduler gestartet.")

    yield

    scheduler.shutdown()
    print("[SCHEDULER] Scheduler beendet.")


app = FastAPI(title="Athena Repair Backend", lifespan=lifespan)

# CORS-Einstellung für das Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router einbinden
app.include_router(estimations.router)