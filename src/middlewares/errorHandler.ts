import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { appConfig } from '../config';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, any>;
}

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}. Please provide a valid value.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];
  const message = `The ${field} "${value}" is already in use. Please use a different ${field}.`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err: MongoError) => {
  const errors: Record<string, string> = {};
  Object.values(err.errors || {}).forEach((el: any) => {
    errors[el.path] = el.message;
  });
  const message = Object.values(errors)[0] || 'Validation failed';
  return new AppError(message, 422, errors);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    errors: err.errors,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (appConfig.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB/Mongoose errors
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}. This route does not exist.`,
  });
};

export default errorHandler;
