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

export const createUserValidator = [
  body('username').trim().notEmpty().withMessage('Username is required.').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('A valid email address is required.'),
  body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('role').isIn(['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']).withMessage('Invalid role.'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  body('station').optional().isMongoId().withMessage('Station id must be valid.'),
  validateRequest,
];

export const updateUserValidator = [
  param('id').isMongoId().withMessage('User id must be a valid Mongo id.'),
  body('role').optional().isIn(['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']).withMessage('Invalid role.'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  body('station').optional().isMongoId().withMessage('Station id must be valid.'),
  validateRequest,
];
