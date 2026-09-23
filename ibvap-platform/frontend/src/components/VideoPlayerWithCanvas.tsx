import React, { useEffect, useRef } from 'react';

interface VideoPlayerWithCanvasProps {
  camera: any;
  detections?: any[];
  zones?: any[];
  nightVision?: boolean;
}

export const VideoPlayerWithCanvas: React.FC<VideoPlayerWithCanvasProps> = ({
  camera,
  detections = [],
  zones = [],
  nightVision = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grid Telemetry Lines
    ctx.strokeStyle = nightVision ? '#06b6d425' : '#33415535';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Draw Active Zones & Tripwires
    zones.forEach((z) => {
      const coords = z.coordinates || [];
      if (coords.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(coords[0].x * width, coords[0].y * height);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x * width, coords[i].y * height);
      }
      if (z.zone_type === 'RESTRICTED_POLYGON' || z.zone_type === 'LOITERING_AREA') {
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Draw AI Bounding Boxes & Velocity Vectors
    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const bx = x1 * width;
      const by = y1 * height;
      const bw = (x2 - x1) * width;
      const bh = (y2 - y1) * height;

      const color = det.class_name === 'Intruder' ? '#EF4444' : '#10B981';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      // Label
      const label = `${det.class_name.toUpperCase()} #${det.track_id} (${Math.round(det.confidence * 100)}%)`;
      ctx.fillStyle = color;
      ctx.fillRect(bx, Math.max(0, by - 18), ctx.measureText(label).width + 8, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(label, bx + 4, Math.max(12, by - 4));
    });
  }, [detections, zones, nightVision]);

  return (
    <div className={`relative aspect-video bg-[#050811] rounded-lg overflow-hidden border border-slate-800 ${nightVision ? 'contrast-125 brightness-90 hue-rotate-15' : ''}`}>
      <div className="absolute top-2 left-2 z-20 font-mono text-xs flex items-center space-x-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-slate-200">{camera.name}</span>
        <span className="text-slate-500">[{camera.camera_type}]</span>
      </div>

      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-full object-cover z-10"
      />
    </div>
  );
};
