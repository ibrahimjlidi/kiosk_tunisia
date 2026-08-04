import React, { useEffect, useState, useCallback } from 'react';
import { fetchShifts, openShift as apiOpenShift, closeShift as apiCloseShift, reopenShift as apiReopenShift } from '../../services/shiftApi';
import { fetchStations } from '../../services/stationApi';
import { fetchAllUsers } from '../../services/authApi';
import { Shift, ShiftType } from '../../types/shift';
import { Station } from '../../types/station';
import { User } from '../../types/auth';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Clock, Sun, Sunset, Moon, Plus, CheckCircle2, XCircle, Eye, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';

const SHIFT_ICONS: Record<ShiftType, React.ReactNode> = {
  MORNING:   <Sun    className="w-4 h-4 text-amber-400" />,
  AFTERNOON: <Sunset className="w-4 h-4 text-orange-400" />,
  NIGHT:     <Moon   className="w-4 h-4 text-blue-400" />,
};

const SHIFT_COLORS: Record<ShiftType, string> = {
  MORNING:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  AFTERNOON: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  NIGHT:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export const ShiftsListPage: React.FC = () => {
  const { user } = useAuth();
  const [shifts, setShifts]     = useState<Shift[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Filter state
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().slice(0, 10));
  const [stationFilter, setStationFilter] = useState<string>('');

  // Open shift modal
  const [showModal, setShowModal]     = useState(false);
  const [newShiftType, setNewShiftType] = useState<ShiftType>('MORNING');
  const [newStationId, setNewStationId] = useState<string>('');
  const [newDate, setNewDate]         = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [opening, setOpening]         = useState(false);
  const [modalError, setModalError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);

    try {
      const [shiftResult, stationResult, userResult] = await Promise.allSettled([
        fetchShifts({ date: dateFilter || undefined, station: stationFilter || undefined }),
        fetchStations(),
        fetchAllUsers(),
      ]);

      if (shiftResult.status === 'fulfilled') {
        setShifts(shiftResult.value.shifts);
      } else {
        setShifts([]);
      }

      if (stationResult.status === 'fulfilled') {
        setStations(stationResult.value.stations);
        if (!newStationId && stationResult.value.stations.length > 0) {
          setNewStationId(stationResult.value.stations[0]._id);
        }
      } else {
        setStations([]);
      }

      if (userResult.status === 'fulfilled') {
        setUsers(userResult.value.users.filter((u) => u.active));
      } else {
        setUsers([]);
      }

      const hasAnyData = shiftResult.status === 'fulfilled' || stationResult.status === 'fulfilled' || userResult.status === 'fulfilled';
      if (!hasAnyData) {
        setError('Failed to load shifts');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, stationFilter]);

  useEffect(() => { load(); }, [load]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null); setOpening(true);
    try {
      await apiOpenShift({ stationId: newStationId, shiftType: newShiftType, shiftDate: newDate, employeeIds: selectedEmployees });
      setShowModal(false);
      load();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Failed to open shift');
    } finally {
      setOpening(false);
    }
  };

  const handleClose = async (shift: Shift) => {
    if (!window.confirm(`Close ${shift.shiftType} shift?`)) return;
    try {
      await apiCloseShift(shift._id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to close shift');
    }
  };

  const handleReopen = async (shift: Shift) => {
    if (!window.confirm(`Reopen this closed shift? (Admin only)`)) return;
    try {
      await apiReopenShift(shift._id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reopen shift');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-cyan-400" />
            Shift Management Console
          </h2>
          <p className="text-xs text-slate-400">
            Morning · Afternoon · Night shifts with pump index readings and financial reconciliation
          </p>
        </div>
        <button
          onClick={() => { setModalError(null); setShowModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Shift</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 glass-panel px-4 py-3">
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400">Station:</label>
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Stations</option>
            {stations.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
        <button onClick={load} className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs">
          <RefreshCw className="w-3 h-3" /><span>Refresh</span>
        </button>
      </div>

      {/* Shifts Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-slate-400 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />Loading shifts...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />{error}
          </div>
        ) : shifts.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-40" />
            No shifts found. Open a shift to begin operations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total Sales (TTC)</th>
                  <th className="px-4 py-3">Payments</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Profit</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shifts.map((shift) => {
                  const balColor = shift.isBalanced
                    ? 'text-emerald-400' : shift.balance > 0
                    ? 'text-blue-400' : 'text-red-400';
                  const station = typeof shift.station === 'object' ? shift.station : null;
                  const openedBy = typeof shift.openedBy === 'object' ? shift.openedBy : null;
                  return (
                    <tr key={shift._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {SHIFT_ICONS[shift.shiftType]}
                          <div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border w-fit ${SHIFT_COLORS[shift.shiftType]}`}>
                              {shift.shiftType}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {new Date(shift.shiftDate).toLocaleDateString('fr-TN')}
                              {openedBy && ` — ${openedBy.firstName} ${openedBy.lastName}`}
                            </div>
                            {shift.employees.length > 0 && (
                              <div className="text-[10px] text-cyan-400 mt-1">
                                Staff: {shift.employees.map((employee) => `${employee.firstName} ${employee.lastName}`).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center space-x-1 w-fit px-2 py-0.5 rounded text-[10px] font-bold border ${
                          shift.status === 'OPEN'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-700/50 text-slate-400 border-slate-600'
                        }`}>
                          {shift.status === 'OPEN' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{shift.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                        {shift.totalSalesTTC.toFixed(3)} TND
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {shift.totalPayments.toFixed(3)} TND
                      </td>
                      <td className={`px-4 py-3 font-mono font-bold ${balColor}`}>
                        {shift.balance >= 0 ? '+' : ''}{shift.balance.toFixed(3)} TND
                      </td>
                      <td className="px-4 py-3 font-mono text-cyan-400">
                        {shift.totalProfit.toFixed(3)} TND
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link
                            to={`/shifts/${shift._id}`}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {shift.status === 'OPEN' && (
                            <button
                              onClick={() => handleClose(shift)}
                              className="px-2 py-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded transition-colors"
                            >
                              Close
                            </button>
                          )}
                          {shift.status === 'CLOSED' && user?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleReopen(shift)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                              title="Reopen (Admin)"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Shift Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Open New Shift</h3>
            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">{modalError}</div>
            )}
            <form onSubmit={handleOpenShift} className="space-y-3 text-xs">
              <div>
                <label htmlFor="shift-station" className="block text-slate-300 mb-1">Station</label>
                <select
                  id="shift-station"
                  name="shift-station"
                  required
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                >
                  {stations.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="shift-type" className="block text-slate-300 mb-1">Shift Type</label>
                  <select
                    id="shift-type"
                    name="shift-type"
                    value={newShiftType}
                    onChange={(e) => setNewShiftType(e.target.value as ShiftType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  >
                    <option value="MORNING">MORNING (Matin)</option>
                    <option value="AFTERNOON">AFTERNOON (Après-midi)</option>
                    <option value="NIGHT">NIGHT (Nuit)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Assigned staff</label>
                <select
                  multiple
                  value={selectedEmployees}
                  onChange={(e) => setSelectedEmployees(Array.from(e.target.selectedOptions, (option) => option.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 min-h-[96px]"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.firstName} {user.lastName} · {user.role}</option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple staff.</div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={opening} className="px-4 py-2 bg-cyan-600 text-white rounded font-semibold hover:bg-cyan-500 disabled:opacity-50">
                  {opening ? 'Opening...' : 'Open Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
