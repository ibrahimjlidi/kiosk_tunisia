import React, { useEffect, useState } from 'react';
import { fetchSales } from '../../services/reportApi';
import { Sale } from '../../types/sale';

export const SalesReportPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchSales(date ? { date } : undefined);
      setSales(res.sales);
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
          <h2 className="text-xl font-bold">Sales Report</h2>
          <p className="text-sm text-slate-400">View and filter recorded sales by date.</p>
        </div>
        <div className="flex items-center space-x-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100" />
          <button onClick={load} className="px-3 py-2 bg-cyan-600 text-white rounded">Filter</button>
        </div>
      </div>

      <div className="glass-panel p-4 overflow-x-auto">
        {loading ? <div>Loading...</div> : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">TTC</th>
                <th className="px-3 py-2">Profit</th>
                <th className="px-3 py-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id} className="border-b border-slate-800 hover:bg-slate-900/50">
                  <td className="px-3 py-2 text-xs text-slate-400">{new Date(sale.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{sale.productName}</td>
                  <td className="px-3 py-2">{sale.quantity.toFixed(3)}</td>
                  <td className="px-3 py-2">{sale.amountTTC.toFixed(3)}</td>
                  <td className="px-3 py-2">{sale.profit.toFixed(3)}</td>
                  <td className="px-3 py-2 text-slate-400">{sale.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
