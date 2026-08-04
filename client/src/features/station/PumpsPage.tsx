import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPump, deletePump, fetchPumps, fetchProducts, fetchStations, updatePump, PumpPayload, PumpPistolPayload } from '../../services/stationApi';
import { Pump, Product, Station } from '../../types/station';
import { Gauge, RefreshCw, AlertCircle, Fuel, Edit2, Trash2, Plus, XCircle, CheckCircle2 } from 'lucide-react';

interface PistolForm {
  _id?: string;
  pistolNumber: number;
  productId: string;
  currentClosingIndex: number;
  active: boolean;
}

export const PumpsPage: React.FC = () => {
  const { user } = useAuth();
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPump, setEditingPump] = useState<Pump | null>(null);
  const [stationId, setStationId] = useState('');
  const [pumpNumber, setPumpNumber] = useState('');
  const [active, setActive] = useState(true);
  const [pistols, setPistols] = useState<PistolForm[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canWrite = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canDelete = user?.role === 'ADMIN';

  const loadPumps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPumps();
      setPumps(res.pumps);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load pumps');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [stationRes, productRes] = await Promise.all([fetchStations(), fetchProducts()]);
      setStations(stationRes.stations);
      setProducts(productRes.products);
      if (!stationId && stationRes.stations.length > 0) {
        setStationId(stationRes.stations[0]._id);
      }
      if (products.length === 0 && productRes.products.length > 0) {
        setPistols(buildDefaultPistols(productRes.products[0]._id));
      }
    } catch (err) {
      // ignore metadata load errors until modal open
    }
  };

  useEffect(() => {
    loadPumps();
    loadMetadata();
  }, []);

  const buildDefaultPistols = (defaultProductId: string = ''): PistolForm[] => [
    { pistolNumber: 1, productId: defaultProductId, currentClosingIndex: 0, active: true },
    { pistolNumber: 2, productId: defaultProductId, currentClosingIndex: 0, active: true },
  ];

  const resetForm = () => {
    setEditingPump(null);
    setPumpNumber('');
    setActive(true);
    setModalError(null);
    setPistols(buildDefaultPistols(products[0]?._id ?? ''));
    if (stations.length > 0) {
      setStationId(stations[0]._id);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (pump: Pump) => {
    setEditingPump(pump);
    setStationId(typeof pump.station === 'object' ? pump.station._id : pump.station);
    setPumpNumber(pump.pumpNumber);
    setActive(pump.active);
    setPistols(
      pump.pistols.map((pistol) => ({
        _id: pistol._id,
        pistolNumber: pistol.pistolNumber,
        productId: typeof pistol.product === 'object' ? pistol.product._id : pistol.product,
        currentClosingIndex: pistol.currentClosingIndex,
        active: pistol.active,
      }))
    );
    setModalError(null);
    setShowModal(true);
  };

  const handlePistolChange = (index: number, field: keyof PistolForm, value: string | number | boolean) => {
    setPistols((current) => current.map((pistol, idx) => (
      idx === index ? { ...pistol, [field]: value } : pistol
    )));
  };

  const addPistol = () => {
    setPistols((current) => [
      ...current,
      {
        pistolNumber: current.length + 1,
        productId: products[0]?._id ?? '',
        currentClosingIndex: 0,
        active: true,
      },
    ]);
  };

  const removePistol = (index: number) => {
    setPistols((current) => current.filter((_, idx) => idx !== index).map((pistol, idx) => ({ ...pistol, pistolNumber: idx + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stationId || !pumpNumber.trim()) {
      setModalError('Station and pump number are required.');
      return;
    }

    if (pistols.length === 0) {
      setModalError('At least one pistol must be assigned to the pump.');
      return;
    }

    const invalidPistol = pistols.find((pistol) => !pistol.productId || pistol.currentClosingIndex < 0);
    if (invalidPistol) {
      setModalError('Each pistol must have a product and a non-negative closing index.');
      return;
    }

    setModalError(null);
    setSaving(true);
    try {
      const payload: PumpPayload = {
        station: stationId,
        pumpNumber: pumpNumber.trim().toUpperCase(),
        active,
        pistols: pistols.map((p) => ({
          pistolNumber: p.pistolNumber,
          product: p.productId,
          currentClosingIndex: p.currentClosingIndex,
          active: p.active,
          _id: p._id,
        })),
      };
      if (editingPump) {
        await updatePump(editingPump._id, payload);
      } else {
        await createPump(payload);
      }
      setShowModal(false);
      resetForm();
      loadPumps();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Error saving pump');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pump: Pump) => {
    if (!window.confirm(`Delete pump ${pump.pumpNumber}? This will remove associated pistols.`)) return;
    try {
      await deletePump(pump._id);
      loadPumps();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete pump');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-cyan-400" />
            Pumps & Pistols Hierarchy
          </h2>
          <p className="text-xs text-slate-400">
            Station → Pump → Pistol → Fuel Product (with current closing indexes)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canWrite && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pump</span>
            </button>
          )}
          <button
            onClick={loadPumps}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-slate-400 text-sm flex justify-center items-center">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
          Loading pumps and pistols...
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-center text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          {pumps.map((pump) => {
            const station = typeof pump.station === 'object' ? pump.station : null;
            return (
              <div key={pump._id} className="glass-panel overflow-hidden">
                <div className="px-5 py-4 bg-slate-900/80 border-b border-slate-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
                      <Fuel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{pump.pumpNumber}</div>
                      <div className="text-[11px] text-slate-400">
                        {pump.pistols.length} pistol{pump.pistols.length !== 1 ? 's' : ''} registered
                      </div>
                      {station && (
                        <div className="text-[11px] text-slate-500 mt-1">{station.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canWrite && (
                      <button
                        onClick={() => openEditModal(pump)}
                        className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition"
                        title="Edit pump"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(pump)}
                        className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/10 transition"
                        title="Delete pump"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      pump.active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {pump.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/50">
                  {pump.pistols.map((pistol) => {
                    const product = pistol.product as any;
                    return (
                      <div key={pistol._id || pistol.pistolNumber} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                            P{pistol.pistolNumber}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-200">
                              {product?.name || 'Unknown Product'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Code: <span className="font-mono text-cyan-500">{product?.code || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Closing Index</div>
                          <div className="font-mono font-bold text-amber-400 text-sm">
                            {pistol.currentClosingIndex.toLocaleString('fr-TN', { minimumFractionDigits: 1 })} L
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingPump ? 'Edit Pump' : 'Add New Pump'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingPump ? 'Update pump details and pistol assignments.' : 'Create a pump and assign its pistols to products.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Station</label>
                  <select
                    required
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    {stations.map((station) => (
                      <option key={station._id} value={station._id}>{station.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Pump Number</label>
                  <input
                    type="text"
                    required
                    value={pumpNumber}
                    onChange={(e) => setPumpNumber(e.target.value)}
                    placeholder="PUMP-001"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">Status:</span>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`rounded-full px-3 py-1 text-slate-100 transition ${active ? 'bg-emerald-500/15 border border-emerald-500/20' : 'bg-red-500/15 border border-red-500/20'}`}
                >
                  {active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="rounded border border-slate-800 bg-slate-900/70 p-3 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Station</span>
                  <span className="font-mono text-cyan-400">{stations.find((item) => item._id === stationId)?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Pump</span>
                  <span className="font-mono text-slate-200">{pumpNumber.trim() || '—'}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Pistols</span>
                  <span className="font-mono text-amber-400">{pistols.length}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-100">Pistols</div>
                  <button
                    type="button"
                    onClick={addPistol}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Pistol</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {pistols.map((pistol, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <div>
                        <label className="block text-slate-300 mb-1">Pistol Number</label>
                        <input
                          type="number"
                          min={1}
                          value={pistol.pistolNumber}
                          onChange={(e) => handlePistolChange(index, 'pistolNumber', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Product</label>
                        <select
                          required
                          value={pistol.productId}
                          onChange={(e) => handlePistolChange(index, 'productId', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>{product.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1">Closing Index (L)</label>
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={pistol.currentClosingIndex}
                          onChange={(e) => handlePistolChange(index, 'currentClosingIndex', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                        />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => handlePistolChange(index, 'active', !pistol.active)}
                          className={`rounded-full px-3 py-1 text-[11px] text-slate-100 transition ${pistol.active ? 'bg-emerald-500/15 border border-emerald-500/20' : 'bg-red-500/15 border border-red-500/20'}`}
                        >
                          {pistol.active ? 'On' : 'Off'}
                        </button>
                        {pistols.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePistol(index)}
                            className="text-rose-400 hover:text-rose-200 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingPump ? 'Save Pump' : 'Create Pump'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
