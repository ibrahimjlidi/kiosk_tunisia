export { User } from './repositories';
export type UserRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'OPERATOR';
export type IUser = Record<string, any>;
