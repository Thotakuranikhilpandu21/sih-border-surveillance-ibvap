import React, { useState } from 'react';
import { enrollSuspectFace } from '../services/api';
import { UserPlus, CheckCircle2, X } from 'lucide-react';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrolled: () => void;
}

export const WatchlistModal: React.FC<WatchlistModalProps> = ({ isOpen, onClose, onEnrolled }) => {
  const [fullName, setFullName] = useState('');
  const [aliasName, setAliasName] = useState('');
  const [category, setCategory] = useState('SUSPECT');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;
    setLoading(true);
    try {
      await enrollSuspectFace({
        full_name: fullName,
        alias_name: aliasName,
        category,
        notes,
      });
      onEnrolled();
      onClose();
      setFullName('');
      setAliasName('');
      setNotes('');
    } catch (err) {
      console.error("Enrollment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center font-mono">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-lg p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <span>ENROLL FACE IDENTITY TO VECTOR DB</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 mb-1 block">Full Target Identity Name:</label>
            <input
              type="text"
              placeholder="e.g. Tariq Mahmood"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 mb-1 block">Alias / Code Handle:</label>
            <input
              type="text"
              placeholder="e.g. Shadow-4"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 mb-1 block">Threat Classification:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="SUSPECT">SUSPECT (Red Threat)</option>
              <option value="POW">POW / DETAINEE</option>
              <option value="PERSON_OF_INTEREST">PERSON OF INTEREST</option>
              <option value="AUTHORIZED">AUTHORIZED PERSONNEL</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 mb-1 block">Intelligence Notes:</label>
            <textarea
              placeholder="Enter suspect notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !fullName}
            className="w-full py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-bold rounded hover:bg-cyan-500/30 flex items-center justify-center space-x-2 pt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>COMPUTE 512-DIM VECTOR & ENROLL</span>
          </button>
        </form>
      </div>
    </div>
  );
};
