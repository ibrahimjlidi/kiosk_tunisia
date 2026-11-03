export { PurchaseOrder } from './repositories';
export type PurchaseOrderStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED';
export type IPurchaseItem = Record<string, any>;
export type IPurchaseOrder = Record<string, any>;
