export { Product } from './repositories';
export type ProductCategory = 'FUEL' | 'KIOSK' | 'SERVICE';
export type UnitOfMeasure = 'LITER' | 'UNIT' | 'SERVICE';
export type IProduct = Record<string, any>;
