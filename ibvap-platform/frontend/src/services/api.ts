export interface Camera {
  id: string;
  name: string;
  rtsp_url: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  camera_type: string;
  status: string;
  fps_target: number;
  night_vision_enabled: boolean;
}

export interface ZonePoint {
  x: number;
  y: number;
}

export interface Zone {
  id: string;
  camera_id: string;
  zone_name: string;
  zone_type: string;
  coordinates: ZonePoint[];
  sensitivity_level: number;
  is_active: boolean;
}

export interface AlertItem {
  id: string;
  camera_id: string;
  zone_id?: string;
  alert_type: string;
  severity: string;
  confidence_score: number;
  snapshot_path: string;
  metadata?: Record<string, any>;
  status: string;
  acknowledged_by?: string;
  created_at?: string;
}

const API_BASE = '/api/v1';

export async function getCameras(): Promise<Camera[]> {
  const res = await fetch(`${API_BASE}/cameras`);
  if (!res.ok) throw new Error('Failed to fetch cameras');
  return res.json();
}

export async function createCamera(payload: Partial<Camera>): Promise<Camera> {
  const res = await fetch(`${API_BASE}/cameras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create camera');
  return res.json();
}

export async function getZones(cameraId: string): Promise<Zone[]> {
  const res = await fetch(`${API_BASE}/zones/${cameraId}`);
  if (!res.ok) throw new Error('Failed to fetch zones');
  return res.json();
}

export async function createZone(cameraId: string, payload: Partial<Zone>): Promise<Zone> {
  const res = await fetch(`${API_BASE}/zones/${cameraId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save zone');
  return res.json();
}

export async function getHistoricalAlerts(params: Record<string, string> = {}): Promise<AlertItem[]> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/alerts/historical?${query}`);
  if (!res.ok) throw new Error('Failed to fetch historical alerts');
  return res.json();
}

export async function triageAlert(alertId: string, status: string, operator = 'Operator_Alpha'): Promise<any> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, operator }),
  });
  if (!res.ok) throw new Error('Failed to triage alert');
  return res.json();
}

export async function searchAnprPlates(plate?: string): Promise<any[]> {
  const query = plate ? `?plate=${encodeURIComponent(plate)}` : '';
  const res = await fetch(`${API_BASE}/intelligence/anpr/search${query}`);
  if (!res.ok) throw new Error('Failed to search ANPR plates');
  return res.json();
}

export async function enrollSuspectFace(payload: { full_name: string; alias_name?: string; category: string; notes?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/intelligence/frs/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to enroll suspect face');
  return res.json();
}

export async function getWatchlist(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/intelligence/frs/watchlist`);
  if (!res.ok) throw new Error('Failed to fetch watchlist');
  return res.json();
}
