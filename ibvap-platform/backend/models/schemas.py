from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class CoordinatePoint(BaseModel):
    x: float
    y: float

class CameraCreate(BaseModel):
    name: str
    rtsp_url: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    camera_type: str = "FIXED_IP"
    resolution: str = "1920x1080"

class CameraResponse(CameraCreate):
    id: str
    status: str = "ONLINE"
    fps_target: int = 25
    night_vision_enabled: bool = True

    class Config:
        from_attributes = True

class ZoneCreate(BaseModel):
    zone_name: str
    zone_type: str
    coordinates: List[CoordinatePoint]
    sensitivity_level: int = 8

class ZoneResponse(BaseModel):
    id: str
    camera_id: str
    zone_name: str
    zone_type: str
    coordinates: List[CoordinatePoint]
    sensitivity_level: int = 8
    is_active: bool = True

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: str
    camera_id: str
    zone_id: Optional[str] = None
    alert_type: str
    severity: str
    confidence_score: float
    snapshot_path: str
    metadata: Optional[Dict[str, Any]] = None
    status: str = "NEW"
    acknowledged_by: Optional[str] = None
    created_at: Optional[str] = None

class AlertTriagePayload(BaseModel):
    status: str  # ACKNOWLEDGED, DISPATCHED, DISMISSED
    operator: Optional[str] = "Operator_Alpha"

class FRSEnrollPayload(BaseModel):
    full_name: str
    alias_name: Optional[str] = None
    category: str = "SUSPECT"
    image_base64: Optional[str] = None
    notes: Optional[str] = None

class FRSEnrollResponse(BaseModel):
    id: str
    full_name: str
    category: str
    vector_id: str
    status: str = "ENROLLED"
