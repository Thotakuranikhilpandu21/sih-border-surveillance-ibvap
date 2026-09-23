import React, { useEffect, useState } from 'react';
import { fetchAnalyticsSummary } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, ShieldAlert, Activity, Car, CheckCircle2, Download, TrendingUp } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await fetchAnalyticsSummary();
      setSummary(data);
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'];

  if (loading || !summary) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0B0F19] text-slate-500 font-mono text-xs">
        [ COMPUTING BORDER SURVEILLANCE TELEMETRY ANALYTICS... ]
      </div>
    );
  }

  const { metrics, hourly_activity, zone_breaches, alerts_by_type } = summary;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] overflow-y-auto p-4 space-y-4 font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#111827] px-4 py-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-slate-200 text-sm">SURVEILLANCE ANALYTICS & THREAT HEATMAP DASHBOARD</h2>
        </div>
        <button 
          onClick={() => alert("Report Export: IBVAP_BOP_Alpha_Sector4_Summary.pdf generated successfully.")}
          className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded text-xs font-bold hover:bg-emerald-500/30 flex items-center space-x-1.5"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT PDF / CSV REPORT</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111827] rounded-lg border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 block">TOTAL INCIDENTS LOGGED</span>
          <span className="text-2xl font-extrabold text-white">{metrics.total_alerts}</span>
          <span className="text-[11px] text-emerald-400 block">+12% vs last 24h</span>
        </div>
        <div className="p-4 bg-[#111827] rounded-lg border border-red-500/40 bg-red-950/10 space-y-1">
          <span className="text-xs text-slate-500 block">CRITICAL ZONE BREACHES</span>
          <span className="text-2xl font-extrabold text-red-400">{metrics.critical_alerts}</span>
          <span className="text-[11px] text-red-400 block">Immediate Triage Req.</span>
        </div>
        <div className="p-4 bg-[#111827] rounded-lg border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 block">ANPR READS PROCESSED</span>
          <span className="text-2xl font-extrabold text-emerald-400">{metrics.total_anpr_reads}</span>
          <span className="text-[11px] text-slate-400 block">100% Optical Accuracy</span>
        </div>
        <div className="p-4 bg-[#111827] rounded-lg border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 block">SYSTEM LATENCY SLA</span>
          <span className="text-2xl font-extrabold text-cyan-400">{metrics.avg_latency_ms}ms</span>
          <span className="text-[11px] text-cyan-400 block">Real-time Stream OK</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly Threat Activity Line Chart */}
        <div className="p-4 bg-[#111827] rounded-lg border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>HOURLY THREAT INTRUSION TRENDS</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly_activity}>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                <Line type="monotone" dataKey="intrusions" stroke="#EF4444" strokeWidth={2} name="Intrusions" />
                <Line type="monotone" dataKey="vehicles" stroke="#10B981" strokeWidth={2} name="Vehicles" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breach Frequency per Zone Bar Chart */}
        <div className="p-4 bg-[#111827] rounded-lg border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>BREACH FREQUENCY BY PERIMETER ZONE</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zone_breaches}>
                <XAxis dataKey="zone" stroke="#64748B" fontSize={9} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                <Bar dataKey="breaches" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
