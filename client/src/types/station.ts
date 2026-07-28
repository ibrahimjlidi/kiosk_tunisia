export type ProductCategory = 'FUEL' | 'KIOSK' | 'SERVICE';
export type UnitOfMeasure = 'LITER' | 'UNIT' | 'SERVICE';

export interface Product {
  _id: string;
  name: string;
  code: string;
  category: ProductCategory;
  purchasePrice: number;
  sellingPrice: number;
  vatRate: number;
  unitOfMeasure: UnitOfMeasure;
  minStockAlert: number;
  currentStock: number;
  active: boolean;
  createdAt?: string;
}

export interface Station {
  _id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone?: string;
  taxId?: string;
  active: boolean;
}

export interface Tank {
  _id: string;
  station: Station | string;
  product: Product;
  tankNumber: string;
  capacity: number;
  currentStock: number;
  minLevelAlert: number;
  active: boolean;
}

export interface Pistol {
  _id?: string;
  pistolNumber: number;
  product: Product;
  currentClosingIndex: number;
  active: boolean;
}

export interface Pump {
  _id: string;
  station: Station | string;
  pumpNumber: string;
  pistols: Pistol[];
  active: boolean;
}
