from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import ProductImpactBenchmark, RepairCostBenchmark

router = APIRouter(prefix="/options", tags=["Options & Dropdowns"])


@router.get("/categories", response_model=List[str])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Gibt alle verfügbaren Hauptkategorien zurück (z. B. ['electronics', 'textiles'])."""
    stmt = select(ProductImpactBenchmark.category).distinct().order_by(ProductImpactBenchmark.category)
    result = await db.execute(stmt)
    categories = result.scalars().all()
    return [c for c in categories if c]


@router.get("/product-types", response_model=List[str])
async def get_product_types(
    category: Optional[str] = Query(None, description="Filter nach Hauptkategorie (z. B. textiles)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Gibt Produkttypen (Subcategories) zurück.
    - Wenn category angegeben ist: nur Typen dieser Kategorie (z. B. ['backpack', 'jeans']).
    - Wenn keine category angegeben ist: alle verfügbaren Produkttypen.
    """
    stmt = select(ProductImpactBenchmark.product_type).distinct()
    
    if category:
        stmt = stmt.where(ProductImpactBenchmark.category == category)
        
    stmt = stmt.order_by(ProductImpactBenchmark.product_type)
    result = await db.execute(stmt)
    products = result.scalars().all()
    return [p for p in products if p]


@router.get("/repair-types", response_model=List[str])
async def get_repair_types(
    category: Optional[str] = Query(None, description="Filter nach Hauptkategorie"),
    product_type: Optional[str] = Query(None, description="Filter nach Produkttyp (z. B. backpack)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Gibt Reparaturarten (Subsubcategories) zurück.
    - Filtert nach category und/oder product_type, falls vorhanden.
    - Wenn nichts übergeben wird: gibt alle bekannten Reparaturarten zurück.
    """
    stmt = select(RepairCostBenchmark.repair_type).distinct()

    if category:
        stmt = stmt.where(RepairCostBenchmark.category == category)
    if product_type:
        stmt = stmt.where(RepairCostBenchmark.product_type == product_type)

    stmt = stmt.order_by(RepairCostBenchmark.repair_type)
    result = await db.execute(stmt)
    repairs = result.scalars().all()
    return [r for r in repairs if r]