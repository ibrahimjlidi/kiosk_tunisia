import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createSale } from '../../services/saleApi';
import { fetchProducts, fetchStations } from '../../services/stationApi';
import { Product, Station } from '../../types/station';
import { PlusCircle, ReceiptText, RotateCcw, ShoppingCart, Sparkles } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  paymentMethod: string;
}

export const PosPage: React.FC = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stationId, setStationId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [stationRes, productRes] = await Promise.all([fetchStations(), fetchProducts()]);
      setStations(stationRes.stations);
      setProducts(productRes.products);
      const defaultStation = user?.station || stationRes.stations[0]?._id || '';
      setStationId(defaultStation);
      const fuelProduct = productRes.products.find((p) => (p.category === 'FUEL' || p.category === 'KIOSK') && p.active);
      if (fuelProduct) setSelectedProductId(fuelProduct._id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.station]);

  const terminalProducts = useMemo(() => products.filter((product) => (product.category === 'FUEL' || product.category === 'KIOSK') && product.active), [products]);
  const selectedProduct = terminalProducts.find((product) => product._id === selectedProductId) || null;

  const totals = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        const amountTTC = item.quantity * item.product.sellingPrice;
        const amountHT = amountTTC / (1 + item.product.vatRate / 100);
        const vatAmount = amountTTC - amountHT;
        const profit = item.quantity * (item.product.sellingPrice - item.product.purchasePrice);
        acc.amountHT += amountHT;
        acc.vatAmount += vatAmount;
        acc.amountTTC += amountTTC;
        acc.profit += profit;
        return acc;
      },
      { amountHT: 0, vatAmount: 0, amountTTC: 0, profit: 0 }
    );
  }, [cart]);

  const addToCart = () => {
    if (!selectedProduct || !stationId) {
      setMessage('Choose a station and a product before adding an item.');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === selectedProduct._id && item.paymentMethod === paymentMethod);
      if (existing) {
        return prev.map((item) => item.product._id === selectedProduct._id && item.paymentMethod === paymentMethod
          ? { ...item, quantity: item.quantity + quantity }
          : item);
      }
      return [...prev, { product: selectedProduct, quantity, paymentMethod }];
    });
    setMessage(`${selectedProduct.name} added to the till.`);
  };

  const handleCompleteSale = async () => {
    if (!cart.length || !stationId) {
      setMessage('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setMessage('Recording transactions...');
    try {
      for (const item of cart) {
        const amountTTC = item.quantity * item.product.sellingPrice;
        const amountHT = amountTTC / (1 + item.product.vatRate / 100);
        const vatAmount = amountTTC - amountHT;
        const profit = item.quantity * (item.product.sellingPrice - item.product.purchasePrice);

        await createSale({
          station: stationId,
          product: item.product._id,
          productName: item.product.name,
          productCode: item.product.code,
          quantity: item.quantity,
          purchasePrice: item.product.purchasePrice,
          sellingPrice: item.product.sellingPrice,
          vatRate: item.product.vatRate,
          amountHT,
          vatAmount,
          amountTTC,
          profit,
          paymentMethod: item.paymentMethod,
        });
      }
      setCart([]);
      setMessage('Receipt completed successfully.');
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Failed to record sales.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-cyan-400" />
            POS Terminal
          </h2>
          <p className="text-xs text-slate-400">Fuel and kiosk sales captured in a fast terminal workflow.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <Sparkles className="w-4 h-4" />
          <span>Fast checkout-ready</span>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-300">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="glass-panel p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Station</label>
              <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100">
                {stations.map((station) => (
                  <option key={station._id} value={station._id}>{station.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Payment</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100">
                <option value="CASH">Cash</option>
                <option value="BANK_CARD">Bank Card</option>
                <option value="FUEL_CARD">Fuel Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_0.35fr]">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Product</label>
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100">
                {terminalProducts.map((product) => (
                  <option key={product._id} value={product._id}>{product.name} · {product.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Quantity</label>
              <input type="number" min="1" step="0.1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100" />
            </div>
          </div>

          {selectedProduct && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{selectedProduct.name}</div>
                  <div className="text-xs text-slate-400">{selectedProduct.code}</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-semibold">{selectedProduct.sellingPrice.toFixed(3)} TND</div>
                  <div className="text-xs text-slate-400">{selectedProduct.category}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button onClick={addToCart} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
              <PlusCircle className="w-4 h-4" /> Add to cart
            </button>
            <button onClick={() => setCart([])} className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
              <RotateCcw className="w-4 h-4" /> Clear cart
            </button>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Current receipt</h3>
            <div className="flex items-center gap-2 text-cyan-400 text-xs">
              <ReceiptText className="w-4 h-4" />
              {cart.length} item(s)
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
              No items yet. Add products to start a sale.
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={`${item.product._id}-${item.paymentMethod}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{item.product.name}</div>
                      <div className="text-xs text-slate-400">Qty {item.quantity} · {item.paymentMethod}</div>
                    </div>
                    <div className="text-right text-cyan-400 font-semibold">
                      {(item.quantity * item.product.sellingPrice).toFixed(3)} TND
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider">
              <span>Total TTC</span>
              <span className="font-semibold text-white">{totals.amountTTC.toFixed(3)} TND</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>Profit</span>
              <span className="font-semibold text-white">{totals.profit.toFixed(3)} TND</span>
            </div>
          </div>

          <button onClick={handleCompleteSale} disabled={submitting || cart.length === 0} className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">
            {submitting ? 'Processing...' : 'Complete sale'}
          </button>
        </div>
      </div>
    </div>
  );
};
