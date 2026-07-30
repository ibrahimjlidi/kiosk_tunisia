import { Supplier } from '../models/Supplier';

export const fetchSuppliers = async () => {
  return Supplier.find().sort({ name: 1 }).lean();
};

export const createSupplier = async (data: { name: string; phone?: string; email?: string; address?: string }) => {
  return Supplier.create(data);
};

export const updateSupplier = async (id: string, data: Partial<{ name: string; phone?: string; email?: string; address?: string; active?: boolean }>) => {
  return Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};
