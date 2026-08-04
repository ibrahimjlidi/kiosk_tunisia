import { Request, Response, NextFunction } from 'express';
import { sendError } from '../helpers/apiResponse';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: { field?: string; message: string; code?: string }[];
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message}`);

  return sendError(
    res,
    message,
    statusCode,
    err.errors,
    process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : undefined
  );
};
