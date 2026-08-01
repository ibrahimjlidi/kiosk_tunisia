import React, { useEffect, useState } from 'react';
import {
  fetchTanks,
  fetchStations,
  fetchProducts,
  createTank,
  updateTank,
  deleteTank,
  TankPayload,
} from '../../services/stationApi';
import { Tank, Station, Product } from '../../types/station';
import {
  Database,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
} from 'lucide-react';

export const TanksPage: React.FC = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [station, setStation] = useState('');
  const [product, setProduct] = useState('');
  const [tankNumber, setTankNumber] = useState('');
  const [capacity, setCapacity] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minLevelAlert, setMinLevelAlert] = useState<number>(2000);
  const [active, setActive] = useState(true);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tanksRes, stationsRes, productsRes] = await Promise.all([
        fetchTanks(),
        fetchStations(),
        fetchProducts(),
      ]);
      setTanks(tanksRes.tanks);
      setStations(stationsRes.stations);
      setProducts(productsRes.products);
      if (!station && stationsRes.stations.length > 0) {
        setStation(stationsRes.stations[0]._id);
      }
      if (!product && productsRes.products.length > 0) {
        setProduct(productsRes.products[0]._id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load tanks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetModal = () => {
    setEditingTank(null);
    setTankNumber('');
    setCapacity(0);
    setCurrentStock(0);
    setMinLevelAlert(2000);
    setActive(true);
    setModalError(null);
    if (stations.length > 0) setStation(stations[0]._id);
    if (products.length > 0) setProduct(products[0]._id);
  };

  const openAddModal = () => {
    resetModal();
    setShowModal(true);
  };

  const openEditModal = (tank: Tank) => {
    setEditingTank(tank);
    setTankNumber(tank.tankNumber);
    setCapacity(tank.capacity);
    setCurrentStock(tank.currentStock);
    setMinLevelAlert(tank.minLevelAlert);
    setActive(tank.active);
    setStation(typeof tank.station === 'object' ? tank.station._id : tank.station);
    setProduct(tank.product._id);
    setModalError(null);
    setShowModal(true);
  };

  const handleDelete = async (tank: Tank) => {
    if (!window.confirm(`Delete tank ${tank.tankNumber}? This cannot be undone.`)) return;
    try {
      await deleteTank(tank._id);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Unable to delete tank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station || !product || !tankNumber.trim()) {
      setModalError('Station, product and tank number are required.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      const payload: TankPayload = {
        station,
        product,
        tankNumber: tankNumber.trim(),
        capacity,
        currentStock,
        minLevelAlert,
        active,
      };
      if (editingTank) {
        await updateTank(editingTank._id, payload);
      } else {
        await createTank(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Failed to save tank');
    } finally {
      setSaving(false);
    }
  };

  const getFillPercent = (tank: Tank) => {
    if (!tank.capacity || tank.capacity === 0) return 0;
    return Math.min(100, Math.max(0, (tank.currentStock / tank.capacity) * 100));
  };

  const isLowStock = (tank: Tank) => tank.currentStock <= tank.minLevelAlert;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-cyan-400" />
            Fuel Tank Inventory & Stock Levels
          </h2>
          <p className="text-xs text-slate-400">
            Current physical stock, capacity, and minimum threshold alerts per fuel tank.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg text-white text-xs font-semibold hover:bg-cyan-500 transition">
            <Plus className="w-4 h-4" /> Add Tank
          </button>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-200 text-xs hover:bg-slate-700 transition">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-slate-400 text-sm flex justify-center items-center">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" /> Loading tank inventory...
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-center text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tanks.map((tank) => {
            const fillPct = getFillPercent(tank);
            const low = isLowStock(tank);
            const productObj = tank.product as Product;
            const stationObj = typeof tank.station === 'object' ? tank.station : null;
            const fillColor = low
              ? 'from-red-600 to-rose-700'
              : fillPct < 40
              ? 'from-amber-500 to-orange-600'
              : 'from-emerald-500 to-teal-600';

            return (
              <div key={tank._id} className={`glass-panel overflow-hidden ${low ? 'ring-1 ring-red-500/40' : ''}`}>
                <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{tank.tankNumber}</div>
                    <div className="text-[11px] text-cyan-400 font-semibold mt-0.5">
                      {productObj?.name || 'Unknown Product'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {stationObj ? stationObj.name : 'No station'}
                    </div>
                  </div>
                  {low && (
                    <div className="flex items-center space-x-1 text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>LOW STOCK</span>
                    </div>
                  )}
                </div>

                <div className="px-5 py-2 space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Current Stock</span>
                    <span className="font-mono font-semibold text-slate-200">{fillPct.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full bg-gradient-to-r ${fillColor} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                <div className="px-5 pb-5 grid grid-cols-3 gap-3 mt-2">
                  <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-0.5">Current</div>
                    <div className="font-mono font-bold text-emerald-400 text-xs">{tank.currentStock.toLocaleString('fr-TN')} L</div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-0.5">Capacity</div>
                    <div className="font-mono font-bold text-slate-300 text-xs">{tank.capacity.toLocaleString('fr-TN')} L</div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-0.5">Min Alert</div>
                    <div className={`font-mono font-bold text-xs ${low ? 'text-red-400' : 'text-amber-400'}`}>{tank.minLevelAlert.toLocaleString('fr-TN')} L</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 px-5 pb-5">
                  <button
                    onClick={() => openEditModal(tank)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tank)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-300 rounded text-xs font-semibold"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{editingTank ? 'Edit Tank' : 'Add New Tank'}</h3>
                <p className="text-xs text-slate-400">Manage physical tank capacity, stock, and product assignment.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-100"><X className="w-5 h-5" /></button>
            </div>

            {modalError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">{modalError}</div>}

            <form onSubmit={handleSubmit} className="grid gap-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Station</label>
                  <select
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    {stations.map((stationItem) => (
                      <option key={stationItem._id} value={stationItem._id}>{stationItem.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Product</label>
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    {products.map((productItem) => (
                      <option key={productItem._id} value={productItem._id}>{productItem.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Tank Number</label>
                  <input
                    value={tankNumber}
                    onChange={(e) => setTankNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                    placeholder="e.g. Tank A"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Capacity (L)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={capacity}
                    onChange={(e) => setCapacity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Current Stock (L)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Min Level Alert (L)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={minLevelAlert}
                    onChange={(e) => setMinLevelAlert(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input
                    id="tank-active"
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  <label htmlFor="tank-active" className="text-slate-300 text-sm">Active tank</label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 rounded text-slate-300 hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded text-white hover:bg-cyan-500 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : editingTank ? 'Update Tank' : 'Create Tank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
