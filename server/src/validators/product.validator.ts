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

export const productCreateValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('code').trim().notEmpty().withMessage('Product code is required.').isLength({ min: 2, max: 20 }).withMessage('Product code must be between 2 and 20 characters.'),
  body('category').isIn(['FUEL', 'KIOSK', 'SERVICE']).withMessage('Product category is invalid.'),
  body('purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be zero or greater.'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be zero or greater.'),
  body('sellingPrice').custom((sellingPrice, { req }) => {
    if (sellingPrice < req.body.purchasePrice) {
      throw new Error('Selling price must be greater than or equal to purchase price.');
    }
    return true;
  }),
  body('vatRate').isFloat({ min: 0, max: 100 }).withMessage('VAT rate must be between 0 and 100.'),
  body('unitOfMeasure').isIn(['LITER', 'UNIT', 'SERVICE']).withMessage('Unit of measure is invalid.'),
  body('minStockAlert').optional().isInt({ min: 0 }).withMessage('Minimum stock alert must be a positive integer.'),
  body('currentStock').optional().isFloat({ min: 0 }).withMessage('Current stock must be zero or greater.'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  validateRequest,
];

export const productUpdateValidator = [
  param('id').isMongoId().withMessage('Product id must be a valid Mongo id.'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
  body('code').optional().trim().notEmpty().withMessage('Product code cannot be empty.').isLength({ min: 2, max: 20 }).withMessage('Product code must be between 2 and 20 characters.'),
  body('category').optional().isIn(['FUEL', 'KIOSK', 'SERVICE']).withMessage('Product category is invalid.'),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be zero or greater.'),
  body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be zero or greater.'),
  body('sellingPrice').custom((sellingPrice, { req }) => {
    if (sellingPrice !== undefined && req.body.purchasePrice !== undefined && sellingPrice < req.body.purchasePrice) {
      throw new Error('Selling price must be greater than or equal to purchase price.');
    }
    return true;
  }),
  body('vatRate').optional().isFloat({ min: 0, max: 100 }).withMessage('VAT rate must be between 0 and 100.'),
  body('unitOfMeasure').optional().isIn(['LITER', 'UNIT', 'SERVICE']).withMessage('Unit of measure is invalid.'),
  body('minStockAlert').optional().isInt({ min: 0 }).withMessage('Minimum stock alert must be a positive integer.'),
  body('currentStock').optional().isFloat({ min: 0 }).withMessage('Current stock must be zero or greater.'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  validateRequest,
];
