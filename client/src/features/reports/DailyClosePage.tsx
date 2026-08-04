import React, { useEffect, useMemo, useState } from 'react';
import { fetchStations } from '../../services/stationApi';
import { fetchDailyClosureSummary, finalizeDailyClosure, fetchDailyClosures } from '../../services/reportApi';
import { Station } from '../../types/station';
import { CalendarDays, CheckCircle2, DollarSign, ReceiptText, Package, ShieldCheck, Loader2 } from 'lucide-react';

export const DailyClosePage: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [stations, setStations] = useState<Station[]>([]);
  const [stationId, setStationId] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [stationRes, summaryRes, historyRes] = await Promise.all([
        fetchStations(),
        fetchDailyClosureSummary({ date, station: stationId || undefined }),
        fetchDailyClosures({ station: stationId || undefined }),
      ]);
      setStations(stationRes.stations);
      setSummary(summaryRes.summary);
      setHistory(historyRes.closures || []);
      if (!stationId && stationRes.stations[0]) setStationId(stationRes.stations[0]._id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards = useMemo(() => [
    { label: 'Sales TTC', value: `${(summary?.salesTTC || 0).toFixed(3)} TND`, icon: <DollarSign className="w-4 h-4" />, tone: 'text-emerald-400' },
    { label: 'Payments', value: `${(summary?.totalPayments || 0).toFixed(3)} TND`, icon: <ReceiptText className="w-4 h-4" />, tone: 'text-cyan-400' },
    { label: 'Expenses', value: `${(summary?.expenses || 0).toFixed(3)} TND`, icon: <Package className="w-4 h-4" />, tone: 'text-amber-400' },
    { label: 'Kif Returns', value: `${summary?.kifQuantity || 0} L`, icon: <ShieldCheck className="w-4 h-4" />, tone: 'text-violet-400' },
  ], [summary]);

  const handleClose = async () => {
    if (!stationId) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await finalizeDailyClosure({ stationId, date, notes: 'Closed from Daily Close UI' });
      setMessage(res.message || 'Daily closure finalized');
      await load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Failed to finalize daily closure');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <CalendarDays className="w-5 h-5 mr-2 text-cyan-400" />
            Daily Close & Station Situation
          </h2>
          <p className="text-xs text-slate-400">Close the day, review reconciliation, and record Kif returns for the selected station.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100" />
          <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100">
            <option value="">All stations</option>
            {stations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}
          </select>
          <button onClick={load} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">{loading ? 'Loading…' : 'Load'}</button>
          <button onClick={handleClose} disabled={saving || !stationId} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Closing</span> : 'Finalize Close'}
          </button>
        </div>
      </div>

      {message && <div className="rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((item) => (
          <div key={item.label} className="glass-panel p-4 space-y-2">
            <div className={`w-fit rounded-lg border border-slate-800 bg-slate-900/80 p-2 ${item.tone}`}>{item.icon}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</div>
            <div className={`text-lg font-semibold ${item.tone}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Reconciliation</h3>
          <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${summary?.isBalanced ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {summary?.isBalanced ? 'Balanced' : 'Variance detected'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
          <div>Variance: <span className="font-semibold text-white">{(summary?.variance || 0).toFixed(3)} TND</span></div>
          <div>Open shifts: <span className="font-semibold text-white">{summary?.openShiftCount || 0}</span></div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">Recent daily closures</div>
        <div className="divide-y divide-slate-800 text-sm text-slate-300">
          {history.length > 0 ? history.map((item: any) => (
            <div key={item._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3">
              <div>
                <div className="font-semibold text-white">{new Date(item.closureDate).toLocaleDateString('fr-TN')}</div>
                <div className="text-xs text-slate-400">Status {item.status} · Variance {item.variance?.toFixed(3)} TND</div>
              </div>
              <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isBalanced ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {item.isBalanced ? 'Balanced' : 'Needs attention'}
              </div>
            </div>
          )) : <div className="px-4 py-6 text-sm text-slate-400">No daily closures recorded yet.</div>}
        </div>
      </div>
    </div>
  );
};
