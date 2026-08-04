import React, { useEffect, useState } from 'react';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '../../services/teamApi';

export const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', station: '', leader: '', members: [] as string[] });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchTeams();
      setTeams(res.teams || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      const res = await createTeam(form);
      if (res.success) {
        setForm({ name: '', station: '', leader: '', members: [] });
        load();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Teams</h2>
        <p className="text-sm text-slate-400">Operational teams and staffing view across stations.</p>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <div className="grid md:grid-cols-4 gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Team name" className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
          <input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} placeholder="Station id" className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
          <input value={form.leader} onChange={(e) => setForm({ ...form, leader: e.target.value })} placeholder="Leader id" className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
          <button onClick={handleCreate} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">Add Team</button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">Team roster</div>
        <div className="divide-y divide-slate-800 text-sm text-slate-300">
          {loading ? <div className="px-4 py-4 text-slate-400">Loading...</div> : teams.map((team: any) => (
            <div key={team._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-2">
              <div>
                <div className="font-semibold text-white">{team.name}</div>
                <div className="text-xs text-slate-400">Leader: {team.leader?.firstName || '-'} {team.leader?.lastName || ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">{team.members?.length || 0} members</span>
                <button onClick={() => updateTeam(team._id, { active: !team.active })} className="px-2 py-1 rounded bg-slate-800 text-xs">Toggle</button>
                <button onClick={() => deleteTeam(team._id)} className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
