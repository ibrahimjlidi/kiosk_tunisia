import React, { useState, useEffect } from 'react';
import { fetchTankGaugings, createTankGauging, fetchTanks } from '../../services/stationApi';
import { TankGauging, Tank } from '../../types/station';
import { Ruler, Plus, Search, X, ChevronLeft, ChevronRight, RefreshCw, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TankGaugingPage: React.FC = () => {
  const { user } = useAuth();
  const [gaugings, setGaugings] = useState<TankGauging[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [form, setForm] = useState({
    tank: '', station: '', dipReading: 0, calculatedVolume: 0,
    waterLevel: 0, temperature: 20, notes: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gaugingsRes, tanksRes] = await Promise.all([
        fetchTankGaugings(),
        fetchTanks()
      ]);
      setGaugings(gaugingsRes.gaugings || []);
      setTanks(tanksRes.tanks || []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = gaugings.filter(g =>
    (typeof g.tank === 'object' && g.tank?.tankNumber?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setForm({
      tank: '', station: '', dipReading: 0, calculatedVolume: 0,
      waterLevel: 0, temperature: 20, notes: ''
    });
    setShowModal(true);
  };

  const handleTankChange = (tankId: string) => {
    const tank = tanks.find(t => t._id === tankId);
    setForm({
      ...form,
      tank: tankId,
      station: typeof tank?.station === 'object' ? tank.station?._id : tank?.station || '',
    });
  };

  const handleCreate = async () => {
    try {
      await createTankGauging(form);
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Create failed', err);
    }
  };

  const varianceIcon = (v: number) => {
    if (v > 0) return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
    if (v < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPERVISOR';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Ruler className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tank Gauging</h2>
            <p className="text-xs text-slate-400">Manual dip readings & inventory verification</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by tank..." className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-48" />
          </div>
          {canCreate && (
            <button onClick={openCreate} className="btn-primary text-xs px-3 py-1.5">
              <Plus className="w-3.5 h-3.5 mr-1 inline" /> New Reading
            </button>
          )}
          <button onClick={loadData} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading tank gaugings...</div>
      ) : paged.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">No gauging records found</div>
      ) : (
        <div className="grid gap-3">
          {paged.map(g => (
            <div key={g._id} className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-slate-800 rounded-lg">
                    <Ruler className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">
                      {typeof g.tank === 'object' ? g.tank?.tankNumber : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(g.gaugedAt).toLocaleString()} • Dip: {g.dipReading}mm
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {varianceIcon(g.variance)}
                  <span className={`text-xs font-bold ${g.variance > 0 ? 'text-emerald-400' : g.variance < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {g.variance > 0 ? '+' : ''}{g.variance?.toFixed(1) || '0'} L
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400">
                <div>Volume: <span className="text-slate-200 font-semibold">{g.calculatedVolume?.toFixed(0) || '0'} L</span></div>
                <div>Stock: <span className="text-slate-200 font-semibold">{g.theoreticalStock?.toFixed(0) || '0'} L</span></div>
                <div>Water: <span className="text-slate-200 font-semibold">{g.waterLevel || 0} mm</span></div>
                <div>Temp: <span className="text-slate-200 font-semibold">{g.temperature || 20}°C</span></div>
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
              <h3 className="text-sm font-bold text-white">New Tank Gauging</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Tank *</label>
                <select value={form.tank} onChange={e => handleTankChange(e.target.value)} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50">
                  <option value="">Select tank</option>
                  {tanks.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.tankNumber} (Capacity: {t.capacity}L • Stock: {t.currentStock}L)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Dip Reading (mm) *</label>
                  <input type="number" value={form.dipReading || ''} onChange={e => setForm({ ...form, dipReading: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Calculated Volume (L) *</label>
                  <input type="number" value={form.calculatedVolume || ''} onChange={e => setForm({ ...form, calculatedVolume: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Water Level (mm)</label>
                  <input type="number" value={form.waterLevel || ''} onChange={e => setForm({ ...form, waterLevel: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Temperature (°C)</label>
                  <input type="number" value={form.temperature || ''} onChange={e => setForm({ ...form, temperature: parseFloat(e.target.value) || 20 })} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full mt-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors">Record Reading</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TankGaugingPage;
