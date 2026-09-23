import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.ORM_models import Alert
from models.schemas import AlertResponse, AlertTriagePayload

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])

@router.get("/historical", response_model=List[AlertResponse])
def get_historical_alerts(
    camera_id: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if camera_id:
        query = query.filter(Alert.camera_id == camera_id)
    if severity:
        query = query.filter(Alert.severity == severity)
        
    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    
    result = []
    for a in alerts:
        meta = json.loads(a.metadata_json) if a.metadata_json else {}
        result.append(AlertResponse(
            id=a.id,
            camera_id=a.camera_id,
            zone_id=a.zone_id,
            alert_type=a.alert_type,
            severity=a.severity,
            confidence_score=a.confidence_score,
            snapshot_path=a.snapshot_path,
            metadata=meta,
            status=a.status,
            acknowledged_by=a.acknowledged_by,
            created_at=str(a.created_at) if a.created_at else None
        ))
    return result

@router.post("/{alert_id}/triage")
def triage_alert(alert_id: str, payload: AlertTriagePayload, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert incident not found")
        
    alert.status = payload.status
    alert.acknowledged_by = payload.operator
    db.commit()
    
    return {"id": alert_id, "status": payload.status, "acknowledged_by": payload.operator}
