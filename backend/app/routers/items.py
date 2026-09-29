from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Item
from ..schemas import BinScore, ClassifyRequest, ClassifyResponse, ItemOut

router = APIRouter(prefix="/api/items", tags=["what goes where"])


@router.get("", response_model=list[ItemOut])
def search_items(
    q: str = Query(default="", max_length=120), limit: int = Query(default=20, le=100), db: Session = Depends(get_db)
):
    stmt = select(Item).order_by(Item.name).limit(limit)
    if q.strip():
        stmt = stmt.where(Item.name.ilike(f"%{q.strip()}%"))
    return db.scalars(stmt).all()


@router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/classify", response_model=ClassifyResponse)
def classify(body: ClassifyRequest, request: Request, db: Session = Depends(get_db)) -> ClassifyResponse:
    """Exact database match first; otherwise ask the ML model for its best guess."""
    text = body.text.strip()
    item = db.scalar(select(Item).where(Item.name.ilike(text)))
    if item:
        return ClassifyResponse(
            text=text,
            source="database",
            bin=item.bin,
            confidence=1.0,
            alternatives=[],
            item=ItemOut.model_validate(item),
        )
    pred = request.app.state.classifier.predict(text)
    return ClassifyResponse(
        text=text,
        source="model",
        bin=pred.bin,
        confidence=pred.confidence,
        alternatives=[BinScore(bin=b, confidence=c) for b, c in pred.alternatives],
    )
