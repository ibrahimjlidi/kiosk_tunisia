import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCustomerTransactions, addCustomerTransaction, fetchCustomer } from '../../services/customerApi';
import { Customer, CreditTransaction } from '../../types/customer';
import { ArrowLeft, Plus } from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [txs, setTxs] = useState<CreditTransaction[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'SALE'|'PAYMENT'|'ADJUSTMENT'>('PAYMENT');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const cRes = await fetchCustomer(id);
        setCustomer(cRes.customer);
        const txRes = await fetchCustomerTransactions(id);
        setTxs(txRes.transactions || []);
      } catch (err) { console.error(err); }
    })();
  }, [id]);

  const handleAdd = async () => {
    if (!id) return;
    try {
      const amt = type === 'PAYMENT' ? -Math.abs(amount) : Math.abs(amount);
      await addCustomerTransaction(id, { type, amount: amt, notes });
      const txRes = await fetchCustomerTransactions(id);
      setTxs(txRes.transactions || []);
      const cRes = await fetchCustomers();
      const c = cRes.customers.find((x:any) => x._id === id);
      setCustomer(c || null);
      setAmount(0); setNotes('');
    } catch (err:any) { alert(err?.response?.data?.message || 'Failed'); }
  };

  if (!customer) return (
    <div className="space-y-4 text-slate-400 text-sm">
      <div>Customer not found.</div>
      <Link to="/customers" className="text-cyan-400 hover:text-cyan-200">Back to customer list</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{customer.name}</h2>
          <div className="text-xs text-slate-400">Balance: {customer.creditBalance.toFixed(3)} TND</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <h3 className="font-semibold text-slate-200 mb-2">Add Transaction</h3>
          <div className="space-y-2 text-sm">
            <div>
              <label className="text-xs text-slate-400">Type</label>
              <select value={type} onChange={(e)=>setType(e.target.value as any)} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100">
                <option value="SALE">Sale (charge)</option>
                <option value="PAYMENT">Payment (settlement)</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Amount</label>
              <input type="number" step="0.001" value={amount} onChange={(e)=>setAmount(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Notes</label>
              <input value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100" />
            </div>
            <div className="flex justify-end">
              <button onClick={handleAdd} className="px-4 py-2 bg-cyan-600 text-white rounded">Add</button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4">
          <h3 className="font-semibold text-slate-200 mb-2">Transactions</h3>
          <div className="text-sm text-slate-300 space-y-2">
            {txs.map(tx => (
              <div key={tx._id} className="flex justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="font-semibold">{tx.type}</div>
                  <div className="text-xs text-slate-500">{tx.notes}</div>
                </div>
                <div className="text-right font-mono">{tx.amount.toFixed(3)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
