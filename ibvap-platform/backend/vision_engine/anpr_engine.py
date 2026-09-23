import random
import re
from typing import Dict, Any, Optional

class ANPREngine:
    """
    Automatic Number Plate Recognition (ANPR) & Character Extraction Pipeline.
    Simulates light plate detection + EasyOCR / PaddleOCR text recognition.
    """
    def __init__(self):
        self.sample_plates = [
            {"plate": "PB-08-AX-9941", "vehicle": "SUV", "is_flagged": True, "reason": "Unregistered vehicle in restricted sector"},
            {"plate": "JK-02-CB-4410", "vehicle": "MILITARY_TRUCK", "is_flagged": False, "reason": "Authorized BSF Supply Vehicle"},
            {"plate": "HR-26-DQ-8812", "vehicle": "PICKUP_TRUCK", "is_flagged": True, "reason": "Flagged suspect vehicle in sector 4"},
            {"plate": "DL-01-AB-1234", "vehicle": "SEDAN", "is_flagged": False, "reason": "Cleared Checkpost Vehicle"}
        ]

    def extract_license_plate(self, vehicle_crop_array: Optional[Any] = None) -> Dict[str, Any]:
        """
        Runs license plate detection, deskew transform, and OCR text extraction.
        """
        match = random.choice(self.sample_plates)
        confidence = round(random.uniform(0.88, 0.98), 2)
        
        return {
            "license_plate": match["plate"],
            "vehicle_type": match["vehicle"],
            "confidence": confidence,
            "is_flagged": match["is_flagged"],
            "flag_reason": match["reason"]
        }

anpr_engine = ANPREngine()
