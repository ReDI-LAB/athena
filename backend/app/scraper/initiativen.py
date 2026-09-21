import re
from typing import List
import httpx
from bs4 import BeautifulSoup

URL = "https://www.reparatur-initiativen.de/aktive?zip=8"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}


async def scrape_initiativen(client: httpx.AsyncClient) -> List[dict]:
    print("[Initiativen] Lade Reparatur-Initiativen aus PLZ 8...")
    try:
        res = await client.get(URL, headers=HEADERS, timeout=20.0, follow_redirects=True)
        res.raise_for_status()
    except Exception as e:
        print(f"[Initiativen] HTTP-Fehler: {e}")
        return []

    soup = BeautifulSoup(res.text, "html.parser")
    entries = []

    cards = soup.select("a.public-user-wrapper")

    for card in cards:
        addr_el = card.select_one(".address-wrapper")
        if not addr_el:
            continue

        addr_text = addr_el.get_text(separator=" ", strip=True)

        # Filter: Nur München und Münchner Postleitzahlen (80xxx / 81xxx)
        plz_match = re.search(r"\b(8[01]\d{3})\b", addr_text)
        if not ("münchen" in addr_text.lower() or plz_match):
            continue

        plz = plz_match.group(1) if plz_match else "80331"

        # Titel ermitteln
        h2 = card.select_one("h2")
        p_name = card.select_one(".public-name-wrapper")
        title = ""
        if h2 and h2.get_text(strip=True):
            title = h2.get_text(strip=True)
        elif card.has_attr("title") and card["title"]:
            title = card["title"].replace("Zum Profil von ", "").strip()
        elif p_name:
            title = p_name.get_text(strip=True)

        if not title:
            continue

        # Straße parsen (alles vor der PLZ)
        street = None
        parts = addr_text.split(",")
        if len(parts) > 1 and not parts[0].strip().isdigit():
            street = parts[0].strip()[:80]

        href = card.get("href", "")
        website = f"https://www.reparatur-initiativen.de{href}" if href.startswith("/") else href

        entries.append({
            "title": title[:100],
            "source": "reparatur_initiativen",
            "street": street,
            "postal_code": plz,
            "city": "München",
            "categories": "Repair Café (Elektronik, Textil)",
            "website": website or None,
        })

    # Duplikate filtern
    unique = {e["title"]: e for e in entries}.values()
    print(f"[Initiativen] {len(unique)} Münchner Initiativen erfolgreich extrahiert.")
    return list(unique)