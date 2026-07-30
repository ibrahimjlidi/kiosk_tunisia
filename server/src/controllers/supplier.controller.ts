import { Request, Response } from 'express';
import { fetchSuppliers, createSupplier, updateSupplier } from '../services/supplier.service';

export const listSuppliers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await fetchSuppliers();
    res.status(200).json({ success: true, count: suppliers.length, suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching suppliers' });
  }
};

export const addSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await createSupplier(req.body);
    res.status(201).json({ success: true, supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error creating supplier' });
  }
};

export const editSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await updateSupplier(req.params.id, req.body);
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }
    res.status(200).json({ success: true, supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error updating supplier' });
  }
};
