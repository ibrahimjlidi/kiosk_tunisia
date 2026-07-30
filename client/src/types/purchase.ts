export interface ProductPurchase {
  _id: string;
  product: {
    _id: string;
    name: string;
    code: string;
    category: string;
    unitOfMeasure: string;
    purchasePrice: number;
  };
  station?: {
    _id: string;
    name: string;
    code: string;
  };
  supplier?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
  createdAt?: string;
}
