import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Maximize2, ShieldAlert } from 'lucide-react';

export default function CameraFeed({ camera, isFocused, onSelect }) {
  const { bboxOverlayEnabled, nightFilterEnabled, zones, addLiveAlert } = useApp();
  const canvasRef = useRef(null);
  const [telemetry, setTelemetry] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    let ws;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/stream/${camera.id}`;

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTelemetry(data);
          if (data.alerts && data.alerts.length > 0) {
            data.alerts.forEach(alert => addLiveAlert(alert));
          }
        } catch (err) {
          console.error("WS decode err:", err);
        }
      };
      ws.onclose = () => setWsConnected(false);
    } catch (e) {
      console.warn("WebSocket fallback mode", e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [camera.id]);

  // Render Canvas Bounding Boxes and Zones
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Simulated Background Grid Telemetry Lines
    ctx.strokeStyle = nightFilterEnabled ? '#06b6d425' : '#33415535';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!bboxOverlayEnabled) return;

    // 2. Draw Polygon Zones & Tripwires for this camera
    const cameraZones = zones.filter(z => z.camera_id === camera.id);
    cameraZones.forEach((zone) => {
      const coords = zone.coordinates || [];
      if (coords.length === 0) return;

      ctx.beginPath();
      ctx.moveTo(coords[0].x * width, coords[0].y * height);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x * width, coords[i].y * height);
      }

      if (zone.zone_type === 'RESTRICTED_POLYGON' || zone.zone_type === 'LOITERING_AREA') {
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; // Red semi-transparent fill
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = '#EF4444';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`ZONE: ${zone.zone_name.toUpperCase()}`, coords[0].x * width + 5, coords[0].y * height + 15);
      } else if (zone.zone_type === 'TRIPWIRE_LINE') {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#F59E0B';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`TRIPWIRE: ${zone.zone_name}`, coords[0].x * width + 5, coords[0].y * height - 5);
      }
    });

    // 3. Draw AI Detections & Bounding Boxes
    if (telemetry && telemetry.detections) {
      telemetry.detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox;
        const bx = x1 * width;
        const by = y1 * height;
        const bw = (x2 - x1) * width;
        const bh = (y2 - y1) * height;

        const isPerson = det.class_name === 'Person';
        const color = isPerson ? '#EF4444' : '#10B981';

        // Bounding Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Corner brackets
        const cl = Math.min(bw, bh) * 0.2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, by + cl); ctx.lineTo(bx, by); ctx.lineTo(bx + cl, by);
        ctx.moveTo(bx + bw - cl, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cl);
        ctx.stroke();

        // Label badge
        const labelText = `${det.class_name.toUpperCase()} #${det.track_id} (${Math.round(det.confidence * 100)}%)`;
        ctx.fillStyle = color;
        ctx.fillRect(bx, Math.max(0, by - 18), ctx.measureText(labelText).width + 10, 18);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText(labelText, bx + 5, Math.max(12, by - 5));

        if (det.plate_number) {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(bx, by + bh + 2, ctx.measureText(`ANPR: ${det.plate_number}`).width + 10, 16);
          ctx.fillStyle = '#000000';
          ctx.fillText(`ANPR: ${det.plate_number}`, bx + 5, by + bh + 14);
        }
      });
    }
  }, [telemetry, bboxOverlayEnabled, nightFilterEnabled, zones, camera.id]);

  return (
    <div 
      onClick={onSelect}
      className={`relative rounded-lg overflow-hidden bg-slate-950 border transition cursor-pointer select-none ${
        isFocused ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800 hover:border-slate-700'
      } ${nightFilterEnabled ? 'contrast-125 brightness-90 hue-rotate-15' : ''}`}
    >
      {/* Top Feed Info Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 py-2 bg-gradient-to-b from-slate-950/90 to-transparent flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-bold text-slate-200">{camera.name}</span>
          <span className="text-slate-400 text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            {camera.camera_type}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <span>{telemetry ? `${telemetry.fps} FPS` : '30 FPS'}</span>
          <Maximize2 className="w-3.5 h-3.5 hover:text-slate-100" />
        </div>
      </div>

      {/* Simulated Video Canvas Container */}
      <div className="relative aspect-video w-full bg-[#050811] flex items-center justify-center">
        {/* Synthetic Digital Feed Background Elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-48 h-48 rounded-full border border-slate-700 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-slate-800" />
          </div>
        </div>

        {/* HTML5 Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-cover z-10"
        />

        {/* CLAHE Filter Night Overlay Effect */}
        {nightFilterEnabled && (
          <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none z-15 mix-blend-screen" />
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>LOC: {camera.location_name}</span>
        <span>LAT: {camera.latitude?.toFixed(4)} LON: {camera.longitude?.toFixed(4)}</span>
      </div>
    </div>
  );
}
