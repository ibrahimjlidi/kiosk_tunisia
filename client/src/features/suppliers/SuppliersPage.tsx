import React, { useEffect, useState } from 'react';
import { fetchSuppliers, createSupplier, updateSupplier } from '../../services/supplierApi';
import { Supplier } from '../../types/supplier';
import { Package, Plus, RefreshCw, AlertCircle, CheckCircle2, Filter } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSuppliers();
      setSuppliers(response.suppliers);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openModal = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Supplier name is required.');
      return;
    }
    if (phone && !/^\+?[0-9\s-]{8,}$/.test(phone.trim())) {
      setModalError('Phone number format is invalid.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setModalError('Email format is invalid.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      await createSupplier({ name: name.trim(), phone: phone.trim(), email: email.trim(), address: address.trim() });
      setShowModal(false);
      await loadSuppliers();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Unable to create supplier');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (supplier: Supplier) => {
    try {
      await updateSupplier(supplier._id, { active: !supplier.active });
      await loadSuppliers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update supplier');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" /> Supplier Directory
          </h2>
          <p className="text-xs text-slate-400">Manage fuel and kiosk suppliers for purchasing and expense workflows.</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg text-white text-xs font-semibold hover:bg-cyan-500 transition">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex justify-center items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" /> Loading suppliers...
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
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {suppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-100">{supplier.name}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {supplier.phone || '—'}
                      <br />
                      {supplier.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{supplier.address || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${supplier.active ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                        {supplier.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleActive(supplier)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {supplier.active ? 'Deactivate' : 'Activate'}
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
          <div className="glass-panel p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">New Supplier</h3>
                <p className="text-xs text-slate-400">Add a supplier for purchases and expense tracking.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-100">Close</button>
            </div>

            {modalError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">{modalError}</div>}

            <div className="rounded border border-slate-800 bg-slate-900/70 p-3 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>Supplier</span>
                <span className="font-mono text-cyan-400">{name.trim() || '—'}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Contact</span>
                <span className="font-mono text-slate-200">{phone.trim() || '—'}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Email</span>
                <span className="font-mono text-slate-200">{email.trim() || '—'}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 text-xs">
              <div>
                <label htmlFor="supplier-name" className="block text-slate-300 mb-1">Supplier Name</label>
                <input
                  id="supplier-name"
                  name="supplier-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  placeholder="Supplier name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="supplier-phone" className="block text-slate-300 mb-1">Phone</label>
                  <input
                    id="supplier-phone"
                    name="supplier-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                    placeholder="Phone"
                  />
                </div>
                <div>
                  <label htmlFor="supplier-email" className="block text-slate-300 mb-1">Email</label>
                  <input
                    id="supplier-email"
                    name="supplier-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                    placeholder="Email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="supplier-address" className="block text-slate-300 mb-1">Address</label>
                <textarea
                  id="supplier-address"
                  name="supplier-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[80px] bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  placeholder="Address"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 rounded text-slate-300 hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-600 rounded text-white hover:bg-cyan-500 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
