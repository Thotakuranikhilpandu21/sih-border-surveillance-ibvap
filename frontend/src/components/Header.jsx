import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Volume2, VolumeX, Eye, Moon, Activity, Server, Radio } from 'lucide-react';

export default function Header() {
  const { 
    alerts, 
    soundEnabled, 
    setSoundEnabled, 
    nightFilterEnabled, 
    setNightFilterEnabled,
    bboxOverlayEnabled,
    setBboxOverlayEnabled
  } = useApp();

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'NEW').length;

  return (
    <header className="h-16 bg-[#111827] border-b border-slate-800 px-6 flex items-center justify-between text-slate-100 shadow-md">
      {/* Brand & BOP Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider font-mono text-white flex items-center space-x-2">
              <span>IBVAP</span>
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                v1.0 MIL-SPEC
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>BOP: SECTOR 4-ALPHA</span>
            </p>
          </div>
        </div>
      </div>

      {/* Critical Threat Beacon */}
      {criticalCount > 0 ? (
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-red-950/80 border border-red-500/50 animate-pulse-red">
          <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce" />
          <span className="font-mono text-sm font-bold text-red-400">
            {criticalCount} CRITICAL BREACH{criticalCount > 1 ? 'ES' : ''} DETECTED
          </span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs text-slate-300">BORDER PERIMETER NOMINAL</span>
        </div>
      )}

      {/* Control Toggles & Telemetry */}
      <div className="flex items-center space-x-3">
        {/* Night Vision CLAHE Filter Simulation Toggle */}
        <button
          onClick={() => setNightFilterEnabled(!nightFilterEnabled)}
          className={`px-3 py-1.5 rounded border text-xs font-mono flex items-center space-x-1.5 transition ${
            nightFilterEnabled 
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400 shadow-sm shadow-cyan-500/20' 
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Low-Light / Contrast Enhancement Filter"
        >
          <Moon className="w-4 h-4" />
          <span>CLAHE NIGHT</span>
        </button>

        {/* AI Bounding Box Overlay Toggle */}
        <button
          onClick={() => setBboxOverlayEnabled(!bboxOverlayEnabled)}
          className={`px-3 py-1.5 rounded border text-xs font-mono flex items-center space-x-1.5 transition ${
            bboxOverlayEnabled 
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' 
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle AI Bounding Boxes & Virtual Fence Overlays"
        >
          <Eye className="w-4 h-4" />
          <span>AI OVERLAY</span>
        </button>

        {/* Audio Alert Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded border transition ${
            soundEnabled 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
              : 'bg-red-950/40 border-red-500/30 text-red-400'
          }`}
          title={soundEnabled ? "Mute Tactical Siren Audio" : "Enable Siren Audio"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* System Telemetry */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono border-l border-slate-800 pl-4 text-slate-400">
          <div className="flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>LATENCY: <strong className="text-slate-200">24ms</strong></span>
          </div>
          <div className="flex items-center space-x-1">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPU: <strong className="text-slate-200">68%</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}
