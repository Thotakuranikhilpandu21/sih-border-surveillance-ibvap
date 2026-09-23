import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.ORM_models import Zone
from models.schemas import ZoneCreate, ZoneResponse, CoordinatePoint

router = APIRouter(prefix="/api/v1/zones", tags=["Zones & Tripwires"])

@router.get("/{camera_id}", response_model=List[ZoneResponse])
def get_camera_zones(camera_id: str, db: Session = Depends(get_db)):
    zones = db.query(Zone).filter(Zone.camera_id == camera_id, Zone.is_active == True).all()
    result = []
    for z in zones:
        coords_raw = json.loads(z.coordinates_json)
        coords = [CoordinatePoint(**p) for p in coords_raw]
        result.append(ZoneResponse(
            id=z.id,
            camera_id=z.camera_id,
            zone_name=z.zone_name,
            zone_type=z.zone_type,
            coordinates=coords,
            sensitivity_level=z.sensitivity_level,
            is_active=z.is_active
        ))
    return result

@router.post("/{camera_id}", response_model=ZoneResponse)
def create_camera_zone(camera_id: str, payload: ZoneCreate, db: Session = Depends(get_db)):
    zone_id = f"zone-{uuid.uuid4().hex[:6]}"
    coords_json = json.dumps([p.dict() for p in payload.coordinates])
    
    new_zone = Zone(
        id=zone_id,
        camera_id=camera_id,
        zone_name=payload.zone_name,
        zone_type=payload.zone_type,
        coordinates_json=coords_json,
        sensitivity_level=payload.sensitivity_level,
        is_active=True
    )
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)
    
    return ZoneResponse(
        id=new_zone.id,
        camera_id=new_zone.camera_id,
        zone_name=new_zone.zone_name,
        zone_type=new_zone.zone_type,
        coordinates=payload.coordinates,
        sensitivity_level=new_zone.sensitivity_level,
        is_active=True
    )
