from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import RepairCostBenchmark, ProductImpactBenchmark

router = APIRouter(prefix="/estimations", tags=["Estimations"])


# 1. Was das Frontend an die API schickt
class EstimationRequest(BaseModel):
    category: str              # z. B. "textiles" oder "electronics"
    product_type: str          # z. B. "jeans" oder "smartphone"
    repair_type: Optional[str] = None  # z. B. "zipper" oder "battery"


# 2. Was die API als Antwort zurückgibt
class EstimationResponse(BaseModel):
    category: str
    product_type: str
    repair_type: Optional[str]
    co2_saved_kg: float
    waste_avoided_kg: float
    cost_min_eur: Optional[float]
    cost_max_eur: Optional[float]


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

    return EstimationResponse(
        category=payload.category,
        product_type=payload.product_type,
        repair_type=payload.repair_type,
        co2_saved_kg=impact.co2e_kg,
        waste_avoided_kg=impact.avg_weight_kg,
        cost_min_eur=cost_min,
        cost_max_eur=cost_max,
    )