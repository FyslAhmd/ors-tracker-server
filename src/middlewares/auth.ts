import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { jwtConfig } from '../config';
import { AuthRequest } from '../types';
import { UnauthorizedError } from '../utils/AppError';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Access denied. No token provided. Please log in to continue.');
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Your session has expired. Please log in again.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token. Please log in again.');
      }
      throw new UnauthorizedError('Token verification failed. Please log in again.');
    }

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new UnauthorizedError('The user belonging to this token no longer exists.');
    }

    // Attach user to request
    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default protect;
