import React, { useEffect, useMemo, useState } from 'react';
import { fetchProducts, fetchStations } from '../../services/stationApi';
import { createSale } from '../../services/saleApi';
import { Product, Station } from '../../types/station';
import { Wrench, ReceiptText, PlusCircle } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [stationId, setStationId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [stationRes, productRes] = await Promise.all([fetchStations(), fetchProducts()]);
        setStations(stationRes.stations);
        setServices(productRes.products.filter((product) => product.category === 'SERVICE' && product.active));
        if (stationRes.stations.length) setStationId(stationRes.stations[0]._id);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const selectedService = useMemo(() => services.find((service) => service._id === selectedServiceId) || null, [services, selectedServiceId]);

  const handleCreateServiceSale = async () => {
    if (!selectedService || !stationId) {
      setMessage('Select a service and station first.');
      return;
    }

    setSubmitting(true);
    try {
      const amountTTC = quantity * selectedService.sellingPrice;
      const amountHT = amountTTC / (1 + selectedService.vatRate / 100);
      const vatAmount = amountTTC - amountHT;
      const profit = quantity * (selectedService.sellingPrice - selectedService.purchasePrice);
      await createSale({
        station: stationId,
        product: selectedService._id,
        productName: selectedService.name,
        productCode: selectedService.code,
        quantity,
        purchasePrice: selectedService.purchasePrice,
        sellingPrice: selectedService.sellingPrice,
        vatRate: selectedService.vatRate,
        amountHT,
        vatAmount,
        amountTTC,
        profit,
        paymentMethod: 'CASH',
      });
      setMessage(`Service sale recorded for ${selectedService.name}.`);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Failed to record service sale.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-cyan-400" />
          Service Catalog & Sales
        </h2>
        <p className="text-xs text-slate-400">Sell service products from a dedicated workflow with receipt-ready totals.</p>
      </div>

      {message && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-300">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.55fr] gap-6">
        <div className="glass-panel p-5 space-y-4">
          <div>
            <label htmlFor="service-station" className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Station</label>
            <select id="service-station" name="service-station" value={stationId} onChange={(e) => setStationId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100">
              {stations.map((station) => (
                <option key={station._id} value={station._id}>{station.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-select" className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Service</label>
            <select id="service-select" name="service-select" value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100">
              {services.map((service) => (
                <option key={service._id} value={service._id}>{service.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-quantity" className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Quantity</label>
            <input id="service-quantity" name="service-quantity" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100" />
          </div>

          {selectedService && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{selectedService.name}</div>
                  <div className="text-xs text-slate-400">{selectedService.code}</div>
                </div>
                <div className="text-right text-cyan-400 font-semibold">
                  {selectedService.sellingPrice.toFixed(3)} TND
                </div>
              </div>
            </div>
          )}

          <button onClick={handleCreateServiceSale} disabled={submitting} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50">
            <PlusCircle className="w-4 h-4" /> {submitting ? 'Recording...' : 'Record service sale'}
          </button>
        </div>

        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ReceiptText className="w-4 h-4 text-emerald-400" />
            Service receipt preview
          </div>
          {selectedService ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>{selectedService.name}</span>
                <span className="text-white font-semibold">x{quantity}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Unit price</span>
                <span>{selectedService.sellingPrice.toFixed(3)} TND</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Amount TTC</span>
                <span className="text-emerald-400 font-semibold">{(quantity * selectedService.sellingPrice).toFixed(3)} TND</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
              Choose a service to preview the sale.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
