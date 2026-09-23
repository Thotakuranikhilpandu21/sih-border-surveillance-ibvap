import json
import uuid
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.database import get_db
from app.models import CameraZoneSchema

router = APIRouter(prefix="/api/v1/zones", tags=["Camera Zones"])

@router.get("", response_model=List[CameraZoneSchema])
def get_zones(camera_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM camera_zones WHERE is_active = 1"
    params = []
    if camera_id:
        query += " AND camera_id = ?"
        params.append(camera_id)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    zones = []
    for r in rows:
        d = dict(r)
        d["coordinates"] = json.loads(d["coordinates_json"])
        zones.append(d)
    return zones

@router.post("", response_model=CameraZoneSchema)
def create_zone(zone: CameraZoneSchema):
    conn = get_db()
    cursor = conn.cursor()
    zone_id = zone.id or f"zone-{uuid.uuid4().hex[:8]}"
    coords_json = json.dumps([p.dict() for p in zone.coordinates])
    
    cursor.execute("""
        INSERT INTO camera_zones (id, camera_id, zone_name, zone_type, coordinates_json, sensitivity_level, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (zone_id, zone.camera_id, zone.zone_name, zone.zone_type, coords_json, zone.sensitivity_level, 1 if zone.is_active else 0))
    conn.commit()
    conn.close()
    
    return {
        "id": zone_id,
        "camera_id": zone.camera_id,
        "zone_name": zone.zone_name,
        "zone_type": zone.zone_type,
        "coordinates": zone.coordinates,
        "sensitivity_level": zone.sensitivity_level,
        "is_active": zone.is_active
    }

@router.delete("/{zone_id}")
def delete_zone(zone_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE camera_zones SET is_active = 0 WHERE id = ?", (zone_id,))
    conn.commit()
    conn.close()
    return {"message": "Zone deleted", "id": zone_id}
