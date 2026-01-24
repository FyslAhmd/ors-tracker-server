import { Request, Response, NextFunction } from 'express';
import { ORSPlan } from '../models';
import { AuthRequest, ApiResponse, ORSQueryParams } from '../types';
import { 
  NotFoundError, 
  ForbiddenError,
  BadRequestError 
} from '../utils/AppError';
import { calculatePagination, isValidObjectId } from '../utils/helpers';

// @desc    Get all ORS plans
// @route   GET /api/ors
// @access  Private (All authenticated users)
export const getORSPlans = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      scoreMin,
      scoreMax,
      status,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query as unknown as ORSQueryParams;

    // Build query
    const query: any = {};

    // Search by vehicle ID or type
    if (search) {
      query.$or = [
        { vehicleId: { $regex: search, $options: 'i' } },
        { vehicleType: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by score range
    if (scoreMin !== undefined || scoreMax !== undefined) {
      query.overallScore = {};
      if (scoreMin !== undefined) {
        query.overallScore.$gte = Number(scoreMin);
      }
      if (scoreMax !== undefined) {
        query.overallScore.$lte = Number(scoreMax);
      }
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj: any = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Execute query
    const [orsPlans, total] = await Promise.all([
      ORSPlan.find(query)
        .populate('createdBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ORSPlan.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orsPlans,
        pagination: calculatePagination(pageNum, limitNum, total),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ORS plan
// @route   GET /api/ors/:id
// @access  Private (All authenticated users)
export const getORSPlan = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const orsPlan = await ORSPlan.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();

    if (!orsPlan) {
      throw new NotFoundError('ORS plan not found. It may have been deleted or the ID is incorrect.');
    }

    res.status(200).json({
      success: true,
      data: {
        orsPlan,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create ORS plan
// @route   POST /api/ors
// @access  Private (Admin, Inspector)
export const createORSPlan = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required.');
    }

    const {
      vehicleId,
      vehicleType,
      inspectionDate,
      nextInspectionDate,
      status,
      scores,
      textDocumentation,
      notes,
      assignedTo,
    } = req.body;

    // Validate assignedTo if provided
    if (assignedTo && !isValidObjectId(assignedTo)) {
      throw new BadRequestError('Invalid assigned user ID format.');
    }

    const orsPlan = await ORSPlan.create({
      vehicleId,
      vehicleType,
      inspectionDate,
      nextInspectionDate,
      status: status || 'draft',
      scores,
      textDocumentation: textDocumentation || {},
      notes,
      createdBy: req.user._id,
      assignedTo,
    });

    // Populate the created plan
    const populatedPlan = await ORSPlan.findById(orsPlan._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();

    res.status(201).json({
      success: true,
      message: 'ORS plan created successfully.',
      data: {
        orsPlan: populatedPlan,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ORS plan
// @route   PUT /api/ors/:id
// @access  Private (Admin - all, Inspector - own/assigned)
export const updateORSPlan = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new ForbiddenError('Authentication required.');
    }

    const orsPlan = await ORSPlan.findById(id);

    if (!orsPlan) {
      throw new NotFoundError('ORS plan not found. It may have been deleted or the ID is incorrect.');
    }

    // Check authorization: Admin can update any, Inspector can only update own/assigned
    if (req.user.role === 'inspector') {
      const isOwner = orsPlan.createdBy.toString() === req.user._id;
      const isAssigned = orsPlan.assignedTo?.toString() === req.user._id;
      
      if (!isOwner && !isAssigned) {
        throw new ForbiddenError(
          'You can only update ORS plans that you created or that are assigned to you.'
        );
      }
    }

    // Update allowed fields
    const allowedUpdates = [
      'vehicleId',
      'vehicleType',
      'inspectionDate',
      'nextInspectionDate',
      'status',
      'scores',
      'textDocumentation',
      'notes',
      'assignedTo',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (orsPlan as any)[field] = req.body[field];
      }
    });

    await orsPlan.save();

    // Populate the updated plan
    const populatedPlan = await ORSPlan.findById(orsPlan._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();

    res.status(200).json({
      success: true,
      message: 'ORS plan updated successfully.',
      data: {
        orsPlan: populatedPlan,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ORS plan
// @route   DELETE /api/ors/:id
// @access  Private (Admin only)
export const deleteORSPlan = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const orsPlan = await ORSPlan.findById(id);

    if (!orsPlan) {
      throw new NotFoundError('ORS plan not found. It may have already been deleted.');
    }

    await orsPlan.deleteOne();

    res.status(200).json({
      success: true,
      message: 'ORS plan deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ORS statistics for dashboard
// @route   GET /api/ors/stats
// @access  Private (All authenticated users)
export const getORSStats = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      total,
      avgScore,
      statusCounts,
      scoreLevelCounts,
    ] = await Promise.all([
      ORSPlan.countDocuments(),
      ORSPlan.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
      ]),
      ORSPlan.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      ORSPlan.aggregate([
        {
          $project: {
            scoreLevel: {
              $switch: {
                branches: [
                  { case: { $gte: ['$overallScore', 90] }, then: 'excellent' },
                  { case: { $gte: ['$overallScore', 70] }, then: 'good' },
                  { case: { $gte: ['$overallScore', 50] }, then: 'fair' },
                  { case: { $gte: ['$overallScore', 30] }, then: 'poor' },
                ],
                default: 'critical',
              },
            },
          },
        },
        { $group: { _id: '$scoreLevel', count: { $sum: 1 } } },
      ]),
    ]);

    // Convert status counts array to object
    const byStatus = {
      draft: 0,
      active: 0,
      completed: 0,
      archived: 0,
    };
    statusCounts.forEach((item: { _id: string; count: number }) => {
      if (item._id in byStatus) {
        byStatus[item._id as keyof typeof byStatus] = item.count;
      }
    });

    // Convert score level counts array to object
    const byScoreLevel = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      critical: 0,
    };
    scoreLevelCounts.forEach((item: { _id: string; count: number }) => {
      if (item._id in byScoreLevel) {
        byScoreLevel[item._id as keyof typeof byScoreLevel] = item.count;
      }
    });

    // Get recent ORS plans
    const recentPlans = await ORSPlan.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          averageScore: avgScore[0]?.avgScore || 0,
          byStatus,
          byScoreLevel,
        },
        recentPlans,
      },
    });
  } catch (error) {
    next(error);
  }
};
