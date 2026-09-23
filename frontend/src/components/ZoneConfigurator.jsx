import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { createZone, deleteZone } from '../services/api';
import { Target, Plus, Trash2, CheckCircle2, Sliders, MapPin } from 'lucide-react';

export default function ZoneConfigurator() {
  const { cameras, selectedCameraId, setSelectedCameraId, zones, refreshZones } = useApp();
  const [currentPoints, setCurrentPoints] = useState([]);
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState('RESTRICTED_POLYGON');
  const [sensitivity, setSensitivity] = useState(8);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);

  const activeCam = cameras.find(c => c.id === selectedCameraId) || cameras[0];
  const activeCamZones = zones.filter(z => z.camera_id === selectedCameraId);

  // Handle Canvas Clicking to draw polygon vertices
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (zoneType === 'TRIPWIRE_LINE' && currentPoints.length >= 2) {
      setCurrentPoints([{ x, y }]);
    } else {
      setCurrentPoints([...currentPoints, { x: round(x), y: round(y) }]);
    }
  };

  const round = (val) => Math.round(val * 1000) / 1000;

  const handleSaveZone = async () => {
    if (!zoneName || currentPoints.length < 2) return;
    setSaving(true);
    try {
      await createZone({
        camera_id: selectedCameraId,
        zone_name: zoneName,
        zone_type: zoneType,
        coordinates: currentPoints,
        sensitivity_level: sensitivity,
        is_active: true
      });
      setCurrentPoints([]);
      setZoneName('');
      await refreshZones();
    } catch (e) {
      console.error("Save zone error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (id) => {
    try {
      await deleteZone(id);
      await refreshZones();
    } catch (e) {
      console.error("Delete zone error:", e);
    }
  };

  // Render Preview Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = '#33415540';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Draw Existing Saved Zones
    activeCamZones.forEach((z) => {
      const coords = z.coordinates || [];
      if (coords.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(coords[0].x * width, coords[0].y * height);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x * width, coords[i].y * height);
      }
      if (z.zone_type === 'RESTRICTED_POLYGON' || z.zone_type === 'LOITERING_AREA') {
        ctx.closePath();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Draw Active Drawing Draft Line / Polygon
    if (currentPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x * width, currentPoints[0].y * height);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x * width, currentPoints[i].y * height);
      }
      if (zoneType === 'RESTRICTED_POLYGON' && currentPoints.length > 2) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
      }
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw handles
      currentPoints.forEach((p, idx) => {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`P${idx + 1}`, p.x * width + 8, p.y * height - 8);
      });
    }
  }, [currentPoints, activeCamZones, zoneType]);

  return (
    <div className="flex-1 flex h-full bg-[#0B0F19] overflow-hidden p-4 space-x-4">
      {/* Left Canvas Drawing Board */}
      <div className="flex-1 flex flex-col bg-[#111827] rounded-lg border border-slate-800 p-4">
        <div className="flex justify-between items-center mb-3 font-mono">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-slate-200">INTERACTIVE ZONE & TRIPWIRE CONFIGURATOR</h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            {activeCam?.name}
          </span>
        </div>

        {/* Canvas Surface */}
        <div className="relative aspect-video w-full bg-[#050811] rounded-lg overflow-hidden border border-slate-800">
          <canvas
            ref={canvasRef}
            width={720}
            height={405}
            onClick={handleCanvasClick}
            className="w-full h-full object-cover cursor-crosshair z-10"
          />
          {currentPoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 font-mono text-xs">
              [ Click on canvas stream area to plot boundary vertices ]
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>PLOTTED VERTICES: {currentPoints.length}</span>
          <button
            onClick={() => setCurrentPoints([])}
            className="text-red-400 hover:underline"
          >
            Clear Current Draft Points
          </button>
        </div>
      </div>

      {/* Right Controls Sidebar */}
      <div className="w-80 bg-[#111827] rounded-lg border border-slate-800 p-4 flex flex-col justify-between font-mono">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            ZONE PARAMETERS
          </h3>

          {/* Camera Selector */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Target Camera:</label>
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                setCurrentPoints([]);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Zone Name */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Zone / Line Identifier:</label>
            <input
              type="text"
              placeholder="e.g. Sector 4 North Tripwire"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Zone Type */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Breach Algorithm Type:</label>
            <select
              value={zoneType}
              onChange={(e) => {
                setZoneType(e.target.value);
                setCurrentPoints([]);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="RESTRICTED_POLYGON">RESTRICTED POLYGON (Intrusion)</option>
              <option value="TRIPWIRE_LINE">TRIPWIRE LINE (Line-Cross)</option>
              <option value="LOITERING_AREA">LOITERING ZONE (Dwell Time)</option>
              <option value="ANPR_CHECKPOINT">ANPR INSPECTION CHECKPOINT</option>
            </select>
          </div>

          {/* Sensitivity */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Sensitivity Threshold:</span>
              <span className="text-emerald-400 font-bold">{sensitivity}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-900"
            />
          </div>

          <button
            onClick={handleSaveZone}
            disabled={saving || !zoneName || currentPoints.length < 2}
            className="w-full py-2 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs flex items-center justify-center space-x-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>SAVE ACTIVE ZONE RULE</span>
          </button>
        </div>

        {/* Existing Active Zones List */}
        <div className="mt-4 border-t border-slate-800 pt-3">
          <h4 className="text-xs text-slate-400 font-bold mb-2">ACTIVE CAMERA RULES ({activeCamZones.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {activeCamZones.map(z => (
              <div key={z.id} className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                <div>
                  <div className="text-slate-200 font-bold">{z.zone_name}</div>
                  <div className="text-slate-500 text-[10px]">{z.zone_type}</div>
                </div>
                <button
                  onClick={() => handleDeleteZone(z.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
