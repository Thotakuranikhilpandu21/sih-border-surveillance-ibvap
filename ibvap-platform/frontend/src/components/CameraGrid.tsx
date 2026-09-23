import React, { useState } from 'react';
import { VideoPlayerWithCanvas } from './VideoPlayerWithCanvas';
import { Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';

interface CameraGridProps {
  cameras: any[];
  telemetryStreams: Record<string, any>;
  zones: any[];
}

export const CameraGrid: React.FC<CameraGridProps> = ({ cameras, telemetryStreams, zones }) => {
  const [layoutMode, setLayoutMode] = useState<'2x2' | '3x3' | '4x4'>('2x2');

  const getGridCols = () => {
    switch (layoutMode) {
      case '3x3': return 'grid-cols-3';
      case '4x4': return 'grid-cols-4';
      default: return 'grid-cols-2';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] p-4 overflow-hidden">
      <div className="mb-3 flex justify-between items-center bg-[#111827] px-4 py-2 rounded-lg border border-slate-800 font-mono text-xs">
        <span className="font-bold text-slate-300">LIVE COMMAND CENTER ({cameras.length} STREAM NODES)</span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLayoutMode('2x2')}
            className={`px-2.5 py-1 rounded border flex items-center space-x-1 ${layoutMode === '2x2' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>2x2</span>
          </button>
          <button
            onClick={() => setLayoutMode('3x3')}
            className={`px-2.5 py-1 rounded border flex items-center space-x-1 ${layoutMode === '3x3' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>3x3</span>
          </button>
          <button
            onClick={() => setLayoutMode('4x4')}
            className={`px-2.5 py-1 rounded border flex items-center space-x-1 ${layoutMode === '4x4' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>4x4</span>
          </button>
        </div>
      </div>

      <div className={`grid ${getGridCols()} gap-3 flex-1 overflow-y-auto`}>
        {cameras.map((cam) => {
          const stream = telemetryStreams[cam.id] || {};
          const camZones = zones.filter((z) => z.camera_id === cam.id);
          return (
            <VideoPlayerWithCanvas
              key={cam.id}
              camera={cam}
              detections={stream.detections || []}
              zones={camZones}
            />
          );
        })}
      </div>
    </div>
  );
};
