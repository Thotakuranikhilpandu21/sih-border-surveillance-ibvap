from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class CameraSchema(BaseModel):
    id: str
    name: str
    rtsp_url: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    camera_type: str
    status: str = "ONLINE"
    fps_target: int = 25
    resolution: str = "1920x1080"
    night_vision_enabled: bool = True

class ZonePoint(BaseModel):
    x: float
    y: float

class CameraZoneSchema(BaseModel):
    id: Optional[str] = None
    camera_id: str
    zone_name: str
    zone_type: str  # RESTRICTED_POLYGON, TRIPWIRE_LINE, LOITERING_AREA, ANPR_CHECKPOINT
    coordinates: List[ZonePoint]
    sensitivity_level: int = 5
    is_active: bool = True

class AlertSchema(BaseModel):
    id: Optional[str] = None
    camera_id: str
    zone_id: Optional[str] = None
    alert_type: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    confidence_score: float
    snapshot_path: str
    metadata: Optional[Dict[str, Any]] = None
    status: str = "NEW"
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[str] = None
    created_at: Optional[str] = None

class AlertStatusUpdate(BaseModel):
    status: str  # ACKNOWLEDGED, DISPATCHED, FALSE_ALARM, RESOLVED
    acknowledged_by: Optional[str] = "operator_active"

class AnprLogSchema(BaseModel):
    id: Optional[str] = None
    camera_id: str
    license_plate_number: str
    vehicle_type: str = "UNKNOWN"
    confidence: float
    snapshot_path: str
    is_flagged: bool = False
    flag_reason: Optional[str] = None
    created_at: Optional[str] = None

class WatchlistPersonSchema(BaseModel):
    id: Optional[str] = None
    full_name: str
    alias_name: Optional[str] = None
    category: str  # SUSPECT, POW, PERSON_OF_INTEREST, AUTHORIZED_PERSONNEL
    vector_id: str
    profile_image_path: str
    notes: Optional[str] = None

class FaceSearchRequest(BaseModel):
    camera_id: str
    vector_query: Optional[List[float]] = None
    threshold: float = 0.75
