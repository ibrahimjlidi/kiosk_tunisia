import React, { useEffect, useState } from 'react';
import { fetchStations } from '../../services/stationApi';
import { Station } from '../../types/station';
import { Building2, RefreshCw, AlertCircle, MapPin, Phone, Hash } from 'lucide-react';

export const StationPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <button
          onClick={loadStations}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
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
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{station.name}</div>
                    <div className="font-mono text-[11px] text-cyan-400">{station.code}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  station.active
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {station.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

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
    </div>
  );
};
