from datetime import UTC, datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Bin(str, Enum):
    """Where a single item should go (used by What Goes Where)."""

    recycling = "recycling"
    compost = "compost"
    garbage = "garbage"
    hazardous = "hazardous"
    ewaste = "ewaste"


class CollectionType(str, Enum):
    """Curbside pickups that appear on the calendar."""

    garbage = "garbage"
    recycling = "recycling"
    food_scraps = "food_scraps"
    yard_waste = "yard_waste"


def utcnow() -> datetime:
    return datetime.now(UTC)


class Zone(Base):
    """A collection area. Every address in a zone shares one pickup schedule."""

    __tablename__ = "zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    weekday: Mapped[int] = mapped_column(Integer)  # 0 = Monday
    # Garbage + food scraps and recycling alternate weeks; parity picks which week is which
    garbage_week_parity: Mapped[int] = mapped_column(Integer, default=0)
    garbage_window: Mapped[str] = mapped_column(String(30), default="7AM-12PM")
    recycling_window: Mapped[str] = mapped_column(String(30), default="12PM-6PM")


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    normalized: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    display: Mapped[str] = mapped_column(String(200))
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id"))

    zone: Mapped[Zone] = relationship()


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(80), default="")
    language: Mapped[str] = mapped_column(String(5), default="en")
    dark_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    address_id: Mapped[int | None] = mapped_column(ForeignKey("addresses.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    address: Mapped[Address | None] = relationship()
    activities: Mapped[list["Activity"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(50))
    bin: Mapped[str] = mapped_column(String(20), index=True)
    tip: Mapped[str] = mapped_column(String(300), default="")


class Announcement(Base):
    """City-wide notices (schedule changes, holiday shifts)."""

    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Activity(Base):
    """A user's feed entry: a pickup reminder or a copy of an announcement."""

    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[str] = mapped_column(String(20))  # "reminder" | "announcement"
    title: Mapped[str] = mapped_column(String(120))
    body: Mapped[str] = mapped_column(Text)
    dedupe_key: Mapped[str] = mapped_column(String(80), index=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped[User] = relationship(back_populates="activities")
