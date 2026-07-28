import React, { useEffect, useState } from 'react';
import { checkHealth, HealthResponse } from '../services/api';
import { Activity, Database, Server, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const HealthCheck: React.FC = () => {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkHealth();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="glass-panel p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">System Connection Status</h2>
            <p className="text-xs text-slate-400">Phase 1: Local Stack Architecture Validation</p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
          Checking local backend and MongoDB status...
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3 text-red-400 text-sm">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Backend Connection Failed</div>
            <div className="text-xs mt-1 text-red-300">{error}</div>
            <div className="text-xs mt-2 text-slate-400">
              Ensure Express backend is running on <code className="text-cyan-300">http://localhost:5000</code>
            </div>
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Backend Express Server</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200">{data.system.appName}</span>
              <span className="flex items-center text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Active
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              URL: http://localhost:5000/api/v1
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
              <Database className="w-4 h-4 text-amber-400" />
              <span>MongoDB Community Server</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200">{data.system.database.name}</span>
              <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded border ${
                data.system.database.connected 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              }`}>
                {data.system.database.connected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    {data.system.database.status}
                  </>
                )}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Host: {data.system.database.host} (127.0.0.1:27017)
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
