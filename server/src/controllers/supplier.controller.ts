import { Request, Response } from 'express';
import { Supplier } from '../models/Supplier';

export const getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    if (req.query.active !== undefined) {
      filter.active = req.query.active === 'true';
    }

    const suppliers = await Supplier.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching suppliers',
    });
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching supplier',
    });
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating supplier',
    });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      supplier,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating supplier',
    });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting supplier',
    });
  }
};