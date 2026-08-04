import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map((err: any) => ({ field: err.path || err.param || 'unknown', message: err.msg })),
    });
    return;
  }

  next();
};

export const tankCreateValidator = [
  body('station').isMongoId().withMessage('Station id is required and must be valid'),
  body('product').isMongoId().withMessage('Product id is required and must be valid'),
  body('tankNumber').trim().notEmpty().withMessage('Tank number is required'),
  body('capacity').isFloat({ min: 1 }).withMessage('Tank capacity must be at least 1 liter'),
  body('currentStock').optional().isFloat({ min: 0 }).withMessage('Current stock must be zero or greater'),
  body('minLevelAlert').isFloat({ min: 0 }).withMessage('Minimum alert level must be zero or greater'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean'),
  validateRequest,
];

export const tankUpdateValidator = [
  param('id').isMongoId().withMessage('Tank id must be a valid Mongo id'),
  body('station').optional().isMongoId().withMessage('Station id must be valid'),
  body('product').optional().isMongoId().withMessage('Product id must be valid'),
  body('tankNumber').optional().trim().notEmpty().withMessage('Tank number cannot be empty'),
  body('capacity').optional().isFloat({ min: 1 }).withMessage('Tank capacity must be at least 1 liter'),
  body('currentStock').optional().isFloat({ min: 0 }).withMessage('Current stock must be zero or greater'),
  body('minLevelAlert').optional().isFloat({ min: 0 }).withMessage('Minimum alert level must be zero or greater'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean'),
  validateRequest,
];
