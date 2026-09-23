import random
from typing import List, Dict, Any

class ObjectDetector:
    """
    YOLOv8 / YOLOv10 + ByteTrack Multi-Object Tracking Simulator.
    Generates object bounding boxes [xmin, ymin, xmax, ymax], track IDs, confidence, and velocity vectors.
    """
    def __init__(self):
        self.classes = ["Pedestrian", "Vehicle", "Military Vehicle", "Intruder"]

    def process_frame(self, camera_id: str, frame_counter: int) -> List[Dict[str, Any]]:
        """
        Simulates object detection & ByteTrack tracking payload.
        """
        detections = []
        
        # Generator logic per camera
        if camera_id == "cam-1":
            # Pedestrian moving across boundary
            x_shift = (frame_counter % 100) / 100.0 * 0.6 + 0.2
            detections.append({
                "track_id": 104,
                "class_name": "Intruder",
                "confidence": 0.94,
                "bbox": [round(x_shift, 3), 0.35, round(x_shift + 0.08, 3), 0.52],
                "velocity": [0.005, 0.001],
                "dwell_time": frame_counter // 2
            })
        elif camera_id == "cam-2":
            # Vehicle passing checkpost
            detections.append({
                "track_id": 208,
                "class_name": "Vehicle",
                "confidence": 0.96,
                "bbox": [0.35, 0.40, 0.52, 0.65],
                "velocity": [0.008, 0.000],
                "plate": "PB-08-AX-9941",
                "dwell_time": 5
            })
        elif camera_id == "cam-3":
            # Military Patrol Vehicle
            detections.append({
                "track_id": 312,
                "class_name": "Military Vehicle",
                "confidence": 0.98,
                "bbox": [0.15, 0.50, 0.32, 0.72],
                "velocity": [0.004, 0.002],
                "dwell_time": 2
            })
        else:
            # Depot Loitering Target
            detections.append({
                "track_id": 401,
                "class_name": "Pedestrian",
                "confidence": 0.91,
                "bbox": [0.42, 0.40, 0.50, 0.60],
                "velocity": [0.001, 0.001],
                "dwell_time": 35  # >30s triggers loitering
            })
            
        return detections

object_detector = ObjectDetector()
