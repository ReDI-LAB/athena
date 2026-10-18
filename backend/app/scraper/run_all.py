import asyncio
import httpx
from sqlalchemy import delete
from sqlalchemy.future import select

from app.database import AsyncSessionLocal, engine, Base
from app.models import RepairLocation
from app.scraper.awm import scrape_awm
from app.scraper.initiativen import scrape_initiativen


# async def clean_and_save(locations: list[dict]):
#     async with AsyncSessionLocal() as session:
#         # Lösche die vorherigen Navigations-Einträge
#         await session.execute(
#             delete(RepairLocation).where(
#                 RepairLocation.title.in_([
#                     "Reparieren statt wegwerfen", "Kampagnen", "Registrieren",
#                     "Aktuelles", "Netzwerktreffen", "Kenntnisse & Interessen",
#                     "Hier finden Sie eine Übersicht von Repair Cafés", "Unternehmen"
#                 ])
#             )
#         )
#         await session.commit()

#         if not locations:
#             print("[DB] Keine neuen Standorte gefunden.")
#             return

#         added = 0
#         for item in locations:
#             stmt = select(RepairLocation).where(
#                 RepairLocation.title == item["title"],
#                 RepairLocation.postal_code == item["postal_code"]
#             )
#             exists = (await session.execute(stmt)).scalars().first()
#             if not exists:
#                 session.add(RepairLocation(**item))
#                 added += 1

#         await session.commit()
#         print(f"[DB] {added} echte Reparatur-Standorte erfolgreich gespeichert.")


# async def main():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

#     async with httpx.AsyncClient() as client:
#         awm_entries = await scrape_awm(client)
#         init_entries = await scrape_initiativen(client)

#     all_entries = awm_entries + init_entries
#     print(f"\n[Scraper] Insgesamt {len(all_entries)} gefundene Adressen.")
#     await clean_and_save(all_entries)
async def clean_and_save(entries: list):
    # Frische Session erst NACH dem Scrapen öffnen!
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # 1. Junk-Einträge bereinigen
            junk_titles = [
                'Reparieren statt wegwerfen', 'Kampagnen', 'Registrieren',
                'Aktuelles', 'Netzwerktreffen', 'Kenntnisse & Interessen',
                'Hier finden Sie eine Übersicht von Repair Cafés', 'Unternehmen'
            ]
            await session.execute(
                delete(RepairLocation).where(RepairLocation.title.in_(junk_titles))
            )

            # 2. Relevante Adressen einfügen / upserten
            valid_entries = [e for e in entries if e.get("title") not in junk_titles]
            for item in valid_entries:
                loc = RepairLocation(
                    title=item.get("title"),
                    source=item.get("source", "awm"),
                    street=item.get("street"),
                    postal_code=item.get("postal_code"),
                    city=item.get("city", "München"),
                    categories=item.get("categories"),
                    website=item.get("website")
                )
                session.add(loc)

        await session.commit()
        print(f"[DB] {len(valid_entries)} Werkstätten erfolgreich in Supabase gespeichert!")


# async def main():
#     # 1. Scrapen (KEINE aktive DB-Verbindung währenddessen!)
#     all_entries = []
    
#     awm_data = await scrape_awm()
#     all_entries.extend(awm_data)

#     try:
#         initiativen_data = await scrape_reparatur_initiativen()
#         all_entries.extend(initiativen_data)
#     except Exception as e:
#         print(f"[Initiativen Warnung] {e}")

#     print(f"[Scraper] Insgesamt {len(all_entries)} gefundene Adressen.")

#     # 2. Erst jetzt die DB verbinden und speichern
#     await clean_and_save(all_entries)

async def main():
    all_entries = []

    # HTTP-Client für die Scraper bereitstellen
    async with httpx.AsyncClient(timeout=30.0) as client:
        awm_data = await scrape_awm(client)
        all_entries.extend(awm_data)

        try:
            # Falls scrape_reparatur_initiativen auch client braucht: scrape_reparatur_initiativen(client)
            # Falls nicht: scrape_reparatur_initiativen()
            initiativen_data = await scrape_reparatur_initiativen(client)
            all_entries.extend(initiativen_data)
        except TypeError:
            # Fallback falls scrape_reparatur_initiativen keinen client-Parameter hat
            initiativen_data = await scrape_reparatur_initiativen()
            all_entries.extend(initiativen_data)
        except Exception as e:
            print(f"[Initiativen Warnung] {e}")

    print(f"[Scraper] Insgesamt {len(all_entries)} gefundene Adressen.")

    # Erst NACH dem Scraping die Datenbank-Session öffnen (verhindert Timeout)
    await clean_and_save(all_entries)

if __name__ == "__main__":
    asyncio.run(main())