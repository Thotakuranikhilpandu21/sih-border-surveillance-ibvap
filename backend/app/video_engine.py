import time
import math
import random
import json
import uuid
from datetime import datetime, timezone
from app.rule_engine import evaluate_object_against_zones
from app.database import get_db

class SyntheticStreamSimulator:
    def __init__(self):
        # Simulated tracks per camera
        self.camera_tracks = {
            "cam-1": [
                {"track_id": 101, "class_name": "Person", "x": 0.20, "y": 0.35, "vx": 0.003, "vy": 0.002, "confidence": 0.94, "dwell": 0},
                {"track_id": 102, "class_name": "Vehicle", "x": 0.70, "y": 0.65, "vx": -0.004, "vy": 0.001, "confidence": 0.96, "dwell": 0, "plate": "PB-08-AX-9941"}
            ],
            "cam-2": [
                {"track_id": 201, "class_name": "Vehicle", "x": 0.30, "y": 0.45, "vx": 0.005, "vy": 0.000, "confidence": 0.98, "dwell": 0, "plate": "JK-02-CB-4410"},
                {"track_id": 202, "class_name": "Person", "x": 0.50, "y": 0.80, "vx": 0.001, "vy": -0.002, "confidence": 0.89, "dwell": 12}
            ],
            "cam-3": [
                {"track_id": 301, "class_name": "Person", "x": 0.10, "y": 0.55, "vx": 0.004, "vy": 0.001, "confidence": 0.92, "dwell": 0}
            ],
            "cam-4": [
                {"track_id": 401, "class_name": "Person", "x": 0.45, "y": 0.50, "vx": 0.000, "vy": 0.001, "confidence": 0.95, "dwell": 25}
            ]
        }
        self.frame_counters = {"cam-1": 0, "cam-2": 0, "cam-3": 0, "cam-4": 0}

    def generate_next_frame(self, camera_id: str):
        if camera_id not in self.camera_tracks:
            camera_id = "cam-1"
        
        self.frame_counters[camera_id] += 1
        frame_idx = self.frame_counters[camera_id]
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Move objects along vector paths with boundary bounce
        detections = []
        for obj in self.camera_tracks[camera_id]:
            prev_x, prev_y = obj["x"], obj["y"]
            obj["x"] += obj["vx"] + (random.uniform(-0.0005, 0.0005))
            obj["y"] += obj["vy"] + (random.uniform(-0.0005, 0.0005))
            
            # Bounce at boundaries
            if obj["x"] < 0.05 or obj["x"] > 0.90:
                obj["vx"] *= -1
            if obj["y"] < 0.10 or obj["y"] > 0.85:
                obj["vy"] *= -1
                
            obj["dwell"] += 0.5
            
            # Form bounding box around center (width ~0.08, height ~0.15)
            w = 0.08 if obj["class_name"] == "Person" else 0.14
            h = 0.16 if obj["class_name"] == "Person" else 0.18
            bbox = [
                max(0.0, round(obj["x"] - w/2, 4)),
                max(0.0, round(obj["y"] - h/2, 4)),
                min(1.0, round(obj["x"] + w/2, 4)),
                min(1.0, round(obj["y"] + h/2, 4))
            ]
            
            det = {
                "track_id": obj["track_id"],
                "class_name": obj["class_name"],
                "confidence": round(obj["confidence"], 2),
                "bbox": bbox,
                "prev_center": (prev_x, prev_y),
                "dwell_time": int(obj["dwell"])
            }
            
            if "plate" in obj:
                det["plate_number"] = obj["plate"]
                
            detections.append(det)

        # Check against active zones in DB
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM camera_zones WHERE camera_id = ? AND is_active = 1", (camera_id,))
        zones = [dict(row) for row in cursor.fetchall()]
        conn.close()

        alerts_triggered = []
        for det in detections:
            breaches = evaluate_object_against_zones(det, zones)
            for b in breaches:
                alerts_triggered.append({
                    "id": f"alt-dyn-{uuid.uuid4().hex[:8]}",
                    "camera_id": camera_id,
                    "zone_id": b["zone_id"],
                    "alert_type": b["alert_type"],
                    "severity": b["severity"],
                    "confidence_score": b["confidence"],
                    "snapshot_path": f"/snapshots/live/{camera_id}_{frame_idx}.jpg",
                    "metadata": {"details": b["details"], "track_id": det["track_id"]},
                    "created_at": timestamp
                })

        # Periodically trigger ANPR / Face Watchlist event simulation
        if frame_idx % 20 == 0:
            if camera_id == "cam-2":
                alerts_triggered.append({
                    "id": f"alt-anpr-{uuid.uuid4().hex[:8]}",
                    "camera_id": camera_id,
                    "zone_id": "zone-2",
                    "alert_type": "ANPR_SUSPICIOUS_HIT",
                    "severity": "HIGH",
                    "confidence_score": 0.94,
                    "snapshot_path": f"/snapshots/anpr/{camera_id}_plate.jpg",
                    "metadata": {"license_plate": "PB-08-AX-9941", "vehicle_type": "SUV", "flag_reason": "Unregistered Vehicle"},
                    "created_at": timestamp
                })
            elif camera_id == "cam-1":
                alerts_triggered.append({
                    "id": f"alt-face-{uuid.uuid4().hex[:8]}",
                    "camera_id": camera_id,
                    "zone_id": "zone-1",
                    "alert_type": "FACE_WATCHLIST_MATCH",
                    "severity": "CRITICAL",
                    "confidence_score": 0.96,
                    "snapshot_path": f"/snapshots/face/{camera_id}_match.jpg",
                    "metadata": {"match_id": "fw-1", "name": "Tariq Mahmood", "category": "SUSPECT", "cosine_similarity": 0.945},
                    "created_at": timestamp
                })

        return {
            "camera_id": camera_id,
            "frame_index": frame_idx,
            "timestamp": timestamp,
            "fps": 30,
            "detections": detections,
            "active_zones": zones,
            "alerts": alerts_triggered
        }

simulator = SyntheticStreamSimulator()
