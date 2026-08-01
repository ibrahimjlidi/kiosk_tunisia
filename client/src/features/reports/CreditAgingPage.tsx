import React, { useEffect, useState } from 'react';
import { fetchCreditAging } from '../../services/reportApi';
import { AgingBucket } from '../../types/customer';

export const CreditAgingPage: React.FC = () => {
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchCreditAging();
      setAging(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Credit Aging Report</h2>
          <p className="text-sm text-slate-400">Review outstanding credit balances by aging bucket.</p>
        </div>
        <button onClick={load} className="px-3 py-2 bg-cyan-600 text-white rounded">Refresh</button>
      </div>

      <div className="grid gap-4">
        {loading ? <div>Loading...</div> : aging.map((row) => (
          <div key={row.customer._id} className="glass-panel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">{row.customer.name}</div>
                <div className="text-xs text-slate-500">Balance: {row.totalBalance.toFixed(3)} TND</div>
              </div>
              <div className="text-xs text-slate-400">Last tx: {row.lastTxAt ? new Date(row.lastTxAt).toLocaleDateString() : '—'}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="bg-slate-950/80 p-3 rounded">0-30 days: {row.bucket0_30.toFixed(3)} TND</div>
              <div className="bg-slate-950/80 p-3 rounded">31-60 days: {row.bucket31_60.toFixed(3)} TND</div>
              <div className="bg-slate-950/80 p-3 rounded">61-90 days: {row.bucket61_90.toFixed(3)} TND</div>
              <div className="bg-slate-950/80 p-3 rounded">90+ days: {row.bucket90p.toFixed(3)} TND</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
