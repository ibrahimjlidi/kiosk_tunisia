import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createStation, deleteStation, fetchStations, updateStation } from '../../services/stationApi';
import { Station } from '../../types/station';
import { Building2, RefreshCw, AlertCircle, MapPin, Phone, Hash, Edit2, Trash2, Plus, CheckCircle2, XCircle } from 'lucide-react';

export const StationPage: React.FC = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Tunis');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [active, setActive] = useState(true);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canCreate = user?.role === 'ADMIN';
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canDelete = user?.role === 'ADMIN';

  const loadStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStations();
      setStations(res.stations);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStations(); }, []);

  const resetForm = () => {
    setName('');
    setCode('');
    setAddress('');
    setCity('Tunis');
    setPhone('');
    setTaxId('');
    setActive(true);
    setModalError(null);
  };

  const openAddModal = () => {
    setEditingStation(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (station: Station) => {
    setEditingStation(station);
    setName(station.name);
    setCode(station.code);
    setAddress(station.address);
    setCity(station.city);
    setPhone(station.phone || '');
    setTaxId(station.taxId || '');
    setActive(station.active);
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSaving(true);
    try {
      const payload = { name, code, address, city, phone, taxId, active };
      if (editingStation) {
        await updateStation(editingStation._id, payload);
      } else {
        await createStation(payload);
      }
      setShowModal(false);
      loadStations();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Error saving station');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (station: Station) => {
    if (!window.confirm(`Delete station ${station.name}? This cannot be undone.`)) return;
    try {
      await deleteStation(station._id);
      loadStations();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete station');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-cyan-400" />
            Station Management
          </h2>
          <p className="text-xs text-slate-400">
            Registered fuel stations with location, tax ID, and contact details
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canCreate && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Station</span>
            </button>
          )}
          <button
            onClick={loadStations}
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
          Loading stations...
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-center text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stations.map((station) => (
            <div key={station._id} className="glass-panel p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{station.name}</div>
                    <div className="font-mono text-[11px] text-cyan-400">{station.code}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(station)}
                      className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition"
                      title="Edit station"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(station)}
                      className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/10 transition"
                      title="Delete station"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                station.active
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {station.active ? 'ACTIVE' : 'INACTIVE'}
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{station.address}, {station.city}</span>
                </div>
                {station.phone && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>{station.phone}</span>
                  </div>
                )}
                {station.taxId && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Hash className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="font-mono">Matricule Fiscal: {station.taxId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingStation ? 'Edit Station' : 'Add New Station'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingStation ? 'Update location, contact and fiscal details.' : 'Create a new fuel station profile.'}
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
                  <label className="block text-slate-300 mb-1">Station Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Station Kiosque Tunis"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Station Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="STATION-001"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rue de l'Industrie"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Tunis"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+216 71 000 000"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Matricule Fiscal</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="123456A"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingStation ? 'Save Changes' : 'Create Station'}</span>
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
