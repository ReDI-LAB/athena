from typing import Dict, List, Optional
from thefuzz import fuzz

# Mapping: Stadtteil -> Zugehörige Münchner Postleitzahlen
MUNICH_DISTRICTS: Dict[str, List[str]] = {
    "Altstadt-Lehel": ["80331", "80333", "80469", "80538", "80539"],
    "Ludwigsvorstadt-Isarvorstadt": ["80335", "80336", "80337", "80469"],
    "Maxvorstadt": ["80333", "80335", "80539", "80797", "80798", "80799"],
    "Schwabing-West": ["80796", "80797", "80798", "80801", "80803", "80804", "80809"],
    "Au-Haidhausen": ["81541", "81543", "81667", "81669", "81671", "81675", "81677"],
    "Sendling": ["80336", "80337", "81369", "81371", "81373", "81379"],
    "Sendling-Westpark": ["80686", "81369", "81373", "81377"],
    "Schwanthalerhöhe": ["80335", "80339"],
    "Neuhausen-Nymphenburg": ["80634", "80636", "80637", "80638", "80639", "80809"],
    "Moosach": ["80637", "80638", "80992", "80993", "80997"],
    "Milbertshofen-Am Hart": ["80807", "80809", "80937", "80939"],
    "Schwabing-Freimann": ["80538", "80801", "80802", "80803", "80804", "80805", "80939"],
    "Bogenhausen": ["81675", "81677", "81679", "81925", "81927", "81929"],
    "Berg am Laim": ["81671", "81673", "81735"],
    "Trudering-Riem": ["81825", "81827", "81829"],
    "Ramersdorf-Perlach": ["81539", "81549", "81669", "81671", "81735", "81737", "81739"],
    "Obergiesing-Fasangarten": ["81539", "81541", "81547", "81549"],
    "Untergiesing-Harlaching": ["81541", "81543", "81545", "81547"],
    "Thalkirchen-Obersendling-Forstenried-Fürstenried-Solln": ["81379", "81475", "81476", "81477", "81479"],
    "Hadern": ["80689", "81375", "81377"],
    "Pasing-Obermenzing": ["81241", "81243", "81245", "81247", "81249"],
    "Aubing-Lochhausen-Langwied": ["81243", "81245", "81249"],
    "Allach-Untermenzing": ["80995", "80997", "80999"],
    "Feldmoching-Hasenbergl": ["80933", "80935", "80995"],
    "Laim": ["80686", "80687", "80689"],
}

# Kurzformen / Aliase für die Freitextsuche (z.B. "Schwabing" -> "Schwabing-West")
DISTRICT_ALIASES: Dict[str, str] = {
    "altstadt": "Altstadt-Lehel",
    "lehel": "Altstadt-Lehel",
    "glockenbach": "Ludwigsvorstadt-Isarvorstadt",
    "isarvorstadt": "Ludwigsvorstadt-Isarvorstadt",
    "ludwigsvorstadt": "Ludwigsvorstadt-Isarvorstadt",
    "maxvorstadt": "Maxvorstadt",
    "schwabing": "Schwabing-West",
    "haidhausen": "Au-Haidhausen",
    "au": "Au-Haidhausen",
    "sendling": "Sendling",
    "westend": "Schwanthalerhöhe",
    "schwanthalerhöhe": "Schwanthalerhöhe",
    "neuhausen": "Neuhausen-Nymphenburg",
    "nymphenburg": "Neuhausen-Nymphenburg",
    "moosach": "Moosach",
    "milbertshofen": "Milbertshofen-Am Hart",
    "freimann": "Schwabing-Freimann",
    "bogenhausen": "Bogenhausen",
    "berg am laim": "Berg am Laim",
    "trudering": "Trudering-Riem",
    "riem": "Trudering-Riem",
    "perlach": "Ramersdorf-Perlach",
    "ramersdorf": "Ramersdorf-Perlach",
    "giesing": "Obergiesing-Fasangarten",
    "obergiesing": "Obergiesing-Fasangarten",
    "untergiesing": "Untergiesing-Harlaching",
    "harlaching": "Untergiesing-Harlaching",
    "solln": "Thalkirchen-Obersendling-Forstenried-Fürstenried-Solln",
    "thalkirchen": "Thalkirchen-Obersendling-Forstenried-Fürstenried-Solln",
    "hadern": "Hadern",
    "pasing": "Pasing-Obermenzing",
    "obermenzing": "Pasing-Obermenzing",
    "aubing": "Aubing-Lochhausen-Langwied",
    "allach": "Allach-Untermenzing",
    "feldmoching": "Feldmoching-Hasenbergl",
    "laim": "Laim",
}


def get_postal_codes_for_district(district: str) -> List[str]:
    """Gibt alle PLZ für einen offiziellen Stadtteilnamen zurück (case-insensitive)."""
    for name, plzs in MUNICH_DISTRICTS.items():
        if name.lower() == district.strip().lower():
            return plzs
    return []


def detect_district_from_text(tokens: List[str], full_text: str) -> Optional[str]:
    """Erkennt einen Münchner Stadtteil im Freitext (inkl. Tippfehler-Toleranz)."""
    # 1. Mehrteilige Stadtteile prüfen (z. B. "berg am laim")
    for alias, official_name in DISTRICT_ALIASES.items():
        if " " in alias and alias in full_text:
            return official_name

    # 2. Einzelne Wörter prüfen (exakt + Fuzzy)
    for token in tokens:
        if len(token) < 3:
            continue
        for alias, official_name in DISTRICT_ALIASES.items():
            if " " in alias:
                continue
            if token == alias:
                return official_name
            if len(token) >= 5 and len(alias) >= 5 and fuzz.ratio(token, alias) >= 82:
                return official_name

    return None