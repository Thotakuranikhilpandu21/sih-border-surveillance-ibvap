from fastapi import APIRouter
from app.database import get_db

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/summary")
def get_analytics_summary():
    conn = get_db()
    cursor = conn.cursor()
    
    # Total counts
    cursor.execute("SELECT COUNT(*) FROM alerts")
    total_alerts = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM alerts WHERE severity = 'CRITICAL'")
    critical_alerts = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM anpr_logs")
    total_anpr = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM face_watchlist WHERE category = 'SUSPECT'")
    active_suspects = cursor.fetchone()[0]
    
    # Alert breakdown by type
    cursor.execute("""
        SELECT alert_type, COUNT(*) as cnt 
        FROM alerts 
        GROUP BY alert_type
    """)
    alerts_by_type = [{"type": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Alert breakdown by severity
    cursor.execute("""
        SELECT severity, COUNT(*) as cnt 
        FROM alerts 
        GROUP BY severity
    """)
    alerts_by_severity = [{"severity": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Hourly threat distribution mock data
    hourly_activity = [
        {"hour": "00:00", "intrusions": 2, "vehicles": 5, "anpr_hits": 1},
        {"hour": "03:00", "intrusions": 6, "vehicles": 2, "anpr_hits": 0},
        {"hour": "06:00", "intrusions": 4, "vehicles": 12, "anpr_hits": 3},
        {"hour": "09:00", "intrusions": 1, "vehicles": 28, "anpr_hits": 5},
        {"hour": "12:00", "intrusions": 3, "vehicles": 35, "anpr_hits": 8},
        {"hour": "15:00", "intrusions": 5, "vehicles": 30, "anpr_hits": 6},
        {"hour": "18:00", "intrusions": 8, "vehicles": 18, "anpr_hits": 4},
        {"hour": "21:00", "intrusions": 11, "vehicles": 8, "anpr_hits": 2}
    ]
    
    # Zone breach distribution
    zone_breaches = [
        {"zone": "Alpha Perimeter Restricted Zone", "breaches": 18, "severity": "CRITICAL"},
        {"zone": "Checkpost ANPR Inspection Line", "breaches": 12, "severity": "HIGH"},
        {"zone": "Border Tripwire Line-A", "breaches": 15, "severity": "CRITICAL"},
        {"zone": "Depot Perimeter No-Loiter Zone", "breaches": 7, "severity": "MEDIUM"}
    ]
    
    conn.close()
    
    return {
        "metrics": {
            "total_alerts": total_alerts,
            "critical_alerts": critical_alerts,
            "total_anpr_reads": total_anpr,
            "active_watchlist_suspects": active_suspects,
            "system_health": "99.8%",
            "avg_latency_ms": 24
        },
        "alerts_by_type": alerts_by_type,
        "alerts_by_severity": alerts_by_severity,
        "hourly_activity": hourly_activity,
        "zone_breaches": zone_breaches
    }
