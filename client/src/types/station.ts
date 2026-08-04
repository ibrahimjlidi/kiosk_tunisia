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

// Phase 11: Supplier
export interface Supplier {
  _id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  active: boolean;
  createdAt?: string;
}

export type PurchaseOrderStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED';

export interface PurchaseItem {
  product: string | Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tank?: string | Tank;
}

export interface PurchaseOrder {
  _id: string;
  supplier: Supplier | string;
  station: Station | string;
  orderNumber: string;
  orderDate: string;
  deliveryDate?: string;
  status: PurchaseOrderStatus;
  items: PurchaseItem[];
  totalAmount: number;
  notes: string;
  createdBy: any;
  deliveredBy?: string;
  createdAt: string;
}

// Phase 12: Tank Gauging
export interface TankGauging {
  _id: string;
  tank: Tank | string;
  station: Station | string;
  gaugedAt: string;
  dipReading: number;
  calculatedVolume: number;
  waterLevel: number;
  temperature: number;
  theoreticalStock: number;
  variance: number;
  operator: any;
  notes: string;
  createdAt: string;
}
