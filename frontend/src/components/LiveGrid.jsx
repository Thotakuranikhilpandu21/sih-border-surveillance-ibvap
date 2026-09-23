import React from 'react';
import { useApp } from '../context/AppContext';
import CameraFeed from './CameraFeed';
import { Grid2X2, Square, Camera, Filter } from 'lucide-react';

export default function LiveGrid() {
  const { cameras, selectedCameraId, setSelectedCameraId, gridMode, setGridMode } = useApp();

  const selectedCam = cameras.find(c => c.id === selectedCameraId) || cameras[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] overflow-hidden p-4">
      {/* Grid Controls Bar */}
      <div className="mb-4 flex items-center justify-between bg-[#111827] px-4 py-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm font-mono font-bold text-slate-200">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>LIVE PERIMETER GRID</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            ({cameras.length} CAMERAS ONLINE)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Switchers */}
          <button
            onClick={() => setGridMode('2x2')}
            className={`p-1.5 rounded border text-xs font-mono flex items-center space-x-1 transition ${
              gridMode === '2x2' 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid2X2 className="w-4 h-4" />
            <span>2x2 QUAD</span>
          </button>
          <button
            onClick={() => setGridMode('single')}
            className={`p-1.5 rounded border text-xs font-mono flex items-center space-x-1 transition ${
              gridMode === 'single' 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>FOCUS VIEW</span>
          </button>
        </div>
      </div>

      {/* Camera Grid View */}
      {gridMode === '2x2' ? (
        <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto">
          {cameras.map((cam) => (
            <CameraFeed
              key={cam.id}
              camera={cam}
              isFocused={cam.id === selectedCameraId}
              onSelect={() => setSelectedCameraId(cam.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {selectedCam && (
            <CameraFeed
              camera={selectedCam}
              isFocused={true}
              onSelect={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
}
