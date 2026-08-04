import { Request, Response } from 'express';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { Tank } from '../models/Tank';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAllPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.station) filter.station = req.query.station;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.supplier) filter.supplier = req.query.supplier;

    const orders = await PurchaseOrder.find(filter)
      .populate('supplier', 'name code')
      .populate('station', 'name code')
      .populate('items.product', 'name code')
      .populate('items.tank', 'tankNumber')
      .populate('createdBy', 'firstName lastName')
      .sort({ orderDate: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching purchase orders' });
  }
};

export const getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('supplier', 'name code contactPerson phone')
      .populate('station', 'name code')
      .populate('items.product', 'name code category')
      .populate('items.tank', 'tankNumber capacity currentStock')
      .populate('createdBy', 'firstName lastName');

    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }
    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching purchase order' });
  }
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplier, station, orderNumber, orderDate, items, notes } = req.body;

    if (!supplier || !station || !orderNumber || !items || items.length === 0) {
      res.status(400).json({ success: false, message: 'supplier, station, orderNumber, and items are required' });
      return;
    }

    // Calculate totalAmount
    const totalAmount = parseFloat(
      items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0).toFixed(3)
    );

    const order = await PurchaseOrder.create({
      supplier,
      station,
      orderNumber,
      orderDate: orderDate || new Date(),
      items,
      totalAmount,
      notes,
      createdBy: req.user!.id,
    });

    res.status(201).json({ success: true, message: 'Purchase order created successfully', order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error creating purchase order' });
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Purchase order updated successfully', order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error updating purchase order' });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting purchase order' });
  }
};

export const deliverPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }
    if (order.status !== 'PENDING') {
      res.status(400).json({ success: false, message: `Order is already ${order.status}` });
      return;
    }

    order.status = 'DELIVERED';
    order.deliveryDate = new Date();
    order.deliveredBy = req.body.deliveredBy || req.user?.username || 'System';
    await order.save();

    // Update tank currentStock for each item that has a tank reference
    for (const item of order.items) {
      if (item.tank) {
        const tank = await Tank.findById(item.tank);
        if (tank) {
          tank.currentStock += item.quantity;
          await tank.save();
        }
      }
    }

    res.status(200).json({ success: true, message: 'Purchase order delivered and tank stock updated', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error delivering purchase order' });
  }
};

export const cancelPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }
    if (order.status === 'DELIVERED') {
      res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
      return;
    }

    order.status = 'CANCELLED';
    await order.save();

    res.status(200).json({ success: true, message: 'Purchase order cancelled', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error cancelling purchase order' });
  }
};
