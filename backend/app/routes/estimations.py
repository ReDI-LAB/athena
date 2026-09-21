from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import ProductImpactBenchmark, RepairCostBenchmark, RepairLocation

router = APIRouter(prefix="/estimations", tags=["Estimations"])


# 1. Pydantic-Schema für die Reparaturorte
class LocationOut(BaseModel):
    id: int
    title: str
    source: str
    street: Optional[str] = None
    postal_code: Optional[str] = None
    city: str
    categories: Optional[str] = None
    website: Optional[str] = None

    class Config:
        from_attributes = True


# 2. Was das Frontend an die API schickt
class EstimationRequest(BaseModel):
    category: str  # z. B. "textiles" oder "electronics"
    product_type: str  # z. B. "jeans" oder "smartphone"
    repair_type: Optional[str] = None  # z. B. "zipper" oder "battery"
    postal_code: Optional[str] = None  # z. B. "80339"


# 3. Was die API als Antwort zurückgibt
class EstimationResponse(BaseModel):
    category: str
    product_type: str
    repair_type: Optional[str]
    co2_saved_kg: float
    waste_avoided_kg: float
    cost_min_eur: Optional[float]
    cost_max_eur: Optional[float]
    recommended_locations: List[LocationOut] = []


@router.post("/", response_model=EstimationResponse)
async def calculate_estimation(
    payload: EstimationRequest,
    db: AsyncSession = Depends(get_db)
):
    # 1. Ökologische Benchmarks (CO2 & Gewicht) aus der DB holen
    impact_stmt = select(ProductImpactBenchmark).where(
        ProductImpactBenchmark.product_type.ilike(payload.product_type)
    )
    impact_result = await db.execute(impact_stmt)
    impact = impact_result.scalars().first()

    if not impact:
        raise HTTPException(
            status_code=404,
            detail=f"Keine ökologischen Daten für Produkttyp '{payload.product_type}' gefunden."
        )

    # 2. Reparaturkosten-Korridor ermitteln (falls repair_type übergeben wurde)
    cost_min = None
    cost_max = None
    if payload.repair_type:
        cost_stmt = select(RepairCostBenchmark).where(
            RepairCostBenchmark.product_type.ilike(payload.product_type),
            RepairCostBenchmark.repair_type.ilike(payload.repair_type)
        )
        cost_result = await db.execute(cost_stmt)
        cost_benchmark = cost_result.scalars().first()

        if cost_benchmark:
            cost_min = cost_benchmark.cost_min
            cost_max = cost_benchmark.cost_max

    # 3. Bis zu 5 passende Reparatur-Orte aus der Datenbank ermitteln
    cat_keyword = "textil" if "textil" in payload.category.lower() else "elektronik" if "elektron" in payload.category.lower() else ""

    locations: List[RepairLocation] = []

    # A) Exakter Treffer: Gleiche PLZ + passende Kategorie
    if payload.postal_code:
        stmt_plz = (
            select(RepairLocation)
            .where(
                RepairLocation.postal_code == payload.postal_code,
                RepairLocation.categories.ilike(f"%{cat_keyword}%")
            )
            .limit(5)
        )
        res_plz = await db.execute(stmt_plz)
        locations.extend(res_plz.scalars().all())

    # B) Fallback / Auffüllen auf 5 Orte: Andere Münchner Orte passender Kategorie
    if len(locations) < 5:
        existing_ids = [loc.id for loc in locations]
        needed = 5 - len(locations)

        stmt_fallback = select(RepairLocation).where(
            RepairLocation.id.not_in(existing_ids) if existing_ids else True,
            RepairLocation.categories.ilike(f"%{cat_keyword}%") if cat_keyword else True
        ).limit(needed)

        res_fallback = await db.execute(stmt_fallback)
        locations.extend(res_fallback.scalars().all())

    # C) Wenn immer noch keine 5 voll sind: Beliebige Orte (z. B. allgemeine Repair Cafés)
    if len(locations) < 5:
        existing_ids = [loc.id for loc in locations]
        needed = 5 - len(locations)

        stmt_any = select(RepairLocation).where(
            RepairLocation.id.not_in(existing_ids) if existing_ids else True
        ).limit(needed)

        res_any = await db.execute(stmt_any)
        locations.extend(res_any.scalars().all())

    return EstimationResponse(
        category=payload.category,
        product_type=payload.product_type,
        repair_type=payload.repair_type,
        co2_saved_kg=impact.co2e_kg,
        waste_avoided_kg=impact.avg_weight_kg,
        cost_min_eur=cost_min,
        cost_max_eur=cost_max,
        recommended_locations=locations
    )