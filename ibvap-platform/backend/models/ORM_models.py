from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    rtsp_url = Column(String(500), nullable=False)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    camera_type = Column(String(30), nullable=False, default="FIXED_IP")
    status = Column(String(20), nullable=False, default="ONLINE")
    fps_target = Column(Integer, default=25)
    resolution = Column(String(20), default="1920x1080")
    night_vision_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Zone(Base):
    __tablename__ = "zones"

    id = Column(String(36), primary_key=True, index=True)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    zone_name = Column(String(100), nullable=False)
    zone_type = Column(String(30), nullable=False)  # RESTRICTED_POLYGON, TRIPWIRE_LINE, LOITERING_AREA, ANPR_CHECKPOINT
    coordinates_json = Column(Text, nullable=False)
    sensitivity_level = Column(Integer, default=8)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, index=True)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    zone_id = Column(String(36), nullable=True)
    alert_type = Column(String(40), nullable=False)
    severity = Column(String(15), nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    confidence_score = Column(Float, nullable=False)
    snapshot_path = Column(String(500), nullable=False)
    metadata_json = Column(Text, nullable=True)
    status = Column(String(20), default="NEW")  # NEW, ACKNOWLEDGED, DISPATCHED, DISMISSED
    acknowledged_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AnprLog(Base):
    __tablename__ = "anpr_logs"

    id = Column(String(36), primary_key=True, index=True)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    alert_id = Column(String(36), nullable=True)
    license_plate_number = Column(String(30), nullable=False, index=True)
    vehicle_type = Column(String(30), default="UNKNOWN")
    confidence = Column(Float, nullable=False)
    snapshot_path = Column(String(500), nullable=False)
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WatchlistPerson(Base):
    __tablename__ = "watchlist_persons"

    id = Column(String(36), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    alias_name = Column(String(100), nullable=True)
    category = Column(String(50), nullable=False)  # SUSPECT, POW, PERSON_OF_INTEREST, AUTHORIZED
    vector_id = Column(String(100), nullable=False)
    profile_image_path = Column(String(500), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
