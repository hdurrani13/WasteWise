from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .. import addresses
from ..db import get_db
from ..deps import address_out, city_today, rules_for
from ..models import Address, CollectionType
from ..schedule import events_for_month, next_pickups
from ..schemas import NextPickupsOut, PickupDay, PickupOut, ScheduleOut
from ..security import get_current_user

router = APIRouter(prefix="/api/schedule", tags=["schedule"])
optional_oauth = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def resolve_address(
    address: str | None = Query(default=None, description="Street address (guests)"),
    token: str | None = Depends(optional_oauth),
    db: Session = Depends(get_db),
) -> Address:
    """Guests pass ?address=; signed-in users fall back to their saved address."""
    if address:
        return addresses.resolve(db, address)
    if token:
        user = get_current_user(token, db)
        if user.address:
            return user.address
    raise HTTPException(status_code=400, detail="Provide an address to see a schedule.")


@router.get("", response_model=ScheduleOut)
def month_schedule(
    year: int = Query(ge=2000, le=2100),
    month: int = Query(ge=1, le=12),
    types: list[CollectionType] | None = Query(default=None, description="Filter by collection type"),
    address: Address = Depends(resolve_address),
) -> ScheduleOut:
    events = events_for_month(rules_for(address), year, month)
    if types:
        events = [e for e in events if e.type in types]
    return ScheduleOut(
        address=address_out(address),
        year=year,
        month=month,
        pickups=[PickupOut(**e.__dict__) for e in events],
    )


@router.get("/next", response_model=NextPickupsOut)
def upcoming(count: int = Query(default=3, ge=1, le=10), address: Address = Depends(resolve_address)) -> NextPickupsOut:
    days = next_pickups(rules_for(address), city_today(), count)
    return NextPickupsOut(
        address=address_out(address),
        days=[PickupDay(date=d[0].date, pickups=[PickupOut(**e.__dict__) for e in d]) for d in days],
    )
