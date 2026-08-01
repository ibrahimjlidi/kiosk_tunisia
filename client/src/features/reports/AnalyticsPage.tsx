import React, { useEffect, useMemo, useState } from 'react';
import { fetchStations } from '../../services/stationApi';
import { fetchAnalyticsSummary } from '../../services/reportApi';
import { Station } from '../../types/station';
import { BarChart3, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [stationId, setStationId] = useState('');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stationRes = await fetchStations();
        setStations(stationRes.stations);
        if (stationRes.stations[0]) setStationId(stationRes.stations[0]._id);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAnalyticsSummary({ station: stationId || undefined, date });
      setSummaryData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (stationId) load(); }, [stationId, date]);

  const summary = useMemo(() => ({
    totalTTC: summaryData?.sales?.totalTTC ?? 0,
    totalProfit: summaryData?.sales?.totalProfit ?? 0,
    totalOrders: summaryData?.sales?.totalOrders ?? 0,
    productMix: summaryData?.productMix ?? [],
  }), [summaryData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
            Analytics Dashboard
          </h2>
          <p className="text-xs text-slate-400">Daily totals, product mix, and station performance snapshots from the live reporting backend.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100" />
          <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100">
            <option value="">All stations</option>
            {stations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}
          </select>
          <button onClick={load} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">{loading ? 'Loading…' : 'Refresh'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Total TTC</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-400">{summary.totalTTC.toFixed(3)} TND</div>
        </div>
        <div className="glass-panel p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Profit</div>
          <div className="mt-2 text-2xl font-semibold text-cyan-400">{summary.totalProfit.toFixed(3)} TND</div>
        </div>
        <div className="glass-panel p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Transactions</div>
          <div className="mt-2 text-2xl font-semibold text-amber-400">{summary.totalOrders}</div>
        </div>
      </div>

      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Product mix
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {summary.productMix.length > 0 ? summary.productMix.map((item: any) => (
            <div key={item._id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>{item.productName}</span>
                <span className="text-cyan-400 font-semibold">{item.totalQuantity.toFixed(3)}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">TTC {item.totalTTC.toFixed(3)} TND · Profit {item.totalProfit.toFixed(3)} TND</div>
            </div>
          )) : (
            <div className="md:col-span-2 rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
              No sales found for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
