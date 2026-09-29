"""Pure functions that turn a zone's rules into dated pickup events.

Rules (sample data modelled on a typical Canadian city program):
- Every zone has one pickup weekday.
- Garbage and food scraps are collected together every other week.
- Recycling is collected on the alternate weeks.
- Yard waste rides along with recycling from May through October.
- A pickup that lands on a statutory holiday moves to the next day.
"""

from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date, timedelta

from .models import CollectionType

YARD_WASTE_MONTHS = range(5, 11)


@dataclass(frozen=True)
class ZoneRules:
    weekday: int
    garbage_week_parity: int
    garbage_window: str
    recycling_window: str


@dataclass(frozen=True)
class PickupEvent:
    date: date
    type: CollectionType
    window: str
    shifted_from: date | None = None


def _nth_weekday(year: int, month: int, weekday: int, n: int) -> date:
    first = date(year, month, 1)
    offset = (weekday - first.weekday()) % 7
    return first + timedelta(days=offset + 7 * (n - 1))


def _last_weekday_before(year: int, month: int, day: int, weekday: int) -> date:
    d = date(year, month, day) - timedelta(days=1)
    while d.weekday() != weekday:
        d -= timedelta(days=1)
    return d


def _easter(year: int) -> date:
    # Anonymous Gregorian algorithm
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    weekday_offset = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * weekday_offset) // 451
    month, day = divmod(h + weekday_offset - 7 * m + 114, 31)
    return date(year, month, day + 1)


def holidays(year: int) -> dict[date, str]:
    """Alberta general holidays."""
    return {
        date(year, 1, 1): "New Year's Day",
        _nth_weekday(year, 2, 0, 3): "Family Day",
        _easter(year) - timedelta(days=2): "Good Friday",
        _last_weekday_before(year, 5, 25, 0): "Victoria Day",
        date(year, 7, 1): "Canada Day",
        _nth_weekday(year, 9, 0, 1): "Labour Day",
        _nth_weekday(year, 10, 0, 2): "Thanksgiving",
        date(year, 11, 11): "Remembrance Day",
        date(year, 12, 25): "Christmas Day",
    }


def _week_parity(d: date) -> int:
    return d.isocalendar().week % 2


def events_for_range(rules: ZoneRules, start: date, end: date) -> list[PickupEvent]:
    """All pickups with a (possibly holiday-shifted) date in [start, end]."""
    events: list[PickupEvent] = []
    # Scan a few extra days back so a holiday shift can move an event into range
    d = start - timedelta(days=7)
    while d.weekday() != rules.weekday:
        d += timedelta(days=1)

    hols = {**holidays(d.year), **holidays(end.year)}
    while d <= end:
        if _week_parity(d) == rules.garbage_week_parity:
            planned = [
                (CollectionType.garbage, rules.garbage_window),
                (CollectionType.food_scraps, rules.garbage_window),
            ]
        else:
            planned = [(CollectionType.recycling, rules.recycling_window)]
            if d.month in YARD_WASTE_MONTHS:
                planned.append((CollectionType.yard_waste, rules.recycling_window))

        actual, shifted_from = d, None
        if d in hols:
            actual, shifted_from = d + timedelta(days=1), d
        if start <= actual <= end:
            events += [PickupEvent(actual, t, w, shifted_from) for t, w in planned]
        d += timedelta(days=7)
    return events


def events_for_month(rules: ZoneRules, year: int, month: int) -> list[PickupEvent]:
    last_day = calendar.monthrange(year, month)[1]
    return events_for_range(rules, date(year, month, 1), date(year, month, last_day))


def next_pickups(rules: ZoneRules, today: date, count: int = 3) -> list[list[PickupEvent]]:
    """The next `count` pickup days (grouped by date), starting today."""
    events = events_for_range(rules, today, today + timedelta(days=7 * (count + 1)))
    by_day: dict[date, list[PickupEvent]] = {}
    for e in events:
        by_day.setdefault(e.date, []).append(e)
    return [by_day[d] for d in sorted(by_day)[:count]]
