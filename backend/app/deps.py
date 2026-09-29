from datetime import date, datetime
from zoneinfo import ZoneInfo

from .models import Address, User
from .schedule import ZoneRules
from .schemas import AddressOut, UserOut

CITY_TZ = ZoneInfo("America/Edmonton")


def city_today() -> date:
    return datetime.now(CITY_TZ).date()


def rules_for(address: Address) -> ZoneRules:
    z = address.zone
    return ZoneRules(z.weekday, z.garbage_week_parity, z.garbage_window, z.recycling_window)


def address_out(address: Address) -> AddressOut:
    return AddressOut(display=address.display, zone_name=address.zone.name)


def user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        language=user.language,
        dark_mode=user.dark_mode,
        notifications_enabled=user.notifications_enabled,
        address=address_out(user.address) if user.address else None,
    )
