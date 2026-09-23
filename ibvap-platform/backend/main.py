import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models.ORM_models import Camera, Zone, Alert, AnprLog, WatchlistPerson
from routers import cameras, zones, alerts, intelligence, ws

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IBVAP — Intelligent Border Video Analytics Platform API",
    description="FastAPI Computer Vision & Border Surveillance Analytics Engine (SIH26187)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def seed_initial_database():
    db = SessionLocal()
    if db.query(Camera).count() == 0:
        cams = [
            Camera(id="cam-1", name="CAM-01 (North Fence Perimeter)", rtsp_url="rtsp://192.168.1.101/live", location_name="Border Outpost Alpha", latitude=31.634, longitude=74.8723, camera_type="THERMAL", status="ONLINE"),
            Camera(id="cam-2", name="CAM-02 (Transit Checkpost Gate)", rtsp_url="rtsp://192.168.1.102/live", location_name="Checkpost Gate 1", latitude=31.6355, longitude=74.8745, camera_type="PTZ", status="ONLINE"),
            Camera(id="cam-3", name="CAM-03 (East Patrol Road)", rtsp_url="rtsp://192.168.1.103/live", location_name="Patrol Route Sector 4", latitude=31.6312, longitude=74.881, camera_type="FIXED_IP", status="ONLINE"),
            Camera(id="cam-4", name="CAM-04 (Restricted Depot Zone)", rtsp_url="rtsp://192.168.1.104/live", location_name="Ammunition Depot East", latitude=31.629, longitude=74.869, camera_type="INFRARED", status="ONLINE")
        ]
        db.add_all(cams)
        
        zones_seed = [
            Zone(id="zone-1", camera_id="cam-1", zone_name="Alpha Perimeter Restricted Zone", zone_type="RESTRICTED_POLYGON", coordinates_json=json.dumps([{"x": 0.15, "y": 0.20}, {"x": 0.85, "y": 0.20}, {"x": 0.90, "y": 0.80}, {"x": 0.10, "y": 0.80}]), sensitivity_level=8),
            Zone(id="zone-2", camera_id="cam-2", zone_name="Checkpost ANPR Line", zone_type="ANPR_CHECKPOINT", coordinates_json=json.dumps([{"x": 0.20, "y": 0.50}, {"x": 0.80, "y": 0.50}]), sensitivity_level=9),
            Zone(id="zone-3", camera_id="cam-3", zone_name="Border Tripwire Line-A", zone_type="TRIPWIRE_LINE", coordinates_json=json.dumps([{"x": 0.05, "y": 0.60}, {"x": 0.95, "y": 0.60}]), sensitivity_level=7),
            Zone(id="zone-4", camera_id="cam-4", zone_name="Depot Perimeter No-Loiter Zone", zone_type="LOITERING_AREA", coordinates_json=json.dumps([{"x": 0.25, "y": 0.25}, {"x": 0.75, "y": 0.25}, {"x": 0.75, "y": 0.75}, {"x": 0.25, "y": 0.75}]), sensitivity_level=9)
        ]
        db.add_all(zones_seed)
        
        alerts_seed = [
            Alert(id="alt-101", camera_id="cam-1", zone_id="zone-1", alert_type="INTRUSION_BREACH", severity="CRITICAL", confidence_score=0.94, snapshot_path="/data/snapshots/breach1.jpg", metadata_json=json.dumps({"target": "Pedestrian", "track_id": 104}), status="NEW"),
            Alert(id="alt-102", camera_id="cam-2", zone_id="zone-2", alert_type="ANPR_FLAGGED_HIT", severity="HIGH", confidence_score=0.91, snapshot_path="/data/snapshots/anpr1.jpg", metadata_json=json.dumps({"plate": "PB-08-AX-9941"}), status="NEW"),
            Alert(id="alt-103", camera_id="cam-4", zone_id="zone-4", alert_type="UNAUTHORIZED_LOITERING", severity="HIGH", confidence_score=0.88, snapshot_path="/data/snapshots/loiter1.jpg", metadata_json=json.dumps({"dwell_time_seconds": 145}), status="ACKNOWLEDGED", acknowledged_by="Operator_Alpha")
        ]
        db.add_all(alerts_seed)
        
        anpr_seed = [
            AnprLog(id="anpr-1", camera_id="cam-2", alert_id="alt-102", license_plate_number="PB-08-AX-9941", vehicle_type="SUV", confidence=0.93, snapshot_path="/data/anpr/plate1.jpg", is_flagged=True, flag_reason="Unregistered vehicle in restricted sector"),
            AnprLog(id="anpr-2", camera_id="cam-2", license_plate_number="JK-02-CB-4410", vehicle_type="MILITARY_TRUCK", confidence=0.98, snapshot_path="/data/anpr/plate2.jpg", is_flagged=False, flag_reason="Authorized BSF Vehicle"),
            AnprLog(id="anpr-3", camera_id="cam-3", license_plate_number="HR-26-DQ-8812", vehicle_type="PICKUP_TRUCK", confidence=0.89, snapshot_path="/data/anpr/plate3.jpg", is_flagged=True, flag_reason="Flagged suspect vehicle in sector 4")
        ]
        db.add_all(anpr_seed)
        
        watchlist_seed = [
            WatchlistPerson(id="fw-1", full_name="Tariq Mahmood", alias_name="Shadow", category="SUSPECT", vector_id="vec_suspect_001", profile_image_path="/data/watchlist/suspect1.jpg", notes="Subject of interest in unauthorized border crossing attempts"),
            WatchlistPerson(id="fw-2", full_name="Vikram Singh", alias_name="Operator-1", category="AUTHORIZED", vector_id="vec_auth_002", profile_image_path="/data/watchlist/auth1.jpg", notes="Senior Patrol Officer Sector 4")
        ]
        db.add_all(watchlist_seed)
        
        db.commit()
    db.close()

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": "IBVAP FastAPI Engine",
        "version": "1.0.0",
        "bop_assignment": "BOP SECTOR 4-ALPHA",
        "docs": "/docs"
    }

app.include_router(cameras.router)
app.include_router(zones.router)
app.include_router(alerts.router)
app.include_router(intelligence.router)
app.include_router(ws.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
