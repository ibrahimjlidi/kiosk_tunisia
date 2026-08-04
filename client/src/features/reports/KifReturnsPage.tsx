import React, { useEffect, useState } from 'react';
import { fetchStations, fetchProducts } from '../../services/stationApi';
import { Station, Product } from '../../types/station';
import { ClipboardCheck, Plus, Search, X } from 'lucide-react';
import { api } from '../../services/api';

export const KifReturnsPage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ stationId: '', productId: '', quantity: 0, reason: '', notes: '', date: new Date().toISOString().slice(0, 10) });
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [stationRes, productRes, kifRes] = await Promise.all([
        fetchStations(),
        fetchProducts(),
        api.get('/kif-returns')
      ]);
      setStations(stationRes.stations);
      setProducts(productRes.products);
      setRecords(kifRes.data.kifReturns || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      await api.post('/kif-returns', {
        stationId: form.stationId,
        productId: form.productId || undefined,
        quantity: Number(form.quantity),
        reason: form.reason,
        notes: form.notes,
        date: form.date,
      });
      setShowModal(false);
      setForm({ stationId: '', productId: '', quantity: 0, reason: '', notes: '', date: new Date().toISOString().slice(0, 10) });
      await load();
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = records.filter((r) => `${r.reason || ''} ${r.notes || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center"><ClipboardCheck className="w-5 h-5 mr-2 text-cyan-400" /> Kif Returns</h2>
          <p className="text-xs text-slate-400">Track fuel or product removals used for testing, verification, or measurement.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search note/reason" className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200" />
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5 mr-1 inline" /> Record</button>
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-slate-400 text-sm">Loading Kif returns...</div> : (
        <div className="glass-panel overflow-hidden">
          <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">Recorded returns</div>
          <div className="divide-y divide-slate-800 text-sm text-slate-300">
            {filtered.length > 0 ? filtered.map((item: any) => (
              <div key={item._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3">
                <div>
                  <div className="font-semibold text-white">{item.reason}</div>
                  <div className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString('fr-TN')} · {item.operator?.firstName || 'Operator'} {item.operator?.lastName || ''}</div>
                </div>
                <div className="text-sm text-cyan-400">{item.quantity} L</div>
              </div>
            )) : <div className="px-4 py-6 text-sm text-slate-400">No Kif returns recorded.</div>}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Record Kif Return</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Station *</label>
                <select value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200">
                  <option value="">Select station</option>
                  {stations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Product</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200">
                  <option value="">Select product (optional)</option>
                  {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Quantity (L)</label>
                  <input type="number" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Reason *</label>
                <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg">Cancel</button>
              <button onClick={submit} className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
