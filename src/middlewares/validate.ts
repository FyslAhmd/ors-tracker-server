import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/AppError';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors into a more user-friendly structure
    const formattedErrors: Record<string, string> = {};
    errors.array().forEach((error: any) => {
      if (error.path && !formattedErrors[error.path]) {
        formattedErrors[error.path] = error.msg;
      }
    });

    // Get the first error message for the main message
    const firstError = errors.array()[0];
    const mainMessage = firstError ? (firstError as any).msg : 'Validation failed';

    next(new ValidationError(mainMessage, formattedErrors));
  };
};

export default validate;
