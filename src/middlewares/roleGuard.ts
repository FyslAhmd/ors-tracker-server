import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError';

export const roleGuard = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required. Please log in.');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}. Your current role is: ${req.user.role}.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const adminOnly = roleGuard('admin');
export const inspectorOrAdmin = roleGuard('admin', 'inspector');

export default roleGuard;
