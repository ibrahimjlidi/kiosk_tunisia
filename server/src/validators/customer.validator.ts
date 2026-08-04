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

export const customerCreateValidator = [
  body('name').trim().notEmpty().withMessage('Customer name is required.'),
  body('phone').optional().trim().isLength({ min: 3 }).withMessage('Phone number must contain at least 3 characters.'),
  body('email').optional().isEmail().withMessage('Email must be a valid email address.'),
  body('address').optional().trim().isLength({ min: 2 }).withMessage('Address must contain at least 2 characters.'),
  validateRequest,
];

export const customerTransactionValidator = [
  param('customerId').isMongoId().withMessage('Customer id must be a valid Mongo id.'),
  body('type').isIn(['SALE', 'PAYMENT', 'ADJUSTMENT']).withMessage('Transaction type must be SALE, PAYMENT, or ADJUSTMENT.'),
  body('amount').isNumeric().withMessage('Transaction amount must be a numeric value.'),
  body('amount').custom((value) => {
    const amt = Number(value);
    if (!Number.isFinite(amt) || amt === 0) {
      throw new Error('Transaction amount must be non-zero.');
    }
    return true;
  }),
  body('station').optional().isMongoId().withMessage('Station id must be a valid Mongo id.'),
  body('referenceId').optional().isMongoId().withMessage('Reference id must be a valid Mongo id.'),
  body('notes').optional().isString().withMessage('Notes must be a string.'),
  validateRequest,
];
