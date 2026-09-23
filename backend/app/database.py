import sqlite3
import os
import json
import uuid
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "ibvap.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'OPERATOR',
        bop_assignment TEXT NOT NULL DEFAULT 'BOP MAIN',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Cameras Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cameras (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rtsp_url TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        camera_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ONLINE',
        fps_target INTEGER NOT NULL DEFAULT 25,
        resolution TEXT DEFAULT '1920x1080',
        night_vision_enabled INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Camera Zones Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS camera_zones (
        id TEXT PRIMARY KEY,
        camera_id TEXT NOT NULL,
        zone_name TEXT NOT NULL,
        zone_type TEXT NOT NULL,
        coordinates_json TEXT NOT NULL,
        sensitivity_level INTEGER DEFAULT 5,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE CASCADE
    );
    """)

    # Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        camera_id TEXT NOT NULL,
        zone_id TEXT,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        snapshot_path TEXT NOT NULL,
        video_clip_path TEXT,
        metadata_json TEXT,
        status TEXT DEFAULT 'NEW',
        acknowledged_by TEXT,
        acknowledged_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE CASCADE
    );
    """)

    # ANPR Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS anpr_logs (
        id TEXT PRIMARY KEY,
        camera_id TEXT NOT NULL,
        alert_id TEXT,
        license_plate_number TEXT NOT NULL,
        vehicle_type TEXT DEFAULT 'UNKNOWN',
        confidence REAL NOT NULL,
        snapshot_path TEXT NOT NULL,
        is_flagged INTEGER DEFAULT 0,
        flag_reason TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE CASCADE
    );
    """)

    # Face Watchlist Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS face_watchlist (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        alias_name TEXT,
        category TEXT NOT NULL,
        vector_id TEXT NOT NULL,
        profile_image_path TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Face Recognition Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS face_recognition_logs (
        id TEXT PRIMARY KEY,
        camera_id TEXT NOT NULL,
        watchlist_person_id TEXT,
        match_confidence REAL NOT NULL,
        snapshot_path TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE CASCADE
    );
    """)

    conn.commit()

    # Seed initial data if cameras table is empty
    cursor.execute("SELECT COUNT(*) FROM cameras;")
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)
        conn.commit()

    conn.close()

def seed_data(cursor):
    # Seed Users
    cursor.execute("""
        INSERT INTO users (id, username, email, password_hash, full_name, role, bop_assignment)
        VALUES ('user-admin-1', 'commander_alpha', 'commander@sih.in', '$2b$12$hashedpwd', 'Capt. V. Sharma', 'COMMANDER', 'BOP SECTOR 4-ALPHA')
    """)

    # Seed Cameras
    cameras = [
        ("cam-1", "CAM-01 (North Fence Perimeter)", "rtsp://192.168.1.101/live", "Border Outpost Alpha - Fence", 31.6340, 74.8723, "THERMAL", "ONLINE", 30, "1920x1080", 1),
        ("cam-2", "CAM-02 (Transit Checkpost Gate)", "rtsp://192.168.1.102/live", "Checkpost Alpha Gate 1", 31.6355, 74.8745, "PTZ", "ONLINE", 25, "1920x1080", 1),
        ("cam-3", "CAM-03 (East Patrol Road)", "rtsp://192.168.1.103/live", "Patrol Route Sector 4", 31.6312, 74.8810, "FIXED_IP", "ONLINE", 25, "1920x1080", 1),
        ("cam-4", "CAM-04 (Restricted Depot Zone)", "rtsp://192.168.1.104/live", "Ammunition Depot East", 31.6290, 74.8690, "INFRARED", "ONLINE", 30, "1920x1080", 1)
    ]
    cursor.executemany("""
        INSERT INTO cameras (id, name, rtsp_url, location_name, latitude, longitude, camera_type, status, fps_target, resolution, night_vision_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, cameras)

    # Seed Zones
    zones = [
        ("zone-1", "cam-1", "Alpha Perimeter Restricted Zone", "RESTRICTED_POLYGON", json.dumps([{"x": 0.15, "y": 0.20}, {"x": 0.85, "y": 0.20}, {"x": 0.90, "y": 0.80}, {"x": 0.10, "y": 0.80}]), 8, 1),
        ("zone-2", "cam-2", "Checkpost ANPR Inspection Line", "ANPR_CHECKPOINT", json.dumps([{"x": 0.20, "y": 0.50}, {"x": 0.80, "y": 0.50}]), 9, 1),
        ("zone-3", "cam-3", "Border Tripwire Line-A", "TRIPWIRE_LINE", json.dumps([{"x": 0.05, "y": 0.60}, {"x": 0.95, "y": 0.60}]), 7, 1),
        ("zone-4", "cam-4", "Depot Perimeter No-Loiter Zone", "LOITERING_AREA", json.dumps([{"x": 0.25, "y": 0.25}, {"x": 0.75, "y": 0.25}, {"x": 0.75, "y": 0.75}, {"x": 0.25, "y": 0.75}]), 9, 1)
    ]
    cursor.executemany("""
        INSERT INTO camera_zones (id, camera_id, zone_name, zone_type, coordinates_json, sensitivity_level, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, zones)

    # Seed Watchlist
    watchlist = [
        ("fw-1", "Tariq Mahmood", "Alias: Shadow", "SUSPECT", "vec_suspect_001", "/snapshots/watchlist/suspect1.jpg", "Subject of interest in unauthorized border crossing attempts"),
        ("fw-2", "Vikram Singh", "Alias: Operator-1", "AUTHORIZED_PERSONNEL", "vec_auth_002", "/snapshots/watchlist/auth1.jpg", "Senior Patrol Officer Sector 4"),
        ("fw-3", "Unknown Male #809", "Alias: Red-Alpha", "PERSON_OF_INTEREST", "vec_poi_003", "/snapshots/watchlist/poi1.jpg", "Spotted loitering near BOP Alpha perimeter wire")
    ]
    cursor.executemany("""
        INSERT INTO face_watchlist (id, full_name, alias_name, category, vector_id, profile_image_path, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, watchlist)

    # Seed Initial Alerts
    alerts = [
        ("alt-101", "cam-1", "zone-1", "INTRUSION_BREACH", "CRITICAL", 0.94, "/snapshots/alerts/breach_cam1.jpg", None, json.dumps({"target": "Pedestrian", "track_id": 104, "location": "Grid 4B"}), "NEW", None, None),
        ("alt-102", "cam-2", "zone-2", "ANPR_SUSPICIOUS_HIT", "HIGH", 0.91, "/snapshots/alerts/anpr_cam2.jpg", None, json.dumps({"plate": "PB-08-AX-9941", "vehicle": "SUV"}), "NEW", None, None),
        ("alt-103", "cam-4", "zone-4", "UNAUTHORIZED_LOITERING", "HIGH", 0.88, "/snapshots/alerts/loiter_cam4.jpg", None, json.dumps({"dwell_time_seconds": 145}), "ACKNOWLEDGED", "user-admin-1", datetime.now(timezone.utc).isoformat()),
        ("alt-104", "cam-1", "zone-1", "FACE_WATCHLIST_MATCH", "CRITICAL", 0.96, "/snapshots/alerts/face_cam1.jpg", None, json.dumps({"match_id": "fw-1", "name": "Tariq Mahmood", "cosine_sim": 0.942}), "NEW", None, None)
    ]
    cursor.executemany("""
        INSERT INTO alerts (id, camera_id, zone_id, alert_type, severity, confidence_score, snapshot_path, video_clip_path, metadata_json, status, acknowledged_by, acknowledged_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, alerts)

    # Seed ANPR Logs
    anpr = [
        ("anpr-1", "cam-2", "alt-102", "PB-08-AX-9941", "SUV", 0.93, "/snapshots/anpr/plate1.jpg", 1, "Flagged: Unregistered vehicle in restricted sector zone"),
        ("anpr-2", "cam-2", None, "JK-02-CB-4410", "MILITARY_TRUCK", 0.98, "/snapshots/anpr/plate2.jpg", 0, "Authorized BSF Supply Truck"),
        ("anpr-3", "cam-3", None, "HR-26-DQ-8812", "PICKUP_TRUCK", 0.89, "/snapshots/anpr/plate3.jpg", 1, "Suspicious movement near Sector 4 patrol road")
    ]
    cursor.executemany("""
        INSERT INTO anpr_logs (id, camera_id, alert_id, license_plate_number, vehicle_type, confidence, snapshot_path, is_flagged, flag_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, anpr)
