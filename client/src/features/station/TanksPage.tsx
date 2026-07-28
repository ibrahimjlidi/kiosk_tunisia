import React, { useEffect, useState } from 'react';
import { fetchTanks } from '../../services/stationApi';
import { Tank } from '../../types/station';
import { Database, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';

export const TanksPage: React.FC = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTanks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTanks();
      setTanks(res.tanks);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load tanks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTanks(); }, []);

  const getFillPercent = (tank: Tank) => {
    if (!tank.capacity || tank.capacity === 0) return 0;
    return Math.min(100, Math.max(0, (tank.currentStock / tank.capacity) * 100));
  };

  const isLowStock = (tank: Tank) => tank.currentStock <= tank.minLevelAlert;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-cyan-400" />
            Fuel Tank Inventory & Stock Levels
          </h2>
          <p className="text-xs text-slate-400">
            Current physical stock, capacity, and minimum threshold alerts per fuel tank
          </p>
        </div>
        <button
          onClick={loadTanks}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-slate-400 text-sm flex justify-center items-center">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
          Loading tank inventory...
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-center text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tanks.map((tank) => {
            const fillPct = getFillPercent(tank);
            const low = isLowStock(tank);
            const product = tank.product as any;

            const fillColor = low
              ? 'from-red-600 to-rose-700'
              : fillPct < 40
              ? 'from-amber-500 to-orange-600'
              : 'from-emerald-500 to-teal-600';

            return (
              <div key={tank._id} className={`glass-panel overflow-hidden ${low ? 'ring-1 ring-red-500/40' : ''}`}>
                {/* Tank Header */}
                <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{tank.tankNumber}</div>
                    <div className="text-[11px] text-cyan-400 font-semibold mt-0.5">
                      {product?.name || 'Unknown Product'}
                    </div>
                  </div>
                  {low && (
                    <div className="flex items-center space-x-1 text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>LOW STOCK</span>
                    </div>
                  )}
                </div>

                {/* Visual Fuel Gauge Bar */}
                <div className="px-5 py-2 space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Current Stock</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {fillPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full bg-gradient-to-r ${fillColor} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="px-5 pb-5 grid grid-cols-3 gap-3 mt-2">
                  <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-0.5">Current</div>
                    <div className="font-mono font-bold text-emerald-400 text-xs">
                      {tank.currentStock.toLocaleString('fr-TN')} L
                    </div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-0.5">Capacity</div>
                    <div className="font-mono font-bold text-slate-300 text-xs">
                      {tank.capacity.toLocaleString('fr-TN')} L
                    </div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-0.5">Min Alert</div>
                    <div className={`font-mono font-bold text-xs ${low ? 'text-red-400' : 'text-amber-400'}`}>
                      {tank.minLevelAlert.toLocaleString('fr-TN')} L
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
