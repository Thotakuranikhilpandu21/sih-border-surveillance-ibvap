import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import SessionLocal
from models.ORM_models import Zone
from vision_engine.stream_manager import stream_manager

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

manager = ConnectionManager()

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    db: Session = SessionLocal()
    try:
        while True:
            # Query active camera zones
            zones = db.query(Zone).filter(Zone.is_active == True).all()
            zones_data = [{
                "id": z.id,
                "camera_id": z.camera_id,
                "zone_name": z.zone_name,
                "zone_type": z.zone_type,
                "coordinates_json": z.coordinates_json,
                "sensitivity_level": z.sensitivity_level
            } for z in zones]
            
            # Fetch stream telemetry across cameras
            telemetry_payloads = []
            for cam_id in ["cam-1", "cam-2", "cam-3", "cam-4"]:
                cam_zones = [z for z in zones_data if z["camera_id"] == cam_id]
                telemetry = stream_manager.get_telemetry_frame(cam_id, cam_zones)
                telemetry_payloads.append(telemetry)
                
            await websocket.send_json({
                "event_type": "TELEMETRY_UPDATE",
                "streams": telemetry_payloads
            })
            await asyncio.sleep(0.15)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
    finally:
        db.close()
