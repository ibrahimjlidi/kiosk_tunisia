import React, { useState, useEffect } from 'react';
import { fetchPurchaseOrders, createPurchaseOrder, deliverPurchaseOrder, cancelPurchaseOrder, fetchSuppliers, fetchProducts, fetchTanks, fetchStations } from '../../services/stationApi';
import { PurchaseOrder, Supplier, Product, Tank, Station } from '../../types/station';
import { ClipboardList, Plus, Search, X, ChevronLeft, ChevronRight, RefreshCw, Truck, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PurchaseOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [form, setForm] = useState({
    supplier: '', station: '', orderNumber: '', orderDate: new Date().toISOString().split('T')[0],
    items: [{ product: '', quantity: 0, unitPrice: 0, tank: '' }],
    notes: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, suppliersRes, productsRes, tanksRes, stationsRes] = await Promise.all([
        fetchPurchaseOrders(),
        fetchSuppliers(),
        fetchProducts(),
        fetchTanks(),
        fetchStations()
      ]);
      setOrders(ordersRes.orders || []);
      setSuppliers(suppliersRes.suppliers || []);
      setProducts(productsRes.products || []);
      setTanks(tanksRes.tanks || []);
      setStations(stationsRes.stations || []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    (typeof o.supplier === 'object' && o.supplier?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setModalError(null);
    setForm({
      supplier: '', station: '', orderNumber: `PO-${Date.now()}`,
      orderDate: new Date().toISOString().split('T')[0],
      items: [{ product: '', quantity: 0, unitPrice: 0, tank: '' }],
      notes: ''
    });
    setShowModal(true);
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product: '', quantity: 0, unitPrice: 0, tank: '' }] });
  };

  const removeItem = (idx: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const items = [...form.items];
    (items[idx] as any)[field] = value;
    if (field === 'product') {
      const prod = products.find(p => p._id === value);
      if (prod) items[idx].unitPrice = prod.purchasePrice;
    }
    setForm({ ...form, items });
  };

  const handleCreate = async () => {
    if (!form.supplier || !form.station || !form.orderNumber.trim()) {
      setModalError('Supplier, station, and order number are required.');
      return;
    }

    const invalidItem = form.items.find((item) => !item.product || !item.tank || item.quantity <= 0 || item.unitPrice < 0);
    if (invalidItem) {
      setModalError('Each order line needs a product, tank, positive quantity, and a valid unit price.');
      return;
    }

    setModalError(null);
    setSaving(true);
    try {
      await createPurchaseOrder(form);
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeliver = async (id: string) => {
    if (!window.confirm('Mark this order as delivered? Tank stock will be updated.')) return;
    try {
      await deliverPurchaseOrder(id);
      loadData();
    } catch (err) {
      console.error('Deliver failed', err);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelPurchaseOrder(id);
      loadData();
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return `px-2 py-0.5 rounded text-[10px] font-bold border ${colors[status] || 'bg-slate-800 text-slate-300'}`;
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <ClipboardList className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Purchase Orders</h2>
            <p className="text-xs text-slate-400">Fuel procurement & delivery management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders..." className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-48" />
          </div>
          {canManage && (
            <button onClick={openCreate} className="btn-primary text-xs px-3 py-1.5">
              <Plus className="w-3.5 h-3.5 mr-1 inline" /> New Order
            </button>
          )}
          <button onClick={loadData} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading purchase orders...</div>
      ) : paged.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">No purchase orders found</div>
      ) : (
        <div className="grid gap-3">
          {paged.map(o => (
            <div key={o._id} className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-slate-800 rounded-lg">
                    <ClipboardList className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{o.orderNumber}</div>
                    <div className="text-[10px] text-slate-400">
                      {typeof o.supplier === 'object' ? o.supplier?.name : 'N/A'} • {new Date(o.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={statusBadge(o.status)}>{o.status}</span>
                  {canManage && o.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleDeliver(o._id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Deliver">
                        <Truck className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleCancel(o._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Cancel">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {o.items?.length || 0} item(s) • Total: <span className="text-amber-400 font-semibold">{o.totalAmount?.toFixed(3) || '0.000'} TND</span>
                {o.deliveredBy && <span> • Delivered by: {o.deliveredBy}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 text-xs">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-400">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">New Purchase Order</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300 text-xs">
                {modalError}
              </div>
            )}

            <div className="rounded border border-slate-800 bg-slate-900/70 p-3 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>Supplier</span>
                <span className="font-mono text-cyan-400">{suppliers.find((item) => item._id === form.supplier)?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Station</span>
                <span className="font-mono text-slate-200">{stations.find((item) => item._id === form.station)?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Items</span>
                <span className="font-mono text-amber-400">{form.items.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Supplier *</label>
                <select value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50">
                  <option value="">Select supplier</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Order Number *</label>
                <input value={form.orderNumber} onChange={e => setForm({ ...form, orderNumber: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Station *</label>
                <select value={form.station} onChange={e => setForm({ ...form, station: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50">
                  <option value="">Select station</option>
                  {stations.map((station) => (
                    <option key={station._id} value={station._id}>{station.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Order Date</label>
                <input type="date" value={form.orderDate} onChange={e => setForm({ ...form, orderDate: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Items</label>
                <button onClick={addItem} className="text-[10px] text-cyan-400 hover:text-cyan-300">+ Add Item</button>
              </div>
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 mb-2 p-2 bg-slate-800/50 rounded-lg">
                  <div className="col-span-2">
                    <select value={item.product} onChange={e => updateItem(idx, 'product', e.target.value)} className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500/50">
                      <option value="">Product</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <div>
                    <input type="number" step="0.001" placeholder="Price" value={item.unitPrice || ''} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <select value={item.tank} onChange={e => updateItem(idx, 'tank', e.target.value)} className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500/50">
                      <option value="">Tank</option>
                      {tanks.map(t => <option key={t._id} value={t._id}>{t.tankNumber}</option>)}
                    </select>
                    {form.items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg">Cancel</button>
              <button disabled={saving} onClick={handleCreate} className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
