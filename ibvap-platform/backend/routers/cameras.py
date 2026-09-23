import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.ORM_models import Camera
from models.schemas import CameraCreate, CameraResponse

router = APIRouter(prefix="/api/v1/cameras", tags=["Cameras"])

@router.get("", response_model=List[CameraResponse])
def list_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).all()
    return cameras

@router.post("", response_model=CameraResponse)
def create_camera(payload: CameraCreate, db: Session = Depends(get_db)):
    cam_id = f"cam-{uuid.uuid4().hex[:6]}"
    new_cam = Camera(
        id=cam_id,
        name=payload.name,
        rtsp_url=payload.rtsp_url,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        camera_type=payload.camera_type,
        resolution=payload.resolution,
        status="ONLINE",
        fps_target=25,
        night_vision_enabled=True
    )
    db.add(new_cam)
    db.commit()
    db.refresh(new_cam)
    return new_cam
