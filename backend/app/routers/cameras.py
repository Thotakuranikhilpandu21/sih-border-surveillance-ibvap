from fastapi import APIRouter, HTTPException
from typing import List
from app.database import get_db
from app.models import CameraSchema

router = APIRouter(prefix="/api/v1/cameras", tags=["Cameras"])

@router.get("", response_model=List[CameraSchema])
def get_cameras():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cameras")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/{camera_id}", response_model=CameraSchema)
def get_camera(camera_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cameras WHERE id = ?", (camera_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Camera not found")
    return dict(row)

@router.patch("/{camera_id}/status")
def update_camera_status(camera_id: str, status: str):
    if status not in ["ONLINE", "OFFLINE", "DEGRADED", "MAINTENANCE"]:
        raise HTTPException(status_code=400, detail="Invalid status string")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE cameras SET status = ? WHERE id = ?", (status, camera_id))
    conn.commit()
    conn.close()
    return {"id": camera_id, "status": status}
