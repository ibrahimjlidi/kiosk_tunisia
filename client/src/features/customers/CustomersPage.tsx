import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCustomers, createCustomer, fetchCreditAging } from '../../services/customerApi';
import { Customer, AgingBucket } from '../../types/customer';
import { Plus, Users } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [aging, setAging] = useState<AgingBucket[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchCustomers();
      setCustomers(res.customers);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!name) return;
    try {
      await createCustomer({ name });
      setName('');
      load();
    } catch (err:any) { alert(err?.response?.data?.message || 'Failed'); }
  };

  const loadAging = async () => {
    try {
      const res = await fetchCreditAging();
      setAging(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center"><Users className="w-5 h-5 mr-2 text-cyan-400"/> Customers</h2>
        <div className="flex items-center space-x-2">
          <button onClick={loadAging} className="px-3 py-1 bg-slate-800 text-slate-200 rounded">Load Aging</button>
          <div className="flex items-center space-x-2">
            <input value={name} onChange={(e)=>setName(e.target.value)} className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-sm" placeholder="New customer name" />
            <button onClick={handleAdd} className="px-3 py-1 bg-cyan-600 text-white rounded flex items-center space-x-1"><Plus className="w-4 h-4"/><span>Add</span></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Customer List</h3>
          {loading ? <div>Loading...</div> : (
            <ul className="space-y-2 text-sm text-slate-300">
              {customers.map(c => (
                <li key={c._id} className="flex items-center justify-between">
                  <Link to={`/customers/${c._id}`} className="flex-1">
                    <div className="font-semibold text-cyan-300 hover:text-cyan-200">{c.name}</div>
                    <div className="text-xs text-slate-500">Balance: {c.creditBalance.toFixed(3)} TND</div>
                  </Link>
                  <div className="text-xs text-slate-400">{new Date(c.createdAt||'').toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Credit Aging</h3>
          {aging.length === 0 ? <div className="text-xs text-slate-500">No aging data loaded.</div> : (
            <div className="space-y-3 text-sm text-slate-300">
              {aging.map(a => (
                <div key={a.customer._id} className="border-b border-slate-800 pb-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{a.customer.name}</div>
                      <div className="text-xs text-slate-500">Last tx: {a.lastTxAt ? new Date(a.lastTxAt).toLocaleDateString() : '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-emerald-300">{a.totalBalance.toFixed(3)} TND</div>
                      <div className="text-xs text-slate-400">0-30: {a.bucket0_30.toFixed(3)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
