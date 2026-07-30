import React, { useEffect, useState } from 'react';
import { fetchStations } from '../../services/stationApi';
import { fetchSuppliers } from '../../services/supplierApi';
import { fetchExpenses, createExpense, patchExpense } from '../../services/expenseApi';
import { Station } from '../../types/station';
import { Supplier } from '../../types/supplier';
import { Expense, ExpenseType } from '../../types/expense';
import { FileText, Plus, RefreshCw, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

const expenseTypes: ExpenseType[] = ['OPERATING', 'MAINTENANCE', 'UTILITY', 'OTHER'];

export const ExpensesPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [station, setStation] = useState('');
  const [supplier, setSupplier] = useState('');
  const [type, setType] = useState<ExpenseType>('OPERATING');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stationsRes, suppliersRes, expensesRes] = await Promise.all([
        fetchStations(),
        fetchSuppliers(),
        fetchExpenses(),
      ]);
      setStations(stationsRes.stations);
      setSuppliers(suppliersRes.suppliers);
      setExpenses(expensesRes.expenses);
      setStation(stationsRes.stations[0]?._id || '');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = () => {
    setStation(stations[0]?._id || '');
    setSupplier('');
    setType('OPERATING');
    setDescription('');
    setAmount(0);
    setPaid(false);
    setNotes('');
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setModalError('Expense description is required');
      return;
    }
    if (amount <= 0) {
      setModalError('Expense amount must be greater than zero');
      return;
    }

    setSaving(true);
    setModalError(null);

    try {
      await createExpense({ station, supplier, type, description, amount, paid, notes });
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Unable to save expense');
    } finally {
      setSaving(false);
    }
  };

  const togglePaid = async (expense: Expense) => {
    try {
      await patchExpense(expense._id, { paid: !expense.paid });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-400" /> Expense Ledger
          </h2>
          <p className="text-xs text-slate-400">Track vendor and station operating expenses for accurate cost accounting.</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg text-white text-xs font-semibold hover:bg-cyan-500 transition">
          <Plus className="w-4 h-4" /> New Expense
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex justify-center items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" /> Loading expenses...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" /> {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{new Date(expense.createdAt || '').toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-200">{expense.station?.name || 'General'}</td>
                    <td className="px-4 py-3 text-slate-300">{expense.supplier?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-200">{expense.type}</td>
                    <td className="px-4 py-3 text-slate-300">{expense.description}</td>
                    <td className="px-4 py-3 font-mono text-emerald-300">{expense.amount.toFixed(3)} TND</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${expense.paid ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                        {expense.paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => togglePaid(expense)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {expense.paid ? 'Mark Pending' : 'Mark Paid'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Record Expense</h3>
                <p className="text-xs text-slate-400">Capture operating expenses and track payables by supplier or station.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-100">Close</button>
            </div>

            {modalError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">{modalError}</div>}

            <form onSubmit={handleSubmit} className="grid gap-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Station</label>
                  <select
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    <option value="">General</option>
                    {stations.map((stationItem) => (
                      <option key={stationItem._id} value={stationItem._id}>
                        {stationItem.name} ({stationItem.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Supplier</label>
                  <select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    <option value="">None</option>
                    {suppliers.map((supplierItem) => (
                      <option key={supplierItem._id} value={supplierItem._id}>
                        {supplierItem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Expense Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ExpenseType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    {expenseTypes.map((expenseType) => (
                      <option key={expenseType} value={expenseType}>{expenseType}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                    placeholder="TND"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  placeholder="Expense description"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-slate-300 mb-1">
                  <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="form-checkbox rounded bg-slate-900 text-cyan-500" />
                  Mark as Paid
                </label>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[88px] bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 rounded text-slate-300 hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-600 rounded text-white hover:bg-cyan-500 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Create Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
