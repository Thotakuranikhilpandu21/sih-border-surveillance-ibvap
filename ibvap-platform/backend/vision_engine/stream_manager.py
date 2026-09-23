import time
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from vision_engine.object_detector import object_detector
from vision_engine.virtual_fence import virtual_fence

class StreamManager:
    """
    RTSP / ONVIF Multi-Camera Stream Manager & Telemetry Pipeline.
    """
    def __init__(self):
        self.frame_counters = {}

    def get_telemetry_frame(self, camera_id: str, active_zones: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Reads frame telemetry, runs object detection, Shapely VirtualFence evaluation, and produces telemetry package.
        """
        self.frame_counters[camera_id] = self.frame_counters.get(camera_id, 0) + 1
        frame_idx = self.frame_counters[camera_id]
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # 1. Detect objects
        detections = object_detector.process_frame(camera_id, frame_idx)
        
        # 2. Evaluate against active zones with Shapely
        alerts = virtual_fence.evaluate_detections(detections, active_zones)
        
        formatted_alerts = []
        for a in alerts:
            formatted_alerts.append({
                "id": f"alt-sys-{uuid.uuid4().hex[:8]}",
                "camera_id": camera_id,
                "zone_id": a["zone_id"],
                "alert_type": a["alert_type"],
                "severity": a["severity"],
                "confidence_score": a["confidence"],
                "snapshot_path": f"/data/snapshots/{camera_id}_{frame_idx}.jpg",
                "metadata": {"details": a["details"]},
                "status": "NEW",
                "created_at": now_iso
            })
            
        return {
            "camera_id": camera_id,
            "frame_idx": frame_idx,
            "timestamp": now_iso,
            "fps": 30,
            "detections": detections,
            "alerts": formatted_alerts
        }

stream_manager = StreamManager()
