import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../../services/auditApi';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs();
      setLogs(res.logs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Audit Trail</h2>
        <p className="text-sm text-slate-400">Latest authentication, business, and role-related event history.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">Recent events</div>
        <div className="divide-y divide-slate-800 text-sm text-slate-300">
          {loading ? <div className="px-4 py-4 text-slate-400">Loading...</div> : logs.map((log: any) => (
            <div key={log._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-2">
              <div>
                <div className="font-semibold text-white">{log.action}</div>
                <div className="text-xs text-slate-400">{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'} · {new Date(log.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-xs ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : log.status === 'FAILURE' ? 'bg-rose-500/10 text-rose-400' : 'bg-cyan-500/10 text-cyan-400'}`}>{log.status}</span>
                <span className="text-xs text-slate-400">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
