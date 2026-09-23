import json
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models import AlertSchema, AlertStatusUpdate

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(
    camera_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50
):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM alerts WHERE 1=1"
    params = []
    
    if camera_id:
        query += " AND camera_id = ?"
        params.append(camera_id)
    if severity:
        query += " AND severity = ?"
        params.append(severity)
    if status:
        query += " AND status = ?"
        params.append(status)
        
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        item = dict(r)
        if item.get("metadata_json"):
            try:
                item["metadata"] = json.loads(item["metadata_json"])
            except Exception:
                item["metadata"] = {}
        result.append(item)
    return result

@router.patch("/{alert_id}/status")
def update_alert_status(alert_id: str, update: AlertStatusUpdate):
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        UPDATE alerts 
        SET status = ?, acknowledged_by = ?, acknowledged_at = ?
        WHERE id = ?
    """, (update.status, update.acknowledged_by, now_iso, alert_id))
    conn.commit()
    conn.close()
    return {"id": alert_id, "status": update.status, "acknowledged_at": now_iso}
