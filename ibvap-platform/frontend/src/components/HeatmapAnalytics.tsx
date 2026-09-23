import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ShieldAlert, TrendingUp, Car } from 'lucide-react';

export const HeatmapAnalytics: React.FC = () => {
  const bopData = [
    { bop: 'BOP Alpha (Fence)', breaches: 24, critical: 14 },
    { bop: 'Checkpost Gate 1', breaches: 18, critical: 8 },
    { bop: 'Patrol Sector 4', breaches: 15, critical: 9 },
    { bop: 'Ammunition Depot', breaches: 10, critical: 6 },
  ];

  const ratioData = [
    { time: '00:00', humans: 3, vehicles: 2, loitering: 1 },
    { time: '04:00', humans: 8, vehicles: 1, loitering: 4 },
    { time: '08:00', humans: 4, vehicles: 15, loitering: 2 },
    { time: '12:00', humans: 5, vehicles: 28, loitering: 3 },
    { time: '16:00', humans: 9, vehicles: 22, loitering: 5 },
    { time: '20:00', humans: 14, vehicles: 8, loitering: 7 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] p-4 space-y-4 font-mono overflow-y-auto">
      <div className="bg-[#111827] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>24-HOUR BORDER OUTPOST (BOP) BREACH & LOITERING HEATMAP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111827] p-4 rounded-lg border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>BREACH INCIDENTS PER BORDER OUTPOST</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bopData}>
                <XAxis dataKey="bop" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                <Bar dataKey="breaches" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111827] p-4 rounded-lg border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span>PEDESTRIAN VS VEHICLE INTRUSION RATIO</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratioData}>
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                <Line type="monotone" dataKey="humans" stroke="#EF4444" strokeWidth={2} name="Pedestrians" />
                <Line type="monotone" dataKey="vehicles" stroke="#10B981" strokeWidth={2} name="Vehicles" />
                <Line type="monotone" dataKey="loitering" stroke="#F59E0B" strokeWidth={2} name="Loitering (>30s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
