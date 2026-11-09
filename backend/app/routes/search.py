import re
from typing import Optional, Dict, List
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from thefuzz import fuzz

from app.database import get_db
from app.routes.estimations import calculate_estimation
from app.routes.estimations import EstimationResponse

router = APIRouter(prefix="/search", tags=["Search"])

# Wörterbücher mit kanonischen Werten und ihren Synonymen/Übersetzungen
CATEGORY_ALIASES: Dict[str, List[str]] = {
    "electronics": ["electronic", "electronics", "elektronik", "gerät", "device", "gadget"],
    "textiles": ["textile", "textiles", "kleidung", "clothes", "clothing", "stoff", "fabric"],
}

PRODUCT_ALIASES: Dict[str, List[str]] = {
    "smartphone": ["phone", "smartphone", "handy", "iphone", "galaxy", "mobiltelefon", "cellphone"],
    "laptop": ["laptop", "notebook", "macbook", "computer", "pc"],
    "tablet": ["tablet", "ipad"],
    "backpack": ["backpack", "rucksack", "tasche", "bag"],
    "jeans": ["jeans", "hose", "pants", "trousers", "denim"],
    "jacket": ["jacket", "jacke", "mantel", "coat", "anorak"],
}

REPAIR_ALIASES: Dict[str, List[str]] = {
    "display": ["screen", "display", "glas", "glass", "touchscreen", "bildschirm", "scheibe"],
    "battery": ["battery", "akku", "batterie", "power", "charging", "laden"],
    "zipper": ["zipper", "reißverschluss", "zip", "zipp"],
    "seam": ["seam", "naht", "torn", "gerissen", "hole", "loch", "flicken"],
}

# Mindest-Ähnlichkeit (Score von 0 bis 100)
# 80 fängt Tippfehler wie 'brocken' -> 'broken' oder 'fon' -> 'phone' ab,
# verhindert aber falsche Treffer bei kurzen Wörtern.
FUZZY_THRESHOLD = 80


def match_with_fuzzy(tokens: List[str], alias_map: Dict[str, List[str]]) -> Optional[str]:
    """
    Vergleicht jedes Token des Nutzers gegen die hinterlegten Aliase.
    Gibt den kanonischen Schlüssel zurück, sobald die Ähnlichkeit >= FUZZY_THRESHOLD ist.
    """
    for token in tokens:
        # Sehr kurze Wörter überspringen, um False Positives zu vermeiden (z. B. "is", "my", "to")
        if len(token) < 3:
            continue

        for canonical, aliases in alias_map.items():
            for alias in aliases:
                # Exakter Treffer (schnell)
                if token == alias:
                    return canonical
                
                # Bei Wörtern ab 4 Zeichen Tippfehler-Toleranz anwenden
                if len(token) >= 4 and len(alias) >= 4:
                    score = fuzz.ratio(token, alias)
                    if score >= FUZZY_THRESHOLD:
                        return canonical
                        
    return None


class ParsedSearchQuery(BaseModel):
    raw_query: str
    detected_category: Optional[str] = None
    detected_product_type: Optional[str] = None
    detected_repair_type: Optional[str] = None
    postal_code: Optional[str] = None


def parse_free_text_fuzzy(text: str) -> ParsedSearchQuery:
    # 1. Bereinigen & Tokenisieren
    cleaned = text.lower()
    
    # PLZ erkennen (5-stellig, beginnt typischerweise mit 8 in München)
    plz_match = re.search(r"\b(8\d{4}|\d{5})\b", cleaned)
    detected_plz = plz_match.group(1) if plz_match else None

    # Satz in einzelne Wörter ohne Sonderzeichen zerlegen
    tokens = re.findall(r"\b\w+\b", cleaned)

    # 2. Entitäten mit Tippfehlertoleranz ermitteln
    detected_repair = match_with_fuzzy(tokens, REPAIR_ALIASES)
    detected_product = match_with_fuzzy(tokens, PRODUCT_ALIASES)
    detected_category = match_with_fuzzy(tokens, CATEGORY_ALIASES)

    # 3. Falls Kategorie nicht explizit genannt wurde: aus Produkt ableiten
    if not detected_category and detected_product:
        if detected_product in ["smartphone", "laptop", "tablet"]:
            detected_category = "electronics"
        elif detected_product in ["backpack", "jeans", "jacket"]:
            detected_category = "textiles"

    return ParsedSearchQuery(
        raw_query=text,
        detected_category=detected_category,
        detected_product_type=detected_product,
        detected_repair_type=detected_repair,
        postal_code=detected_plz
    )


@router.get("/parse", response_model=ParsedSearchQuery)
async def parse_query_only(q: str = Query(..., description="Freitext z. B. 'my fone scrin is brocken 80333'")):
    """Analysiert den Text und gibt die erkannten Dropdown-Werte zurück."""
    return parse_free_text_fuzzy(q)


@router.get("/estimate", response_model=EstimationResponse)
async def search_and_estimate(
    q: str = Query(..., description="Freitext-Suche mit Schätzungsergebnis"),
    db: AsyncSession = Depends(get_db)
):
    """Parst die Eingabe und berechnet direkt die Schätzung inklusive Standorte."""
    parsed = parse_free_text_fuzzy(q)

    # Fallbacks, falls Wörter komplett fehlen
    category = parsed.detected_category or "electronics"
    product_type = parsed.detected_product_type or "smartphone"
    repair_type = parsed.detected_repair_type or "display"
    postal_code = parsed.postal_code

    return await calculate_estimation(
        category=category,
        product_type=product_type,
        repair_type=repair_type,
        postal_code=postal_code,
        db=db
    )