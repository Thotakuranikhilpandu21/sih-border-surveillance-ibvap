import React, { useState } from 'react';
import { triageAlert } from '../services/api';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, Send, XCircle } from 'lucide-react';

interface AlertTriageDrawerProps {
  alerts: any[];
  onAlertUpdated: () => void;
}

export const AlertTriageDrawer: React.FC<AlertTriageDrawerProps> = ({ alerts, onAlertUpdated }) => {
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const handleTriage = async (alertId: string, status: string) => {
    try {
      await triageAlert(alertId, status);
      onAlertUpdated();
    } catch (e) {
      console.error("Triage error:", e);
    }
  };

  const filtered = alerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded bg-red-950/90 border border-red-500/80 text-red-400 font-bold text-[10px] flex items-center space-x-1"><ShieldAlert className="w-3 h-3" /><span>CRITICAL BREACH</span></span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-500/80 text-amber-400 font-bold text-[10px] flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>HIGH WARNING</span></span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-bold text-[10px] flex items-center space-x-1"><Info className="w-3 h-3" /><span>MEDIUM/LOW</span></span>;
    }
  };

  return (
    <aside className="w-96 bg-[#111827] border-l border-slate-800 flex flex-col h-full font-mono select-none">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
          <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          <span>ALERT TRIAGE CONSOLE</span>
        </div>
        <span className="text-xs text-slate-500">({filtered.length})</span>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 border-b border-slate-800 flex space-x-1 text-xs">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-2.5 py-1 rounded border ${severityFilter === sev ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alert Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-slate-500 text-xs">
            [ NO ACTIVE THREATS MATCHING FILTER ]
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 bg-slate-950 rounded-lg border transition ${alert.status === 'NEW' && alert.severity === 'CRITICAL' ? 'border-red-500/80 shadow-md shadow-red-500/20 animate-pulse' : 'border-slate-800'}`}
            >
              <div className="flex justify-between items-start mb-2">
                {getSeverityBadge(alert.severity)}
                <span className="text-[10px] text-slate-500">{alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : 'JUST NOW'}</span>
              </div>

              <div className="text-xs font-bold text-slate-200 mb-1">{alert.alert_type}</div>
              <div className="text-[11px] text-slate-400 mb-3">
                CAMERA: <strong className="text-slate-300">{alert.camera_id}</strong> | CONF: <strong className="text-emerald-400">{Math.round((alert.confidence_score || 0.9) * 100)}%</strong>
              </div>

              {alert.status === 'NEW' ? (
                <div className="flex space-x-1.5 text-[11px]">
                  <button
                    onClick={() => handleTriage(alert.id, 'ACKNOWLEDGED')}
                    className="flex-1 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded hover:bg-emerald-500/30 font-bold flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ACK</span>
                  </button>
                  <button
                    onClick={() => handleTriage(alert.id, 'DISPATCHED')}
                    className="flex-1 py-1 bg-cyan-500/20 border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-500/30 font-bold flex items-center justify-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>DISPATCH</span>
                  </button>
                  <button
                    onClick={() => handleTriage(alert.id, 'DISMISSED')}
                    className="py-1 px-2 bg-slate-900 border border-slate-700 text-slate-400 rounded hover:text-slate-200"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded text-center">
                  STATUS: {alert.status} BY {alert.acknowledged_by || 'OPERATOR'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
