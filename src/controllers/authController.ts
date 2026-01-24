import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { jwtConfig } from '../config';
import { AuthRequest, ApiResponse, IUserResponse } from '../types';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError 
} from '../utils/AppError';
import { sanitizeUser } from '../utils/helpers';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: '7d',
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ConflictError('This email address is already registered. Please use a different email or log in.');
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'viewer',
    });

    // Generate token
    const token = generateToken(user._id.toString());

    const userResponse = sanitizeUser(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to ORS Tracker.',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new UnauthorizedError('No account found with this email address. Please check your email or register.');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Incorrect password. Please try again or reset your password.');
    }

    // Generate token
    const token = generateToken(user._id.toString());

    const userResponse = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not found. Please log in again.');
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (client-side token removal, just returns success)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};
