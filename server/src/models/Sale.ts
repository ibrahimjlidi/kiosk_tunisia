export { Sale } from './repositories';
export type PaymentMethod = 'CASH' | 'BANK_CARD' | 'FUEL_CARD' | 'BANK_TRANSFER' | 'CREDIT';
export type ISale = Record<string, any>;
