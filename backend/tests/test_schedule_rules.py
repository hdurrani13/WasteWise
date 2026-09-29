from datetime import date

from app.models import CollectionType
from app.schedule import ZoneRules, events_for_month, holidays, next_pickups

MONDAY_ZONE = ZoneRules(weekday=0, garbage_week_parity=0, garbage_window="7AM-12PM", recycling_window="12PM-6PM")


def test_every_pickup_is_on_zone_weekday_unless_shifted():
    for e in events_for_month(MONDAY_ZONE, 2026, 3):
        if e.shifted_from is None:
            assert e.date.weekday() == 0


def test_garbage_and_recycling_alternate_weeks():
    events = events_for_month(MONDAY_ZONE, 2026, 3)
    garbage_days = sorted({e.date for e in events if e.type == CollectionType.garbage})
    recycling_days = sorted({e.date for e in events if e.type == CollectionType.recycling})
    assert not set(garbage_days) & set(recycling_days)
    assert all((b - a).days == 14 for a, b in zip(garbage_days, garbage_days[1:]))


def test_food_scraps_ride_with_garbage():
    events = events_for_month(MONDAY_ZONE, 2026, 3)
    garbage = {e.date for e in events if e.type == CollectionType.garbage}
    food = {e.date for e in events if e.type == CollectionType.food_scraps}
    assert garbage == food


def test_yard_waste_only_in_season():
    assert not any(e.type == CollectionType.yard_waste for e in events_for_month(MONDAY_ZONE, 2026, 1))
    assert any(e.type == CollectionType.yard_waste for e in events_for_month(MONDAY_ZONE, 2026, 6))


def test_holidays_computed_correctly():
    h = holidays(2026)
    assert h[date(2026, 4, 3)] == "Good Friday"  # Easter 2026 is April 5
    assert h[date(2026, 5, 18)] == "Victoria Day"
    assert h[date(2026, 9, 7)] == "Labour Day"
    assert h[date(2026, 10, 12)] == "Thanksgiving"


def test_holiday_pickup_moves_to_next_day():
    # Labour Day 2026 is Monday Sept 7, so Monday-zone pickups shift to Tuesday
    events = events_for_month(MONDAY_ZONE, 2026, 9)
    shifted = [e for e in events if e.shifted_from == date(2026, 9, 7)]
    assert shifted and all(e.date == date(2026, 9, 8) for e in shifted)


def test_next_pickups_groups_by_day():
    days = next_pickups(MONDAY_ZONE, date(2026, 3, 4), count=3)
    assert len(days) == 3
    assert days[0][0].date > date(2026, 3, 4)
    assert all(len({e.date for e in day}) == 1 for day in days)
