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

export const stationCreateValidator = [
  body('name').trim().notEmpty().withMessage('Station name is required.'),
  body('code').trim().notEmpty().withMessage('Station code is required.').isLength({ min: 2, max: 12 }).withMessage('Station code must be between 2 and 12 characters.'),
  body('address').trim().notEmpty().withMessage('Station address is required.'),
  body('city').trim().notEmpty().withMessage('Station city is required.'),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^[0-9+\-\s]{8,20}$/).withMessage('Phone number must contain only digits, spaces, + or -.'),
  body('taxId').optional({ values: 'falsy' }).trim().matches(/^[A-Z0-9-]{4,20}$/i).withMessage('Tax ID must contain only letters, numbers or dashes.'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  validateRequest,
];

export const stationUpdateValidator = [
  param('id').isMongoId().withMessage('Station id must be a valid Mongo id.'),
  body('name').optional().trim().notEmpty().withMessage('Station name cannot be empty.'),
  body('code').optional().trim().notEmpty().withMessage('Station code cannot be empty.').isLength({ min: 2, max: 12 }).withMessage('Station code must be between 2 and 12 characters.'),
  body('address').optional().trim().notEmpty().withMessage('Station address cannot be empty.'),
  body('city').optional().trim().notEmpty().withMessage('Station city cannot be empty.'),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^[0-9+\-\s]{8,20}$/).withMessage('Phone number must contain only digits, spaces, + or -.'),
  body('taxId').optional({ values: 'falsy' }).trim().matches(/^[A-Z0-9-]{4,20}$/i).withMessage('Tax ID must contain only letters, numbers or dashes.'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  validateRequest,
];
