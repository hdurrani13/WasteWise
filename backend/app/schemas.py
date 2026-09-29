from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import Bin, CollectionType


# ---- auth / user ----
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(default="", max_length=80)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    display: str
    zone_name: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    display_name: str
    language: str
    dark_mode: bool
    notifications_enabled: bool
    address: AddressOut | None


class UserUpdate(BaseModel):
    display_name: str | None = Field(default=None, max_length=80)
    language: str | None = Field(default=None, pattern="^(en|fr|es|pa)$")
    dark_mode: bool | None = None
    notifications_enabled: bool | None = None
    address: str | None = Field(default=None, min_length=5, max_length=200)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


# ---- schedule ----
class PickupOut(BaseModel):
    date: date
    type: CollectionType
    window: str
    shifted_from: date | None = None


class ScheduleOut(BaseModel):
    address: AddressOut
    year: int
    month: int
    pickups: list[PickupOut]


class PickupDay(BaseModel):
    date: date
    pickups: list[PickupOut]


class NextPickupsOut(BaseModel):
    address: AddressOut
    days: list[PickupDay]


# ---- what goes where ----
class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category: str
    bin: Bin
    tip: str


class ClassifyRequest(BaseModel):
    text: str = Field(min_length=1, max_length=120)


class BinScore(BaseModel):
    bin: Bin
    confidence: float


class ClassifyResponse(BaseModel):
    text: str
    source: str  # "database" or "model"
    bin: Bin
    confidence: float
    alternatives: list[BinScore]
    item: ItemOut | None = None


# ---- activity ----
class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    kind: str
    title: str
    body: str
    read: bool
    created_at: datetime
