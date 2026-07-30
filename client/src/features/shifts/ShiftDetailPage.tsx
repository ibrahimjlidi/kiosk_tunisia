import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchShiftById, updateReadings, updatePayments, closeShift } from '../../services/shiftApi';
import { Shift, PistolReading, ShiftType } from '../../types/shift';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Sun, Sunset, Moon, Save, Lock,
  AlertCircle, RefreshCw, TrendingUp, DollarSign,
  CheckCircle2, XCircle, Banknote, CreditCard
} from 'lucide-react';
import { fetchCustomers } from '../../services/customerApi';
import { createSale } from '../../services/saleApi';
import { Customer } from '../../types/customer';

const SHIFT_ICONS: Record<ShiftType, React.ReactNode> = {
  MORNING:   <Sun    className="w-5 h-5 text-amber-400" />,
  AFTERNOON: <Sunset className="w-5 h-5 text-orange-400" />,
  NIGHT:     <Moon   className="w-5 h-5 text-blue-400" />,
};

// Local calculation helper (mirrors server logic)
const calcLocally = (pistol: PistolReading, closingIndex: number) => {
  const volume   = Math.max(0, closingIndex - pistol.openingIndex);
  const amountTTC = parseFloat((volume * pistol.sellingPrice).toFixed(3));
  const amountHT  = parseFloat((amountTTC / (1 + pistol.vatRate / 100)).toFixed(3));
  const vatAmount = parseFloat((amountTTC - amountHT).toFixed(3));
  const profit    = parseFloat((volume * (pistol.sellingPrice - pistol.purchasePrice)).toFixed(3));
  return { volume, amountHT, vatAmount, amountTTC, profit };
};

export const ShiftDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Sale modal
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [activePistol, setActivePistol] = useState<{ pumpId: string; pistolId: string; pr?: any } | null>(null);
  const [salePaymentMethod, setSalePaymentMethod] = useState<string>('CASH');
  const [saleCustomerId, setSaleCustomerId] = useState<string>('');

  // Local editable closing indexes: pumpIndex-pistolId => closingIndex
  const [localIndexes, setLocalIndexes] = useState<Record<string, number>>({});

  // Payments state
  const [payments, setPayments] = useState({
    cashAmount: 0, bankCardAmount: 0, fuelCardAmount: 0,
    bankTransferAmount: 0, creditAmount: 0,
  });

  const load = async () => {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const res = await fetchShiftById(id);
      setShift(res.shift);

      // Initialise local indexes from server data
      const init: Record<string, number> = {};
      for (const pr of res.shift.pumpReadings) {
        for (const pistol of pr.pistolReadings) {
          init[`${pr.pump}-${pistol.pistolId}`] = pistol.closingIndex;
        }
      }
      setLocalIndexes(init);
      setPayments({
        cashAmount:         res.shift.cashAmount,
        bankCardAmount:     res.shift.bankCardAmount,
        fuelCardAmount:     res.shift.fuelCardAmount,
        bankTransferAmount: res.shift.bankTransferAmount,
        creditAmount:       res.shift.creditAmount,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load shift');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    // load customers for sale modal
    (async () => {
      try {
        const res = await fetchCustomers();
        setCustomers(res.customers || []);
      } catch (err) { /* ignore */ }
    })();
  }, []);

  const handleSaveReadings = async () => {
    if (!shift) return;
    setSaving(true); setSaveMsg(null);
    try {
      const readings = shift.pumpReadings.flatMap((pr) =>
        pr.pistolReadings.map((pistol) => ({
          pumpId:       pr.pump,
          pistolId:     pistol.pistolId,
          closingIndex: localIndexes[`${pr.pump}-${pistol.pistolId}`] ?? pistol.closingIndex,
        }))
      );
      const res = await updateReadings(shift._id, readings);
      setShift(res.shift);
      setSaveMsg('Readings saved & financials recalculated ✓');
    } catch (err: any) {
      setSaveMsg(`Error: ${err?.response?.data?.message || 'Failed to save readings'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayments = async () => {
    if (!shift) return;
    setSaving(true); setSaveMsg(null);
    try {
      const res = await updatePayments(shift._id, payments);
      setShift(res.shift);
      setSaveMsg('Payments saved & reconciliation updated ✓');
    } catch (err: any) {
      setSaveMsg(`Error: ${err?.response?.data?.message || 'Failed to save payments'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (!shift || !window.confirm('Close this shift? This will roll over indexes to the next shift.')) return;
    setSaving(true); setSaveMsg(null);
    try {
      const res = await closeShift(shift._id);
      setShift(res.shift);
      setSaveMsg('Shift closed and indexes rolled over ✓');
    } catch (err: any) {
      setSaveMsg(`Error: ${err?.response?.data?.message || 'Failed to close shift'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-slate-400">
      <RefreshCw className="w-6 h-6 animate-spin mr-2 text-cyan-400" /> Loading shift...
    </div>
  );
  if (error) return (
    <div className="glass-panel p-6 text-center text-red-400 text-sm">
      <AlertCircle className="w-6 h-6 mx-auto mb-2" /> {error}
    </div>
  );
  if (!shift) return null;

  const isClosed = shift.status === 'CLOSED';
  const station  = typeof shift.station  === 'object' ? shift.station  : null;
  const openedBy = typeof shift.openedBy === 'object' ? shift.openedBy : null;

  // Live totals (from current state of localIndexes before save)
  let liveTTC = 0; let liveProfit = 0; let liveHT = 0; let liveVAT = 0;
  if (shift) {
    for (const pr of shift.pumpReadings) {
      for (const pistol of pr.pistolReadings) {
        const ci = localIndexes[`${pr.pump}-${pistol.pistolId}`] ?? pistol.closingIndex;
        const c  = calcLocally(pistol, ci);
        liveTTC    += c.amountTTC;
        liveProfit += c.profit;
        liveHT     += c.amountHT;
        liveVAT    += c.vatAmount;
      }
    }
  }
  const livePaymentsTotal = Object.values(payments).reduce((a, b) => a + b, 0);
  const liveBalance = livePaymentsTotal - liveTTC;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate('/shifts')} className="text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center space-x-2">
          {SHIFT_ICONS[shift.shiftType]}
          <h2 className="text-xl font-bold text-white">{shift.shiftType} Shift</h2>
          <span className="text-slate-400 text-sm">—</span>
          <span className="text-slate-400 text-sm">{new Date(shift.shiftDate).toLocaleDateString('fr-TN')}</span>
          {station && <span className="text-xs text-slate-500">{station.name}</span>}
        </div>
        <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold border ${
          isClosed ? 'bg-slate-700/50 text-slate-400 border-slate-600' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>{shift.status}</span>
      </div>

      {/* Live Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sales HT', value: liveHT,     color: 'text-slate-300', prefix: '' },
          { label: 'TVA (19%)', value: liveVAT,   color: 'text-amber-400', prefix: '' },
          { label: 'Sales TTC', value: liveTTC,    color: 'text-emerald-400', prefix: '' },
          { label: 'Profit',   value: liveProfit, color: 'text-cyan-400',  prefix: '+' },
        ].map(({ label, value, color, prefix }) => (
          <div key={label} className="glass-panel p-4 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
            <div className={`text-lg font-bold font-mono ${color}`}>{prefix}{value.toFixed(3)}</div>
            <div className="text-[10px] text-slate-600">TND</div>
          </div>
        ))}
      </div>

      {/* Pump Readings Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 text-sm">Pump Index Readings</h3>
          {!isClosed && (
            <button
              onClick={handleSaveReadings}
              disabled={saving}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save & Recalculate'}</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Pump / Pistol</th>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Opening</th>
                <th className="px-4 py-2.5">Closing</th>
                <th className="px-4 py-2.5">Volume (L)</th>
                <th className="px-4 py-2.5">HT (TND)</th>
                <th className="px-4 py-2.5">TVA</th>
                <th className="px-4 py-2.5">TTC (TND)</th>
                <th className="px-4 py-2.5">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {shift.pumpReadings.map((pr) =>
                pr.pistolReadings.map((pistol) => {
                  const key = `${pr.pump}-${pistol.pistolId}`;
                  const ci  = localIndexes[key] ?? pistol.closingIndex;
                  const c   = calcLocally(pistol, ci);
                  return (
                    <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-slate-300">
                        {pr.pumpNumber} · P{pistol.pistolNumber}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-cyan-400 font-mono text-[10px]">{pistol.productCode}</span>
                        <div className="text-slate-400">{pistol.productName}</div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">
                        {pistol.openingIndex.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5">
                        {isClosed ? (
                          <span className="font-mono text-slate-300">{ci.toFixed(1)}</span>
                        ) : (
                          <input
                            type="number"
                            step="0.001"
                            min={pistol.openingIndex}
                            value={ci}
                            onChange={(e) => setLocalIndexes((prev) => ({
                              ...prev,
                              [key]: parseFloat(e.target.value) || pistol.openingIndex,
                            }))}
                            className="w-28 bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none transition-colors"
                          />
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-amber-400">{c.volume.toFixed(3)}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-300">{c.amountHT.toFixed(3)}</td>
                      <td className="px-4 py-2.5 font-mono text-amber-300">{c.vatAmount.toFixed(3)}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-emerald-400">{c.amountTTC.toFixed(3)}</td>
                      <td className="px-4 py-2.5 font-mono text-cyan-400">+{c.profit.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-right">
                        {!isClosed && c.volume > 0 && (
                          <button
                            onClick={() => { setActivePistol({ pumpId: pr.pump, pistolId: pistol.pistolId, pr: { pr, pistol } }); setSaleModalOpen(true); }}
                            className="px-2 py-1 bg-slate-800 text-slate-200 rounded text-xs">
                            Record Sale
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments & Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center">
              <Banknote className="w-4 h-4 mr-2 text-emerald-400" />Payments Entry
            </h3>
            {!isClosed && (
              <button
                onClick={handleSavePayments}
                disabled={saving}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                <Save className="w-3 h-3" /><span>Save</span>
              </button>
            )}
          </div>
          {[
            { key: 'cashAmount',         label: 'Cash (Espèces)' },
            { key: 'bankCardAmount',      label: 'Bank Card (CB)' },
            { key: 'fuelCardAmount',      label: 'Fuel Card (Carte Carburant)' },
            { key: 'bankTransferAmount',  label: 'Bank Transfer (Virement)' },
            { key: 'creditAmount',        label: 'Credit (Crédit Client)' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-xs text-slate-400">{label}</label>
              {isClosed ? (
                <span className="font-mono text-slate-300 text-xs">
                  {(payments as any)[key].toFixed(3)} TND
                </span>
              ) : (
                <input
                  type="number"
                  step="0.001"
                  min={0}
                  value={(payments as any)[key]}
                  onChange={(e) => setPayments((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                  className="w-32 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none transition-colors text-right"
                />
              )}
            </div>
          ))}
          <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Total Payments</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{livePaymentsTotal.toFixed(3)} TND</span>
          </div>
        </div>

        {/* Reconciliation Summary */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-cyan-400" />Reconciliation Summary
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Total Sales TTC', value: liveTTC.toFixed(3), color: 'text-emerald-400' },
              { label: 'Total Payments',  value: livePaymentsTotal.toFixed(3), color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">{label}</span>
                <span className={`font-mono font-bold ${color}`}>{value} TND</span>
              </div>
            ))}

            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              Math.abs(liveBalance) < 0.001
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : liveBalance > 0
                ? 'bg-blue-500/10 border-blue-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div>
                <div className="font-bold text-slate-200">
                  {Math.abs(liveBalance) < 0.001 ? '✓ Balanced' : liveBalance > 0 ? '▲ Surplus' : '▼ Shortage'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {Math.abs(liveBalance) < 0.001 ? 'Payments match sales exactly' : `Difference of ${Math.abs(liveBalance).toFixed(3)} TND`}
                </div>
              </div>
              <span className={`font-mono font-bold text-lg ${
                Math.abs(liveBalance) < 0.001 ? 'text-emerald-400' : liveBalance > 0 ? 'text-blue-400' : 'text-red-400'
              }`}>
                {liveBalance >= 0 ? '+' : ''}{liveBalance.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`text-xs p-3 rounded-lg border ${saveMsg.startsWith('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {saveMsg}
        </div>
      )}

      {/* Close Shift Button */}
      {!isClosed && (
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-red-700/70 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-lg transition-all disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>Close Shift & Lock</span>
          </button>
        </div>
      )}

      {/* Record Sale Modal */}
      {saleModalOpen && activePistol && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white">Record Sale</h3>
            <div className="space-y-3 mt-3 text-sm">
              <div>
                <label className="block text-xs text-slate-400">Payment Method</label>
                <select value={salePaymentMethod} onChange={(e)=>setSalePaymentMethod(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100">
                  <option value="CASH">Cash</option>
                  <option value="BANK_CARD">Bank Card</option>
                  <option value="FUEL_CARD">Fuel Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>
              {salePaymentMethod === 'CREDIT' && (
                <div>
                  <label className="block text-xs text-slate-400">Customer</label>
                  <select value={saleCustomerId} onChange={(e)=>setSaleCustomerId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100">
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} — {c.creditBalance.toFixed(3)} TND</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-end space-x-2 pt-4">
                <button onClick={()=>{ setSaleModalOpen(false); setActivePistol(null); }} className="px-4 py-2 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button onClick={async ()=>{
                  if (!activePistol) return;
                  const { pr, pistol } = activePistol.pr;
                  const key = `${pr.pump}-${pistol.pistolId}`;
                  const ci = localIndexes[key] ?? pistol.closingIndex;
                  const c = calcLocally(pistol, ci);
                  const payload: any = {
                    station: typeof shift.station === 'object' ? shift.station._id : shift.station,
                    shift: shift._id,
                    pump: pr.pump,
                    pistol: pistol.pistolId,
                    product: pistol.product,
                    productName: pistol.productName,
                    productCode: pistol.productCode,
                    quantity: c.volume,
                    purchasePrice: pistol.purchasePrice,
                    sellingPrice: pistol.sellingPrice,
                    vatRate: pistol.vatRate,
                    amountHT: c.amountHT,
                    vatAmount: c.vatAmount,
                    amountTTC: c.amountTTC,
                    profit: c.profit,
                    paymentMethod: salePaymentMethod,
                  };
                  if (salePaymentMethod === 'CREDIT') payload.customer = saleCustomerId;
                  try {
                    await createSale(payload);
                    alert('Sale recorded');
                    setSaleModalOpen(false); setActivePistol(null);
                    load();
                  } catch (err:any) {
                    alert(err?.response?.data?.message || 'Failed to record sale');
                  }
                }} className="px-4 py-2 bg-cyan-600 text-white rounded">Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
