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

export const tankCreateValidator = [
  body('station').isMongoId().withMessage('Station id is required and must be valid.'),
  body('product').isMongoId().withMessage('Product id is required and must be valid.'),
  body('tankNumber').trim().notEmpty().withMessage('Tank number is required.'),
  body('capacity').isFloat({ min: 100 }).withMessage('Tank capacity must be at least 100 liters.'),
  body('currentStock').optional().isFloat({ min: 0 }).withMessage('Current stock must be zero or greater.'),
  body('minLevelAlert').isFloat({ min: 0 }).withMessage('Minimum alert level must be zero or greater.'),
  body('currentStock').custom((currentStock, { req }) => {
    if (currentStock !== undefined && req.body.capacity !== undefined && currentStock > req.body.capacity) {
      throw new Error('Current stock cannot exceed tank capacity.');
    }
    return true;
  }),
  body('minLevelAlert').custom((minLevelAlert, { req }) => {
    if (minLevelAlert !== undefined && req.body.capacity !== undefined && minLevelAlert > req.body.capacity) {
      throw new Error('Minimum alert level cannot exceed tank capacity.');
    }
    return true;
  }),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  validateRequest,
];

export const tankUpdateValidator = [
  param('id').isMongoId().withMessage('Tank id must be a valid Mongo id.'),
  body('station').optional().isMongoId().withMessage('Station id must be valid.'),
  body('product').optional().isMongoId().withMessage('Product id must be valid.'),
  body('tankNumber').optional().trim().notEmpty().withMessage('Tank number cannot be empty.'),
  body('capacity').optional().isFloat({ min: 100 }).withMessage('Tank capacity must be at least 100 liters.'),
  body('currentStock').optional().isFloat({ min: 0 }).withMessage('Current stock must be zero or greater.'),
  body('minLevelAlert').optional().isFloat({ min: 0 }).withMessage('Minimum alert level must be zero or greater.'),
  body('currentStock').custom((currentStock, { req }) => {
    if (currentStock !== undefined && req.body.capacity !== undefined && currentStock > req.body.capacity) {
      throw new Error('Current stock cannot exceed tank capacity.');
    }
    return true;
  }),
  body('minLevelAlert').custom((minLevelAlert, { req }) => {
    if (minLevelAlert !== undefined && req.body.capacity !== undefined && minLevelAlert > req.body.capacity) {
      throw new Error('Minimum alert level cannot exceed tank capacity.');
    }
    return true;
  }),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  validateRequest,
];
