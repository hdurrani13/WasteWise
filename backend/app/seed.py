import csv
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Announcement, Item, Zone

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

ZONES = [
    # name, weekday (0=Mon), garbage parity, garbage window, recycling window
    ("Zone A", 0, 0, "7AM-12PM", "12PM-6PM"),
    ("Zone B", 1, 1, "7AM-12PM", "12PM-6PM"),
    ("Zone C", 2, 0, "9AM-12PM", "1PM-6PM"),
    ("Zone D", 3, 1, "7AM-12PM", "12PM-6PM"),
    ("Zone E", 4, 0, "9AM-12PM", "1PM-6PM"),
]

ANNOUNCEMENTS = [
    (
        "Holiday pickups move one day later",
        "When your pickup day falls on a statutory holiday, collection happens the next day. "
        "Shifted pickups are marked on your calendar.",
    ),
    (
        "Yard waste season",
        "Yard waste is collected with recycling from May through October. "
        "Use paper yard waste bags; plastic bags are not accepted.",
    ),
]


def seed(db: Session) -> None:
    if db.scalar(select(Zone).limit(1)) is None:
        db.add_all(
            Zone(name=n, weekday=w, garbage_week_parity=p, garbage_window=gw, recycling_window=rw)
            for n, w, p, gw, rw in ZONES
        )
    if db.scalar(select(Item).limit(1)) is None:
        with open(DATA_DIR / "items.csv", newline="", encoding="utf-8") as f:
            db.add_all(Item(**row) for row in csv.DictReader(f))
    if db.scalar(select(Announcement).limit(1)) is None:
        db.add_all(Announcement(title=t, body=b) for t, b in ANNOUNCEMENTS)
    db.commit()
