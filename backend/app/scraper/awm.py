import re
from typing import List
import httpx
from bs4 import BeautifulSoup

URL = "https://www.awm-muenchen.de/abfall-vermeiden/reparieren-statt-wegwerfen/reparaturfuehrer/liste-aller-reperaturbetriebe-google"
BASE_URL = "https://www.awm-muenchen.de"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}


async def scrape_awm(client: httpx.AsyncClient) -> List[dict]:
    print("[AWM] Lade Betriebe-Liste...")
    try:
        res = await client.get(URL, headers=HEADERS, timeout=20.0, follow_redirects=True)
        res.raise_for_status()
    except Exception as e:
        print(f"[AWM] Fehler: {e}")
        return []

    soup = BeautifulSoup(res.text, "html.parser")
    entries = []

    # Exakter Selektor aus der debug.html
    links = soup.select(".awmtemplate_listgoogle a.internallink")
    print(f"[AWM] {len(links)} Betriebe im Index gefunden. Lade Details der relevanten Betriebe...")

    for a in links:
        title = a.get_text(strip=True)
        href = a.get("href", "")
        if not href or len(title) < 3:
            continue

        detail_url = f"{BASE_URL}{href}" if href.startswith("/") else href

        # Kategorie grob anhand des Titels
        low = title.lower()
        if any(w in low for w in ["elektronik", "pc", "computer", "handy", "mac", "tv", "hifi"]):
            cat = "Elektronik"
        elif any(w in low for w in ["schneid", "leder", "schuh", "nähen", "textil"]):
            cat = "Textilien"
        elif any(w in low for w in ["rad", "bike", "cycle"]):
            cat = "Fahrrad"
        else:
            cat = "Allgemein"

        # Detailseite für genaue Adresse laden
        street = None
        plz = "80331"
        try:
            sub_res = await client.get(detail_url, headers=HEADERS, timeout=10.0)
            if sub_res.status_code == 200:
                sub_soup = BeautifulSoup(sub_res.text, "html.parser")
                main_txt = sub_soup.get_text(separator=" ", strip=True)
                plz_match = re.search(r"\b(8[01]\d{3})\b", main_txt)
                if plz_match:
                    plz = plz_match.group(1)

                str_match = re.search(r"([A-Za-zäöüÄÖÜß\.\-\s]+(?:str|straße|weg|platz|ring))\s*(\d+[a-zA-Z]?)", main_txt, re.I)
                if str_match:
                    street = f"{str_match.group(1).strip()} {str_match.group(2).strip()}"[:80]
        except Exception:
            pass

        entries.append({
            "title": title[:100],
            "source": "awm_muenchen",
            "street": street,
            "postal_code": plz,
            "city": "München",
            "categories": cat,
            "website": detail_url,
        })

    print(f"[AWM] {len(entries)} Münchner Betriebe vollständig erfasst.")
    return entries