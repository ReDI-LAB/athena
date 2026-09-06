from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import RepairCostBenchmark, ProductImpactBenchmark

# 1. Daten für CO2 & vermiedenen Müll (ProBas / The Restart Project)
IMPACT_DATA = [
    {"category": "textiles", "product_type": "jeans", "avg_weight_kg": 0.8, "co2e_kg": 23.4},
    {"category": "textiles", "product_type": "t-shirt", "avg_weight_kg": 0.2, "co2e_kg": 7.0},
    {"category": "textiles", "product_type": "jacket", "avg_weight_kg": 1.2, "co2e_kg": 38.0},
    {"category": "textiles", "product_type": "sweater", "avg_weight_kg": 0.5, "co2e_kg": 27.5},
    {"category": "electronics", "product_type": "smartphone", "avg_weight_kg": 0.19, "co2e_kg": 55.0},
    {"category": "electronics", "product_type": "tablet", "avg_weight_kg": 0.48, "co2e_kg": 85.0},
    {"category": "electronics", "product_type": "laptop", "avg_weight_kg": 2.1, "co2e_kg": 250.0},
    {"category": "electronics", "product_type": "hair dryer", "avg_weight_kg": 0.65, "co2e_kg": 12.0},
]

# 2. Daten für typische Reparaturkosten (A-GAIN / Bitkom)
COST_DATA = [
    {"category": "textiles", "product_type": "jeans", "repair_type": "zipper", "cost_min": 15.0, "cost_max": 28.0},
    {"category": "textiles", "product_type": "jeans", "repair_type": "hole", "cost_min": 10.0, "cost_max": 22.0},
    {"category": "textiles", "product_type": "jacket", "repair_type": "zipper", "cost_min": 25.0, "cost_max": 50.0},
    {"category": "electronics", "product_type": "smartphone", "repair_type": "display", "cost_min": 75.0, "cost_max": 180.0},
    {"category": "electronics", "product_type": "smartphone", "repair_type": "battery", "cost_min": 45.0, "cost_max": 85.0},
    {"category": "electronics", "product_type": "laptop", "repair_type": "battery", "cost_min": 45.0, "cost_max": 210.0},
    {"category": "electronics", "product_type": "hair dryer", "repair_type": "cable", "cost_min": 15.0, "cost_max": 35.0},
]

async def seed_initial_data(session: AsyncSession):
    # Nur einfügen, wenn noch keine Daten vorhanden sind
    impact_exists = (await session.execute(select(ProductImpactBenchmark))).scalars().first()
    if not impact_exists:
        for item in IMPACT_DATA:
            session.add(ProductImpactBenchmark(**item))

    cost_exists = (await session.execute(select(RepairCostBenchmark))).scalars().first()
    if not cost_exists:
        for item in COST_DATA:
            session.add(RepairCostBenchmark(**item))

    await session.commit()