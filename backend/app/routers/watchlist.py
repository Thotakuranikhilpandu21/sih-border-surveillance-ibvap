from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.database import get_db
from app.models import WatchlistPersonSchema

router = APIRouter(prefix="/api/v1/watchlist", tags=["Face Watchlist"])

@router.get("", response_model=List[WatchlistPersonSchema])
def get_watchlist(category: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM face_watchlist"
    params = []
    if category:
        query += " WHERE category = ?"
        params.append(category)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/logs")
def get_face_recognition_logs(limit: int = 50):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT f.*, w.full_name, w.category, w.notes 
        FROM face_recognition_logs f
        LEFT JOIN face_watchlist w ON f.watchlist_person_id = w.id
        ORDER BY f.created_at DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
