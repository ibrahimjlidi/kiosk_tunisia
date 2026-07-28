import React, { useEffect, useState } from 'react';
import { fetchPumps } from '../../services/stationApi';
import { Pump } from '../../types/station';
import { Gauge, RefreshCw, AlertCircle, Fuel, ChevronRight } from 'lucide-react';

export const PumpsPage: React.FC = () => {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPumps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPumps();
      setPumps(res.pumps);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load pumps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPumps(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-cyan-400" />
            Pumps & Pistols Hierarchy
          </h2>
          <p className="text-xs text-slate-400">
            Station → Pump → Pistol → Fuel Product (with current closing indexes)
          </p>
        </div>
        <button
          onClick={loadPumps}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-slate-400 text-sm flex justify-center items-center">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
          Loading pumps and pistols...
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-center text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          {pumps.map((pump) => (
            <div key={pump._id} className="glass-panel overflow-hidden">
              {/* Pump Header */}
              <div className="px-5 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
                    <Fuel className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{pump.pumpNumber}</div>
                    <div className="text-[11px] text-slate-400">
                      {pump.pistols.length} pistol{pump.pistols.length !== 1 ? 's' : ''} registered
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  pump.active
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {pump.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              {/* Pistols List */}
              <div className="divide-y divide-slate-800/50">
                {pump.pistols.map((pistol) => {
                  const product = pistol.product as any;
                  return (
                    <div key={pistol._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                          P{pistol.pistolNumber}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-200">
                            {product?.name || 'Unknown Product'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Code: <span className="font-mono text-cyan-500">{product?.code || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Closing Index</div>
                        <div className="font-mono font-bold text-amber-400 text-sm">
                          {pistol.currentClosingIndex.toLocaleString('fr-TN', { minimumFractionDigits: 1 })} L
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
