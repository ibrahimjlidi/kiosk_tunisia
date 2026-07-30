import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../../services/stationApi';
import { fetchPurchases, createPurchase } from '../../services/purchaseApi';
import { Product } from '../../types/station';
import { ProductPurchase } from '../../types/purchase';
import { BoxSeam, ShoppingCart, Plus, RefreshCw, AlertCircle } from 'lucide-react';

export const PurchasesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<ProductPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, purchasesRes] = await Promise.all([fetchProducts(), fetchPurchases()]);
      setProducts(productsRes.products);
      setPurchases(purchasesRes.purchases);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setSelectedProduct(products[0]?._id || '');
    setSupplier('');
    setQuantity(0);
    setUnitCost(0);
    setNotes('');
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setModalError('Select a product first');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      await createPurchase({ product: selectedProduct, supplier, quantity, unitCost, notes });
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Unable to save purchase');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" /> Purchase & Stock Intake
          </h2>
          <p className="text-xs text-slate-400">Record product replenishments and update current stock levels.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg text-white text-xs font-semibold hover:bg-cyan-500 transition">
          <Plus className="w-4 h-4" /> New Purchase
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex justify-center items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" /> Loading purchases...
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
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit Cost</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{new Date(purchase.createdAt || '').toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{purchase.product.name}</td>
                    <td className="px-4 py-3 text-slate-300">{purchase.supplier || '—'}</td>
                    <td className="px-4 py-3 font-mono text-cyan-300">{purchase.quantity}</td>
                    <td className="px-4 py-3 font-mono text-emerald-300">{purchase.unitCost.toFixed(3)}</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{purchase.totalCost.toFixed(3)}</td>
                    <td className="px-4 py-3 text-slate-400">{purchase.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Record Purchase</h3>
                <p className="text-xs text-slate-400">Add stock and update product current quantity.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-100">Close</button>
            </div>

            {modalError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">{modalError}</div>}

            <form onSubmit={handleSubmit} className="grid gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                >
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} — {product.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Supplier name"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Unit Cost</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Total Cost</label>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 font-mono">
                    {(quantity * unitCost).toFixed(3)} TND
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[88px] bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 rounded text-slate-300 hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-600 rounded text-white hover:bg-cyan-500 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Record Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
