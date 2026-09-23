import React, { useState, useRef, useEffect } from 'react';
import { createZone } from '../services/api';
import { Target, CheckCircle2, Trash2 } from 'lucide-react';

interface ZoneConfiguratorCanvasProps {
  cameras: any[];
  onZoneSaved: () => void;
}

export const ZoneConfiguratorCanvas: React.FC<ZoneConfiguratorCanvasProps> = ({ cameras, onZoneSaved }) => {
  const [selectedCamId, setSelectedCamId] = useState(cameras[0]?.id || 'cam-1');
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState('RESTRICTED_POLYGON');
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 1000;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 1000;

    if (zoneType === 'TRIPWIRE_LINE' && points.length >= 2) {
      setPoints([{ x, y }]);
    } else {
      setPoints([...points, { x, y }]);
    }
  };

  const handleSave = async () => {
    if (!zoneName || points.length < 2) return;
    setSaving(true);
    try {
      await createZone(selectedCamId, {
        zone_name: zoneName,
        zone_type: zoneType,
        coordinates: points,
        sensitivity_level: 8,
      });
      setPoints([]);
      setZoneName('');
      onZoneSaved();
    } catch (e) {
      console.error("Save zone error:", e);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#33415540';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x * w, points[0].y * h);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * w, points[i].y * h);
      }
      if (zoneType === 'RESTRICTED_POLYGON' && points.length > 2) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
      }
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      points.forEach((p, idx) => {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`P${idx + 1}`, p.x * w + 8, p.y * h - 8);
      });
    }
  }, [points, zoneType]);

  return (
    <div className="flex-1 flex h-full bg-[#0B0F19] p-4 space-x-4 font-mono">
      <div className="flex-1 bg-[#111827] rounded-lg border border-slate-800 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>INTERACTIVE ROI & TRIPWIRE DRAWING WORKSTATION</span>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            EXPORT PAYLOAD: [{points.length} POINTS PLOTTED]
          </span>
        </div>

        <div className="relative aspect-video w-full bg-[#050811] rounded-lg overflow-hidden border border-slate-800">
          <canvas
            ref={canvasRef}
            width={720}
            height={405}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair z-10"
          />
        </div>
      </div>

      <div className="w-80 bg-[#111827] rounded-lg border border-slate-800 p-4 flex flex-col justify-between text-xs space-y-4">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 text-sm">
            ROI & TRIPWIRE SPECS
          </h3>

          <div>
            <label className="text-slate-400 mb-1 block">Target Camera Node:</label>
            <select
              value={selectedCamId}
              onChange={(e) => { setSelectedCamId(e.target.value); setPoints([]); }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 mb-1 block">Zone Name / Tag:</label>
            <input
              type="text"
              placeholder="e.g. Perimeter Tripwire Sector 4"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 mb-1 block">Algorithm Type:</label>
            <select
              value={zoneType}
              onChange={(e) => { setZoneType(e.target.value); setPoints([]); }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="RESTRICTED_POLYGON">RESTRICTED POLYGON (Shapely Intersection)</option>
              <option value="TRIPWIRE_LINE">DIRECTIONAL TRIPWIRE (Line-Cross Vector)</option>
              <option value="LOITERING_AREA">LOITERING ZONE (Dwell Time &gt;30s)</option>
              <option value="ANPR_CHECKPOINT">ANPR INSPECTION CHECKPOINT</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !zoneName || points.length < 2}
            className="w-full py-2 bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold rounded hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>SAVE DIGITAL FENCE RULE</span>
          </button>
        </div>

        <button
          onClick={() => setPoints([])}
          className="text-red-400 hover:underline text-center"
        >
          Clear Plotted Vertices ({points.length})
        </button>
      </div>
    </div>
  );
};
