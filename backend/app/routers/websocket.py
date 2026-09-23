import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.video_engine import simulator

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, camera_id: str, websocket: WebSocket):
        await websocket.accept()
        if camera_id not in self.active_connections:
            self.active_connections[camera_id] = []
        self.active_connections[camera_id].append(websocket)

    def disconnect(self, camera_id: str, websocket: WebSocket):
        if camera_id in self.active_connections:
            if websocket in self.active_connections[camera_id]:
                self.active_connections[camera_id].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/stream/{camera_id}")
async def websocket_stream_endpoint(websocket: WebSocket, camera_id: str):
    await manager.connect(camera_id, websocket)
    try:
        while True:
            # Generate synthetic frame data
            frame_data = simulator.generate_next_frame(camera_id)
            await websocket.send_json(frame_data)
            await asyncio.sleep(0.1) # 10 FPS stream update for prototype
    except WebSocketDisconnect:
        manager.disconnect(camera_id, websocket)
    except Exception:
        manager.disconnect(camera_id, websocket)
