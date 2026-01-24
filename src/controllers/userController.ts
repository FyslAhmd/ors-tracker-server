import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { AuthRequest, ApiResponse, UserQueryParams } from '../types';
import { 
  NotFoundError, 
  ForbiddenError,
  BadRequestError 
} from '../utils/AppError';
import { calculatePagination, sanitizeUser } from '../utils/helpers';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      role,
      page = 1,
      limit = 10,
    } = req.query as unknown as UserQueryParams;

    // Build query
    const query: any = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Calculate pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: calculatePagination(pageNum, limitNum, total),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUser = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      throw new NotFoundError('User not found. The user may have been deleted.');
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUserRole = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!req.user) {
      throw new ForbiddenError('Authentication required.');
    }

    // Prevent admin from changing their own role
    if (id === req.user._id) {
      throw new BadRequestError('You cannot change your own role. Please ask another admin.');
    }

    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError('User not found. The user may have been deleted.');
    }

    // Check if this is the last admin and trying to demote
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new BadRequestError(
          'Cannot change role. This is the last admin account. Promote another user to admin first.'
        );
      }
    }

    user.role = role;
    await user.save();

    const userResponse = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new ForbiddenError('Authentication required.');
    }

    // Prevent admin from deleting themselves
    if (id === req.user._id) {
      throw new BadRequestError('You cannot delete your own account. Please ask another admin.');
    }

    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError('User not found. The user may have already been deleted.');
    }

    // Check if this is the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new BadRequestError(
          'Cannot delete the last admin account. Promote another user to admin first.'
        );
      }
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats (for admin dashboard)
// @route   GET /api/users/stats
// @access  Private (Admin only)
export const getUserStats = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalUsers, roleDistribution] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    // Format role distribution
    const roles: Record<string, number> = {
      admin: 0,
      inspector: 0,
      viewer: 0,
    };

    roleDistribution.forEach((item: any) => {
      roles[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          roles,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
