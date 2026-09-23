const API_BASE = '/api/v1';

export async function fetchCameras() {
  const res = await fetch(`${API_BASE}/cameras`);
  if (!res.ok) throw new Error('Failed to fetch cameras');
  return res.json();
}

export async function fetchAlerts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/alerts?${query}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function updateAlertStatus(alertId, status, user = 'operator_active') {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, acknowledged_by: user })
  });
  if (!res.ok) throw new Error('Failed to update alert');
  return res.json();
}

export async function fetchAnprLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/anpr/logs?${query}`);
  if (!res.ok) throw new Error('Failed to fetch ANPR logs');
  return res.json();
}

export async function fetchWatchlist() {
  const res = await fetch(`${API_BASE}/watchlist`);
  if (!res.ok) throw new Error('Failed to fetch watchlist');
  return res.json();
}

export async function fetchZones(cameraId) {
  const query = cameraId ? `?camera_id=${cameraId}` : '';
  const res = await fetch(`${API_BASE}/zones${query}`);
  if (!res.ok) throw new Error('Failed to fetch zones');
  return res.json();
}

export async function createZone(zoneData) {
  const res = await fetch(`${API_BASE}/zones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zoneData)
  });
  if (!res.ok) throw new Error('Failed to create zone');
  return res.json();
}

export async function deleteZone(zoneId) {
  const res = await fetch(`${API_BASE}/zones/${zoneId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete zone');
  return res.json();
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  if (!res.ok) throw new Error('Failed to fetch analytics summary');
  return res.json();
}
