import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutGrid, Target, BellRing, Car, BarChart3 } from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, alerts } = useApp();
  const unreadAlerts = alerts.filter(a => a.status === 'NEW').length;

  const navItems = [
    { id: 'live', label: 'Live Grid', icon: LayoutGrid, badge: null },
    { id: 'zones', label: 'ROI & Tripwires', icon: Target, badge: null },
    { id: 'triage', label: 'Alert Triage', icon: BellRing, badge: unreadAlerts > 0 ? unreadAlerts : null },
    { id: 'anpr', label: 'ANPR & Watchlist', icon: Car, badge: null },
    { id: 'analytics', label: 'Analytics Hub', icon: BarChart3, badge: null },
  ];

  return (
    <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col justify-between p-4 select-none">
      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3 px-3">
            Command Operations
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Operator Footer Status */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono space-y-1">
        <div className="flex justify-between text-slate-400">
          <span>OPERATOR:</span>
          <span className="text-slate-200 font-semibold">Capt. V. Sharma</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>CLEARANCE:</span>
          <span className="text-emerald-400">LEVEL 4 - ALPHA</span>
        </div>
      </div>
    </aside>
  );
}
