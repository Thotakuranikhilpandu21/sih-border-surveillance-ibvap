# Database & Vector DB Schema Specification

## Project Title
**IBVAP — Intelligent Border Video Analytics Platform**  
*(SIH Problem Statement ID: SIH26187)*

---

## 1. Relational Database Schema (SQL)

```sql
-- ============================================================================
-- TABLE: USERS & AUTHENTICATION
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'COMMANDER', 'OPERATOR', 'AUDITOR')),
    bop_assignment VARCHAR(100) NOT NULL DEFAULT 'BOP MAIN',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: CAMERAS
-- ============================================================================
CREATE TABLE cameras (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rtsp_url VARCHAR(500) NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    camera_type VARCHAR(30) NOT NULL CHECK (camera_type IN ('FIXED_IP', 'PTZ', 'THERMAL', 'INFRARED')),
    status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'DEGRADED', 'MAINTENANCE')),
    fps_target INTEGER NOT NULL DEFAULT 25,
    resolution VARCHAR(20) DEFAULT '1920x1080',
    night_vision_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: ZONES & VIRTUAL FENCES (ROIs)
-- ============================================================================
CREATE TABLE camera_zones (
    id VARCHAR(36) PRIMARY KEY,
    camera_id VARCHAR(36) NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(30) NOT NULL CHECK (zone_type IN ('RESTRICTED_POLYGON', 'TRIPWIRE_LINE', 'LOITERING_AREA', 'ANPR_CHECKPOINT')),
    coordinates_json TEXT NOT NULL, -- Format: [{"x": 0.1, "y": 0.2}, ...] normalized 0.0 to 1.0
    sensitivity_level INTEGER DEFAULT 5 CHECK (sensitivity_level BETWEEN 1 AND 10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: DETECTED ALERTS & INCIDENTS
-- ============================================================================
CREATE TABLE alerts (
    id VARCHAR(36) PRIMARY KEY,
    camera_id VARCHAR(36) NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    zone_id VARCHAR(36) REFERENCES camera_zones(id) ON DELETE SET NULL,
    alert_type VARCHAR(40) NOT NULL CHECK (alert_type IN (
        'INTRUSION_BREACH', 'TRIPWIRE_CROSSING', 'FACE_WATCHLIST_MATCH', 
        'ANPR_SUSPICIOUS_HIT', 'UNAUTHORIZED_LOITERING', 'NIGHT_MOVEMENT_ANOMALY', 'CAMERA_OBSTRUCTION'
    )),
    severity VARCHAR(15) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    snapshot_path VARCHAR(500) NOT NULL,
    video_clip_path VARCHAR(500),
    metadata_json TEXT, -- Contains extra detection metadata (e.g. bounding box specs, track history)
    status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW', 'ACKNOWLEDGED', 'DISPATCHED', 'FALSE_ALARM', 'RESOLVED')),
    acknowledged_by VARCHAR(36) REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: ANPR LOGS
-- ============================================================================
CREATE TABLE anpr_logs (
    id VARCHAR(36) PRIMARY KEY,
    camera_id VARCHAR(36) NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    alert_id VARCHAR(36) REFERENCES alerts(id) ON DELETE SET NULL,
    license_plate_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(30) DEFAULT 'UNKNOWN',
    confidence FLOAT NOT NULL,
    snapshot_path VARCHAR(500) NOT NULL,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: FACE WATCHLIST & RECOGNITION LOGS
-- ============================================================================
CREATE TABLE face_watchlist (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    alias_name VARCHAR(100),
    category VARCHAR(50) NOT NULL CHECK (category IN ('SUSPECT', 'POW', 'PERSON_OF_INTEREST', 'AUTHORIZED_PERSONNEL')),
    vector_id VARCHAR(100) NOT NULL, -- Foreign Pointer to FAISS / Chroma Index
    profile_image_path VARCHAR(500) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE face_recognition_logs (
    id VARCHAR(36) PRIMARY KEY,
    camera_id VARCHAR(36) NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    watchlist_person_id VARCHAR(36) REFERENCES face_watchlist(id) ON DELETE SET NULL,
    match_confidence FLOAT NOT NULL,
    snapshot_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_anpr_plate ON anpr_logs(license_plate_number);
CREATE INDEX idx_cameras_status ON cameras(status);
```

---

## 2. Vector DB Schema & Indexing (FAISS / Chroma)

Facial recognition embeddings are indexed in a high-performance vector database layer for fast Euclidean / Cosine similarity lookup.

### 2.1 Vector Properties
- **Dimensionality:** 512 dimensions (ArcFace / MobileFaceNet embedding vector output).
- **Metric Type:** Cosine Similarity ($\text{Inner Product}$ with $L_2$-normalized vectors).
- **Index Type:** `IndexFlatIP` (Exact search for small databases $<10,000$ identities) or `IndexIVFFlat` (Inverted File Index for large-scale deployment).

### 2.2 Payload Structure (Metadata sidecar linked to `vector_id`)
```json
{
  "vector_id": "face_emb_98321",
  "watchlist_id": "fw_uuid_8832190",
  "full_name": "Unknown Person #402",
  "category": "SUSPECT",
  "threat_level": "RED",
  "added_date": "2026-04-12T10:30:00Z"
}
```