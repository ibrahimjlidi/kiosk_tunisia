import mongoose from 'mongoose';
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
  const purchase = await ProductPurchase.create({
    product,
    station,
    supplier,
    quantity,
    unitCost,
    totalCost,
    notes,
  });

  productDoc.currentStock += quantity;
  await productDoc.save();

  return purchase;
};

export const fetchProductPurchases = async (query: { product?: string; station?: string; supplier?: string } = {}) => {
  const filter: any = {};
  if (query.product) filter.product = new mongoose.Types.ObjectId(query.product);
  if (query.station) filter.station = new mongoose.Types.ObjectId(query.station);
  if (query.supplier) filter.supplier = query.supplier;

  return ProductPurchase.find(filter)
    .sort({ createdAt: -1 })
    .populate('product', 'name code category unitOfMeasure purchasePrice')
    .populate('station', 'name code')
    .lean();
};
