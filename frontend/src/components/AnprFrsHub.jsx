import React, { useState, useEffect } from 'react';
import { fetchAnprLogs, fetchWatchlist } from '../services/api';
import { Car, UserCheck, Search, ShieldAlert, FileText, CheckCircle2, UserX } from 'lucide-react';

export default function AnprFrsHub() {
  const [activeSubTab, setActiveSubTab] = useState('anpr'); // 'anpr' or 'watchlist'
  const [anprLogs, setAnprLogs] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [searchPlate, setSearchPlate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'anpr') {
        const data = await fetchAnprLogs({ plate: searchPlate });
        setAnprLogs(data);
      } else {
        const data = await fetchWatchlist();
        setWatchlist(data);
      }
    } catch (e) {
      console.error("Hub fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] overflow-hidden p-4 font-mono">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="mb-4 flex items-center justify-between bg-[#111827] px-4 py-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-3">
          {activeSubTab === 'anpr' ? <Car className="w-5 h-5 text-emerald-400" /> : <UserCheck className="w-5 h-5 text-cyan-400" />}
          <h2 className="font-bold text-slate-200 text-sm">ANPR & FACIAL RECOGNITION INTELLIGENCE HUB</h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('anpr')}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'anpr'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>ANPR VEHICLE LOGS</span>
          </button>
          <button
            onClick={() => setActiveSubTab('watchlist')}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'watchlist'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>FACE WATCHLIST & VECTOR DB</span>
          </button>
        </div>
      </div>

      {/* ANPR View */}
      {activeSubTab === 'anpr' ? (
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Search Filter */}
          <form onSubmit={handleSearch} className="flex items-center space-x-3 bg-[#111827] p-3 rounded-lg border border-slate-800 text-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by license plate string (e.g., PB-08)..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 flex-1"
            />
            <button type="submit" className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded font-bold hover:bg-emerald-500/30">
              QUERY ANPR DATABASE
            </button>
          </form>

          {/* ANPR Log Matrix */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
            {anprLogs.map((log) => (
              <div key={log.id} className={`p-4 bg-[#111827] rounded-lg border ${log.is_flagged ? 'border-red-500/60 bg-red-950/10' : 'border-slate-800'} space-y-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 block">LICENSE PLATE</span>
                    <span className="text-base font-extrabold text-white tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {log.license_plate_number}
                    </span>
                  </div>
                  {log.is_flagged ? (
                    <span className="px-2 py-0.5 bg-red-950 border border-red-500 text-red-400 text-[10px] font-bold rounded">
                      FLAGGED SUSPECT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[10px] font-bold rounded">
                      CLEAR
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>VEHICLE TYPE: <strong className="text-slate-200">{log.vehicle_type}</strong></div>
                  <div>OCR CONFIDENCE: <strong className="text-emerald-400">{Math.round(log.confidence * 100)}%</strong></div>
                  {log.flag_reason && <div className="text-red-400 text-[11px] italic">"{log.flag_reason}"</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Watchlist & Face Match Vector Database View */
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="bg-[#111827] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>VECTOR INDEX ENGINE: ArcFace 512-dim Embedding | Cosine Distance Match Threshold ≥ 0.75</span>
            <span className="text-cyan-400 font-bold">{watchlist.length} IDENTITIES INDEXED</span>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
            {watchlist.map((person) => (
              <div key={person.id} className="p-4 bg-[#111827] rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-lg">
                    {person.full_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{person.full_name}</h3>
                    <p className="text-xs text-slate-400">{person.alias_name || 'No Alias'}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">CATEGORY:</span>
                    <span className={`font-bold ${person.category === 'SUSPECT' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {person.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">VECTOR POINTER:</span>
                    <span className="text-slate-300 text-[11px] font-mono">{person.vector_id}</span>
                  </div>
                  {person.notes && (
                    <p className="text-slate-400 text-[11px] pt-1 italic">
                      "{person.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
