import React, { useEffect, useMemo, useState } from 'react';
import { fetchStations } from '../../services/stationApi';
import { fetchAnalyticsSummary } from '../../services/reportApi';
import { Station } from '../../types/station';
import { CalendarDays, CheckCircle2, DollarSign, Package, ReceiptText } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [stations, setStations] = useState<Station[]>([]);
  const [stationId, setStationId] = useState('');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [stationRes, analyticsRes] = await Promise.all([
        fetchStations(),
        fetchAnalyticsSummary({ date, station: stationId || undefined }),
      ]);
      setStations(stationRes.stations);
      setSummaryData(analyticsRes.data);
      if (!stationId && stationRes.stations[0]) setStationId(stationRes.stations[0]._id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = useMemo(() => ({
    sales: summaryData?.audit?.totalSalesTTC ?? 0,
    payments: summaryData?.audit?.totalPayments ?? 0,
    expensesTotal: summaryData?.audit?.totalExpenses ?? 0,
    purchasesTotal: summaryData?.audit?.totalPurchases ?? 0,
    openShifts: summaryData?.audit?.openShifts ?? 0,
  }), [summaryData]);

  const shifts = summaryData?.shifts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <CalendarDays className="w-5 h-5 mr-2 text-cyan-400" />
            Daily Close & Audit
          </h2>
          <p className="text-xs text-slate-400">Live close summary combining shifts, purchases, expenses, and station health from the backend analytics endpoint.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100" />
          <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100">
            <option value="">All stations</option>
            {stations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}
          </select>
          <button onClick={load} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">{loading ? 'Loading…' : 'Load'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Sales TTC', value: `${summary.sales.toFixed(3)} TND`, icon: <DollarSign className="w-4 h-4" />, tone: 'text-emerald-400' },
          { label: 'Payments', value: `${summary.payments.toFixed(3)} TND`, icon: <ReceiptText className="w-4 h-4" />, tone: 'text-cyan-400' },
          { label: 'Purchases', value: `${summary.purchasesTotal.toFixed(3)} TND`, icon: <Package className="w-4 h-4" />, tone: 'text-amber-400' },
          { label: 'Open shifts', value: `${summary.openShifts}`, icon: <CheckCircle2 className="w-4 h-4" />, tone: 'text-rose-400' },
        ].map((item) => (
          <div key={item.label} className="glass-panel p-4 space-y-2">
            <div className={`w-fit rounded-lg border border-slate-800 bg-slate-900/80 p-2 ${item.tone}`}>{item.icon}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</div>
            <div className={`text-lg font-semibold ${item.tone}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">Shift close checklist</div>
        <div className="divide-y divide-slate-800 text-sm text-slate-300">
          {shifts.length > 0 ? shifts.map((shift: any) => (
            <div key={shift._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3">
              <div>
                <div className="font-semibold text-white">{shift.shiftType} · {new Date(shift.shiftDate).toLocaleDateString('fr-TN')}</div>
                <div className="text-xs text-slate-400">Status {shift.status} · Sales {shift.totalSalesTTC.toFixed(3)} TND</div>
              </div>
              <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${shift.status === 'OPEN' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {shift.status === 'OPEN' ? 'Needs close' : 'Closed'}
              </div>
            </div>
          )) : (
            <div className="px-4 py-6 text-sm text-slate-400">No shifts found for the selected period.</div>
          )}
        </div>
      </div>
    </div>
  );
};
