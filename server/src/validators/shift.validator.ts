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

export const openShiftValidator = [
  body('stationId').isMongoId().withMessage('Station id is required and must be valid.'),
  body('shiftType').isIn(['MORNING', 'AFTERNOON', 'NIGHT']).withMessage('Shift type is invalid.'),
  body('shiftDate').isISO8601().withMessage('Shift date must be a valid ISO date.'),
  body('employeeIds').optional().isArray().withMessage('Employee ids must be an array when provided.'),
  body('employeeIds.*').optional().isMongoId().withMessage('Each employee id must be a valid Mongo id.'),
  validateRequest,
];

export const readingsUpdateValidator = [
  param('id').isMongoId().withMessage('Shift id must be a valid Mongo id.'),
  body('readings').isArray({ min: 1 }).withMessage('At least one reading update is required.'),
  body('readings.*.pumpId').isMongoId().withMessage('Each pump id must be a valid Mongo id.'),
  body('readings.*.pistolId').isMongoId().withMessage('Each pistol id must be a valid Mongo id.'),
  body('readings.*.closingIndex').isFloat({ min: 0 }).withMessage('Closing index cannot be negative.'),
  validateRequest,
];

export const paymentsUpdateValidator = [
  param('id').isMongoId().withMessage('Shift id must be a valid Mongo id.'),
  body('cashAmount').optional().isFloat({ min: 0 }).withMessage('Cash amount cannot be negative.'),
  body('bankCardAmount').optional().isFloat({ min: 0 }).withMessage('Bank card amount cannot be negative.'),
  body('fuelCardAmount').optional().isFloat({ min: 0 }).withMessage('Fuel card amount cannot be negative.'),
  body('bankTransferAmount').optional().isFloat({ min: 0 }).withMessage('Bank transfer amount cannot be negative.'),
  body('creditAmount').optional().isFloat({ min: 0 }).withMessage('Credit amount cannot be negative.'),
  validateRequest,
];

export const closeShiftValidator = [
  param('id').isMongoId().withMessage('Shift id must be a valid Mongo id.'),
  body('notes').optional().isString().withMessage('Notes must be a string.'),
  validateRequest,
];
