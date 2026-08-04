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

const uniquePistolNumbers = (pistols: any[]) => {
  const numbers = pistols.map((pistol) => Number(pistol.pistolNumber));
  const duplicates = numbers.filter((value, index) => numbers.indexOf(value) !== index);
  return duplicates.length === 0;
};

export const pumpCreateValidator = [
  body('station').isMongoId().withMessage('Station id is required and must be valid.'),
  body('pumpNumber').trim().notEmpty().withMessage('Pump number is required.'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  body('pistols').isArray({ min: 1 }).withMessage('At least one pistol must be associated with the pump.'),
  body('pistols.*.pistolNumber').isInt({ min: 1 }).withMessage('Pistol number must be a positive integer.'),
  body('pistols.*.product').isMongoId().withMessage('Each pistol must reference a valid product.'),
  body('pistols.*.currentClosingIndex').optional().isFloat({ min: 0 }).withMessage('Current closing index cannot be negative.'),
  body('pistols.*.active').optional().isBoolean().withMessage('Pistol active status must be a boolean.'),
  body('pistols').custom((pistols) => {
    if (!Array.isArray(pistols) || pistols.length === 0) return true;
    if (!uniquePistolNumbers(pistols)) {
      throw new Error('Each pistol within a pump must have a unique number.');
    }
    return true;
  }),
  validateRequest,
];

export const pumpUpdateValidator = [
  param('id').isMongoId().withMessage('Pump id must be a valid Mongo id.'),
  body('station').optional().isMongoId().withMessage('Station id must be valid.'),
  body('pumpNumber').optional().trim().notEmpty().withMessage('Pump number cannot be empty.'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  body('pistols').optional().isArray({ min: 1 }).withMessage('At least one pistol must be associated with the pump.'),
  body('pistols.*.pistolNumber').optional().isInt({ min: 1 }).withMessage('Pistol number must be a positive integer.'),
  body('pistols.*.product').optional().isMongoId().withMessage('Each pistol must reference a valid product.'),
  body('pistols.*.currentClosingIndex').optional().isFloat({ min: 0 }).withMessage('Current closing index cannot be negative.'),
  body('pistols.*.active').optional().isBoolean().withMessage('Pistol active status must be a boolean.'),
  body('pistols').custom((pistols) => {
    if (!pistols || !Array.isArray(pistols)) return true;
    if (!uniquePistolNumbers(pistols)) {
      throw new Error('Each pistol within a pump must have a unique number.');
    }
    return true;
  }),
  validateRequest,
];
