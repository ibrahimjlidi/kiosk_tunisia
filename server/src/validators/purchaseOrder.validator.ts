import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const normalizeField = (err: any): string => err.path || err.param || 'unknown';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted fields.',
      errors: errors.array().map((err: any) => ({ field: normalizeField(err), message: err.msg })),
    });
    return;
  }

  next();
};

export const purchaseOrderCreateValidator = [
  body('supplier').isMongoId().withMessage('Supplier id is required and must be valid.'),
  body('station').isMongoId().withMessage('Station id is required and must be valid.'),
  body('orderNumber').trim().notEmpty().withMessage('Order number is required.'),
  body('orderDate').optional().isISO8601().withMessage('Order date must be a valid date.'),
  body('items').isArray({ min: 1 }).withMessage('At least one order line is required.'),
  body('items.*.product').isMongoId().withMessage('Each line must reference a valid product.'),
  body('items.*.quantity').isFloat({ min: 1 }).withMessage('Each quantity must be at least 1 liter.'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Each unit price must be zero or greater.'),
  body('items.*.tank').optional().isMongoId().withMessage('Each tank reference must be a valid Mongo id.'),
  body('items.*.tank').custom((tank, { req, path }) => {
    const index = Number(path.match(/\[(\d+)\]/)?.[1]);
    const item = req.body.items?.[index];
    if (item?.product && tank && req.body.station) {
      return true;
    }
    return true;
  }),
  validateRequest,
];

export const purchaseOrderUpdateValidator = [
  param('id').isMongoId().withMessage('Purchase order id must be a valid Mongo id.'),
  body('supplier').optional().isMongoId().withMessage('Supplier id must be valid.'),
  body('station').optional().isMongoId().withMessage('Station id must be valid.'),
  body('orderNumber').optional().trim().notEmpty().withMessage('Order number cannot be empty.'),
  body('status').optional().isIn(['PENDING', 'DELIVERED', 'CANCELLED']).withMessage('Status is invalid.'),
  body('items').optional().isArray({ min: 1 }).withMessage('At least one order line is required.'),
  body('items.*.product').optional().isMongoId().withMessage('Each line must reference a valid product.'),
  body('items.*.quantity').optional().isFloat({ min: 1 }).withMessage('Each quantity must be at least 1 liter.'),
  body('items.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Each unit price must be zero or greater.'),
  body('items.*.tank').optional().isMongoId().withMessage('Each tank reference must be a valid Mongo id.'),
  validateRequest,
];
