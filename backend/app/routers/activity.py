from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import city_today, rules_for
from ..models import Activity, Announcement, User
from ..schedule import next_pickups
from ..schemas import ActivityOut
from ..security import get_current_user

router = APIRouter(prefix="/api/activity", tags=["activity"])

LABELS = {"garbage": "Garbage", "food_scraps": "Food Scraps", "recycling": "Recycling", "yard_waste": "Yard Waste"}


def sync_feed(db: Session, user: User) -> None:
    """Add any missing announcements and a reminder for a pickup today or tomorrow.

    Generating the feed when it's read (instead of with a cron job) keeps the
    backend stateless, so it can run on serverless hosting.
    """
    existing = set(db.scalars(select(Activity.dedupe_key).where(Activity.user_id == user.id)))

    for ann in db.scalars(select(Announcement)):
        key = f"announcement:{ann.id}"
        if key not in existing:
            db.add(Activity(user=user, kind="announcement", title=ann.title, body=ann.body, dedupe_key=key))

    if user.notifications_enabled and user.address:
        today = city_today()
        upcoming = next_pickups(rules_for(user.address), today, count=1)
        if upcoming and upcoming[0][0].date <= today + timedelta(days=1):
            day = upcoming[0]
            key = f"reminder:{day[0].date.isoformat()}"
            if key not in existing:
                when = "today" if day[0].date == today else "tomorrow"
                kinds = " + ".join(LABELS[e.type.value] for e in day)
                db.add(
                    Activity(
                        user=user,
                        kind="reminder",
                        title=f"{kinds} pickup {when}",
                        body=f"Put your bins out by the start of the {day[0].window} window on "
                        f"{day[0].date.strftime('%A, %b %d')}.",
                        dedupe_key=key,
                    )
                )
    db.commit()


@router.get("", response_model=list[ActivityOut])
def list_activity(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sync_feed(db, user)
    return db.scalars(
        select(Activity).where(Activity.user_id == user.id).order_by(Activity.created_at.desc(), Activity.id.desc())
    ).all()


@router.post("/{activity_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_read(activity_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    activity = db.get(Activity, activity_id)
    if activity is None or activity.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    activity.read = True
    db.commit()
