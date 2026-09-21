import asyncio
import httpx
from sqlalchemy import delete
from sqlalchemy.future import select

from app.database import AsyncSessionLocal, engine, Base
from app.models import RepairLocation
from app.scraper.awm import scrape_awm
from app.scraper.initiativen import scrape_initiativen


async def clean_and_save(locations: list[dict]):
    async with AsyncSessionLocal() as session:
        # Lösche die vorherigen Navigations-Einträge
        await session.execute(
            delete(RepairLocation).where(
                RepairLocation.title.in_([
                    "Reparieren statt wegwerfen", "Kampagnen", "Registrieren",
                    "Aktuelles", "Netzwerktreffen", "Kenntnisse & Interessen",
                    "Hier finden Sie eine Übersicht von Repair Cafés", "Unternehmen"
                ])
            )
        )
        await session.commit()

        if not locations:
            print("[DB] Keine neuen Standorte gefunden.")
            return

        added = 0
        for item in locations:
            stmt = select(RepairLocation).where(
                RepairLocation.title == item["title"],
                RepairLocation.postal_code == item["postal_code"]
            )
            exists = (await session.execute(stmt)).scalars().first()
            if not exists:
                session.add(RepairLocation(**item))
                added += 1

        await session.commit()
        print(f"[DB] {added} echte Reparatur-Standorte erfolgreich gespeichert.")


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with httpx.AsyncClient() as client:
        awm_entries = await scrape_awm(client)
        init_entries = await scrape_initiativen(client)

    all_entries = awm_entries + init_entries
    print(f"\n[Scraper] Insgesamt {len(all_entries)} gefundene Adressen.")
    await clean_and_save(all_entries)


if __name__ == "__main__":
    asyncio.run(main())