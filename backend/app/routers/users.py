from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import addresses
from ..db import get_db
from ..deps import user_out
from ..models import User
from ..schemas import PasswordChange, UserOut, UserUpdate
from ..security import get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/me", tags=["account"])


@router.get("", response_model=UserOut)
def read_me(user: User = Depends(get_current_user)) -> UserOut:
    return user_out(user)


@router.patch("", response_model=UserOut)
def update_me(body: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserOut:
    changes = body.model_dump(exclude_unset=True)
    if "address" in changes:
        user.address = addresses.resolve(db, changes.pop("address"))
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user_out(user)


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    body: PasswordChange, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    user.password_hash = hash_password(body.new_password)
    db.commit()
