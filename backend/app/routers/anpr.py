from fastapi import APIRouter, Query
from typing import List, Optional
from app.database import get_db

router = APIRouter(prefix="/api/v1/anpr", tags=["ANPR"])

@router.get("/logs")
def get_anpr_logs(
    plate: Optional[str] = None,
    is_flagged: Optional[bool] = None,
    camera_id: Optional[str] = None,
    limit: int = 50
):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM anpr_logs WHERE 1=1"
    params = []
    
    if plate:
        query += " AND license_plate_number LIKE ?"
        params.append(f"%{plate}%")
    if is_flagged is not None:
        query += " AND is_flagged = ?"
        params.append(1 if is_flagged else 0)
    if camera_id:
        query += " AND camera_id = ?"
        params.append(camera_id)
        
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
