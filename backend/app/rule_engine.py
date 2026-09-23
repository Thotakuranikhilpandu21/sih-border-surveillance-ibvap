import json
from typing import List, Dict, Tuple

def point_in_polygon(x: float, y: float, polygon: List[Dict[str, float]]) -> bool:
    """
    Ray-Casting Algorithm for 2D Point-in-Polygon Detection.
    Coordinates are normalized (0.0 to 1.0).
    """
    n = len(polygon)
    if n < 3:
        return False
    
    inside = False
    p1x, p1y = polygon[0]["x"], polygon[0]["y"]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]["x"], polygon[i % n]["y"]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def line_crosses_tripwire(p1: Dict[str, float], p2: Dict[str, float], tripwire: List[Dict[str, float]]) -> bool:
    """
    Check if segment p1->p2 intersects tripwire line segment (tripwire[0]->tripwire[1]).
    """
    if len(tripwire) < 2:
        return False
    
    q1, q2 = tripwire[0], tripwire[1]
    
    def ccw(A, B, C):
        return (C["y"] - A["y"]) * (B["x"] - A["x"]) > (B["y"] - A["y"]) * (C["x"] - A["x"])
    
    return ccw(p1, q1, q2) != ccw(p2, q1, q2) and ccw(p1, p2, q1) != ccw(p1, p2, q2)

def evaluate_object_against_zones(obj: Dict, zones: List[Dict]) -> List[Dict]:
    """
    Evaluate detected object against active camera zones.
    Returns list of triggered breach alerts if rule condition met.
    """
    triggered_alerts = []
    center_x = (obj["bbox"][0] + obj["bbox"][2]) / 2.0
    center_y = (obj["bbox"][1] + obj["bbox"][3]) / 2.0
    
    for zone in zones:
        coords = json.loads(zone["coordinates_json"]) if isinstance(zone["coordinates_json"], str) else zone["coordinates_json"]
        zone_type = zone["zone_type"]
        
        if zone_type == "RESTRICTED_POLYGON":
            if point_in_polygon(center_x, center_y, coords):
                triggered_alerts.append({
                    "zone_id": zone["id"],
                    "alert_type": "INTRUSION_BREACH",
                    "severity": "CRITICAL",
                    "confidence": obj.get("confidence", 0.92),
                    "details": f"Target '{obj['class_name']}' (ID #{obj['track_id']}) breached restricted zone '{zone['zone_name']}'"
                })
        elif zone_type == "TRIPWIRE_LINE" and "prev_center" in obj:
            prev_x, prev_y = obj["prev_center"]
            if line_crosses_tripwire({"x": prev_x, "y": prev_y}, {"x": center_x, "y": center_y}, coords):
                triggered_alerts.append({
                    "zone_id": zone["id"],
                    "alert_type": "TRIPWIRE_CROSSING",
                    "severity": "CRITICAL",
                    "confidence": obj.get("confidence", 0.95),
                    "details": f"Target '{obj['class_name']}' crossed tripwire '{zone['zone_name']}'"
                })
        elif zone_type == "LOITERING_AREA":
            if point_in_polygon(center_x, center_y, coords) and obj.get("dwell_time", 0) > 10:
                triggered_alerts.append({
                    "zone_id": zone["id"],
                    "alert_type": "UNAUTHORIZED_LOITERING",
                    "severity": "HIGH",
                    "confidence": obj.get("confidence", 0.88),
                    "details": f"Loitering anomaly: '{obj['class_name']}' stationary for {obj.get('dwell_time', 0)}s in '{zone['zone_name']}'"
                })
                
    return triggered_alerts
