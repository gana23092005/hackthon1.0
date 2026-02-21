// src/CriteriaEngine.jsx
import React, { useState } from 'react';
import { Filter, Send, Users, AlertCircle } from 'lucide-react';

const BRANCHES = ['All', 'CSE', 'MCA', 'IT'];

const CriteriaEngine = ({ onFilterChange, students = [] }) => {
  const [driveName, setDriveName]       = useState('');
  const [minCgpa, setMinCgpa]           = useState(6.0);
  const [maxBacklogs, setMaxBacklogs]   = useState(0);
  const [branch, setBranch]             = useState('All');
  const [notified, setNotified]         = useState(false);

  const eligible = students.filter(s =>
    s.cgpa >= minCgpa &&
    s.backlogs <= maxBacklogs &&
    (branch === 'All' || s.branch === branch)
  );

  const update = (newCgpa, newBacklogs, newBranch) => {
    setNotified(false);
    onFilterChange({ minCgpa: newCgpa, maxBacklogs: newBacklogs, branch: newBranch });
  };

  const handleNotify = () => {
    if (!driveName.trim()) { alert('Please enter a Drive Name first.'); return; }
    setNotified(true);
    setTimeout(() => setNotified(false), 4000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Filter size={20} className="text-blue-600" /> Criteria Engine
        </h2>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full">
          <Users size={16} />
          <span className="font-black text-lg">{eligible.length}</span>
          <span className="text-sm font-semibold">Students Eligible</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">Drive Name</label>
        <input
          type="text"
          placeholder="e.g. TCS Digital, Google SDE-1 ..."
          value={driveName}
          onChange={e => setDriveName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-600">Min CGPA</label>
            <span className="text-xl font-black text-blue-600">{minCgpa.toFixed(1)}</span>
          </div>
          <input
            type="range" min="0" max="10" step="0.1"
            value={minCgpa}
            onChange={e => { const v = parseFloat(e.target.value); setMinCgpa(v); update(v, maxBacklogs, branch); }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span>0.0</span><span>5.0</span><span>10.0</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-600">Max Backlogs Allowed</label>
          <div className="flex gap-2">
            {[0, 1, 2].map(n => (
              <button
                key={n}
                onClick={() => { setMaxBacklogs(n); update(minCgpa, n, branch); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                  maxBacklogs === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-600">Branch</label>
          <select
            value={branch}
            onChange={e => { setBranch(e.target.value); update(minCgpa, maxBacklogs, e.target.value); }}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
          >
            {BRANCHES.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {notified ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg font-semibold text-sm">
          <AlertCircle size={18} />
          ✅ Notification sent to {eligible.length} eligible students for <b>{driveName}</b>!
        </div>
      ) : (
        <button
          onClick={handleNotify}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <Send size={18} /> Notify All {eligible.length} Eligible Students
        </button>
      )}
    </div>
  );
};

export default CriteriaEngine;
