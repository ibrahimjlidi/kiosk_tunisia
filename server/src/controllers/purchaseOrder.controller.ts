import { Request, Response } from 'express';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { Tank } from '../models/Tank';
import { AuthRequest } from '../middlewares/auth.middleware';
import { normalizeApiError } from '../helpers/errorResponse';

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
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load purchase orders.') });
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
      res.status(404).json({ success: false, message: 'Purchase order not found.' });
      return;
    }
    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load purchase order.') });
  }
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplier, station, orderNumber, orderDate, items, notes } = req.body;

    if (!supplier || !station || !orderNumber || !items || items.length === 0) {
      res.status(400).json({ success: false, message: 'Supplier, station, order number and items are required.' });
      return;
    }

    const normalizedItems = await Promise.all(
      items.map(async (item: any, index: number) => {
        if (!item.product || !item.tank || item.quantity <= 0 || item.unitPrice < 0) {
          throw new Error(`Order line ${index + 1} must include a product, a tank, a positive quantity and a valid unit price.`);
        }

        const tank = await Tank.findById(item.tank).populate('product', 'name code');
        if (!tank) {
          throw new Error(`Tank on order line ${index + 1} was not found.`);
        }

        if (tank.station?.toString() !== station) {
          throw new Error(`Tank on order line ${index + 1} does not belong to the selected station.`);
        }

        if (tank.product?._id?.toString() !== item.product) {
          throw new Error(`Tank on order line ${index + 1} does not match the selected product.`);
        }

        return {
          ...item,
          totalPrice: parseFloat((item.quantity * item.unitPrice).toFixed(3)),
        };
      })
    );

    const totalAmount = parseFloat(
      normalizedItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0).toFixed(3)
    );

    const order = await PurchaseOrder.create({
      supplier,
      station,
      orderNumber,
      orderDate: orderDate || new Date(),
      items: normalizedItems,
      totalAmount,
      notes,
      createdBy: req.user!.id,
    });

    res.status(201).json({ success: true, message: 'Purchase order created successfully', order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to create purchase order.') });
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Purchase order updated successfully', order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to update purchase order.') });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to delete purchase order.') });
  }
};

export const deliverPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found.' });
      return;
    }
    if (order.status !== 'PENDING') {
      res.status(400).json({ success: false, message: `Order is already ${order.status}.` });
      return;
    }

    order.status = 'DELIVERED';
    order.deliveryDate = new Date();
    order.deliveredBy = req.body.deliveredBy || req.user?.username || 'System';
    await order.save();

    for (const item of order.items) {
      if (item.tank) {
        const tank = await Tank.findById(item.tank);
        if (!tank) {
          throw new Error('One or more tanks referenced by the order could not be found.');
        }

        const projectedStock = tank.currentStock + item.quantity;
        if (projectedStock > tank.capacity) {
          throw new Error(`Delivery for tank ${tank.tankNumber} would exceed its capacity.`);
        }

        tank.currentStock = projectedStock;
        await tank.save();
      }
    }

    res.status(200).json({ success: true, message: 'Purchase order delivered and tank stock updated', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to deliver purchase order.') });
  }
};

export const cancelPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found.' });
      return;
    }
    if (order.status === 'DELIVERED') {
      res.status(400).json({ success: false, message: 'Cannot cancel a delivered order.' });
      return;
    }

    order.status = 'CANCELLED';
    await order.save();

    res.status(200).json({ success: true, message: 'Purchase order cancelled', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to cancel purchase order.') });
  }
};
