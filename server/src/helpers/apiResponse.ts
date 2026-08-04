import { Response } from 'express';

export type ApiSuccessPayload = Record<string, any>;

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: ApiErrorDetail[];

  constructor(message: string, statusCode = 500, errors?: ApiErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const sendSuccess = (
  res: Response,
  data: ApiSuccessPayload = {},
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: ApiErrorDetail[],
  meta?: Record<string, any>
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(meta ? meta : {}),
  });
};
