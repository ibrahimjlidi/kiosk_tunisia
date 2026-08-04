import React, { useState, useEffect } from 'react';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/stationApi';
import { Supplier } from '../../types/station';
import { Truck, Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SuppliersPage: React.FC = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [page, setPage] = useState(1);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pageSize = 8;

  const [form, setForm] = useState({
    name: '', code: '', contactPerson: '', phone: '', email: '', address: '', taxId: ''
  });

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetchSuppliers();
      setSuppliers(res.suppliers || []);
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setModalError(null);
    setForm({ name: '', code: '', contactPerson: '', phone: '', email: '', address: '', taxId: '' });
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setModalError(null);
    setForm({
      name: s.name, code: s.code, contactPerson: s.contactPerson || '',
      phone: s.phone || '', email: s.email || '', address: s.address || '', taxId: s.taxId || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setModalError('Supplier name and code are required.');
      return;
    }

    if (form.phone && !/^\+?[0-9\s-]{8,}$/.test(form.phone.trim())) {
      setModalError('Phone number format is invalid.');
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setModalError('Email format is invalid.');
      return;
    }

    setModalError(null);
    setSaving(true);
    try {
      if (editing) {
        await updateSupplier(editing._id, form);
      } else {
        await createSupplier(form);
      }
      setShowModal(false);
      loadSuppliers();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      loadSuppliers();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Truck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Suppliers</h2>
            <p className="text-xs text-slate-400">Manage fuel & kiosk suppliers</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search suppliers..."
              className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-48"
            />
          </div>
          {canManage && (
            <button onClick={openCreate} className="btn-primary text-xs px-3 py-1.5">
              <Plus className="w-3.5 h-3.5 mr-1 inline" /> Add Supplier
            </button>
          )}
          <button onClick={loadSuppliers} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading suppliers...</div>
      ) : paged.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">No suppliers found</div>
      ) : (
        <div className="grid gap-3">
          {paged.map(s => (
            <div key={s._id} className="glass-panel p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Truck className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">{s.name}</div>
                  <div className="text-[10px] text-slate-400 space-x-2">
                    <span className="font-mono text-amber-400">{s.code}</span>
                    {s.contactPerson && <span>• {s.contactPerson}</span>}
                    {s.phone && <span>• {s.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${s.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {s.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
                {canManage && (
                  <div className="flex items-center space-x-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{editing ? 'Edit Supplier' : 'New Supplier'}</h3>
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
                <span>Name</span>
                <span className="font-mono text-cyan-400">{form.name.trim() || '—'}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Code</span>
                <span className="font-mono text-slate-200">{form.code.trim() || '—'}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Contact</span>
                <span className="font-mono text-amber-400">{form.contactPerson.trim() || '—'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Code *</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Contact Person</label>
                <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Tax ID</label>
                <input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg">Cancel</button>
              <button disabled={saving} onClick={handleSave} className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
