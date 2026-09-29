"""Address normalization and zone assignment.

The real app would look addresses up in the city's open-data address
register. This demo accepts any Edmonton-style street address and assigns
it a zone deterministically, so the same address always gets the same
schedule.
"""

import hashlib
import re

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Address, Zone

ADDRESS_RE = re.compile(r"^\d{1,6}[a-z]?\s+[\w .'-]{2,}$", re.IGNORECASE)

ABBREVIATIONS = {
    "street": "st",
    "avenue": "ave",
    "road": "rd",
    "drive": "dr",
    "boulevard": "blvd",
    "northwest": "nw",
    "southwest": "sw",
    "northeast": "ne",
    "southeast": "se",
}


def normalize(raw: str) -> str:
    text = re.sub(r"[,#]", " ", raw.lower())
    text = re.sub(r"\s+", " ", text).strip()
    words = [ABBREVIATIONS.get(w.rstrip("."), w.rstrip(".")) for w in text.split(" ")]
    return " ".join(words)


def pretty(normalized: str) -> str:
    out = []
    for w in normalized.split(" "):
        out.append(w.upper() if w in {"nw", "sw", "ne", "se"} else w.capitalize())
    return " ".join(out)


def resolve(db: Session, raw: str) -> Address:
    norm = normalize(raw)
    if not ADDRESS_RE.match(norm):
        raise HTTPException(status_code=422, detail="Enter a street address like '10365 111 St NW'.")

    existing = db.scalar(select(Address).where(Address.normalized == norm))
    if existing:
        return existing

    zones = db.scalars(select(Zone).order_by(Zone.id)).all()
    if not zones:
        raise HTTPException(status_code=503, detail="Collection zones are not configured.")
    index = int(hashlib.sha256(norm.encode()).hexdigest(), 16) % len(zones)
    address = Address(normalized=norm, display=pretty(norm), zone_id=zones[index].id)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address
