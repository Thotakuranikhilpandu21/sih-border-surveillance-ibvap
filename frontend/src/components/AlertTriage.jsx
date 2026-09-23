import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { updateAlertStatus } from '../services/api';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, Send, XCircle, Filter, Clock } from 'lucide-react';

export default function AlertTriage() {
  const { alerts, setAlerts, cameras } = useApp();
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const handleUpdate = async (alertId, newStatus) => {
    try {
      await updateAlertStatus(alertId, newStatus);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus } : a));
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-400 font-bold flex items-center space-x-1"><ShieldAlert className="w-3 h-3" /><span>CRITICAL BREACH</span></span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-400 font-bold flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>HIGH WARNING</span></span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-bold flex items-center space-x-1"><Info className="w-3 h-3" /><span>MEDIUM/LOW</span></span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] overflow-hidden p-4 font-mono">
      {/* Header & Filter Bar */}
      <div className="mb-4 flex items-center justify-between bg-[#111827] px-4 py-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
          <h2 className="font-bold text-slate-200 text-sm">REAL-TIME ALERT TRIAGE & DISPATCH CONSOLE</h2>
          <span className="text-xs text-slate-500">({filteredAlerts.length} INCIDENTS LOGGED)</span>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center space-x-2 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded border transition ${
                filterSeverity === sev 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-2" />
            <span>NO ACTIVE INCIDENTS MATCHING FILTER CRITERIA</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const cam = cameras.find(c => c.id === alert.camera_id);
            const isNew = alert.status === 'NEW';
            
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg bg-[#111827] border transition flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 ${
                  isNew && alert.severity === 'CRITICAL'
                    ? 'border-red-500/80 shadow-lg shadow-red-500/10 animate-pulse-red'
                    : 'border-slate-800'
                }`}
              >
                {/* Info Block */}
                <div className="flex items-start space-x-4">
                  {/* Snapshot Preview Box */}
                  <div className="w-20 h-16 bg-slate-950 rounded border border-slate-800 flex items-center justify-center text-slate-600 text-[10px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="z-10 font-bold text-slate-400">SNAP</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-3 text-xs">
                      {getSeverityBadge(alert.severity)}
                      <span className="font-bold text-slate-200">{alert.alert_type}</span>
                      <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(alert.created_at || Date.now()).toLocaleTimeString()}</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span>LOCATION: </span>
                      <strong className="text-slate-300">{cam?.name || alert.camera_id}</strong>
                      <span className="ml-3 text-emerald-400">
                        CONFIDENCE: {Math.round(alert.confidence_score * 100)}%
                      </span>
                    </div>

                    {alert.metadata && alert.metadata.details && (
                      <div className="text-[11px] text-slate-400 italic">
                        "{alert.metadata.details}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Action Buttons */}
                <div className="flex items-center space-x-2 text-xs">
                  <div className="text-right mr-3 hidden lg:block">
                    <span className="text-[10px] text-slate-500 block">STATUS</span>
                    <span className={`font-bold ${
                      alert.status === 'NEW' ? 'text-red-400' :
                      alert.status === 'DISPATCHED' ? 'text-cyan-400' : 'text-emerald-400'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  {alert.status === 'NEW' && (
                    <>
                      <button
                        onClick={() => handleUpdate(alert.id, 'ACKNOWLEDGED')}
                        className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded hover:bg-emerald-500/30 flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACKNOWLEDGE</span>
                      </button>
                      <button
                        onClick={() => handleUpdate(alert.id, 'DISPATCHED')}
                        className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-500/30 flex items-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>DISPATCH TEAM</span>
                      </button>
                      <button
                        onClick={() => handleUpdate(alert.id, 'FALSE_ALARM')}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 rounded flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>DISMISS</span>
                      </button>
                    </>
                  )}

                  {alert.status !== 'NEW' && (
                    <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded text-xs">
                      HANDLED BY OPERATOR
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
