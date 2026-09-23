import json
from shapely.geometry import Polygon, LineString, Point
from typing import List, Dict, Any, Tuple

class VirtualFenceEvaluator:
    """
    Shapely-based spatial geometry intersection engine for Polygon ROIs and Tripwires.
    """
    
    @staticmethod
    def check_polygon_breach(point_coords: Tuple[float, float], polygon_coords: List[Dict[str, float]]) -> bool:
        """
        Determines if point (x, y) is inside Shapely Polygon defined by polygon_coords.
        """
        if len(polygon_coords) < 3:
            return False
        
        poly_tuples = [(p["x"], p["y"]) for p in polygon_coords]
        poly = Polygon(poly_tuples)
        pt = Point(point_coords[0], point_coords[1])
        
        return poly.contains(pt) or poly.touches(pt)

    @staticmethod
    def check_tripwire_crossing(prev_pt: Tuple[float, float], curr_pt: Tuple[float, float], tripwire_coords: List[Dict[str, float]]) -> bool:
        """
        Determines if object vector trajectory (prev_pt -> curr_pt) intersects Shapely LineString tripwire.
        """
        if len(tripwire_coords) < 2:
            return False
        
        object_trajectory = LineString([prev_pt, curr_pt])
        tripwire_line = LineString([(p["x"], p["y"]) for p in tripwire_coords[:2]])
        
        return object_trajectory.intersects(tripwire_line)

    def evaluate_detections(self, detections: List[Dict[str, Any]], active_zones: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Evaluate frame detections against camera active zones using Shapely geometry.
        """
        alerts = []
        
        for det in detections:
            bbox = det["bbox"]  # [x1, y1, x2, y2]
            cx = (bbox[0] + bbox[2]) / 2.0
            cy = (bbox[1] + bbox[3]) / 2.0
            prev_cx, prev_cy = det.get("prev_center", (cx, cy))
            
            for zone in active_zones:
                coords = json.loads(zone["coordinates_json"]) if isinstance(zone["coordinates_json"], str) else zone["coordinates"]
                ztype = zone["zone_type"]
                
                if ztype == "RESTRICTED_POLYGON":
                    if self.check_polygon_breach((cx, cy), coords):
                        alerts.append({
                            "zone_id": zone["id"],
                            "alert_type": "INTRUSION_BREACH",
                            "severity": "CRITICAL",
                            "confidence": det.get("confidence", 0.94),
                            "details": f"Intruder '{det['class_name']}' (ID #{det['track_id']}) inside restricted ROI '{zone['zone_name']}'"
                        })
                elif ztype == "TRIPWIRE_LINE":
                    if self.check_tripwire_crossing((prev_cx, prev_cy), (cx, cy), coords):
                        alerts.append({
                            "zone_id": zone["id"],
                            "alert_type": "TRIPWIRE_CROSSING",
                            "severity": "CRITICAL",
                            "confidence": det.get("confidence", 0.96),
                            "details": f"Target '{det['class_name']}' crossed tripwire '{zone['zone_name']}'"
                        })
                elif ztype == "LOITERING_AREA":
                    if self.check_polygon_breach((cx, cy), coords) and det.get("dwell_time", 0) > 30:
                        alerts.append({
                            "zone_id": zone["id"],
                            "alert_type": "UNAUTHORIZED_LOITERING",
                            "severity": "HIGH",
                            "confidence": det.get("confidence", 0.89),
                            "details": f"Unauthorized loitering (>30s) by '{det['class_name']}' in '{zone['zone_name']}'"
                        })
                        
        return alerts

virtual_fence = VirtualFenceEvaluator()
