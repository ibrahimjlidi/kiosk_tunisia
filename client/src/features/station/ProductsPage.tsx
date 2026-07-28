import React, { useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct } from '../../services/stationApi';
import { Product, ProductCategory } from '../../types/station';
import { Fuel, Plus, Edit2, RefreshCw, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ProductCategory>('FUEL');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(19);
  const [minStockAlert, setMinStockAlert] = useState<number>(2000);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts();
      setProducts(res.products);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCode('');
    setCategory('FUEL');
    setPurchasePrice(1.850);
    setSellingPrice(2.200);
    setVatRate(19);
    setMinStockAlert(2000);
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCode(product.code);
    setCategory(product.category);
    setPurchasePrice(product.purchasePrice);
    setSellingPrice(product.sellingPrice);
    setVatRate(product.vatRate);
    setMinStockAlert(product.minStockAlert);
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, {
          name,
          code,
          category,
          purchasePrice,
          sellingPrice,
          vatRate,
          minStockAlert,
        });
      } else {
        await createProduct({
          name,
          code,
          category,
          purchasePrice,
          sellingPrice,
          vatRate,
          minStockAlert,
        });
      }
      setShowModal(false);
      loadProducts();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Fuel className="w-5 h-5 mr-2 text-cyan-400" />
            Fuel & Product Catalog
          </h2>
          <p className="text-xs text-slate-400">Manage fuel types, prices (HT, TVA 19%, TTC), and profit margin parameters (TND)</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product / Fuel Type</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm flex justify-center items-center">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
            Loading product catalog...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Purchase Price (HT/TND)</th>
                  <th className="px-4 py-3">Selling Price (TTC/TND)</th>
                  <th className="px-4 py-3">VAT Rate</th>
                  <th className="px-4 py-3">Margin / Liter</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => {
                  const margin = p.sellingPrice - p.purchasePrice;
                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">{p.name}</div>
                        <div className="text-[11px] text-cyan-400 font-mono">{p.code}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          p.category === 'FUEL'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : p.category === 'KIOSK'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {p.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-300">
                        {p.purchasePrice.toFixed(3)} TND
                      </td>

                      <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                        {p.sellingPrice.toFixed(3)} TND
                      </td>

                      <td className="px-4 py-3 text-slate-400 font-mono">
                        {p.vatRate}%
                      </td>

                      <td className="px-4 py-3 font-mono text-cyan-400 font-medium">
                        +{margin.toFixed(3)} TND
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
              {editingProduct ? 'Edit Product & Pricing' : 'Add New Fuel or Product'}
            </h3>

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diesel (Gasoil)"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. GASOIL"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    <option value="FUEL">FUEL (Carburant)</option>
                    <option value="KIOSK">KIOSK (Boutique)</option>
                    <option value="SERVICE">SERVICE (Lavage/Vidange)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Purchase Price (TND)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Selling Price (TTC/TND)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">VAT Rate (%)</label>
                  <input
                    type="number"
                    required
                    value={vatRate}
                    onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Min Alert Stock</label>
                  <input
                    type="number"
                    required
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Profit Margin per unit:</span>
                <span className="text-cyan-400 font-bold">{(sellingPrice - purchasePrice).toFixed(3)} TND</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-cyan-600 text-white rounded font-semibold hover:bg-cyan-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
