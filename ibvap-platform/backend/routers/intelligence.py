import uuid
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.ORM_models import AnprLog, WatchlistPerson
from models.schemas import FRSEnrollPayload, FRSEnrollResponse
from vision_engine.frs_engine import frs_engine

router = APIRouter(prefix="/api/v1/intelligence", tags=["Intelligence Hub"])

@router.get("/anpr/search")
def search_anpr_plates(
    plate: Optional[str] = Query(None, description="License plate search string"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(AnprLog)
    if plate:
        query = query.filter(AnprLog.license_plate_number.like(f"%{plate}%"))
    logs = query.order_by(AnprLog.created_at.desc()).limit(limit).all()
    
    return [{
        "id": l.id,
        "camera_id": l.camera_id,
        "license_plate_number": l.license_plate_number,
        "vehicle_type": l.vehicle_type,
        "confidence": l.confidence,
        "snapshot_path": l.snapshot_path,
        "is_flagged": l.is_flagged,
        "flag_reason": l.flag_reason,
        "created_at": str(l.created_at)
    } for l in logs]

@router.post("/frs/enroll", response_model=FRSEnrollResponse)
def enroll_suspect_face(payload: FRSEnrollPayload, db: Session = Depends(get_db)):
    person_id = f"fw-{uuid.uuid4().hex[:6]}"
    vector_id = frs_engine.enroll_face(person_id, payload.full_name, payload.category)
    
    new_person = WatchlistPerson(
        id=person_id,
        full_name=payload.full_name,
        alias_name=payload.alias_name,
        category=payload.category,
        vector_id=vector_id,
        profile_image_path=f"/data/watchlist/{person_id}.jpg",
        notes=payload.notes
    )
    db.add(new_person)
    db.commit()
    
    return FRSEnrollResponse(
        id=person_id,
        full_name=payload.full_name,
        category=payload.category,
        vector_id=vector_id,
        status="ENROLLED"
    )

@router.get("/frs/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    persons = db.query(WatchlistPerson).all()
    return [{
        "id": p.id,
        "full_name": p.full_name,
        "alias_name": p.alias_name,
        "category": p.category,
        "vector_id": p.vector_id,
        "notes": p.notes,
        "profile_image_path": p.profile_image_path
    } for p in persons]
