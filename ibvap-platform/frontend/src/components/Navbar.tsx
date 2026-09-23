import React from 'react';
import { ShieldAlert, LayoutGrid, Target, Car, BarChart3, Radio, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalAlertsCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  criticalAlertsCount,
  soundEnabled,
  setSoundEnabled,
}) => {
  return (
    <header className="h-16 bg-[#111827] border-b border-slate-800 px-6 flex items-center justify-between font-mono">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wider text-white flex items-center space-x-2">
              <span>IBVAP PLATFORM</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                SIH26187 MIL-SPEC
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>BOP: SECTOR 4-ALPHA</span>
            </p>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="flex space-x-1 border-l border-slate-800 pl-6">
          {[
            { id: 'dashboard', label: 'Command Grid', icon: LayoutGrid },
            { id: 'zones', label: 'ROI & Tripwires', icon: Target },
            { id: 'intelligence', label: 'ANPR & FRS', icon: Car },
            { id: 'analytics', label: 'Analytics Hub', icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded text-xs font-bold transition flex items-center space-x-2 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {criticalAlertsCount > 0 ? (
          <div className="px-3 py-1 rounded bg-red-950/80 border border-red-500 text-red-400 font-bold text-xs animate-pulse">
            {criticalAlertsCount} CRITICAL BREACHES
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>PERIMETER NOMINAL</span>
          </div>
        )}

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded border transition ${
            soundEnabled
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-red-950/40 border-red-500/30 text-red-400'
          }`}
          title="Toggle Alert Audio Chimes"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
