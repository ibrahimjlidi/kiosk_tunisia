import { withTransaction } from '../config/db';
import { newId } from '../models/sqlModel';
import { ProductPurchase } from '../models/ProductPurchase';
import { Product } from '../models/Product';

interface PurchasePayload {
  product: string;
  station?: string;
  supplier?: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}

export const recordProductPurchase = async (data: PurchasePayload) => {
  const { product, station, supplier, quantity, unitCost, notes } = data;
  const productDoc = await Product.findById(product);
  if (!productDoc) {
    throw new Error('Product not found');
  }

  const totalCost = parseFloat((quantity * unitCost).toFixed(3));
  const purchaseId = newId();
  await withTransaction(async (connection) => {
    await connection.execute(
      `INSERT INTO product_purchases (id, product_id, station_id, supplier, quantity, unit_cost, total_cost, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(3))`,
      [purchaseId, product, station ?? null, supplier ?? null, quantity, unitCost, totalCost, notes ?? null],
    );
    await connection.execute('UPDATE products SET current_stock = current_stock + ? WHERE id = ?', [quantity, product]);
  });
  return ProductPurchase.findById(purchaseId);
};

export const fetchProductPurchases = async (query: { product?: string; station?: string; supplier?: string } = {}) => {
  const filter: any = {};
  if (query.product) filter.product = query.product;
  if (query.station) filter.station = query.station;
  if (query.supplier) filter.supplier = query.supplier;

  return ProductPurchase.find(filter)
    .sort({ createdAt: -1 })
    .populate('product', 'name code category unitOfMeasure purchasePrice')
    .populate('station', 'name code')
    .lean();
};
