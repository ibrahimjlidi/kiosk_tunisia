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

export const stationCreateValidator = [
  body('name').trim().notEmpty().withMessage('Station name is required'),
  body('code').trim().notEmpty().withMessage('Station code is required'),
  body('address').trim().notEmpty().withMessage('Station address is required'),
  body('city').trim().notEmpty().withMessage('Station city is required'),
  body('phone').optional().trim(),
  body('taxId').optional().trim(),
  body('active').optional().isBoolean().withMessage('Active must be a boolean'),
  validateRequest,
];

export const stationUpdateValidator = [
  param('id').isMongoId().withMessage('Station id must be a valid Mongo id'),
  body('name').optional().trim().notEmpty().withMessage('Station name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Station code cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Station address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('Station city cannot be empty'),
  body('phone').optional().trim(),
  body('taxId').optional().trim(),
  body('active').optional().isBoolean().withMessage('Active must be a boolean'),
  validateRequest,
];
