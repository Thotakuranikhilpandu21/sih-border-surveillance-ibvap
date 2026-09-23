import React, { useState, useEffect } from 'react';
import { searchAnprPlates, getWatchlist } from '../services/api';
import { WatchlistModal } from '../components/WatchlistModal';
import { Car, UserCheck, Search, UserPlus } from 'lucide-react';

export const IntelligenceHub: React.FC = () => {
  const [subTab, setSubTab] = useState<'anpr' | 'frs'>('anpr');
  const [anprLogs, setAnprLogs] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [plateQuery, setPlateQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [subTab]);

  const loadData = async () => {
    try {
      if (subTab === 'anpr') {
        const data = await searchAnprPlates(plateQuery);
        setAnprLogs(data);
      } else {
        const data = await getWatchlist();
        setWatchlist(data);
      }
    } catch (e) {
      console.error("Fetch intelligence error:", e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] p-4 font-mono overflow-hidden">
      <div className="mb-4 flex justify-between items-center bg-[#111827] px-4 py-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-3">
          {subTab === 'anpr' ? <Car className="w-5 h-5 text-emerald-400" /> : <UserCheck className="w-5 h-5 text-cyan-400" />}
          <h2 className="font-bold text-slate-200 text-sm">INTELLIGENCE HUB — ANPR & FRS ENGINE</h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubTab('anpr')}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition flex items-center space-x-1.5 ${subTab === 'anpr' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            <Car className="w-4 h-4" />
            <span>ANPR LOG BROWSER</span>
          </button>
          <button
            onClick={() => setSubTab('frs')}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition flex items-center space-x-1.5 ${subTab === 'frs' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
          >
            <UserCheck className="w-4 h-4" />
            <span>FRS VECTOR WATCHLIST</span>
          </button>
        </div>
      </div>

      {subTab === 'anpr' ? (
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <form onSubmit={handleSearch} className="flex space-x-3 bg-[#111827] p-3 rounded-lg border border-slate-800 text-xs">
            <Search className="w-4 h-4 text-slate-400 my-auto" />
            <input
              type="text"
              placeholder="Search by license plate string (e.g. PB-08)..."
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 flex-1"
            />
            <button type="submit" className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold rounded">
              SEARCH PLATES
            </button>
          </form>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {anprLogs.map((log) => (
              <div key={log.id} className={`p-4 bg-[#111827] rounded-lg border ${log.is_flagged ? 'border-red-500/60 bg-red-950/10' : 'border-slate-800'} space-y-2 text-xs`}>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-white text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{log.license_plate_number}</span>
                  {log.is_flagged ? <span className="text-red-400 text-[10px] font-bold">FLAGGED</span> : <span className="text-emerald-400 text-[10px] font-bold">CLEAR</span>}
                </div>
                <div className="text-slate-400">VEHICLE: <strong className="text-slate-200">{log.vehicle_type}</strong></div>
                <div className="text-slate-400">OCR CONFIDENCE: <strong className="text-emerald-400">{Math.round(log.confidence * 100)}%</strong></div>
                {log.flag_reason && <div className="text-red-400 text-[11px] italic">"{log.flag_reason}"</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="flex justify-between items-center bg-[#111827] p-3 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">FAISS / CHROMADB VECTOR STORAGE: ArcFace 512-dim Embeddings</span>
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-bold rounded flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>ENROLL NEW SUSPECT</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {watchlist.map((person) => (
              <div key={person.id} className="p-4 bg-[#111827] rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                    {person.full_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">{person.full_name}</h3>
                    <p className="text-slate-500">{person.alias_name || 'No Alias'}</p>
                  </div>
                </div>
                <div className="text-slate-400">CATEGORY: <strong className="text-cyan-400">{person.category}</strong></div>
                <div className="text-slate-400">VECTOR ID: <span className="font-mono text-[11px] text-slate-300">{person.vector_id}</span></div>
                {person.notes && <p className="text-slate-400 italic text-[11px]">"{person.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <WatchlistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onEnrolled={loadData} />
    </div>
  );
};
