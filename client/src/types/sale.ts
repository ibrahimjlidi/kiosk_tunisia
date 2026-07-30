export interface Sale {
  _id: string;
  station: string;
  shift?: string;
  pump?: string;
  pistol?: string;
  product: string;
  customer?: string;
  productName: string;
  productCode: string;
  employee?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  vatRate: number;
  amountHT: number;
  vatAmount: number;
  amountTTC: number;
  profit: number;
  paymentMethod: string;
  createdAt: string;
}
