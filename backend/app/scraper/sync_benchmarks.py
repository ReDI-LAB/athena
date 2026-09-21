import csv
from pathlib import Path
from sqlalchemy.future import select

from app.database import AsyncSessionLocal
from app.models import ProductImpactBenchmark, RepairCostBenchmark

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
IMPACT_CSV = DATA_DIR / "benchmarks_impact.csv"
COST_CSV = DATA_DIR / "benchmarks_cost.csv"


async def sync_product_impacts(session):
    if not IMPACT_CSV.exists():
        print(f"[Sync] Datei nicht gefunden: {IMPACT_CSV}")
        return

    with open(IMPACT_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        added, updated = 0, 0

        for row in reader:
            stmt = select(ProductImpactBenchmark).where(
                ProductImpactBenchmark.product_type == row["product_type"]
            )
            existing = (await session.execute(stmt)).scalars().first()

            if existing:
                existing.category = row["category"]
                existing.avg_weight_kg = float(row["avg_weight_kg"])
                existing.co2e_kg = float(row["co2e_kg"])
                updated += 1
            else:
                session.add(ProductImpactBenchmark(
                    category=row["category"],
                    product_type=row["product_type"],
                    avg_weight_kg=float(row["avg_weight_kg"]),
                    co2e_kg=float(row["co2e_kg"])
                ))
                added += 1

    print(f"[Sync] Impact-Benchmarks: {added} hinzugefügt, {updated} aktualisiert.")


async def sync_repair_costs(session):
    if not COST_CSV.exists():
        print(f"[Sync] Datei nicht gefunden: {COST_CSV}")
        return

    with open(COST_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        added, updated = 0, 0

        for row in reader:
            stmt = select(RepairCostBenchmark).where(
                RepairCostBenchmark.product_type == row["product_type"],
                RepairCostBenchmark.repair_type == row["repair_type"]
            )
            existing = (await session.execute(stmt)).scalars().first()

            if existing:
                existing.category = row["category"]
                existing.cost_min = float(row["cost_min"])
                existing.cost_max = float(row["cost_max"])
                updated += 1
            else:
                session.add(RepairCostBenchmark(
                    category=row["category"],
                    product_type=row["product_type"],
                    repair_type=row["repair_type"],
                    cost_min=float(row["cost_min"]),
                    cost_max=float(row["cost_max"])
                ))
                added += 1

    print(f"[Sync] Cost-Benchmarks: {added} hinzugefügt, {updated} aktualisiert.")


async def sync_all_benchmarks():
    async with AsyncSessionLocal() as session:
        await sync_product_impacts(session)
        await sync_repair_costs(session)
        await session.commit()
        print("[Sync] Benchmark-Synchronisation vollständig abgeschlossen.")


if __name__ == "__main__":
    import asyncio
    asyncio.run(sync_all_benchmarks())