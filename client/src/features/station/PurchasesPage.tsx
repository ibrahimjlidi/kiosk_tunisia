import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchStations } from '../../services/stationApi';
import { fetchPurchases, createPurchase } from '../../services/purchaseApi';
import { fetchSuppliers } from '../../services/supplierApi';
import { Product, Station } from '../../types/station';
import { Supplier } from '../../types/supplier';
import { ProductPurchase } from '../../types/purchase';
import { ShoppingCart, Plus, RefreshCw, AlertCircle } from 'lucide-react';

export const PurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<ProductPurchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [notes, setNotes] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [purchaseRes, productRes, stationRes, supplierRes] = await Promise.all([
        fetchPurchases(),
        fetchProducts(),
        fetchStations(),
        fetchSuppliers(),
      ]);
      setPurchases(purchaseRes.purchases || []);
      setProducts(productRes.products || []);
      setStations(stationRes.stations || []);
      setSuppliers(supplierRes.suppliers || []);
      if (!selectedProduct && (productRes.products || []).length > 0) {
        setSelectedProduct(productRes.products[0]._id);
      }
      if (!selectedStation && (stationRes.stations || []).length > 0) {
        setSelectedStation(stationRes.stations[0]._id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSaving(true);

    try {
      await createPurchase({
        product: selectedProduct,
        station: selectedStation,
        supplier: supplier || undefined,
        quantity,
        unitCost,
        notes,
      });
      setShowModal(false);
      setQuantity(0);
      setUnitCost(0);
      setNotes('');
      await load();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSaving(false);
    }
  };

  const totalCost = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-cyan-400" />
            Purchase Register
          </h2>
          <p className="text-xs text-slate-400">Record incoming stock and review purchase history.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase</span>
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-slate-400 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
            Loading purchases...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            {error}
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-40" />
            No purchases recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Station</th>
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
                    <td className="px-4 py-3 text-slate-200">{purchase.station?.name || 'General'}</td>
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

      <div className="glass-panel p-4 text-sm text-slate-300 flex items-center justify-between">
        <span>Total recorded purchases</span>
        <span className="font-semibold text-cyan-400">{totalCost.toFixed(3)} TND</span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Record Purchase</h3>
                <p className="text-xs text-slate-400">Add stock and update product quantities.</p>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Station</label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    {stations.map((station) => (
                      <option key={station._id} value={station._id}>
                        {station.name}
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
                      <option key={supplierItem._id} value={supplierItem.name}>
                        {supplierItem.name}
                      </option>
                    ))}
                  </select>
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
